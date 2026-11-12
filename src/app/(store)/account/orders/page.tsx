"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Package } from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { EmptyState } from "@/components/ui/empty-state"
import { OrderStatusBadge } from "@/components/ui/order-status-badge"
import { useAuthGuard } from "@/hooks/use-auth-guard"
import { useOrdersStore } from "@/store/orders"
import { formatPrice, formatDate } from "@/lib/utils"

const statusLabels = {
  pending: "En attente",
  processing: "En préparation",
  shipped: "Expédiée",
  delivered: "Livrée",
  cancelled: "Annulée",
  refunded: "Remboursée",
} as const

export default function OrdersPage() {
  const { user, isReady } = useAuthGuard()
  const orders = useOrdersStore((s) => s.orders)

  if (!isReady) return null

  const userOrders = user
    ? orders.filter((order) => order.customerEmail === user.email)
    : []

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <PageHeader
        title="Mes aperçus de commande"
        description={userOrders.length > 0 ? String(userOrders.length) + " aperçu(s) enregistré(s) sur cet appareil" : undefined}
      />

      <p className="mt-4 rounded-lg border border-amber-300/60 bg-amber-50 p-3 text-sm text-amber-900">
        Ces aperçus sont conservés uniquement dans le navigateur utilisé. Ce ne sont pas des commandes réelles : aucun paiement n'est traité et aucun vendeur n'est notifié.
      </p>

      {userOrders.length === 0 ? (
        <EmptyState
          icon={Package}
          title="Aucun aperçu de commande"
          description="Lorsque tu crées un aperçu depuis le checkout de démonstration, il apparaîtra ici sur cet appareil."
          actionLabel="Découvrir les annonces"
          actionHref="/annonces"
        />
      ) : (
        <div className="mt-8 space-y-4">
          {userOrders.map((order) => (
            <Card key={order.id}>
              <CardContent className="pt-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-medium">{order.orderNumber}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">{statusLabels[order.status]}</span>
                    <OrderStatusBadge status={order.status} />
                    <span className="text-sm font-medium">{formatPrice(order.total)}</span>
                  </div>
                </div>
                <div className="mt-4 text-sm text-muted-foreground">
                  {order.items.map((item) => (
                    <span key={item.id} className="mr-3">
                      {item.name} × {item.quantity}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
