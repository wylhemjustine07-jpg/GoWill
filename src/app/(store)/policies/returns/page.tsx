import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Retours et remboursements",
  description: "État actuel des fonctions de retour et de remboursement de GoWill.",
}

export default function ReturnsPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <p className="text-sm font-semibold text-violet-700">Prototype</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">Retours et remboursements</h1>
      <div className="mt-8 space-y-6 text-muted-foreground">
        <section className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">Aucune transaction réelle</h2>
          <p>
            Le checkout GoWill est actuellement une démonstration locale. Aucun
            paiement n'est encaissé et aucune commande n'est transmise à un
            vendeur. Il n'existe donc pas encore de procédure de retour ou de
            remboursement exécutée par GoWill.
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">Avant une ouverture commerciale</h2>
          <p>
            Une politique contractuelle devra préciser les responsabilités des
            vendeurs et de la plateforme, les conditions de retour, les délais,
            les frais éventuels et la procédure de réclamation. Elle devra être
            vérifiée par un adulte responsable et un professionnel compétent
            avant toute vente réelle.
          </p>
        </section>
        <p className="rounded-xl border border-amber-300/60 bg-amber-50 p-4 text-sm text-amber-900">
          Ne considère pas cette page comme une garantie de remboursement ou
          comme des conditions de vente définitives.
        </p>
      </div>
    </div>
  )
}
