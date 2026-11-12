import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "À propos de GoWill",
  description: "Découvre le projet de marketplace communautaire GoWill.",
}

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <p className="text-sm font-semibold text-violet-700">Le projet</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">À propos de GoWill</h1>
      <div className="mt-8 space-y-6 text-muted-foreground">
        <p>
          GoWill est un projet de marketplace communautaire. L'idée est de réunir
          la découverte de produits d'un grand catalogue et les annonces publiées
          directement par les membres.
        </p>
        <p>
          Les visiteurs peuvent parcourir les annonces. Les personnes disposant
          d'un compte peuvent publier leurs produits, gérer leurs annonces,
          enregistrer des favoris et échanger avec les vendeurs.
        </p>
        <h2 className="text-xl font-semibold text-foreground">Une marketplace en construction</h2>
        <p>
          GoWill est encore un prototype. Le paiement, la transmission réelle des
          commandes, les étiquettes de transport et le suivi des colis ne sont
          pas activés. Les frais affichés peuvent être des estimations et ne
          constituent pas un tarif confirmé.
        </p>
        <p>
          Le projet évolue progressivement : la sécurité des comptes, la
          confidentialité des adresses et la clarté des informations sont
          prioritaires avant toute ouverture commerciale.
        </p>
        <div className="rounded-xl border bg-muted/30 p-5">
          <h2 className="font-semibold text-foreground">Découvrir le prototype</h2>
          <p className="mt-2 text-sm">
            Parcours les annonces de la communauté ou consulte les questions
            fréquentes pour connaître les fonctions déjà disponibles.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/annonces" className="text-sm font-medium text-violet-700 underline">Voir les annonces</Link>
            <Link href="/faq" className="text-sm font-medium text-violet-700 underline">Questions fréquentes</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
