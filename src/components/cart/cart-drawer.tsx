"use client"

import Link from "next/link"
import { ShoppingBag, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet"
import { CartItem } from "./cart-item"
import { useCartStore } from "@/store/cart"
import { formatPrice } from "@/lib/utils"

export function CartDrawer() {
  const items = useCartStore((s) => s.items)
  const isOpen = useCartStore((s) => s.isOpen)
  const closeCart = useCartStore((s) => s.closeCart)
  const getSubtotal = useCartStore((s) => s.getSubtotal)
  const subtotal = getSubtotal()

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent side="right" className="flex !w-full flex-col !gap-0 sm:!w-3/4 sm:max-w-md" showCloseButton={false}>
        <SheetHeader>
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={closeCart}
              className="text-sm text-muted-foreground hover:text-foreground sm:hidden"
            >
              ← Retour
            </button>
            <button
              type="button"
              onClick={closeCart}
              className="hidden rounded-md p-1 text-muted-foreground hover:text-foreground sm:ml-auto sm:block"
              aria-label="Fermer le panier"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <SheetTitle className="mt-2 text-2xl font-bold tracking-tight">
            Mon panier ({items.length} article{items.length > 1 ? "s" : ""})
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <ShoppingBag className="h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-sm font-medium">Ton panier est vide</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Parcours les annonces pour trouver un article.
            </p>
            <Button className="mt-6" onClick={closeCart} asChild>
              <Link href="/annonces">Découvrir les annonces</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-4">
              <div className="divide-y">
                {items.map((item) => (
                  <CartItem key={item.variantId} item={item} />
                ))}
              </div>
            </div>

            <SheetFooter className="!mt-0 shrink-0 border-t !px-4 !pt-4 !pb-8">
              <div className="w-full space-y-3">
                <div className="flex justify-between text-sm font-medium">
                  <span>Sous-total</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Les frais d'expédition sont estimés dans l'étape suivante. Aucun paiement réel n'est effectué.
                </p>
                <Button className="w-full" size="lg" asChild onClick={closeCart}>
                  <Link href="/checkout">Voir la livraison et l'aperçu</Link>
                </Button>
                <button
                  type="button"
                  className="mb-4 w-full py-2 text-center text-sm text-muted-foreground underline hover:text-foreground sm:mb-0 sm:hidden"
                  onClick={closeCart}
                >
                  Continuer mes achats
                </button>
              </div>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
