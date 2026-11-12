import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/ui/page-header"
import { ShieldCheck, Users, Package } from "lucide-react"

const plannedTools = [
  {
    title: "Gestion des annonces",
    description: "Une file de modération devra permettre de vérifier les annonces signalées et les contenus interdits.",
    icon: Package,
  },
  {
    title: "Gestion des membres",
    description: "Les outils de gestion des comptes et de traitement des signalements ne sont pas encore raccordés.",
    icon: Users,
  },
]

export default function AdminDashboardPage() {
  return (
    <div>
      <PageHeader
        title="Administration GoWill"
        description="Les outils de modération et de gestion ne sont pas encore activés."
      />

      <div className="mt-8 rounded-xl border border-amber-300/60 bg-amber-50 p-4 text-sm text-amber-900">
        Aucun chiffre de vente ou de fréquentation n'est affiché ici : les paiements et les commandes réelles ne sont pas activés.
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {plannedTools.map((tool) => (
          <Card key={tool.title}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <tool.icon className="h-5 w-5 text-muted-foreground" />
                {tool.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{tool.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldCheck className="h-5 w-5" />
            Prochaine étape
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Avant l'ouverture publique, l'accès administrateur devra être attribué
            de façon sécurisée et les outils de modération devront être testés.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
