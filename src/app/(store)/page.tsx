import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { siteConfig } from "@/lib/config"
import { NewsletterForm } from "@/components/layout/newsletter-form"
import { PLACEHOLDER_IMAGE } from "@/lib/constants"
import { categoryRepository } from "@/lib/repositories"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: "Acheter et vendre en ligne",
  description: siteConfig.description,
  alternates: { canonical: "/" },
  openGraph: {
    title: "GoWill — Achetez et vendez en ligne",
    description: siteConfig.description,
    type: "website",
    url: siteConfig.url,
  },
  keywords: ["GoWill", "marketplace", "acheter", "vendre", "annonces", "seconde main"],
}

export default async function HomePage() {
  const categories = await categoryRepository.list()
  const supabase = await createClient()
  const { data: latestListings } = await supabase
    .from("listings")
    .select("id,title,price,category,image_urls,location")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(4)
  const euro = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" })

  return (
    <div className="flex flex-col">
      <section className="relative overflow-hidden bg-neutral-950 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-violet-900/50 via-neutral-950 to-neutral-950" />
        <div className="relative mx-auto flex min-h-[560px] w-full max-w-[1440px] flex-col items-center justify-center px-4 py-20 text-center sm:px-6 lg:px-8">
          <Badge variant="secondary" className="mb-6 border border-white/15 bg-white/10 text-white">
            La marketplace de tous les jours
          </Badge>
          <h1 className="max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-7xl">
            Trouvez. Vendez. <span className="text-violet-300">Recommencez.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-base text-neutral-300 sm:text-lg">
            Mode, maison, high-tech, loisirs et bien plus encore : découvrez les annonces
            de la communauté et donnez une nouvelle vie aux produits.
          </p>
          <div className="mt-9 flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/annonces">
                <ShoppingBag className="mr-2 h-4 w-4" />
                Explorer les annonces
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>

          </div>
          <p className="mt-5 text-xs text-neutral-400">
            La consultation est ouverte. Un compte sera nécessaire pour publier une annonce.
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1440px] px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-violet-700">À découvrir</p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight">Explorer par catégorie</h2>
          </div>
          <Link href="/annonces" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            Tout voir
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {categories.map((category) => (
            <Link key={category.id} href={`/${category.slug}`} className="group">
              <div className="relative aspect-square overflow-hidden rounded-xl bg-neutral-100">
                <Image
                  src={category.image?.url ?? PLACEHOLDER_IMAGE}
                  alt={category.image?.alt ?? category.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 768px) 50vw, 16vw"
                />
              </div>
              <h3 className="mt-3 text-center text-sm font-medium group-hover:text-violet-700">
                {category.name}
              </h3>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1440px] px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm font-medium text-violet-700">Sélection GoWill</p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight">Annonces à découvrir</h2>
          </div>
          <Link href="/annonces" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            Voir toutes les annonces
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {(latestListings ?? []).map((listing) => (
            <Link key={listing.id} href={`/annonces/${listing.id}`} className="group overflow-hidden rounded-xl border bg-white transition-shadow hover:shadow-md">
              <div className="relative aspect-square bg-neutral-100">
                {listing.image_urls?.[0] ? (
                  <Image src={listing.image_urls[0]} alt={listing.title} fill unoptimized className="object-cover transition-transform group-hover:scale-105" />
                ) : <div className="flex h-full items-center justify-center text-4xl text-neutral-300">📦</div>}
              </div>
              <div className="p-3">
                <p className="text-xs text-violet-700">{listing.category}</p>
                <h3 className="mt-1 line-clamp-2 text-sm font-medium">{listing.title}</h3>
                <p className="mt-2 font-bold">{euro.format(Number(listing.price))}</p>
                {listing.location && <p className="mt-1 truncate text-xs text-muted-foreground">{listing.location}</p>}
              </div>
            </Link>
          ))}
          {(!latestListings || latestListings.length === 0) && (
            <div className="col-span-full rounded-xl border border-dashed p-10 text-center">
              <p className="font-medium">Les premières annonces arrivent bientôt.</p>
              <p className="mt-2 text-sm text-muted-foreground">Connecte-toi pour publier le premier produit sur GoWill.</p>
              <Link href="/deposer" className="mt-4 inline-block text-sm font-semibold text-violet-700">Déposer une annonce</Link>
            </div>
          )}
        </div>
      </section>


      <section className="bg-neutral-900 text-white">
        <div className="mx-auto flex max-w-[1440px] flex-col items-center px-4 py-16 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Restez au courant</h2>
          <p className="mt-4 text-neutral-400">
            Recevez les actualités et nouveautés de GoWill.
          </p>
          <NewsletterForm />
        </div>
      </section>
    </div>
  )
}
