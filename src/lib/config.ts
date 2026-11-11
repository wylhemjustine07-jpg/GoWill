// GoWill — configuration générale du site
export const siteConfig = {
  name: "GoWill",
  tagline: "La marketplace où chacun peut acheter et vendre.",
  description:
    "GoWill réunit acheteurs et vendeurs autour d'une marketplace simple, pratique et ouverte à de nombreuses catégories de produits.",
  announcement: "Bienvenue sur GoWill — découvrez les annonces de la communauté.",
  url: process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000",
  contact: {
    email: "",
    phone: "",
    address: { street: "", suite: "", city: "", state: "", zip: "" },
  },
  social: {
    twitter: "",
    instagram: "",
    facebook: "",
    youtube: "",
    tiktok: "",
  },
  // Paramètres conservés pour compatibilité avec le panier de démonstration.
  freeShippingThreshold: 7500,
  taxRate: 0,
  currency: "EUR",
  locale: "fr-FR",
  copyrightYear: new Date().getFullYear(),
} as const

export type SiteConfig = typeof siteConfig
