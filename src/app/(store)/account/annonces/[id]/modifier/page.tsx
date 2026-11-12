"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import { useAuthGuard } from "@/hooks/use-auth-guard"
import { createClient } from "@/lib/supabase/client"
import { getListingPolicyError } from "@/lib/listing-policy"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

const categories = ["Mode", "Maison", "High-tech", "Téléphones", "Jeux vidéo", "Sports et loisirs", "Beauté", "Livres", "Jouets", "Autre"]
type ListingForm = { title: string; description: string; price: string; category: string; item_condition: string; shippingCity: string; shippingCountry: string; shippingCountryCode: string; shippingFee: string; shippingFeePayer: "buyer" | "seller" | "split"; shipsInternationally: boolean; parcelWeightKg: string; parcelLengthCm: string; parcelWidthCm: string; parcelHeightCm: string }

export default function ModifierAnnoncePage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { user, isReady } = useAuthGuard()
  const [form, setForm] = useState<ListingForm>({ title: "", description: "", price: "", category: "Mode", item_condition: "good", shippingCity: "", shippingCountry: "", shippingCountryCode: "", shippingFee: "0", shippingFeePayer: "buyer", shipsInternationally: true, parcelWeightKg: "0.5", parcelLengthCm: "20", parcelWidthCm: "15", parcelHeightCm: "10" })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [missing, setMissing] = useState(false)

  useEffect(() => {
    if (!isReady || !user) return
    let active = true
    createClient().from("listings").select("id,title,description,price,category,item_condition,location,shipping_origin_country_code,shipping_fee_amount,shipping_fee_payer,ships_internationally,parcel_weight_kg,parcel_length_cm,parcel_width_cm,parcel_height_cm").eq("id", params.id).eq("seller_id", user.id).maybeSingle()
      .then(({ data, error }) => {
        if (!active) return
        if (error || !data) setMissing(true)
        else {
          const storedLocation = data.location ?? ""
          const commaIndex = storedLocation.lastIndexOf(",")
          setForm({
            title: data.title,
            description: data.description,
            price: String(data.price),
            category: data.category,
            item_condition: data.item_condition,
            shippingCity: commaIndex >= 0 ? storedLocation.slice(0, commaIndex).trim() : storedLocation,
            shippingCountry: commaIndex >= 0 ? storedLocation.slice(commaIndex + 1).trim() : "",
            shippingCountryCode: data.shipping_origin_country_code ?? "",
            shippingFee: String(data.shipping_fee_amount ?? 0),
            shippingFeePayer: data.shipping_fee_payer === "seller" || data.shipping_fee_payer === "split" ? data.shipping_fee_payer : "buyer",
            shipsInternationally: data.ships_internationally ?? true,
            parcelWeightKg: String(data.parcel_weight_kg ?? 0.5),
            parcelLengthCm: String(data.parcel_length_cm ?? 20),
            parcelWidthCm: String(data.parcel_width_cm ?? 15),
            parcelHeightCm: String(data.parcel_height_cm ?? 10),
          })
        }
        setLoading(false)
      })
    return () => { active = false }
  }, [isReady, user, params.id])

  function update(field: Exclude<keyof ListingForm, "shipsInternationally">, value: string) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!user) return
    const price = Number(form.price.replace(",", "."))
    if (!Number.isFinite(price) || price < 0) { toast.error("Indique un prix valide."); return }
    const listingPolicyError = getListingPolicyError(form.title, form.description, form.category)
    if (listingPolicyError) { toast.error(listingPolicyError); return }
    if (!form.shippingCity.trim() || !form.shippingCountry.trim()) {
      toast.error("Indique la ville et le pays depuis lesquels tu expédies l'article.")
      return
    }
    const shippingCountryCode = form.shippingCountryCode.trim().toUpperCase()
    if (!/^[A-Z]{2}$/.test(shippingCountryCode)) {
      toast.error("Indique le code pays ISO à deux lettres, par exemple FR, GP ou JP.")
      return
    }
    const shippingFeeAmount = Number(form.shippingFee.replace(",", "."))
    if (!form.shippingFee.trim() || !Number.isFinite(shippingFeeAmount) || shippingFeeAmount < 0) {
      toast.error("Indique une estimation de frais d'expédition valide.")
      return
    }
    const parcelWeightKg = Number(form.parcelWeightKg)
    const parcelLengthCm = Number(form.parcelLengthCm)
    const parcelWidthCm = Number(form.parcelWidthCm)
    const parcelHeightCm = Number(form.parcelHeightCm)
    if (![parcelWeightKg, parcelLengthCm, parcelWidthCm, parcelHeightCm].every(Number.isFinite)
      || parcelWeightKg <= 0 || parcelWeightKg > 70
      || [parcelLengthCm, parcelWidthCm, parcelHeightCm].some((value) => value <= 0 || value > 200)) {
      toast.error("Vérifie le poids et les dimensions du colis.")
      return
    }
    setSaving(true)
    const { error } = await createClient().from("listings").update({
      title: form.title.trim(),
      description: form.description.trim(),
      price,
      category: form.category,
      item_condition: form.item_condition,
      location: `${form.shippingCity.trim()}, ${form.shippingCountry.trim()}`,
      shipping_origin_country_code: shippingCountryCode,
      shipping_fee_amount: shippingFeeAmount,
      shipping_fee_payer: form.shippingFeePayer,
      ships_internationally: form.shipsInternationally,
      parcel_weight_kg: parcelWeightKg,
      parcel_length_cm: parcelLengthCm,
      parcel_width_cm: parcelWidthCm,
      parcel_height_cm: parcelHeightCm,
      updated_at: new Date().toISOString(),
    }).eq("id", params.id).eq("seller_id", user.id)
    setSaving(false)
    if (error) { toast.error("La modification n'a pas été enregistrée."); return }
    toast.success("Ton annonce a bien été modifiée.")
    router.push("/account/annonces")
    router.refresh()
  }

  if (!isReady || loading) return <p className="py-20 text-center text-muted-foreground">Chargement de ton annonce...</p>
  if (missing) return <section className="mx-auto max-w-xl px-4 py-20 text-center"><h1 className="text-2xl font-bold">Annonce introuvable</h1><p className="mt-2 text-muted-foreground">Cette annonce n&apos;existe pas ou ne t&apos;appartient pas.</p><Button asChild className="mt-5"><Link href="/account/annonces">Retour à mes annonces</Link></Button></section>

  return (
    <section className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <div className="mb-8"><p className="text-sm font-semibold text-violet-700">Espace vendeur</p><h1 className="mt-2 text-3xl font-bold tracking-tight">Modifier mon annonce</h1><p className="mt-2 text-sm text-muted-foreground">Les photos déjà publiées sont conservées.</p></div>
      <form onSubmit={submit} className="space-y-5 rounded-2xl border bg-white p-5 shadow-sm sm:p-7">
        <div className="space-y-2"><Label htmlFor="title">Titre de l&apos;annonce</Label><Input id="title" minLength={3} maxLength={120} value={form.title} onChange={(e) => update("title", e.target.value)} required /></div>
        <div className="space-y-2"><Label htmlFor="description">Description</Label><Textarea id="description" maxLength={5000} rows={6} value={form.description} onChange={(e) => update("description", e.target.value)} required /></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2"><Label htmlFor="price">Prix (€)</Label><Input id="price" type="number" min="0" step="0.01" value={form.price} onChange={(e) => update("price", e.target.value)} required /></div>
          <div className="space-y-2"><Label htmlFor="category">Catégorie</Label><select id="category" value={form.category} onChange={(e) => update("category", e.target.value)} className="h-10 w-full rounded-md border bg-background px-3 text-sm">{categories.map((category) => <option key={category}>{category}</option>)}</select></div>
          <div className="space-y-2"><Label htmlFor="item_condition">État du produit</Label><select id="item_condition" value={form.item_condition} onChange={(e) => update("item_condition", e.target.value)} className="h-10 w-full rounded-md border bg-background px-3 text-sm"><option value="new">Neuf</option><option value="like_new">Comme neuf</option><option value="good">Bon état</option><option value="fair">État correct</option><option value="for_parts">Pour pièces</option></select></div>
          <div className="space-y-2"><Label htmlFor="shippingCity">Ville d&apos;expédition</Label><Input id="shippingCity" maxLength={100} value={form.shippingCity} onChange={(e) => update("shippingCity", e.target.value)} placeholder="Ex. Tokyo" autoComplete="address-level2" required /></div>
          <div className="space-y-2"><Label htmlFor="shippingCountry">Pays d&apos;expédition</Label><Input id="shippingCountry" maxLength={80} value={form.shippingCountry} onChange={(e) => update("shippingCountry", e.target.value)} placeholder="Ex. Japon, France, Canada..." autoComplete="country-name" required /></div>
          <div className="space-y-2"><Label htmlFor="shippingCountryCode">Code pays ISO (2 lettres)</Label><Input id="shippingCountryCode" maxLength={2} value={form.shippingCountryCode} onChange={(e) => update("shippingCountryCode", e.target.value.toUpperCase())} placeholder="Ex. FR, GP, JP, CA" required /><p className="text-xs text-muted-foreground">Ce code permet de vérifier les destinations avec les transporteurs.</p></div>
          <div className="space-y-2"><Label htmlFor="shippingFee">Frais d&apos;expédition estimés (€)</Label><Input id="shippingFee" type="number" min="0" step="0.01" value={form.shippingFee} onChange={(e) => update("shippingFee", e.target.value)} required /><p className="text-xs text-muted-foreground">Indique ton estimation en euros. 0 signifie que tu offres l'expédition.</p></div>
          <div className="space-y-2"><Label htmlFor="shippingFeePayer">Qui paie l'expédition ?</Label><select id="shippingFeePayer" value={form.shippingFeePayer} onChange={(e) => update("shippingFeePayer", e.target.value as ListingForm["shippingFeePayer"])} className="h-10 w-full rounded-md border bg-background px-3 text-sm"><option value="buyer">L&apos;acheteur paie 100 %</option><option value="split">Partagé à 50 / 50</option><option value="seller">Le vendeur paie 100 %</option></select></div>
        </div>
        <div className="space-y-3 rounded-lg border p-4">
          <h2 className="text-sm font-semibold">Dimensions du colis prêt à expédier</h2>
          <p className="text-xs text-muted-foreground">Ces mesures servent à demander des tarifs transporteur. Pèse et mesure le colis emballé.</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2"><Label htmlFor="parcelWeightKg">Poids (kg)</Label><Input id="parcelWeightKg" type="number" min="0.01" max="70" step="0.001" value={form.parcelWeightKg} onChange={(e) => update("parcelWeightKg", e.target.value)} required /></div>
            <div className="space-y-2"><Label htmlFor="parcelLengthCm">Longueur (cm)</Label><Input id="parcelLengthCm" type="number" min="1" max="200" step="0.1" value={form.parcelLengthCm} onChange={(e) => update("parcelLengthCm", e.target.value)} required /></div>
            <div className="space-y-2"><Label htmlFor="parcelWidthCm">Largeur (cm)</Label><Input id="parcelWidthCm" type="number" min="1" max="200" step="0.1" value={form.parcelWidthCm} onChange={(e) => update("parcelWidthCm", e.target.value)} required /></div>
            <div className="space-y-2"><Label htmlFor="parcelHeightCm">Hauteur (cm)</Label><Input id="parcelHeightCm" type="number" min="1" max="200" step="0.1" value={form.parcelHeightCm} onChange={(e) => update("parcelHeightCm", e.target.value)} required /></div>
          </div>
        </div>
        <label className="flex items-start gap-3 rounded-lg border p-3 text-sm"><input type="checkbox" checked={form.shipsInternationally} onChange={(e) => setForm((current) => ({ ...current, shipsInternationally: e.target.checked }))} className="mt-1 h-4 w-4" /><span><span className="font-medium">J&apos;accepte les commandes internationales</span><span className="mt-1 block text-xs text-muted-foreground">Décoche cette case pour limiter l'annonce aux acheteurs de ton pays.</span></span></label>
        <div className="flex flex-col-reverse gap-3 sm:flex-row"><Button type="submit" className="flex-1" disabled={saving}>{saving ? "Enregistrement..." : "Enregistrer les modifications"}</Button><Button type="button" variant="outline" asChild><Link href="/account/annonces">Annuler</Link></Button></div>
      </form>
    </section>
  )
}
