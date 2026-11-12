const restrictedPatterns: RegExp[] = [
  /\barmes?\b/i,
  /\bmunitions?\b/i,
  /\bexplosifs?\b/i,
  /\bdrogues?\b/i,
  /\bstup[eé]fiants?\b/i,
  /\balcool\b/i,
  /\btabac\b/i,
  /\bnicotine\b/i,
  /\bjeux?\s+d'argent\b/i,
  /\bparis?\s+(sportifs?|en\s+ligne)\b/i,
  /\bm[eé]dicaments?\s+sur\s+ordonnance\b/i,
  /\bcontrefa[cç]ons?\b/i,
]

export function getListingPolicyError(
  title: string,
  description: string,
  category: string
): string | null {
  const content = `${category} ${title} ${description}`.normalize("NFC")

  if (restrictedPatterns.some((pattern) => pattern.test(content))) {
    return "Cette annonce semble concerner un produit interdit ou réglementé par les règles GoWill. Elle ne peut pas être publiée."
  }

  return null
}
