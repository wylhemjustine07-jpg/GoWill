import Link from "next/link"
import { Separator } from "@/components/ui/separator"
import { siteConfig } from "@/lib/config"

const footerGroups = [
  {
    title: "Marketplace",
    links: [
      { label: "Toutes les annonces", href: "/annonces" },
      { label: "Déposer une annonce", href: "/deposer" },
      { label: "Mes favoris", href: "/wishlist" },
    ],
  },
  {
    title: "Mon espace",
    links: [
      { label: "Mon compte", href: "/account" },
      { label: "Mes annonces", href: "/account/annonces" },
      { label: "Mes messages", href: "/messages" },
    ],
  },
  {
    title: "Informations",
    links: [
      { label: "À propos de GoWill", href: "/about" },
      { label: "Questions fréquentes", href: "/faq" },
      { label: "Contact et retours", href: "/contact" },
    ],
  },
  {
    title: "Prototype et confidentialité",
    links: [
      { label: "Expédition", href: "/policies/shipping" },
      { label: "Retours", href: "/policies/returns" },
      { label: "Confidentialité", href: "/policies/privacy" },
      { label: "Conditions d'utilisation", href: "/policies/terms" },
    ],
  },
]

export function Footer() {
  return (
    <footer className="border-t bg-white">
      <div className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-1">
            <Link href="/" className="text-xl font-semibold tracking-tight">
              {siteConfig.name}
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              {siteConfig.tagline}
            </p>
            <p className="mt-3 text-xs leading-5 text-muted-foreground">
              Un projet en construction pour faciliter les échanges entre membres.
            </p>
          </div>

          {footerGroups.map((group) => (
            <div key={group.title}>
              <h2 className="text-sm font-semibold">{group.title}</h2>
              <ul className="mt-4 space-y-3">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {siteConfig.copyrightYear} {siteConfig.name}. Tous droits réservés.</p>
          <p>Prototype en développement — aucun paiement ni envoi réel.</p>
        </div>
      </div>
    </footer>
  )
}
