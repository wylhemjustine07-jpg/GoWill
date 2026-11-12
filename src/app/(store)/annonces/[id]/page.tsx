"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { MessageCircle } from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { FavoriteButton } from "@/components/listings/favorite-button"
import { BuyListingButton } from "@/components/listings/buy-listing-button"
import { useAuthStore } from "@/store/auth"

type Listing = {
  id: string
  title: string
  description: string
  price: number
  category: string
  item_condition: string
  location: string | null
  image_urls: string[]
  seller_id: string
  created_at: string
  shipping_origin_country_code: string | null
  shipping_fee_amount: number
  shipping_fee_payer: "buyer" | "seller" | "split"
  ships_internationally: boolean
}

const euro = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" })
const payerLabels = { buyer: "payés par l'acheteur", split: "partagés à 50 / 50", seller: "payés par le vendeur" } as const
const conditionLabels: Record<string, string> = { new: "Neuf", like_new: "Comme neuf", good: "Bon état", fair: "État correct", for_parts: "Pour pièces" }

export default function AnnonceDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [listing, setListing] = useState<Listing | null>(null)
  const [loading, setLoading] = useState(true)
  const [contacting, setContacting] = useState(false)
  const currentUser = useAuthStore((state) => state.user)

  useEffect(() => {
    let active = true
    createClient().from("listings").select("*").eq("id", params.id).eq("status", "active").maybeSingle()
      .then(({ data }) => {
        if (active) { setListing(data as Listing | null); setLoading(false) }
      })
    return () => { active = false }
  }, [params.id])

  async function contactSeller() {
    if (!listing || contacting) return
    setContacting(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push("/auth/login")
      setContacting(false)
      return
    }
    if (user.id === listing.seller_id) {
      toast.info("Tu ne peux pas démarrer une conversation avec toi-même.")
      setContacting(false)
      return
    }
    const { data: existing } = await supabase.from("conversations").select("id").eq("listing_id", listing.id).eq("buyer_id", user.id).maybeSingle()
    let conversationId = existing?.id as string | undefined
    if (!conversationId) {
      const { data: created, error } = await supabase.from("conversations").insert({
        listing_id: listing.id,
        buyer_id: user.id,
        seller_id: listing.seller_id,
      }).select("id").single()
      if (error) {
        const { data: retry } = await supabase.from("conversations").select("id").eq("listing_id", listing.id).eq("buyer_id", user.id).maybeSingle()
        conversationId = retry?.id as string | undefined
        if (!conversationId) toast.error("Impossible d'ouvrir la conversation. Réessaie.")
      } else conversationId = created.id
    }
    setContacting(false)
    if (conversationId) router.push(`/messages/${conversationId}`)
  }

  if (loading) return <p className="py-24 text-center text-muted-foreground">Chargement de l'annonce...</p>
  if (!listing) return <section className="mx-auto max-w-2xl px-4 py-24 text-center"><h1 className="text-2xl font-bold">Annonce introuvable</h1><Link className="mt-4 inline-block text-violet-700 underline" href="/annonces">Retour aux annonces</Link></section>

  return (
    <section className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-2 sm:px-6">
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-neutral-100">
        {listing.image_urls?.[0] ? <Image src={listing.image_urls[0]} alt={listing.title} fill unoptimized className="object-cover" /> : <div className="flex h-full items-center justify-center text-7xl text-neutral-300">📦</div>}
      </div>
      <div className="flex flex-col">
        <p className="text-sm font-semibold text-violet-700">{listing.category}</p>
        <div className="flex items-start justify-between gap-4"><h1 className="mt-2 text-3xl font-bold tracking-tight">{listing.title}</h1><FavoriteButton listingId={listing.id} className="mt-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border hover:bg-neutral-50" /></div>
        <p className="mt-4 text-2xl font-bold">{euro.format(Number(listing.price))}</p>
        <div className="mt-5 flex flex-wrap gap-2 text-sm text-muted-foreground">
          <span className="rounded-full bg-neutral-100 px-3 py-1">{conditionLabels[listing.item_condition] ?? "État non précisé"}</span>
          {listing.location && <span className="rounded-full bg-neutral-100 px-3 py-1">Expédié depuis : {listing.location}</span>}
        </div>
        <div className="mt-6 rounded-xl border bg-muted/30 p-4">
          <h2 className="font-semibold">Expédition</h2>
          <p className="mt-2 text-sm">{Number(listing.shipping_fee_amount ?? 0) === 0 ? "Expédition offerte" : euro.format(Number(listing.shipping_fee_amount)) + " estimés, " + payerLabels[listing.shipping_fee_payer ?? "buyer"]}</p>
          <p className="mt-1 text-xs text-muted-foreground">{listing.ships_internationally ? "Le vendeur accepte les demandes internationales, sous réserve de la couverture du transporteur." : "Le vendeur limite cette annonce aux acheteurs de son pays."}</p>
        </div>
        <div className="mt-8 border-t pt-6">
          <h2 className="font-semibold">Description</h2>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-muted-foreground">{listing.description}</p>
        </div>
        <div className="mt-8">
          {currentUser?.id === listing.seller_id ? (
            <Button asChild variant="outline" className="w-full"><Link href="/account/annonces">Gérer mon annonce</Link></Button>
          ) : (
            <div className="space-y-3">
              <BuyListingButton listing={listing} className="w-full" size="lg" />
              <Button onClick={() => void contactSeller()} disabled={contacting} variant="outline" className="w-full">
                <MessageCircle className="mr-2 h-4 w-4" />{contacting ? "Ouverture..." : "Contacter le vendeur"}
              </Button>
            </div>
          )}
          <p className="mt-3 text-center text-xs text-muted-foreground">Ajoute l'article à ton panier pour passer à l'étape de livraison, ou contacte le vendeur pour poser une question.</p>
        </div>
      </div>
    </section>
  )
}
