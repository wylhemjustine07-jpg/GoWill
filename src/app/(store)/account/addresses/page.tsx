"use client"

import { FormEvent, useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/ui/page-header"
import { EmptyState } from "@/components/ui/empty-state"
import { MapPin, Plus, Trash2, Star } from "lucide-react"
import { useAuthGuard } from "@/hooks/use-auth-guard"
import { createClient } from "@/lib/supabase/client"
import type { Address } from "@/types"
import { toast } from "sonner"

type AddressRow = {
  id: string; type: "shipping" | "billing"; first_name: string; last_name: string
  line1: string; line2: string | null; city: string; state: string
  postal_code: string; country: string; phone: string | null; is_default: boolean
}

const emptyForm = {
  firstName: "", lastName: "", line1: "", line2: "",
  city: "", state: "", postalCode: "", country: "Guadeloupe",
}

function mapAddress(row: AddressRow): Address {
  return {
    id: row.id, type: row.type, firstName: row.first_name, lastName: row.last_name,
    line1: row.line1, line2: row.line2 ?? undefined, city: row.city, state: row.state,
    postalCode: row.postal_code, country: row.country, phone: row.phone ?? undefined,
    isDefault: row.is_default,
  }
}

export default function AddressesPage() {
  const { user, isReady } = useAuthGuard()
  const [addresses, setAddresses] = useState<Address[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(emptyForm)

  const loadAddresses = useCallback(async () => {
    if (!user) return
    const { data, error } = await createClient().from("user_addresses").select("*").eq("user_id", user.id).order("created_at", { ascending: false })
    if (error) toast.error("Impossible de charger les adresses.")
    else setAddresses((data ?? []).map((row) => mapAddress(row as AddressRow)))
    setLoading(false)
  }, [user])

  useEffect(() => { if (isReady && user) void loadAddresses() }, [isReady, user, loadAddresses])

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  async function handleAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!user || saving) return
    setSaving(true)
    const supabase = createClient()
    const { data, error } = await supabase.from("user_addresses").insert({
      user_id: user.id, type: "shipping", first_name: form.firstName.trim(),
      last_name: form.lastName.trim(), line1: form.line1.trim(), line2: form.line2.trim() || null,
      city: form.city.trim(), state: form.state.trim(), postal_code: form.postalCode.trim(),
      country: form.country.trim(), is_default: addresses.length === 0,
    }).select("*").single()
    setSaving(false)
    if (error || !data) { toast.error("Impossible d'enregistrer cette adresse."); return }
    setAddresses((current) => [mapAddress(data as AddressRow), ...current])
    toast.success("Adresse enregistrée.")
    setShowForm(false)
    setForm(emptyForm)
  }

  async function handleDelete(id: string) {
    if (!user) return
    const { error } = await createClient().from("user_addresses").delete().eq("id", id).eq("user_id", user.id)
    if (error) { toast.error("Impossible de supprimer cette adresse."); return }
    setAddresses((current) => current.filter((address) => address.id !== id))
    toast.success("Adresse supprimée.")
  }

  async function handleSetDefault(id: string) {
    if (!user) return
    const supabase = createClient()
    const { error: clearError } = await supabase.from("user_addresses").update({ is_default: false }).eq("user_id", user.id)
    if (clearError) { toast.error("Impossible de modifier l'adresse par défaut."); return }
    const { error } = await supabase.from("user_addresses").update({ is_default: true }).eq("id", id).eq("user_id", user.id)
    if (error) { toast.error("Impossible de définir cette adresse par défaut."); return }
    setAddresses((current) => current.map((address) => ({ ...address, isDefault: address.id === id })))
    toast.success("Adresse par défaut mise à jour.")
  }

  if (!isReady || loading) return <p className="py-20 text-center text-muted-foreground">Chargement des adresses...</p>

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <PageHeader title="Mes adresses">
        <Button onClick={() => setShowForm((value) => !value)}><Plus className="mr-2 h-4 w-4" />Ajouter une adresse</Button>
      </PageHeader>

      {showForm && (
        <Card className="mt-6"><CardContent className="pt-6">
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label htmlFor="firstName">Prénom</Label><Input id="firstName" name="firstName" value={form.firstName} onChange={handleChange} required /></div>
              <div className="space-y-2"><Label htmlFor="lastName">Nom</Label><Input id="lastName" name="lastName" value={form.lastName} onChange={handleChange} required /></div>
            </div>
            <div className="space-y-2"><Label htmlFor="line1">Adresse</Label><Input id="line1" name="line1" value={form.line1} onChange={handleChange} required /></div>
            <div className="space-y-2"><Label htmlFor="line2">Complément (facultatif)</Label><Input id="line2" name="line2" value={form.line2} onChange={handleChange} /></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label htmlFor="city">Ville</Label><Input id="city" name="city" value={form.city} onChange={handleChange} required /></div>
              <div className="space-y-2"><Label htmlFor="state">Région / département</Label><Input id="state" name="state" value={form.state} onChange={handleChange} /></div>
              <div className="space-y-2"><Label htmlFor="postalCode">Code postal</Label><Input id="postalCode" name="postalCode" value={form.postalCode} onChange={handleChange} required /></div>
              <div className="space-y-2"><Label htmlFor="country">Pays</Label><Input id="country" name="country" value={form.country} onChange={handleChange} required /></div>
            </div>
            <div className="flex gap-2"><Button type="submit" disabled={saving}>{saving ? "Enregistrement..." : "Enregistrer"}</Button><Button type="button" variant="outline" onClick={() => setShowForm(false)}>Annuler</Button></div>
          </form>
        </CardContent></Card>
      )}

      {addresses.length === 0 && !showForm && <EmptyState icon={MapPin} title="Aucune adresse enregistrée" description="Ajoute une adresse pour la retrouver plus tard." />}
      {addresses.length > 0 && (
        <div className="mt-8 space-y-4">
          {addresses.map((address) => (
            <Card key={address.id}><CardContent className="flex items-start justify-between gap-4 pt-6">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2"><p className="text-sm font-medium">{address.firstName} {address.lastName}</p>{address.isDefault && <Badge variant="secondary">Par défaut</Badge>}</div>
                <p className="mt-1 text-sm text-muted-foreground">{address.line1}{address.line2 ? `, ${address.line2}` : ""}<br />{address.postalCode} {address.city}<br />{address.state ? `${address.state}, ` : ""}{address.country}</p>
                {!address.isDefault && <Button variant="link" size="sm" className="mt-2 h-auto p-0" onClick={() => void handleSetDefault(address.id)}><Star className="mr-1 h-3 w-3" />Définir par défaut</Button>}
              </div>
              <Button variant="ghost" size="icon" onClick={() => void handleDelete(address.id)} aria-label="Supprimer l'adresse"><Trash2 className="h-4 w-4" /></Button>
            </CardContent></Card>
          ))}
        </div>
      )}
    </div>
  )
}
