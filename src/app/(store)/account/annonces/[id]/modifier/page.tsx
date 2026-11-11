"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import { useAuthGuard } from "@/hooks/use-auth-guard"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

const categories = ["Mode", "Maison", "High-tech", "Téléphones", "Jeux vidéo", "Sports et loisirs", "Beauté", "Livres", "Jouets", "Autre"]
type ListingForm = { title: string; description: string; price: string; category: string; item_condition: string; location: string }

export default function ModifierAnnoncePage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { user, isReady } = useAuthGuard()
  const [form, setForm] = useState<ListingForm>({ title: "", description: "", price: "", category: "Mode", item_condition: "good", location: "" })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [missing, setMissing] = useState(false)

  useEffect(() => {
    if (!isReady || !user) return
    let active = true
    createClient().from("listings").select("id,title,description,price,category,item_condition,location").eq("id", params.id).eq("seller_id", user.id).maybeSingle()
      .then(({ data, error }) => {
        if (!active) return
        if (error || !data) setMissing(true)
        else setForm({ title: data.title, description: data.description, price: String(data.price), category: data.category, item_condition: data.item_condition, location: data.location ?? "" })
        setLoading(false)
      })
    return () => { active = false }
  }, [isReady, user, params.id])

  function update(field: keyof ListingForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!user) return
    const price = Number(form.price.replace(",", "."))
    if (!Number.isFinite(price) || price < 0) { toast.error("Indique un prix valide."); return }
    setSaving(true)
    const { error } = await createClient().from("listings").update({
      title: form.title.trim(),
      description: form.description.trim(),
      price,
      category: form.category,
      item_condition: form.item_condition,
      location: form.location.trim() || null,
      updated_at: new Date().toISOString(),
    }).eq("id", params.id).eq("seller_id", user.id)
    setSaving(false)
    if (error) { toast.error("La modification n'a pas été enregistrée."); return }
    toast.success("Ton annonce a bien été modifiée.")
    router.push("/account/annonces")
    router.refresh()
  }

  if (!isReady || loading) return <p className="py-20 text-center text-muted-foreground">Chargement de ton annonce...</p>
  if (missing) return <section className="mx-auto max-w-xl px-4 py-20 text-center"><h1 className="text-2xl font-bold">Annonce introuvable</h1><p className="mt-2 text-muted-foreground">Cette annonce n'existe pas ou ne t'appartient pas.</p><Button asChild className="mt-5"><Link href="/account/annonces">Retour à mes annonces</Link></Button></section>

  return (
    <section className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <div className="mb-8"><p className="text-sm font-semibold text-violet-700">Espace vendeur</p><h1 className="mt-2 text-3xl font-bold tracking-tight">Modifier mon annonce</h1><p className="mt-2 text-sm text-muted-foreground">Les photos déjà publiées sont conservées.</p></div>
      <form onSubmit={submit} className="space-y-5 rounded-2xl border bg-white p-5 shadow-sm sm:p-7">
        <div className="space-y-2"><Label htmlFor="title">Titre de l'annonce</Label><Input id="title" minLength={3} maxLength={120} value={form.title} onChange={(e) => update("title", e.target.value)} required /></div>
        <div className="space-y-2"><Label htmlFor="description">Description</Label><Textarea id="description" maxLength={5000} rows={6} value={form.description} onChange={(e) => update("description", e.target.value)} required /></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2"><Label htmlFor="price">Prix (€)</Label><Input id="price" type="number" min="0" step="0.01" value={form.price} onChange={(e) => update("price", e.target.value)} required /></div>
          <div className="space-y-2"><Label htmlFor="category">Catégorie</Label><select id="category" value={form.category} onChange={(e) => update("category", e.target.value)} className="h-10 w-full rounded-md border bg-background px-3 text-sm">{categories.map((category) => <option key={category}>{category}</option>)}</select></div>
          <div className="space-y-2"><Label htmlFor="item_condition">État du produit</Label><select id="item_condition" value={form.item_condition} onChange={(e) => update("item_condition", e.target.value)} className="h-10 w-full rounded-md border bg-background px-3 text-sm"><option value="new">Neuf</option><option value="like_new">Comme neuf</option><option value="good">Bon état</option><option value="fair">État correct</option><option value="for_parts">Pour pièces</option></select></div>
          <div className="space-y-2"><Label htmlFor="location">Ville (facultatif)</Label><Input id="location" maxLength={100} value={form.location} onChange={(e) => update("location", e.target.value)} /></div>
        </div>
        <div className="flex flex-col-reverse gap-3 sm:flex-row"><Button type="submit" className="flex-1" disabled={saving}>{saving ? "Enregistrement..." : "Enregistrer les modifications"}</Button><Button type="button" variant="outline" asChild><Link href="/account/annonces">Annuler</Link></Button></div>
      </form>
    </section>
  )
}
