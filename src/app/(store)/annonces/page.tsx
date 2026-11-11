"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useState } from "react"
import { Search } from "lucide-react"
import { FavoriteButton } from "@/components/listings/favorite-button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"

type Listing = {
  id: string
  title: string
  description: string
  price: number
  category: string
  item_condition: string
  location: string | null
  image_urls: string[]
  created_at: string
}

const euro = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" })

export default function AnnoncesPage() {
  const [listings, setListings] = useState<Listing[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    createClient().from("listings").select("id,title,description,price,category,item_condition,location,image_urls,created_at").eq("status", "active").order("created_at", { ascending: false }).limit(60)
      .then(({ data, error }) => {
        if (!active) return
        if (!error && data) setListings(data as Listing[])
        setLoading(false)
      })
    return () => { active = false }
  }, [])

  const visible = listings.filter((listing) => {
    const term = search.toLocaleLowerCase("fr")
    return !term || [listing.title, listing.description, listing.category, listing.location ?? ""].some((value) => value.toLocaleLowerCase("fr").includes(term))
  })

  return (
    <section className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold text-violet-700">La communauté GoWill</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Toutes les annonces</h1>
          <p className="mt-2 text-muted-foreground">Découvre les produits proposés par les membres.</p>
        </div>
        <Link href="/deposer" className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90">Déposer une annonce</Link>
      </div>
      <div className="relative mt-8 max-w-xl">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher un produit, une catégorie..." className="pl-9" aria-label="Rechercher une annonce" />
      </div>
      {loading ? <p className="py-16 text-center text-muted-foreground">Chargement des annonces...</p> :
        visible.length === 0 ? <div className="py-20 text-center"><h2 className="text-xl font-semibold">Aucune annonce pour le moment</h2><p className="mt-2 text-muted-foreground">Essaie une autre recherche ou publie la première annonce.</p></div> :
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {visible.map((listing) => (
            <article key={listing.id} className="group relative overflow-hidden rounded-xl border bg-white transition-shadow hover:shadow-md">
              <Link href={`/annonces/${listing.id}`} className="block">
                <div className="relative aspect-square bg-neutral-100">
                  {listing.image_urls?.[0] ? <Image src={listing.image_urls[0]} alt={listing.title} fill unoptimized className="object-cover transition-transform group-hover:scale-105" /> : <div className="flex h-full items-center justify-center text-4xl text-neutral-300">📦</div>}
                </div>
                <div className="p-3">
                  <p className="text-xs text-violet-700">{listing.category}</p>
                  <h2 className="mt-1 line-clamp-2 text-sm font-medium">{listing.title}</h2>
                  <p className="mt-2 font-bold">{euro.format(Number(listing.price))}</p>
                  {listing.location && <p className="mt-1 truncate text-xs text-muted-foreground">{listing.location}</p>}
                </div>
              </Link>
              <FavoriteButton listingId={listing.id} className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 shadow hover:bg-white" />
            </article>
          ))}
        </div>
      }
    </section>
  )
}
