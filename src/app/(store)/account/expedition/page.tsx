"use client"

import { FormEvent, useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { useAuthGuard } from "@/hooks/use-auth-guard"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type OriginForm = {
  contactName: string
  email: string
  phone: string
  street1: string
  street2: string
  city: string
  state: string
  postalCode: string
  country: string
  countryCode: string
}

const emptyForm: OriginForm = {
  contactName: "",
  email: "",
  phone: "",
  street1: "",
  street2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
  countryCode: "",
}

export default function SellerShippingOriginPage() {
  const { user, isReady } = useAuthGuard()
  const [form, setForm] = useState<OriginForm>(emptyForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const loadOrigin = useCallback(async () => {
    if (!user) return
    const { data, error } = await createClient()
      .from("seller_shipping_origins")
      .select("contact_name,email,phone,street1,street2,city,state,postal_code,country,country_code")
      .eq("seller_id", user.id)
      .maybeSingle()

    if (error) {
      toast.error("Impossible de charger l'adresse d'expédition.")
    } else if (data) {
      setForm({
        contactName: data.contact_name,
        email: data.email,
        phone: data.phone,
        street1: data.street1,
        street2: data.street2 ?? "",
        city: data.city,
        state: data.state ?? "",
        postalCode: data.postal_code,
        country: data.country,
        countryCode: data.country_code,
      })
    }
    setLoading(false)
  }, [user])

  useEffect(() => {
    if (isReady && user) void loadOrigin()
  }, [isReady, user, loadOrigin])

  function update(field: keyof OriginForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!user || saving) return

    const countryCode = form.countryCode.trim().toUpperCase()
    if (!/^[A-Z]{2}$/.test(countryCode)) {
      toast.error("Entre le code pays ISO à deux lettres, par exemple FR, GP ou JP.")
      return
    }

    setSaving(true)
    const { error } = await createClient().from("seller_shipping_origins").upsert({
      seller_id: user.id,
      contact_name: form.contactName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      street1: form.street1.trim(),
      street2: form.street2.trim() || null,
      city: form.city.trim(),
      state: form.state.trim(),
      postal_code: form.postalCode.trim(),
      country: form.country.trim(),
      country_code: countryCode,
      updated_at: new Date().toISOString(),
    }, { onConflict: "seller_id" })
    setSaving(false)

    if (error) {
      toast.error("L'adresse n'a pas été enregistrée. Vérifie les champs et réessaie.")
      return
    }

    toast.success("Adresse d'expédition privée enregistrée.")
    setForm((current) => ({ ...current, countryCode }))
  }

  if (!isReady || loading) {
    return <p className="py-20 text-center text-muted-foreground">Chargement de ton adresse d'expédition...</p>
  }

  return (
    <section className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <div className="mb-8">
        <p className="text-sm font-semibold text-violet-700">Espace vendeur</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Adresse d'expédition</h1>
        <p className="mt-2 text-sm text-muted-foreground">Cette adresse sert uniquement à demander des tarifs transporteur. Elle n'est pas affichée sur tes annonces.</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Coordonnées de départ du colis</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2"><Label htmlFor="contactName">Nom du contact expéditeur</Label><Input id="contactName" value={form.contactName} onChange={(e) => update("contactName", e.target.value)} autoComplete="name" required /></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label htmlFor="email">E-mail de contact</Label><Input id="email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} autoComplete="email" required /></div>
              <div className="space-y-2"><Label htmlFor="phone">Téléphone</Label><Input id="phone" type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} autoComplete="tel" required /></div>
            </div>
            <div className="space-y-2"><Label htmlFor="street1">Adresse de départ</Label><Input id="street1" value={form.street1} onChange={(e) => update("street1", e.target.value)} autoComplete="street-address" required /></div>
            <div className="space-y-2"><Label htmlFor="street2">Complément (facultatif)</Label><Input id="street2" value={form.street2} onChange={(e) => update("street2", e.target.value)} /></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label htmlFor="city">Ville</Label><Input id="city" value={form.city} onChange={(e) => update("city", e.target.value)} autoComplete="address-level2" required /></div>
              <div className="space-y-2"><Label htmlFor="state">Région / département</Label><Input id="state" value={form.state} onChange={(e) => update("state", e.target.value)} autoComplete="address-level1" /></div>
              <div className="space-y-2"><Label htmlFor="postalCode">Code postal</Label><Input id="postalCode" value={form.postalCode} onChange={(e) => update("postalCode", e.target.value)} autoComplete="postal-code" required /></div>
              <div className="space-y-2"><Label htmlFor="country">Pays ou territoire</Label><Input id="country" value={form.country} onChange={(e) => update("country", e.target.value)} autoComplete="country-name" required /></div>
              <div className="space-y-2 sm:col-span-2"><Label htmlFor="countryCode">Code pays ISO (2 lettres)</Label><Input id="countryCode" maxLength={2} value={form.countryCode} onChange={(e) => update("countryCode", e.target.value.toUpperCase())} placeholder="Ex. FR, GP, JP, CA" required /><p className="text-xs text-muted-foreground">Le code ISO est utilisé par les transporteurs. Vérifie qu'il correspond au pays indiqué.</p></div>
            </div>
            <Button type="submit" disabled={saving}>{saving ? "Enregistrement..." : "Enregistrer l'adresse privée"}</Button>
          </form>
        </CardContent>
      </Card>

      <p className="mt-4 rounded-lg border p-3 text-xs text-muted-foreground">Confidentialité : l'adresse complète n'est pas publique. Elle est accessible au compte vendeur et utilisée côté serveur pour les demandes de tarifs. Demande l'aide d'un parent ou d'un responsable avant d'enregistrer une adresse personnelle.</p>
      <Button asChild variant="outline" className="mt-5"><Link href="/account/annonces">Retour à mes annonces</Link></Button>
    </section>
  )
}
