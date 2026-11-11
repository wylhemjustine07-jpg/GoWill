import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, ShoppingBag, Store } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { siteConfig } from "@/lib/config"
import { ProductGrid } from "@/components/products/product-grid"
import { NewsletterForm } from "@/components/layout/newsletter-form"
import { PLACEHOLDER_IMAGE } from "@/lib/constants"
import { productRepository, categoryRepository } from "@/lib/repositories"

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
  const featuredProducts = await productRepository.getFeatured(4)

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
            <Button size="lg" variant="outline" className="border-white/30 bg-white/5 text-white hover:bg-white/10 hover:text-white" asChild>
              <Link href="/auth/register">
                <Store className="mr-2 h-4 w-4" />
                Créer un compte
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
        <div className="mt-8">
          <ProductGrid products={featuredProducts} />
        </div>
      </section>

      <section className="border-y bg-neutral-50">
        <div className="mx-auto flex max-w-[1440px] flex-col items-center px-4 py-16 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Prêt à rejoindre GoWill ?
          </h2>
          <p className="mt-4 max-w-xl text-muted-foreground">
            Créez votre compte pour préparer votre espace membre. La publication d'annonces
            sera réservée aux utilisateurs connectés.
          </p>
          <Button size="lg" className="mt-8" asChild>
            <Link href="/auth/register">Créer mon compte</Link>
          </Button>
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
