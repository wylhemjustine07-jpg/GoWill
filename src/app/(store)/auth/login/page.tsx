"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AuthCardLayout } from "@/components/auth/auth-card-layout"
import { useAuthStore } from "@/store/auth"
import { toast } from "sonner"
import { loginSchema } from "@/lib/validators"

export default function LoginPage() {
  const router = useRouter()
  const login = useAuthStore((s) => s.login)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const result = loginSchema.safeParse({ email, password })
    if (!result.success) {
      toast.error(result.error.issues[0].message)
      return
    }
    setLoading(true)
    try {
      const success = await login(email, password)
      if (success) {
        toast.success("Connexion réussie !")
        router.push("/account")
        router.refresh()
      } else {
        toast.error("Adresse e-mail ou mot de passe incorrect.")
      }
    } catch {
      toast.error("Impossible de se connecter. Vérifie la configuration de GoWill.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthCardLayout
      title="Connexion à GoWill"
      subtitle="Retrouve ton compte et tes annonces."
      footerText="Tu n'as pas encore de compte ?"
      footerLinkText="Créer un compte"
      footerLinkHref="/auth/register"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Adresse e-mail</Label>
          <Input id="email" type="email" autoComplete="email" placeholder="toi@exemple.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Mot de passe</Label>
            <Link href="/auth/forgot-password" className="text-xs text-muted-foreground hover:text-foreground">Mot de passe oublié ?</Link>
          </div>
          <Input id="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Connexion..." : "Se connecter"}
        </Button>
        <p className="text-center text-xs text-muted-foreground">Tu resteras connecté sur cet appareil jusqu'à ta déconnexion.</p>
      </form>
    </AuthCardLayout>
  )
}
