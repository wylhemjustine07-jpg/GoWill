import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Confidentialité",
  description: "Informations sur les données utilisées par le prototype GoWill.",
}

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <p className="text-sm font-semibold text-violet-700">Prototype</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">Confidentialité</h1>
      <p className="mt-4 text-sm text-muted-foreground">
        Cette page décrit le fonctionnement technique actuel ; elle ne remplace
        pas une politique de confidentialité complète et validée.
      </p>
      <div className="mt-8 space-y-6 text-muted-foreground">
        <section className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">Données utilisées</h2>
          <p>
            Le prototype utilise Supabase pour les comptes et les données de la
            marketplace. Selon les fonctions utilisées, cela peut inclure
            l'adresse e-mail du compte, le nom de profil, les annonces et leurs
            photos, les favoris, les messages, les adresses de livraison et
            l'adresse d'expédition privée d'un vendeur.
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">Visibilité et accès</h2>
          <p>
            Les annonces actives et leurs photos sont destinées à être publiques.
            Les conversations sont réservées à leurs participants. Les adresses
            enregistrées et les coordonnées d'expédition privées sont protégées
            par des règles d'accès au niveau de la base de données.
          </p>
          <p>
            N'ajoute jamais de mot de passe, de document d'identité ou
            d'information bancaire dans une annonce ou un message. Ne publie pas
            de photo contenant une adresse ou un document privé.
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">Fournisseurs techniques</h2>
          <p>
            L'authentification, la base de données et le stockage des images
            reposent sur Supabase. Les demandes de devis transporteur peuvent
            passer par Shippo lorsque cette option serveur est configurée.
            Consulte les informations de ces fournisseurs pour connaître leurs
            propres pratiques de traitement des données.
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">Avant les tests</h2>
          <p>
            Utilise des données fictives tant que la politique complète, les
            durées de conservation, les modalités d'exercice des droits et les
            coordonnées du responsable du service n'ont pas été définies et
            vérifiées.
          </p>
        </section>
        <p className="rounded-xl border border-amber-300/60 bg-amber-50 p-4 text-sm text-amber-900">
          Cette page doit être complétée et validée par un adulte responsable et
          un professionnel compétent avant une ouverture au public.
        </p>
      </div>
    </div>
  )
}
