import type { Metadata } from "next"
import Link from "next/link"
import { ExternalLink, MessageCircle } from "lucide-react"

export const metadata: Metadata = {
  title: "Contact et retours",
  description: "Informations pour transmettre un retour sur le prototype GoWill.",
}

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <p className="text-sm font-semibold text-violet-700">Échanger autour du projet</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">Contact et retours</h1>
      <div className="mt-8 space-y-6 text-muted-foreground">
        <p>
          GoWill est encore en développement et ne dispose pas d'un service
          client opérationnel. Aucun message envoyé depuis cette page ne doit
          être considéré comme une demande de support enregistrée.
        </p>
        <div className="rounded-xl border p-5">
          <div className="flex items-center gap-2 font-semibold text-foreground">
            <MessageCircle className="h-5 w-5 text-violet-700" />
            Signaler un problème technique
          </div>
          <p className="mt-2 text-sm">
            Le dépôt GitHub permet de suivre les évolutions et de signaler un
            problème technique. Les tickets y sont publics : n'y partage pas
            d'adresse, de numéro de téléphone, de mot de passe ou d'autres
            informations personnelles.
          </p>
          <Link
            href="https://github.com/wylhemjustine07-jpg/GoWill/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-violet-700 underline"
          >
            Ouvrir les problèmes GitHub
            <ExternalLink className="h-4 w-4" />
          </Link>
        </div>
        <p className="text-sm">
          Un formulaire privé de support et une adresse de contact officielle
          seront ajoutés lorsque l'organisation du service sera définie.
        </p>
      </div>
    </div>
  )
}
