import { Users } from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { EmptyState } from "@/components/ui/empty-state"

export default function AdminCustomersPage() {
  return (
    <div>
      <PageHeader title="Gestion des membres" description="Cet outil d'administration n'est pas encore activé." />
      <EmptyState
        icon={Users}
        title="Gestion des membres indisponible"
        description="La liste des comptes et les actions de modération ne sont pas encore raccordées."
      />
    </div>
  )
}
