"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AuthCardLayout } from "@/components/auth/auth-card-layout"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setLoading(true)
    const { error } = await createClient().auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    setLoading(false)
    if (error) toast.error("Impossible d'envoyer le lien pour le moment.")
    else toast.success("Si cette adresse correspond à un compte, un lien de réinitialisation a été envoyé.")
  }

  return (
    <AuthCardLayout
      title="Réinitialiser le mot de passe"
      subtitle="Indique ton adresse e-mail pour recevoir un lien de réinitialisation."
      footerText="Tu te souviens de ton mot de passe ?"
      footerLinkText="Se connecter"
      footerLinkHref="/auth/login"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Adresse e-mail</Label>
          <Input id="email" type="email" autoComplete="email" placeholder="toi@exemple.com" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>{loading ? "Envoi..." : "Envoyer le lien"}</Button>
      </form>
    </AuthCardLayout>
  )
}
