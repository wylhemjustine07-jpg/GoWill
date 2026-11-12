import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { Search, SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FavoriteButton } from "@/components/listings/favorite-button"
import { BuyListingButton } from "@/components/listings/buy-listing-button"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: "Toutes les annonces",
  description: "Découvre les produits proposés par les membres de GoWill.",
}

const PAGE_SIZE = 20
const CATEGORIES = ["Mode", "Maison", "High-tech", "Téléphones", "Jeux vidéo", "Sports et loisirs", "Beauté", "Livres", "Jouets", "Autre"] as const
const CONDITIONS = [
  { value: "new", label: "Neuf" },
  { value: "like_new", label: "Comme neuf" },
  { value: "good", label: "Bon état" },
  { value: "fair", label: "État correct" },
  { value: "for_parts", label: "Pour pièces" },
] as const

type SearchParams = Promise<{
  q?: string
  category?: string
  condition?: string
  country?: string
  min?: string
  max?: string
  sort?: string
  page?: string
}>

type Listing = {
  id: string
  title: string
  description: string
  price: number
  category: string
  item_condition: string
  location: string | null
  image_urls: string[] | null
  created_at: string
  seller_id: string
  shipping_origin_country_code: string | null
  shipping_fee_amount: number
  shipping_fee_payer: "buyer" | "seller" | "split"
  ships_internationally: boolean
}

const euro = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" })
const conditionLabels: Record<string, string> = {
  new: "Neuf",
  like_new: "Comme neuf",
  good: "Bon état",
  fair: "État correct",
  for_parts: "Pour pièces",
}

function parsePrice(value?: string) {
  if (!value?.trim()) return null
  const number = Number(value.replace(",", "."))
  return Number.isFinite(number) && number >= 0 ? number : null
}

function escapeLike(value: string) {
  return value.replace(/[\\%_]/g, "\\$&")
}

function pageHref(page: number, filters: {
  q: string
  category: string
  condition: string
  country: string
  min: string
  max: string
  sort: string
}) {
  const query = new URLSearchParams()
  if (filters.q) query.set("q", filters.q)
  if (filters.category) query.set("category", filters.category)
  if (filters.condition) query.set("condition", filters.condition)
  if (filters.country) query.set("country", filters.country)
  if (filters.min) query.set("min", filters.min)
  if (filters.max) query.set("max", filters.max)
  if (filters.sort !== "newest") query.set("sort", filters.sort)
  query.set("page", String(page))
  return "/annonces?" + query.toString()
}

