"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Home, MapPin, Search, PackageCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useCartStore } from "@/store/cart"
import { useOrdersStore } from "@/store/orders"
import { CartSummary } from "@/components/cart/cart-summary"
import { formatPrice } from "@/lib/utils"
import { toast } from "sonner"
import { siteConfig } from "@/lib/config"
import { calculateCartShipping, getBuyerShippingShare, getOriginCountry, normalizeCountry } from "@/lib/shipping"
import type { Order } from "@/types"

type DeliveryMethod = "home" | "relay"

type CarrierRate = {
  rateId: string
  provider: string
  service: string
  amount: number
  currency: "EUR"
  estimatedDays: number | null
  durationTerms: string
}

export default function CheckoutPage() {
  const router = useRouter()
  const items = useCartStore((s) => s.items)
  const getSubtotal = useCartStore((s) => s.getSubtotal)
  const clearCart = useCartStore((s) => s.clearCart)
  const addOrder = useOrdersStore((s) => s.addOrder)
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("home")
  const [postalSearching, setPostalSearching] = useState(false)
  const [mapPosition, setMapPosition] = useState<{ lat: number; lon: number } | null>(null)
  const [carrierRates, setCarrierRates] = useState<Record<string, CarrierRate[]>>({})
  const [selectedCarrierRates, setSelectedCarrierRates] = useState<Record<string, CarrierRate>>({})
  const [rateLoadingFor, setRateLoadingFor] = useState<string | null>(null)

  const [form, setForm] = useState({
    email: "",
    firstName: "",
    lastName: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "France",
    countryCode: "FR",
    phone: "",
    relayName: "",
    relayAddress: "",
    relayPostalCode: "",
    relayCity: "",
  })

  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8"><h1 className="text-3xl font-bold tracking-tight">Finaliser la commande</h1></div>
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight">Finaliser la commande</h1>
        <div className="mt-16 text-center">
          <p className="text-muted-foreground">Ton panier est vide. Ajoute un article avant de continuer.</p>
          <Button className="mt-8" asChild><Link href="/shop">Continuer mes achats</Link></Button>
        </div>
      </div>
    )
  }

  const subtotal = getSubtotal()
  const fallbackShipping = subtotal >= siteConfig.freeShippingThreshold ? 0 : 599
  const itemsWithCarrierRates = items.map((item) => {
    const rate = selectedCarrierRates[item.variantId]
    return rate ? { ...item, shippingFeeAmount: Math.round(rate.amount * 100) } : item
  })
  const shippingEstimate = calculateCartShipping(itemsWithCarrierRates, fallbackShipping)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
    setCarrierRates({})
    setSelectedCarrierRates({})
  }

  async function requestCarrierRates(item: (typeof items)[number]) {
    if (!item.sellerId) {
      toast.error("Les tarifs transporteur sont réservés aux annonces GoWill.")
      return
    }
    if (deliveryMethod !== "home") {
      toast.info("Les devis transporteur pour les points relais ne sont pas encore disponibles.")
      return
    }
    if (!form.email || !form.firstName || !form.lastName || !form.line1 || !form.city || !form.postalCode || !form.country) {
      toast.error("Complète d'abord tes coordonnées et ton adresse de livraison.")
      return
    }
    if (!/^[A-Z]{2}$/.test(form.countryCode.trim().toUpperCase())) {
      toast.error("Ajoute le code pays ISO à deux lettres, par exemple FR, GP ou JP.")
      return
    }

    setRateLoadingFor(item.variantId)
    try {
      const response = await fetch("/api/shipping/rates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId: item.productId,
          quantity: item.quantity,
          destination: {
            firstName: form.firstName,
            lastName: form.lastName,
            email: form.email,
            phone: form.phone,
            street1: form.line1,
            street2: form.line2,
            city: form.city,
            state: form.state,
            postalCode: form.postalCode,
            country: form.country,
            countryCode: form.countryCode.trim().toUpperCase(),
          },
        }),
      })
      const result = await response.json() as { error?: string; rates?: CarrierRate[] }
      if (!response.ok) {
        toast.error(result.error || "Impossible de calculer les tarifs pour le moment.")
        return
      }
      const rates = result.rates ?? []
      setCarrierRates((current) => ({ ...current, [item.variantId]: rates }))
      if (rates.length > 0) {
        setSelectedCarrierRates((current) => ({ ...current, [item.variantId]: rates[0] }))
        toast.success("Tarifs transporteur reçus.")
      } else {
        setSelectedCarrierRates((current) => {
          const next = { ...current }
          delete next[item.variantId]
          return next
        })
        toast.info("Aucun tarif en euros n'a été retourné pour cette route.")
      }
    } catch {
      toast.error("Le service de devis est indisponible.")
    } finally {
      setRateLoadingFor(null)
    }
  }

  async function locatePostalCode() {
    const postalCode = form.relayPostalCode.trim()
    if (!postalCode || !form.country.trim()) {
      toast.error("Indique le code postal et le pays du point relais.")
      return
    }

    setPostalSearching(true)
    try {
      const params = new URLSearchParams({
        postalcode: postalCode,
        country: form.country.trim(),
        format: "jsonv2",
        limit: "1",
      })
      const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`)
      if (!response.ok) throw new Error("Geocoding unavailable")
      const results = (await response.json()) as Array<{ lat: string; lon: string; display_name?: string }>
      if (!results.length) {
        toast.error("Aucune zone trouvée. Vérifie le code postal et le pays.")
        setMapPosition(null)
        return
      }
      const point = { lat: Number(results[0].lat), lon: Number(results[0].lon) }
      setMapPosition(point)
      if (!form.relayCity && results[0].display_name) {
        const city = results[0].display_name.split(",")[0]
        setForm((current) => ({ ...current, relayCity: city }))
      }
      toast.success("Zone du code postal localisée.")
    } catch {
      toast.error("Impossible de localiser ce code postal pour le moment.")
    } finally {
      setPostalSearching(false)
    }
  }

  const mapUrl = mapPosition
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${mapPosition.lon - 0.025}%2C${mapPosition.lat - 0.018}%2C${mapPosition.lon + 0.025}%2C${mapPosition.lat + 0.018}&layer=mapnik&marker=${mapPosition.lat}%2C${mapPosition.lon}`
    : null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!form.email || !form.firstName || !form.lastName) {
      toast.error("Renseigne tes coordonnées pour continuer.")
      return
    }

    if (deliveryMethod === "home" && (!form.line1 || !form.city || !form.postalCode)) {
      toast.error("Complète ton adresse de livraison.")
      return
    }

    if (deliveryMethod === "relay" && (!form.relayName || !form.relayAddress || !form.relayPostalCode || !form.relayCity)) {
      toast.error("Renseigne le nom et l'adresse du point relais.")
      return
    }

    const blockedListing = items.find((item) => {
      if (!item.sellerId || item.shipsInternationally !== false) return false
      const originCountry = getOriginCountry(item.shippingOrigin)
      return originCountry !== "" && normalizeCountry(originCountry) !== normalizeCountry(form.country)
    })
    if (blockedListing) {
      toast.error(`Le vendeur de « ${blockedListing.name} » n'autorise pas l'expédition vers ce pays.`)
      return
    }

    setLoading(true)

    // Démonstration locale uniquement : les estimations vendeur ne sont pas des tarifs transporteur vérifiés.
    const shipping = shippingEstimate
    const tax = Math.round(subtotal * siteConfig.taxRate)
    const total = subtotal + shipping + tax
    const orderId = `DEMO-${Date.now().toString(36).toUpperCase()}`
    const address = deliveryMethod === "home"
      ? {
          id: "demo-home",
          type: "shipping" as const,
          firstName: form.firstName,
          lastName: form.lastName,
          line1: form.line1,
          line2: form.line2 || undefined,
          city: form.city,
          state: form.state,
          postalCode: form.postalCode,
          country: form.country,
          phone: form.phone || undefined,
          isDefault: false,
        }
      : {
          id: "demo-relay",
          type: "shipping" as const,
          firstName: form.firstName,
          lastName: form.lastName,
          line1: form.relayAddress,
          line2: form.relayName,
          city: form.relayCity,
          state: "",
          postalCode: form.relayPostalCode,
          country: form.country,
          phone: form.phone || undefined,
          isDefault: false,
        }

    const order: Order = {
      id: orderId,
      orderNumber: orderId,
      items: items.map((item) => {
        const selectedRate = selectedCarrierRates[item.variantId]
        return {
          id: item.id,
          productId: item.productId,
          variantId: item.variantId,
          name: item.name,
          variantName: item.variantName,
          sku: "",
          image: item.image,
          price: item.price,
          quantity: item.quantity,
          total: item.lineTotal,
          sellerId: item.sellerId,
          shippingOrigin: item.shippingOrigin,
          shippingFeeAmount: selectedRate ? Math.round(selectedRate.amount * 100) : item.shippingFeeAmount,
          shippingFeePayer: item.shippingFeePayer,
          shipsInternationally: item.shipsInternationally,
          shippingRateId: selectedRate?.rateId,
          shippingProvider: selectedRate?.provider,
          shippingService: selectedRate?.service,
        }
      }),
      status: "pending",
      paymentStatus: "pending",
      subtotal,
      tax,
      shipping,
      total,
      currency: "EUR",
      shippingAddress: address,
      customerEmail: form.email,
      customerName: `${form.firstName} ${form.lastName}`,
      deliveryMethod,
      relayName: deliveryMethod === "relay" ? form.relayName : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    addOrder(order)
    clearCart()
    toast.success("Aperçu de commande enregistré sur cet appareil.")
    router.push(`/checkout/success?order_id=${orderId}`)
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight">Choisir la livraison</h1>
      <p className="mt-2 text-sm text-muted-foreground">GoWill est conçu pour des achats entre pays. Indique le pays et l'adresse de destination ; les transporteurs et tarifs internationaux réels ne sont pas encore connectés.</p>

      <form onSubmit={handleSubmit} className="mt-8 grid gap-8 lg:grid-cols-5">
        <div className="space-y-8 lg:col-span-3">
          <Card>
            <CardHeader><CardTitle className="text-lg">Tes coordonnées</CardTitle></CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2"><Label htmlFor="email">Adresse e-mail</Label><Input id="email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="toi@exemple.fr" required /></div>
              <div className="space-y-2"><Label htmlFor="firstName">Prénom</Label><Input id="firstName" name="firstName" value={form.firstName} onChange={handleChange} required /></div>
              <div className="space-y-2"><Label htmlFor="lastName">Nom</Label><Input id="lastName" name="lastName" value={form.lastName} onChange={handleChange} required /></div>
              <div className="space-y-2 sm:col-span-2"><Label htmlFor="phone">Téléphone (facultatif)</Label><Input id="phone" name="phone" type="tel" value={form.phone} onChange={handleChange} /></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-lg">Où veux-tu recevoir ton colis ?</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <button type="button" onClick={() => { setDeliveryMethod("home"); setSelectedCarrierRates({}); setCarrierRates({}) }} aria-pressed={deliveryMethod === "home"} className={`rounded-xl border p-4 text-left transition ${deliveryMethod === "home" ? "border-primary bg-primary/5 ring-1 ring-primary" : "hover:bg-muted/50"}`}>
                  <Home className="mb-3 h-5 w-5" />
                  <span className="block font-semibold">À domicile</span>
                  <span className="mt-1 block text-xs text-muted-foreground">Le colis arrive à ton adresse.</span>
                </button>
                <button type="button" onClick={() => { setDeliveryMethod("relay"); setSelectedCarrierRates({}); setCarrierRates({}) }} aria-pressed={deliveryMethod === "relay"} className={`rounded-xl border p-4 text-left transition ${deliveryMethod === "relay" ? "border-primary bg-primary/5 ring-1 ring-primary" : "hover:bg-muted/50"}`}>
                  <MapPin className="mb-3 h-5 w-5" />
                  <span className="block font-semibold">Point relais</span>
                  <span className="mt-1 block text-xs text-muted-foreground">Tu récupères le colis dans un relais.</span>
                </button>
              </div>

              {deliveryMethod === "home" ? (
                <div className="space-y-4 border-t pt-4">
                  <div className="space-y-2"><Label htmlFor="line1">Adresse</Label><Input id="line1" name="line1" value={form.line1} onChange={handleChange} placeholder="Numéro et nom de rue" required /></div>
                  <div className="space-y-2"><Label htmlFor="line2">Complément (facultatif)</Label><Input id="line2" name="line2" value={form.line2} onChange={handleChange} placeholder="Appartement, bâtiment..." /></div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2"><Label htmlFor="postalCode">Code postal</Label><Input id="postalCode" name="postalCode" autoComplete="postal-code" value={form.postalCode} onChange={handleChange} required /></div>
                    <div className="space-y-2 sm:col-span-2"><Label htmlFor="city">Ville</Label><Input id="city" name="city" value={form.city} onChange={handleChange} required /></div>
                  </div>
                  <div className="space-y-2"><Label htmlFor="country">Pays de destination</Label><Input id="country" name="country" autoComplete="country-name" value={form.country} onChange={handleChange} placeholder="Ex. Guadeloupe, France, Japon, Canada..." required /><p className="text-xs text-muted-foreground">Saisis le pays ou territoire où le colis doit être livré.</p></div>
                  <div className="space-y-2"><Label htmlFor="countryCode">Code pays ISO (2 lettres, pour les devis transporteur)</Label><Input id="countryCode" name="countryCode" maxLength={2} value={form.countryCode} onChange={handleChange} placeholder="FR, GP, JP, CA..." /><p className="text-xs text-muted-foreground">Le code doit correspondre au pays de destination.</p></div>
                </div>
              ) : (
                <div className="space-y-4 border-t pt-4">
                  <div className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">Choisis le pays du point relais, puis entre son code postal pour afficher la zone sur la carte. Les formats de codes postaux varient selon les pays.</div>
                  <div className="space-y-2"><Label htmlFor="country">Pays du point relais</Label><Input id="country" name="country" autoComplete="country-name" value={form.country} onChange={handleChange} placeholder="Ex. Japon, France, Canada..." required /></div>
                  <div className="space-y-2"><Label htmlFor="relayPostalCode">Code postal du point relais</Label>
                    <div className="flex gap-2"><Input id="relayPostalCode" name="relayPostalCode" autoComplete="postal-code" value={form.relayPostalCode} onChange={handleChange} placeholder="Code postal local" /><Button type="button" variant="outline" onClick={() => void locatePostalCode()} disabled={postalSearching}><Search className="mr-2 h-4 w-4" />{postalSearching ? "Recherche..." : "Localiser"}</Button></div>
                  </div>
                  {mapUrl && <div className="overflow-hidden rounded-xl border"><iframe title="Carte de la zone du point relais" src={mapUrl} className="h-64 w-full" loading="lazy" referrerPolicy="no-referrer-when-downgrade" /><p className="border-t px-3 py-2 text-xs text-muted-foreground">La carte localise le code postal, pas les points relais disponibles.</p></div>}
                  <div className="space-y-2"><Label htmlFor="relayName">Nom du point relais</Label><Input id="relayName" name="relayName" value={form.relayName} onChange={handleChange} placeholder="Nom du commerce ou du relais" required /></div>
                  <div className="space-y-2"><Label htmlFor="relayAddress">Adresse du point relais</Label><Input id="relayAddress" name="relayAddress" value={form.relayAddress} onChange={handleChange} placeholder="Numéro et nom de rue" required /></div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2"><Label htmlFor="relayCity">Ville</Label><Input id="relayCity" name="relayCity" value={form.relayCity} onChange={handleChange} required /></div>
                    <div className="space-y-2"><Label htmlFor="relayPostalCode2">Code postal</Label><Input id="relayPostalCode2" name="relayPostalCode" value={form.relayPostalCode} onChange={handleChange} required /></div>
                  </div>
                  <p className="text-xs text-amber-700">Prototype international : la carte indique uniquement la zone du code postal. Le nom et l'adresse du relais sont saisis manuellement ; aucune liste officielle, disponibilité, étiquette ou expédition de transporteur n'est encore connectée. Vérifie le relais auprès du transporteur avant toute utilisation réelle.</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-lg">Paiement</CardTitle></CardHeader>
            <CardContent><p className="text-sm text-muted-foreground">GoWill est actuellement en mode démonstration. Les taxes, droits de douane, conversions de devises et frais de transport internationaux ne sont pas calculés. Aucun paiement réel ne sera effectué et aucune expédition ne sera déclenchée.</p></CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="sticky top-24">
            <CardHeader><CardTitle className="text-lg">Récapitulatif</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {items.map((item) => {
                const selectedRate = selectedCarrierRates[item.variantId]
                const effectiveFee = selectedRate ? Math.round(selectedRate.amount * 100) : (item.shippingFeeAmount ?? 0)
                const buyerShare = getBuyerShippingShare(effectiveFee, item.shippingFeePayer ?? "buyer")
                const availableRates = carrierRates[item.variantId]
                return <div key={item.variantId} className="space-y-2 border-b pb-3 text-sm last:border-b-0">
                  <div className="flex justify-between gap-3">
                    <div className="min-w-0">
                      <span className="text-muted-foreground">{item.name} × {item.quantity}</span>
                      {item.sellerId && <p className="mt-1 text-xs text-muted-foreground">Expédié depuis : {item.shippingOrigin || "Origine non renseignée"} · ta part des frais : {formatPrice(buyerShare * item.quantity)}</p>}
                    </div>
                    <span>{formatPrice(item.lineTotal)}</span>
                  </div>
                  {item.sellerId && deliveryMethod === "home" && (
                    <div className="space-y-2">
                      <Button type="button" size="sm" variant="outline" className="w-full" disabled={rateLoadingFor !== null} onClick={() => void requestCarrierRates(item)}>
                        {rateLoadingFor === item.variantId ? "Recherche des tarifs..." : "Obtenir les tarifs transporteur"}
                      </Button>
                      {availableRates?.map((rate) => (
                        <label key={rate.rateId} className="flex cursor-pointer items-start gap-2 rounded-lg border p-2 text-xs">
                          <input type="radio" name={`rate-${item.variantId}`} checked={selectedRate?.rateId === rate.rateId} onChange={() => setSelectedCarrierRates((current) => ({ ...current, [item.variantId]: rate }))} className="mt-0.5" />
                          <span className="min-w-0 flex-1"><span className="font-medium">{rate.provider} · {rate.service}</span><span className="block text-muted-foreground">{rate.estimatedDays ? `${rate.estimatedDays} jour(s) estimé(s)` : rate.durationTerms || "Délai non indiqué"}</span></span>
                          <span className="font-semibold">{formatPrice(Math.round(rate.amount * 100))}</span>
                        </label>
                      ))}
                      {availableRates && availableRates.length === 0 && <p className="text-xs text-muted-foreground">Aucun tarif en euros trouvé pour cette route. L'estimation du vendeur reste affichée.</p>}
                      {selectedRate && <p className="text-xs text-emerald-700">Tarif transporteur sélectionné : {selectedRate.provider} · {selectedRate.service}</p>}
                    </div>
                  )}
                  {item.sellerId && deliveryMethod === "relay" && <p className="text-xs text-muted-foreground">Le devis transporteur pour les points relais n'est pas encore intégré ; l'estimation du vendeur est utilisée.</p>}
                </div>
              })}
              <Separator />
              <CartSummary subtotal={subtotal} shipping={shippingEstimate} />
              <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground"><PackageCheck className="mr-2 inline h-4 w-4" />Mode choisi : {deliveryMethod === "home" ? "Livraison à domicile" : "Point relais"}</div>
              <Button type="submit" size="lg" className="w-full" disabled={loading}>{loading ? "Préparation..." : "Voir l'aperçu de commande"}</Button>
              <p className="text-center text-xs text-muted-foreground">Les devis Shippo disponibles sont des tarifs transporteur ; sinon, l'estimation du vendeur est utilisée. Les douanes et taxes d'importation restent exclues.</p>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  )
}
