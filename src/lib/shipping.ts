export type ShippingFeePayer = "buyer" | "seller" | "split"

export interface ShippingCartLine {
  sellerId?: string
  quantity: number
  shippingFeeAmount?: number
  shippingFeePayer?: ShippingFeePayer
}

export function getBuyerShippingShare(
  amountInCents: number,
  payer: ShippingFeePayer = "buyer"
): number {
  const amount = Math.max(0, Math.round(Number(amountInCents) || 0))

  if (payer === "seller") return 0
  if (payer === "split") return Math.ceil(amount / 2)
  return amount
}

/**
 * Marketplace listings carry their own seller-entered shipping estimate.
 * Ordinary store products retain the existing single-cart demo rate.
 */
export function calculateCartShipping(
  items: readonly ShippingCartLine[],
  fallbackShippingInCents: number
): number {
  const hasOrdinaryProducts = items.some((item) => !item.sellerId)
  const ordinaryShipping = hasOrdinaryProducts ? fallbackShippingInCents : 0

  return items.reduce((total, item) => {
    if (!item.sellerId) return total

    const buyerShare = getBuyerShippingShare(
      item.shippingFeeAmount ?? 0,
      item.shippingFeePayer ?? "buyer"
    )

    return total + buyerShare * Math.max(1, item.quantity)
  }, ordinaryShipping)
}

export function getOriginCountry(origin?: string | null): string {
  if (!origin) return ""
  const separator = origin.lastIndexOf(",")
  return separator >= 0 ? origin.slice(separator + 1).trim() : ""
}

export function normalizeCountry(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\\u0300-\\u036f]/g, "")
    .trim()
    .toLocaleLowerCase()
}
