import type { Metadata } from "next"
import Link from "next/link"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export const metadata: Metadata = {
  title: "Questions fréquentes",
  description: "Réponses aux questions sur les annonces et le prototype GoWill.",
}

const faqs = [
  {
    question: "Qui peut consulter les annonces ?",
    answer: "Les annonces actives sont consultables publiquement. Tu peux parcourir le catalogue sans compte.",
  },
  {
    question: "Qui peut publier une annonce ?",
    answer: "La publication est réservée aux membres connectés. Depuis « Déposer une annonce », le vendeur renseigne le produit, son état, son prix, son origine d'expédition et ses photos.",
  },
  {
    question: "Puis-je publier plusieurs photos ?",
    answer: "Oui. Une annonce peut contenir jusqu'à cinq photos. Évite d'ajouter des documents, coordonnées ou informations privées dans les images.",
  },
  {
    question: "Les vendeurs peuvent-ils expédier à l'international ?",
    answer: "Le vendeur peut indiquer s'il accepte les demandes internationales ou s'il limite son annonce à son pays. Cela ne garantit pas qu'un transporteur dessert la route : la disponibilité doit être vérifiée.",
  },
  {
    question: "Les frais d'expédition sont-ils définitifs ?",
    answer: "Non. Les frais renseignés par un vendeur sont des estimations. Le prototype peut demander un devis Shippo si le service est configuré, mais il ne réserve pas de transport et ne crée pas d'étiquette.",
  },
  {
    question: "Puis-je payer un article sur GoWill ?",
    answer: "Non. Le checkout est un aperçu de démonstration. Aucun paiement réel n'est traité, aucune commande n'est transmise au vendeur et aucun colis n'est expédié.",
  },
  {
    question: "Comment contacter un vendeur ?",
    answer: "Ouvre une annonce puis utilise le bouton « Contacter le vendeur ». La messagerie est réservée aux membres connectés.",
  },
  {
    question: "Que faire si une fonctionnalité ne marche pas ?",
    answer: "GoWill est encore en développement. Tu peux consulter le dépôt du projet pour voir son évolution. N'y publie pas d'informations personnelles dans un ticket public.",
  },
]

export default function FAQPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <p className="text-sm font-semibold text-violet-700">Besoin d'aide ?</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">Questions fréquentes</h1>
      <p className="mt-4 text-muted-foreground">
        Voici ce qu'il faut savoir sur les annonces, les échanges et les limites actuelles du prototype.
      </p>

      <Accordion className="mt-8">
        {faqs.map((faq, index) => (
          <AccordionItem key={faq.question} value={"item-" + String(index)}>
            <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <div className="mt-12 rounded-lg border bg-neutral-50 p-6 text-center">
        <h2 className="text-lg font-semibold">Une question sur le prototype ?</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          La page contact indique les moyens disponibles pour transmettre un retour.
        </p>
        <Link href="/contact" className="mt-4 inline-block text-sm font-medium underline hover:text-foreground">
          Voir la page contact
        </Link>
      </div>
    </div>
  )
}
