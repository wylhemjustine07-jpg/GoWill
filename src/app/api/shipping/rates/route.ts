import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"

export const runtime = "nodejs"

const quoteSchema = z.object({
  listingId: z.string().uuid(),
  quantity: z.number().int().min(1).max(5).default(1),
  destination: z.object({
    firstName: z.string().trim().min(1).max(80),
    lastName: z.string().trim().min(1).max(80),
    email: z.string().trim().email().max(254),
    phone: z.string().trim().max(40).optional().default(""),
    street1: z.string().trim().min(1).max(200),
    street2: z.string().trim().max(200).optional().default(""),
    city: z.string().trim().min(1).max(100),
    state: z.string().trim().max(100).optional().default(""),
    postalCode: z.string().trim().min(1).max(20),
    country: z.string().trim().min(1).max(80),
    countryCode: z.string().trim().regex(/^[A-Z]{2}$/),
  }),
})

type ShippoRate = {
  object_id?: string
  provider?: string
  servicelevel?: {
    name?: string
    terms?: string
  }
  amount?: string
  currency?: string
  estimated_days?: number | null
  duration_terms?: string
}

export async function POST(request: Request) {
  const sessionClient = await createClient()
  const { data: { user }, error: authError } = await sessionClient.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Connecte-toi pour demander un tarif." }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "La demande n'est pas un JSON valide." }, { status: 400 })
  }

  const parsed = quoteSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Vérifie l'adresse de destination et la quantité." }, { status: 400 })
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const shippoToken = process.env.SHIPPO_API_TOKEN
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

  if (!serviceRoleKey || !shippoToken || !supabaseUrl) {
    return NextResponse.json({
      error: "Les devis en temps réel ne sont pas encore configurés sur GoWill.",
      code: "SHIPPING_PROVIDER_NOT_CONFIGURED",
    }, { status: 503 })
  }

  const admin = createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const { listingId, quantity, destination } = parsed.data
  const { data: listing, error: listingError } = await admin
    .from("listings")
    .select("id,seller_id,title,status,location,shipping_origin_country_code,ships_internationally,parcel_weight_kg,parcel_length_cm,parcel_width_cm,parcel_height_cm")
    .eq("id", listingId)
    .eq("status", "active")
    .maybeSingle()

  if (listingError || !listing) {
    return NextResponse.json({ error: "Cette annonce n'est plus disponible." }, { status: 404 })
  }

  if (listing.seller_id === user.id) {
    return NextResponse.json({ error: "Tu ne peux pas demander un tarif pour ta propre annonce." }, { status: 400 })
  }

  const { data: origin, error: originError } = await admin
    .from("seller_shipping_origins")
    .select("contact_name,email,phone,street1,street2,city,state,postal_code,country,country_code")
    .eq("seller_id", listing.seller_id)
    .maybeSingle()

  if (originError || !origin) {
    return NextResponse.json({
      error: "Le vendeur doit d'abord enregistrer son adresse d'expédition privée.",
      code: "SELLER_ORIGIN_MISSING",
    }, { status: 409 })
  }

  if (listing.shipping_origin_country_code && listing.shipping_origin_country_code !== origin.country_code) {
    return NextResponse.json({
      error: "Le code pays de l'annonce ne correspond pas à l'adresse d'expédition privée du vendeur.",
      code: "SELLER_ORIGIN_COUNTRY_MISMATCH",
    }, { status: 409 })
  }

  if (!listing.ships_internationally && origin.country_code !== destination.countryCode) {
    return NextResponse.json({
      error: "Le vendeur n'accepte pas l'expédition vers ce pays.",
      code: "DESTINATION_NOT_ALLOWED",
    }, { status: 403 })
  }

  const parcel = {
    length: String(listing.parcel_length_cm),
    width: String(listing.parcel_width_cm),
    height: String(listing.parcel_height_cm),
    distance_unit: "cm",
    weight: String(listing.parcel_weight_kg),
    mass_unit: "kg",
  }

  const shipmentPayload = {
    address_from: {
      name: origin.contact_name,
      street1: origin.street1,
      street2: origin.street2 || undefined,
      city: origin.city,
      state: origin.state || undefined,
      zip: origin.postal_code,
      country: origin.country_code,
      phone: origin.phone,
      email: origin.email,
    },
    address_to: {
      name: `${destination.firstName} ${destination.lastName}`,
      street1: destination.street1,
      street2: destination.street2 || undefined,
      city: destination.city,
      state: destination.state || undefined,
      zip: destination.postalCode,
      country: destination.countryCode,
      phone: destination.phone || undefined,
      email: destination.email,
    },
    parcels: Array.from({ length: quantity }, () => parcel),
    async: false,
    metadata: `GoWill listing ${listing.id}`,
  }

  let shippoResponse: Response
  try {
    shippoResponse = await fetch("https://api.goshippo.com/shipments/", {
      method: "POST",
      headers: {
        Authorization: `ShippoToken ${shippoToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(shipmentPayload),
      signal: AbortSignal.timeout(20000),
      cache: "no-store",
    })
  } catch {
    return NextResponse.json({ error: "Le service de transport est momentanément inaccessible." }, { status: 502 })
  }

  if (!shippoResponse.ok) {
    return NextResponse.json({
      error: "Le transporteur n'a pas pu calculer de tarif pour cette adresse et ce colis.",
      code: "CARRIER_QUOTE_FAILED",
    }, { status: 502 })
  }

  const shipment = await shippoResponse.json() as { rates?: ShippoRate[]; status?: string }
  const rates = (shipment.rates ?? [])
    .filter((rate) => rate.object_id && rate.provider && rate.servicelevel?.name && rate.amount && rate.currency === "EUR")
    .map((rate) => ({
      rateId: rate.object_id as string,
      provider: rate.provider as string,
      service: rate.servicelevel?.name as string,
      amount: Number(rate.amount),
      currency: "EUR",
      estimatedDays: rate.estimated_days ?? null,
      durationTerms: rate.duration_terms ?? rate.servicelevel?.terms ?? "",
    }))
    .filter((rate) => Number.isFinite(rate.amount) && rate.amount >= 0)
    .sort((a, b) => a.amount - b.amount)

  return NextResponse.json({
    rates,
    currency: "EUR",
    note: "Tarifs transporteur retournés par Shippo. Les droits et taxes de douane ne sont pas inclus.",
  })
}
