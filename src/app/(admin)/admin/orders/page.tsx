import { Package } from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { EmptyState } from "@/components/ui/empty-state"

export default function AdminOrdersPage() {
  return (
    <div>
      <PageHeader title="Gestion des commandes" description="Les commandes réelles ne sont pas encore activées." />
      <EmptyState
        icon={Package}
        title="Aucune commande réelle"
        description="Le checkout est une démonstration locale et ne transmet pas de commande à un vendeur."
      />
    </div>
  )
}
