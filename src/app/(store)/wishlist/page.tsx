"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useState } from "react"
import { Heart } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { FavoriteButton } from "@/components/listings/favorite-button"

type Listing = { id: string; title: string; price: number; category: string; location: string | null; image_urls: string[] }
const euro = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" })

export default function WishlistPage() {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [signedIn, setSignedIn] = useState(false)

  useEffect(() => {
    let active = true
    async function loadFavorites() {
      const supabase = createClient()
      const { data: auth } = await supabase.auth.getUser()
      if (!active) return
      if (!auth.user) { setSignedIn(false); setLoading(false); return }
      setSignedIn(true)
      const { data: favorites, error } = await supabase.from("favorites").select("listing_id").eq("user_id", auth.user.id)
      if (error || !favorites?.length) { setListings([]); setLoading(false); return }
      const ids = favorites.map((favorite) => favorite.listing_id)
      const { data } = await supabase.from("listings").select("id,title,price,category,location,image_urls").in("id", ids).eq("status", "active")
      if (active) { setListings((data ?? []) as Listing[]); setLoading(false) }
    }
    void loadFavorites()
    return () => { active = false }
  }, [])

  return (
    <section className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8"><p className="text-sm font-semibold text-violet-700">Ton espace GoWill</p><h1 className="mt-2 text-3xl font-bold tracking-tight">Mes favoris</h1><p className="mt-2 text-muted-foreground">Retrouve les annonces que tu as enregistrées.</p></div>
      {loading ? <p className="py-16 text-center text-muted-foreground">Chargement de tes favoris...</p> :
        !signedIn ? <div className="rounded-2xl border py-16 text-center"><Heart className="mx-auto h-9 w-9 text-muted-foreground" /><h2 className="mt-4 text-xl font-semibold">Connecte-toi pour retrouver tes favoris</h2><p className="mt-2 text-sm text-muted-foreground">Tes annonces enregistrées seront conservées dans ton compte.</p><Link href="/auth/login" className="mt-5 inline-flex rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground">Se connecter</Link></div> :
        listings.length === 0 ? <div className="rounded-2xl border py-16 text-center"><Heart className="mx-auto h-9 w-9 text-muted-foreground" /><h2 className="mt-4 text-xl font-semibold">Aucun favori pour le moment</h2><p className="mt-2 text-sm text-muted-foreground">Appuie sur le cœur d’une annonce pour la retrouver ici.</p><Link href="/annonces" className="mt-5 inline-flex rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground">Découvrir les annonces</Link></div> :
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">{listings.map((listing) => <article key={listing.id} className="relative overflow-hidden rounded-xl border bg-white">
          <Link href={`/annonces/${listing.id}`} className="block"><div className="relative aspect-square bg-neutral-100">{listing.image_urls?.[0] ? <Image src={listing.image_urls[0]} alt={listing.title} fill unoptimized className="object-cover" /> : <div className="flex h-full items-center justify-center text-4xl text-neutral-300">📦</div>}</div>
            <div className="p-3"><p className="text-xs text-violet-700">{listing.category}</p><h2 className="mt-1 line-clamp-2 text-sm font-medium">{listing.title}</h2><p className="mt-2 font-bold">{euro.format(Number(listing.price))}</p>{listing.location && <p className="mt-1 truncate text-xs text-muted-foreground">{listing.location}</p>}</div></Link>
          <FavoriteButton listingId={listing.id} className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 shadow hover:bg-white" />
        </article>)}</div>
      }
    </section>
  )
}
