"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AuthCardLayout } from "@/components/auth/auth-card-layout"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { passwordSchema } from "@/lib/validators"

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [confirmation, setConfirmation] = useState("")
  const [loading, setLoading] = useState(false)

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    const passwordValidation = passwordSchema.safeParse(password)
    if (!passwordValidation.success) { toast.error(passwordValidation.error.issues[0].message); return }
    if (password !== confirmation) { toast.error("Les mots de passe ne correspondent pas."); return }
    setLoading(true)
    const { error } = await createClient().auth.updateUser({ password })
    setLoading(false)
    if (error) { toast.error("Le lien est invalide ou a expiré. Demande-en un nouveau."); return }
    toast.success("Ton mot de passe a été modifié.")
    router.push("/account")
    router.refresh()
  }

  return (
    <AuthCardLayout title="Choisir un nouveau mot de passe" subtitle="Entre ton nouveau mot de passe pour retrouver ton compte." footerText="Tu préfères te connecter ?" footerLinkText="Connexion" footerLinkHref="/auth/login">
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-2"><Label htmlFor="password">Nouveau mot de passe (12 caractères minimum)</Label><Input id="password" type="password" autoComplete="new-password" minLength={12} maxLength={128} value={password} onChange={(event) => setPassword(event.target.value)} required /></div>
        <div className="space-y-2"><Label htmlFor="confirmation">Confirmer le mot de passe</Label><Input id="confirmation" type="password" autoComplete="new-password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} required /></div>
        <Button type="submit" className="w-full" disabled={loading}>{loading ? "Enregistrement..." : "Enregistrer le mot de passe"}</Button>
      </form>
    </AuthCardLayout>
  )
}
