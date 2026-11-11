import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Politique de livraison",
  description: "Informations sur les options et estimations de livraison GoWill.",
}

export default function ShippingPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight">Politique de livraison</h1>
      <div className="mt-8 space-y-6 text-muted-foreground">
        <section className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">Une marketplace entre pays</h2>
          <p>Les vendeurs indiquent la ville et le pays depuis lesquels ils expédient chaque article. Ils peuvent accepter les demandes internationales ou limiter leur annonce aux acheteurs de leur pays.</p>
          <p>Une destination internationale n'est pas automatiquement desservie : la possibilité d'expédier dépend du vendeur, du pays de départ, du pays de destination, du produit et des services de transport disponibles sur cette route.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">Frais d'expédition affichés</h2>
          <p>Le vendeur peut saisir une estimation en euros et choisir qui prend les frais en charge : l'acheteur à 100 %, le vendeur à 100 %, ou chacun à 50 %.</p>
          <p>Ces montants sont des estimations déclarées par les vendeurs. Ils ne sont pas encore calculés ou confirmés par un transporteur et peuvent différer du coût réel d'un envoi.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">Livraison à domicile et point relais</h2>
          <p>Le prototype permet de saisir une adresse de livraison ou les coordonnées d'un point relais. La carte peut aider à localiser une zone à partir d'un code postal ; elle ne fournit pas une liste officielle de relais ni leurs disponibilités.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">Transporteurs, douanes et suivi</h2>
          <p>Les connexions aux transporteurs, les tarifs en temps réel, les étiquettes, les enlèvements et le suivi des colis ne sont pas encore activés. Les taxes d'importation, droits de douane et conversions de devises ne sont pas calculés par GoWill.</p>
          <p>Aucun délai de livraison ne peut donc être garanti à ce stade. Vérifie les possibilités d'envoi et les éventuels frais applicables avant toute transaction réelle.</p>
        </section>

        <section className="rounded-xl border border-amber-300/60 bg-amber-50 p-4 text-sm text-amber-900">
          GoWill est actuellement en mode démonstration pour le checkout : aucun paiement réel n'est traité, aucune commande n'est transmise au vendeur et aucune expédition n'est déclenchée.
        </section>
      </div>
    </div>
  )
}
