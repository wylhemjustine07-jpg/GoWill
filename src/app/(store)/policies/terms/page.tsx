import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Conditions d'utilisation",
  description: "Informations de démonstration sur les règles du prototype GoWill.",
}

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <p className="text-sm font-semibold text-violet-700">Prototype</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">Conditions d'utilisation</h1>
      <p className="mt-4 text-sm text-muted-foreground">
        Informations provisoires — ce texte n'est pas encore un document
        contractuel de vente.
      </p>
      <div className="mt-8 space-y-6 text-muted-foreground">
        <section className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">Utilisation du prototype</h2>
          <p>
            GoWill est un prototype en développement destiné à tester la
            consultation d'annonces, la publication de produits, les favoris et
            les échanges entre membres. Les fonctions de paiement et de commande
            réelle ne sont pas activées.
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">Annonces et contenus</h2>
          <p>
            Les membres doivent publier des informations exactes et disposer
            des droits nécessaires sur les textes et les photos qu'ils ajoutent.
            Les annonces illicites, trompeuses ou portant sur des produits
            interdits ou réglementés ne sont pas autorisées sur le prototype.
          </p>
          <p>
            Une annonce peut être retirée si elle enfreint les règles du site.
            Les vérifications automatiques ne remplacent pas la modération
            humaine ni les obligations applicables.
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">Prix et expédition</h2>
          <p>
            Les prix et frais saisis dans les annonces sont des informations
            déclarées par leurs auteurs. Les devis éventuels sont indicatifs
            tant qu'aucun service de réservation ou d'expédition n'est activé.
            Aucun paiement, remboursement ou suivi de colis n'est exécuté par
            cette version.
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">Avant toute ouverture publique</h2>
          <p>
            Les règles contractuelles, les responsabilités de la plateforme et
            des vendeurs, la gestion des litiges, les conditions de vente et
            les informations de l'éditeur devront être définies et vérifiées
            avec un adulte responsable et un professionnel compétent.
          </p>
        </section>
        <p className="rounded-xl border border-amber-300/60 bg-amber-50 p-4 text-sm text-amber-900">
          Ne réalise aucune transaction réelle sur la base de cette page ou de
          l'aperçu de commande actuel.
        </p>
      </div>
    </div>
  )
}
