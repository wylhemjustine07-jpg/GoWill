"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useAuthGuard } from "@/hooks/use-auth-guard"
import { createClient } from "@/lib/supabase/client"

const categories = [
  "Mode", "Maison", "High-tech", "Téléphones", "Jeux vidéo",
  "Sports et loisirs", "Beauté", "Livres", "Jouets", "Autre",
]

export default function DeposerPage() {
  const router = useRouter()
  const { user, isReady } = useAuthGuard()
  const [form, setForm] = useState({
    title: "", description: "", price: "", category: "Mode",
    item_condition: "good", location: "", image_url: "",
  })
  const [loading, setLoading] = useState(false)

  function update(field: string, value: string) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!user) return
    const price = Number(form.price.replace(",", "."))
    if (!Number.isFinite(price) || price < 0) {
      toast.error("Indique un prix valide.")
      return
    }
    setLoading(true)
    const imageUrls = form.image_url.trim() ? [form.image_url.trim()] : []
    const { error } = await createClient().from("listings").insert({
      seller_id: user.id,
      title: form.title.trim(),
      description: form.description.trim(),
      price,
      category: form.category,
      item_condition: form.item_condition,
      location: form.location.trim() || null,
      image_urls: imageUrls,
      status: "active",
    })
    setLoading(false)
    if (error) {
      toast.error("L'annonce n'a pas pu être publiée. Réessaie dans un instant.")
      return
    }
    toast.success("Ton annonce est publiée sur GoWill !")
    router.push("/annonces")
    router.refresh()
  }

  if (!isReady) return <div className="mx-auto max-w-2xl px-4 py-20 text-center">Chargement de ton espace...</div>

  return (
    <section className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <div className="mb-8">
        <p className="text-sm font-semibold text-violet-700">Espace vendeur</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Déposer une annonce</h1>
        <p className="mt-2 text-muted-foreground">Présente clairement ton produit pour aider les acheteurs à le trouver.</p>
      </div>
      <form onSubmit={submit} className="space-y-5 rounded-2xl border bg-white p-5 shadow-sm sm:p-7">
        <div className="space-y-2">
          <Label htmlFor="title">Titre de l'annonce</Label>
          <Input id="title" maxLength={120} minLength={3} value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="Ex. Veste en jean" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" minLength={10} maxLength={5000} rows={5} value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="Décris le produit, son état et ses caractéristiques..." required />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="price">Prix (€)</Label>
            <Input id="price" type="number" min="0" step="0.01" value={form.price} onChange={(e) => update("price", e.target.value)} placeholder="25,00" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Catégorie</Label>
            <select id="category" value={form.category} onChange={(e) => update("category", e.target.value)} className="h-10 w-full rounded-md border bg-background px-3 text-sm">
              {categories.map((category) => <option key={category}>{category}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="item_condition">État du produit</Label>
            <select id="item_condition" value={form.item_condition} onChange={(e) => update("item_condition", e.target.value)} className="h-10 w-full rounded-md border bg-background px-3 text-sm">
              <option value="new">Neuf</option>
              <option value="like_new">Comme neuf</option>
              <option value="good">Bon état</option>
              <option value="fair">État correct</option>
              <option value="for_parts">Pour pièces</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Ville (facultatif)</Label>
            <Input id="location" maxLength={100} value={form.location} onChange={(e) => update("location", e.target.value)} placeholder="Ex. Pointe-à-Pitre" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="image_url">Lien d'une photo (facultatif)</Label>
          <Input id="image_url" type="url" value={form.image_url} onChange={(e) => update("image_url", e.target.value)} placeholder="https://..." />
          <p className="text-xs text-muted-foreground">L'ajout direct de photos depuis ton appareil sera ajouté ensuite.</p>
        </div>
        <Button type="submit" className="w-full" disabled={loading}>{loading ? "Publication..." : "Publier mon annonce"}</Button>
      </form>
    </section>
  )
}
