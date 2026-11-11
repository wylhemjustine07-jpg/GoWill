"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AuthCardLayout } from "@/components/auth/auth-card-layout"
import { useAuthStore } from "@/store/auth"
import { toast } from "sonner"
import { registerSchema } from "@/lib/validators"

export default function RegisterPage() {
  const router = useRouter()
  const register = useAuthStore((s) => s.register)
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "", confirmPassword: "" })
  const [loading, setLoading] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((current) => ({ ...current, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const validation = registerSchema.safeParse(form)
    if (!validation.success) {
      toast.error(validation.error.issues[0].message)
      return
    }
    setLoading(true)
    try {
      const result = await register({ firstName: form.firstName, lastName: form.lastName, email: form.email, password: form.password })
      if (!result.success) {
        toast.error("Impossible de créer le compte. Vérifie l'adresse e-mail et réessaie.")
      } else if (result.needsEmailConfirmation) {
        toast.success("Compte créé. Consulte ta boîte e-mail pour confirmer l'inscription, puis connecte-toi.")
        router.push("/auth/login")
      } else {
        toast.success("Bienvenue sur GoWill !")
        router.push("/account")
        router.refresh()
      }
    } catch {
      toast.error("Impossible de créer le compte. Vérifie la configuration de GoWill.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthCardLayout
      title="Rejoindre GoWill"
      subtitle="Crée ton compte pour acheter et publier tes annonces."
      footerText="Tu as déjà un compte ?"
      footerLinkText="Se connecter"
      footerLinkHref="/auth/login"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">Prénom</Label>
            <Input id="firstName" name="firstName" autoComplete="given-name" value={form.firstName} onChange={handleChange} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Nom</Label>
            <Input id="lastName" name="lastName" autoComplete="family-name" value={form.lastName} onChange={handleChange} required />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Adresse e-mail</Label>
          <Input id="email" name="email" type="email" autoComplete="email" placeholder="toi@exemple.com" value={form.email} onChange={handleChange} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Mot de passe</Label>
          <Input id="password" name="password" type="password" autoComplete="new-password" minLength={8} value={form.password} onChange={handleChange} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
          <Input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" value={form.confirmPassword} onChange={handleChange} required />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Création..." : "Créer mon compte"}
        </Button>
      </form>
    </AuthCardLayout>
  )
}
