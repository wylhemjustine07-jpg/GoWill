"use client"

import { formatPrice } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import { siteConfig } from "@/lib/config"

interface CartSummaryProps {
  subtotal: number
  shipping?: number
}

export function CartSummary({ subtotal, shipping: providedShipping }: CartSummaryProps) {
  const hasCustomShipping = providedShipping !== undefined
  const shipping = providedShipping ?? (subtotal >= siteConfig.freeShippingThreshold ? 0 : 599)
  const total = subtotal + shipping

  return (
    <div className="space-y-3">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Sous-total</span>
        <span>{formatPrice(subtotal)}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{hasCustomShipping ? "Livraison estimée" : "Livraison"}</span>
        <span>{shipping === 0 ? "Offerte" : formatPrice(shipping)}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Taxes et douanes</span>
        <span className="text-right text-muted-foreground">Non calculées</span>
      </div>
      <Separator />
      <div className="flex justify-between font-medium">
        <span>Total</span>
        <span>{formatPrice(total)}</span>
      </div>
      {!hasCustomShipping && subtotal > 0 && subtotal < siteConfig.freeShippingThreshold && (
        <p className="text-xs text-muted-foreground">
          Ajoute encore {formatPrice(siteConfig.freeShippingThreshold - subtotal)} pour bénéficier de la livraison offerte
        </p>
      )}
    </div>
  )
}