export default async function AnnoncesPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams
  const q = (params.q ?? "").trim().slice(0, 80)
  const category = CATEGORIES.includes(params.category as (typeof CATEGORIES)[number]) ? params.category! : ""
  const condition = CONDITIONS.some((item) => item.value === params.condition) ? params.condition! : ""
  const country = (params.country ?? "").trim().slice(0, 60)
  const min = parsePrice(params.min)
  const max = parsePrice(params.max)
  const sort = ["newest", "price-asc", "price-desc"].includes(params.sort ?? "") ? params.sort! : "newest"
  const requestedPage = Math.max(1, Math.min(1000, Number.parseInt(params.page ?? "1", 10) || 1))

  const supabase = await createClient()
  let query = supabase
    .from("listings")
    .select("id,title,description,price,category,item_condition,location,image_urls,created_at,seller_id,shipping_origin_country_code,shipping_fee_amount,shipping_fee_payer,ships_internationally", { count: "exact" })
    .eq("status", "active")

  if (q) query = query.ilike("title", "%" + escapeLike(q) + "%")
  if (category) query = query.eq("category", category)
  if (condition) query = query.eq("item_condition", condition)
  if (country) query = query.ilike("location", "%" + escapeLike(country) + "%")
  if (min !== null) query = query.gte("price", min)
  if (max !== null) query = query.lte("price", max)

  if (sort === "price-asc") query = query.order("price", { ascending: true })
  else if (sort === "price-desc") query = query.order("price", { ascending: false })
  else query = query.order("created_at", { ascending: false })

  const { data, count, error } = await query.range((requestedPage - 1) * PAGE_SIZE, requestedPage * PAGE_SIZE - 1)
  const listings = (data ?? []) as Listing[]
  const total = count ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const page = Math.min(requestedPage, totalPages)
  const filters = {
    q,
    category,
    condition,
    country,
    min: params.min ?? "",
    max: params.max ?? "",
    sort,
  }
  const invalidPriceRange = min !== null && max !== null && min > max

  return (
    <section className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold text-violet-700">La communauté GoWill</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Toutes les annonces</h1>
          <p className="mt-2 text-muted-foreground">Découvre les produits proposés par les membres.</p>
        </div>
        <Button asChild><Link href="/deposer">Déposer une annonce</Link></Button>
      </div>

      <form action="/annonces" method="get" className="mt-8 rounded-2xl border bg-white p-4 sm:p-5">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold">
          <SlidersHorizontal className="h-4 w-4 text-violet-700" />
          Rechercher et filtrer
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative sm:col-span-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input name="q" defaultValue={q} maxLength={80} placeholder="Nom du produit..." className="pl-9" aria-label="Rechercher par nom" />
          </div>
          <select name="category" defaultValue={category} aria-label="Catégorie" className="h-10 rounded-md border bg-background px-3 text-sm">
            <option value="">Toutes les catégories</option>
            {CATEGORIES.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <select name="condition" defaultValue={condition} aria-label="État du produit" className="h-10 rounded-md border bg-background px-3 text-sm">
            <option value="">Tous les états</option>
            {CONDITIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
          <Input name="country" defaultValue={country} maxLength={60} placeholder="Pays ou ville d'expédition" aria-label="Pays ou ville d'expédition" />
          <Input name="min" defaultValue={params.min ?? ""} inputMode="decimal" placeholder="Prix minimum (€)" aria-label="Prix minimum" />
          <Input name="max" defaultValue={params.max ?? ""} inputMode="decimal" placeholder="Prix maximum (€)" aria-label="Prix maximum" />
          <select name="sort" defaultValue={sort} aria-label="Trier les annonces" className="h-10 rounded-md border bg-background px-3 text-sm">
            <option value="newest">Plus récentes</option>
            <option value="price-asc">Prix croissant</option>
            <option value="price-desc">Prix décroissant</option>
          </select>
        </div>
        {invalidPriceRange && <p className="mt-3 text-sm text-red-600">Le prix minimum doit être inférieur au prix maximum.</p>}
        <div className="mt-4 flex flex-wrap gap-3">
          <Button type="submit">Appliquer les filtres</Button>
          <Button type="reset" variant="outline" asChild><Link href="/annonces">Effacer les filtres</Link></Button>
        </div>
      </form>

      <div className="mt-6 flex items-center justify-between gap-3 text-sm text-muted-foreground">
        <p>{error ? "Chargement indisponible" : String(total) + " annonce" + (total > 1 ? "s" : "")}</p>
        {totalPages > 1 && <p>Page {page} sur {totalPages}</p>}
      </div>

      {error ? (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-800">
          Impossible de charger les annonces. Vérifie la connexion au service puis actualise la page.
        </div>
      ) : listings.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed p-12 text-center">
          <h2 className="text-xl font-semibold">Aucune annonce ne correspond</h2>
          <p className="mt-2 text-sm text-muted-foreground">Essaie d'autres filtres ou publie la première annonce.</p>
          <Button asChild className="mt-5"><Link href="/deposer">Déposer une annonce</Link></Button>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {listings.map((listing) => (
            <article key={listing.id} className="group relative overflow-hidden rounded-xl border bg-white transition-shadow hover:shadow-md">
              <Link href={"/annonces/" + listing.id} className="block">
                <div className="relative aspect-square bg-neutral-100">
                  {listing.image_urls?.[0] ? <Image src={listing.image_urls[0]} alt={listing.title} fill unoptimized className="object-cover transition-transform group-hover:scale-105" /> : <div className="flex h-full items-center justify-center text-4xl text-neutral-300">📦</div>}
                </div>
                <div className="p-3">
                  <p className="text-xs text-violet-700">{listing.category}</p>
                  <h2 className="mt-1 line-clamp-2 text-sm font-medium">{listing.title}</h2>
                  <p className="mt-2 font-bold">{euro.format(Number(listing.price))}</p>
                  {listing.location && <p className="mt-1 truncate text-xs text-muted-foreground">Expédié depuis : {listing.location}</p>}
                  <p className="mt-1 text-xs text-muted-foreground">Expédition : {Number(listing.shipping_fee_amount ?? 0) === 0 ? "offerte" : euro.format(Number(listing.shipping_fee_amount))}</p>
                  <p className="text-xs text-muted-foreground">{conditionLabels[listing.item_condition] ?? "État non précisé"} · {listing.ships_internationally ? "International accepté" : "Pays du vendeur uniquement"}</p>
                </div>
              </Link>
              <div className="px-3 pb-3"><BuyListingButton listing={listing} className="w-full" size="sm" /></div>
              <FavoriteButton listingId={listing.id} className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 shadow hover:bg-white" />
            </article>
          ))}
        </div>
      )}

      {!error && totalPages > 1 && (
        <nav aria-label="Pagination des annonces" className="mt-10 flex items-center justify-center gap-3">
          {page > 1 ? (
            <Button asChild variant="outline"><Link href={pageHref(page - 1, filters)}>Précédent</Link></Button>
          ) : <Button disabled variant="outline">Précédent</Button>}
          <span className="text-sm text-muted-foreground">{page} / {totalPages}</span>
          {page < totalPages ? (
            <Button asChild variant="outline"><Link href={pageHref(page + 1, filters)}>Suivant</Link></Button>
          ) : <Button disabled variant="outline">Suivant</Button>}
        </nav>
      )}
    </section>
  )
}
