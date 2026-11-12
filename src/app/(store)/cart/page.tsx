"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ShoppingBag } from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { EmptyState } from "@/components/ui/empty-state"
import { useCartStore } from "@/store/cart"
import { CartItem } from "@/components/cart/cart-item"
import { CartSummary } from "@/components/cart/cart-summary"
import { calculateCartShipping } from "@/lib/shipping"
import { siteConfig } from "@/lib/config"
import { useMounted } from "@/hooks/use-mounted"

export default function CartPage() {
  const items = useCartStore((s) => s.items)
  const getSubtotal = useCartStore((s) => s.getSubtotal)
  const mounted = useMounted()

  if (!mounted) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <PageHeader title="Mon panier" />
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <PageHeader title="Mon panier" />
        <EmptyState
          icon={ShoppingBag}
          title="Ton panier est vide"
          description="Ajoute une annonce pour la retrouver ici."
          actionLabel="Découvrir les annonces"
          actionHref="/annonces"
        />
      </div>
    )
  }

  const subtotal = getSubtotal()
  const fallbackShipping = subtotal >= siteConfig.freeShippingThreshold ? 0 : 599
  const shipping = calculateCartShipping(items, fallbackShipping)

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 pb-16 sm:px-6 sm:py-16 lg:px-8">
      <PageHeader title="Mon panier" />
      <p className="mt-2 text-sm text-muted-foreground">
        Les annonces correspondent à des articles uniques. Les frais d&apos;expédition sont des estimations tant qu&apos;un transporteur n&apos;a pas confirmé un devis.
      </p>
      <div className="mt-8">
        <div className="divide-y">
          {items.map((item) => (
            <CartItem key={item.variantId} item={item} />
          ))}
        </div>
        <Separator className="my-6" />
        <CartSummary subtotal={subtotal} shipping={shipping} />
        <div className="mt-8 flex flex-col gap-3">
          <Button size="lg" asChild>
            <Link href="/checkout">Continuer vers la livraison</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/annonces">Continuer mes achats</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
