"use client"

import { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Info, Package } from "lucide-react"
import { useOrdersStore } from "@/store/orders"
import { formatPrice, formatDate } from "@/lib/utils"

export default function CheckoutSuccessPage() {
  return <Suspense><CheckoutSuccessContent /></Suspense>
}

function CheckoutSuccessContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get("order_id")
  const getOrderById = useOrdersStore((s) => s.getOrderById)
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!mounted) return <div className="mx-auto max-w-3xl px-4 py-16 text-center"><h1 className="text-3xl font-bold">Chargement...</h1></div>

  const order = orderId ? getOrderById(orderId) : undefined

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center text-center">
        <Info className="h-14 w-14 text-primary" />
        <h1 className="mt-6 text-3xl font-bold tracking-tight">Aperçu de commande créé</h1>
        <p className="mt-4 max-w-xl text-muted-foreground">Cette démonstration est enregistrée uniquement dans le stockage local de ce navigateur. Aucune commande n'a été envoyée à un vendeur, aucun paiement n'a été effectué et aucun colis ne sera expédié.</p>

        {order && (
          <Card className="mt-8 w-full text-left">
            <CardContent className="space-y-4 pt-6">
              <div className="flex justify-between gap-4 text-sm"><span className="text-muted-foreground">Référence de démonstration</span><span className="font-medium">{order.orderNumber}</span></div>
              <div className="flex justify-between gap-4 text-sm"><span className="text-muted-foreground">Date</span><span>{formatDate(order.createdAt)}</span></div>
              <div className="flex justify-between gap-4 text-sm"><span className="text-muted-foreground">Livraison choisie</span><span>{order.deliveryMethod === "relay" ? "Point relais" : "À domicile"}</span></div>
              {order.deliveryMethod === "relay" && order.relayName && <div className="flex justify-between gap-4 text-sm"><span className="text-muted-foreground">Point relais saisi</span><span className="text-right font-medium">{order.relayName}</span></div>}
              <Separator />
              {order.items.map((item) => <div key={item.id} className="flex justify-between gap-4 text-sm"><span className="text-muted-foreground">{item.name} × {item.quantity}</span><span>{formatPrice(item.total)}</span></div>)}
              <Separator />
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Sous-total</span><span>{formatPrice(order.subtotal)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Livraison (simulation)</span><span>{order.shipping === 0 ? "Offerte" : formatPrice(order.shipping)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Taxes (simulation)</span><span>{formatPrice(order.tax)}</span></div>
              <Separator />
              <div className="flex justify-between font-medium"><span>Total simulé</span><span>{formatPrice(order.total)}</span></div>
            </CardContent>
          </Card>
        )}

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Button asChild><Link href="/shop"><Package className="mr-2 h-4 w-4" />Retour à la boutique</Link></Button>
          <Button variant="outline" asChild><Link href="/annonces">Voir les annonces GoWill</Link></Button>
        </div>
      </div>
    </div>
  )
}
