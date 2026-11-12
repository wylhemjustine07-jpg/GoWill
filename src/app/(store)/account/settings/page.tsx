"use client"

import { FormEvent, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/ui/page-header"
import { useAuthGuard } from "@/hooks/use-auth-guard"
import { useAuthStore } from "@/store/auth"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { passwordSchema } from "@/lib/validators"
import type { User } from "@/types"

export default function SettingsPage() {
  const { user, isReady } = useAuthGuard()

  if (!isReady || !user) return null

  return <SettingsContent user={user} />
}

function SettingsContent({ user }: { user: User }) {
  const updateProfile = useAuthStore((s) => s.updateProfile)
  const [firstName, setFirstName] = useState(user.firstName)
  const [lastName, setLastName] = useState(user.lastName)
  const [savingProfile, setSavingProfile] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [savingPassword, setSavingPassword] = useState(false)

  async function handleSaveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!firstName.trim() || !lastName.trim()) {
      toast.error("Indique ton prénom et ton nom.")
      return
    }

    setSavingProfile(true)
    const success = await updateProfile({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
    })
    setSavingProfile(false)

    if (success) toast.success("Profil enregistré.")
    else toast.error("Impossible d'enregistrer le profil. Réessaie.")
  }

  async function handleChangePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!user.email) return

    const passwordValidation = passwordSchema.safeParse(newPassword)
    if (!passwordValidation.success) {
      toast.error(passwordValidation.error.issues[0].message)
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error("Les deux nouveaux mots de passe ne correspondent pas.")
      return
    }

    setSavingPassword(true)
    const supabase = createClient()
    const { error: verificationError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    })

    if (verificationError) {
      setSavingPassword(false)
      toast.error("Le mot de passe actuel est incorrect.")
      return
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setSavingPassword(false)

    if (error) {
      toast.error(error.message || "Impossible de modifier le mot de passe.")
      return
    }

    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
    toast.success("Mot de passe modifié.")
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <PageHeader title="Paramètres" />
      <Card className="mt-8">
        <CardHeader><CardTitle>Informations du profil</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label htmlFor="firstName">Prénom</Label><Input id="firstName" autoComplete="given-name" value={firstName} onChange={(event) => setFirstName(event.target.value)} required /></div>
              <div className="space-y-2"><Label htmlFor="lastName">Nom</Label><Input id="lastName" autoComplete="family-name" value={lastName} onChange={(event) => setLastName(event.target.value)} required /></div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Adresse e-mail</Label>
              <Input id="email" type="email" value={user.email} readOnly disabled />
              <p className="text-xs text-muted-foreground">L&apos;adresse e-mail est gérée par le système de connexion du compte.</p>
            </div>
            <Button type="submit" disabled={savingProfile}>{savingProfile ? "Enregistrement..." : "Enregistrer le profil"}</Button>
          </form>
        </CardContent>
      </Card>

      <Card className="mt-8">
        <CardHeader><CardTitle>Changer le mot de passe</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2"><Label htmlFor="currentPassword">Mot de passe actuel</Label><Input id="currentPassword" type="password" autoComplete="current-password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} required /></div>
            <div className="space-y-2"><Label htmlFor="newPassword">Nouveau mot de passe (12 caractères minimum)</Label><Input id="newPassword" type="password" autoComplete="new-password" minLength={12} maxLength={128} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} required /></div>
            <div className="space-y-2"><Label htmlFor="confirmPassword">Confirmer le nouveau mot de passe</Label><Input id="confirmPassword" type="password" autoComplete="new-password" minLength={12} maxLength={128} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required /></div>
            <Button type="submit" disabled={savingPassword}>{savingPassword ? "Modification..." : "Modifier le mot de passe"}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
