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

const categories = ["Mode", "Maison", "High-tech", "Téléphones", "Jeux vidéo", "Sports et loisirs", "Beauté", "Livres", "Jouets", "Autre"]

export default function DeposerPage() {
  const router = useRouter()
  const { user, isReady } = useAuthGuard()
  const [form, setForm] = useState({ title: "", description: "", price: "", category: "Mode", item_condition: "good", shippingCity: "", shippingCountry: "" })
  const [images, setImages] = useState<File[]>([])
  const [loading, setLoading] = useState(false)

  function update(field: string, value: string) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function selectImages(files: FileList | null) {
    const selected = Array.from(files ?? [])
    if (selected.length > 5) {
      toast.error("Tu peux ajouter jusqu'à 5 photos.")
      return
    }
    if (selected.some((file) => !file.type.startsWith("image/") || file.size > 5 * 1024 * 1024)) {
      toast.error("Chaque photo doit être une image de 5 Mo maximum.")
      return
    }
    setImages(selected)
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!user) return
    const price = Number(form.price.replace(",", "."))
    if (!Number.isFinite(price) || price < 0) {
      toast.error("Indique un prix valide.")
      return
    }
    if (!form.shippingCity.trim() || !form.shippingCountry.trim()) {
      toast.error("Indique la ville et le pays depuis lesquels tu expédies l'article.")
      return
    }
    setLoading(true)
    const supabase = createClient()
    const imageUrls: string[] = []
    try {
      for (const file of images) {
        const extension = file.name.split(".").pop()?.toLowerCase() || "jpg"
        const path = `${user.id}/${crypto.randomUUID()}.${extension}`
        const { error: uploadError } = await supabase.storage.from("listing-images").upload(path, file, { contentType: file.type, upsert: false })
        if (uploadError) throw uploadError
        imageUrls.push(supabase.storage.from("listing-images").getPublicUrl(path).data.publicUrl)
      }
      const { error } = await supabase.from("listings").insert({
        seller_id: user.id,
        title: form.title.trim(),
        description: form.description.trim(),
        price,
        category: form.category,
        item_condition: form.item_condition,
        location: `${form.shippingCity.trim()}, ${form.shippingCountry.trim()}`,
        image_urls: imageUrls,
        status: "active",
      })
      if (error) throw error
      toast.success("Ton annonce est publiée sur GoWill !")
      router.push("/annonces")
      router.refresh()
    } catch {
      toast.error("La publication a échoué. Vérifie les photos et réessaie.")
    } finally {
      setLoading(false)
    }
  }

  if (!isReady) return <div className="mx-auto max-w-2xl px-4 py-20 text-center">Chargement de ton espace...</div>

  return (
    <section className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <div className="mb-8">
        <p className="text-sm font-semibold text-violet-700">Espace vendeur</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Déposer une annonce</h1>
        <p className="mt-2 text-muted-foreground">Présente ton produit et indique le pays depuis lequel tu l'expédieras pour les acheteurs du monde entier.</p>
      </div>
      <form onSubmit={submit} className="space-y-5 rounded-2xl border bg-white p-5 shadow-sm sm:p-7">
        <div className="space-y-2">
          <Label htmlFor="title">Titre de l'annonce</Label>
          <Input id="title" maxLength={120} minLength={3} value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="Ex. Veste en jean" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" maxLength={5000} rows={5} value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="Décris le produit, son état et ses caractéristiques..." required />
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
              <option value="new">Neuf</option><option value="like_new">Comme neuf</option><option value="good">Bon état</option><option value="fair">État correct</option><option value="for_parts">Pour pièces</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="shippingCity">Ville d'expédition</Label>
            <Input id="shippingCity" maxLength={100} value={form.shippingCity} onChange={(e) => update("shippingCity", e.target.value)} placeholder="Ex. Tokyo" autoComplete="address-level2" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="shippingCountry">Pays d'expédition</Label>
            <Input id="shippingCountry" maxLength={80} value={form.shippingCountry} onChange={(e) => update("shippingCountry", e.target.value)} placeholder="Ex. Japon, France, Canada..." autoComplete="country-name" required />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="images">Photos (jusqu'à 5)</Label>
          <input id="images" type="file" accept="image/*" multiple onChange={(e) => selectImages(e.target.files)} className="block w-full rounded-md border p-3 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-neutral-100 file:px-3 file:py-2" />
          <p className="text-xs text-muted-foreground">{images.length} photo(s) sélectionnée(s), 5 Mo maximum par photo.</p>
        </div>
        <Button type="submit" className="w-full" disabled={loading}>{loading ? "Publication..." : "Publier mon annonce"}</Button>
      </form>
    </section>
  )
}
