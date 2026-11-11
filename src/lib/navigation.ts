export interface NavItem {
  name: string
  href: string
}

export interface NavSection {
  label: string
  items: NavItem[]
}

// Navigation GoWill — catégories et espaces principaux.
export const shopLinks: NavItem[] = [
  { name: "Toutes les annonces", href: "/annonces" },
  { name: "Déposer une annonce", href: "/deposer" },
  { name: "Mode", href: "/annonces?categorie=Mode" },
  { name: "Maison", href: "/annonces?categorie=Maison" },
  { name: "High-tech", href: "/annonces?categorie=High-tech" },
]

export const accountLinks: NavItem[] = [
  { name: "Mon compte", href: "/account" },
  { name: "Favoris", href: "/wishlist" },
  { name: "Commandes", href: "/account/orders" },
]

export const infoLinks: NavItem[] = [
  { name: "À propos", href: "/about" },
  { name: "Contact", href: "/contact" },
  { name: "FAQ", href: "/faq" },
]

export const mobileMenuSections: NavSection[] = [
  { label: "Marketplace", items: shopLinks },
  { label: "Mon espace", items: accountLinks },
  { label: "Informations", items: infoLinks },
]
