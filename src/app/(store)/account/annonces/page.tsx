"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { useAuthGuard } from "@/hooks/use-auth-guard"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"

type Listing = { id: string; title: string; price: number; status: "draft" | "active" | "sold" | "archived"; created_at: string; category: string; location: string | null }
const price = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" })
const statusLabel = { draft: "Brouillon", active: "En ligne", sold: "Vendu", archived: "Archivé" }

export default function MesAnnoncesPage() {
  const { user, isReady } = useAuthGuard()
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)

  const loadListings = useCallback(async () => {
    if (!user) return
    const { data, error } = await createClient().from("listings").select("id,title,price,status,created_at,category,location").eq("seller_id", user.id).order("created_at", { ascending: false })
    if (error) toast.error("Impossible de charger tes annonces.")
    else setListings((data ?? []) as Listing[])
    setLoading(false)
  }, [user])

  useEffect(() => { if (isReady) void loadListings() }, [isReady, loadListings])

  async function changeStatus(id: string, status: Listing["status"]) {
    const { error } = await createClient().from("listings").update({ status, updated_at: new Date().toISOString() }).eq("id", id)
    if (error) toast.error("La modification n'a pas été enregistrée.")
    else { toast.success("Annonce mise à jour."); await loadListings() }
  }

  async function removeListing(id: string) {
    if (!window.confirm("Supprimer définitivement cette annonce ?")) return
    const { error } = await createClient().from("listings").delete().eq("id", id)
    if (error) toast.error("Impossible de supprimer cette annonce.")
    else { toast.success("Annonce supprimée."); await loadListings() }
  }

  if (!isReady) return <p className="py-20 text-center text-muted-foreground">Chargement de ton espace...</p>

  return (
    <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><p className="text-sm font-semibold text-violet-700">Espace vendeur</p><h1 className="mt-2 text-3xl font-bold">Mes annonces</h1><p className="mt-2 text-muted-foreground">Gère les produits que tu proposes sur GoWill.</p></div>
        <Button asChild><Link href="/deposer">Déposer une annonce</Link></Button>
      </div>
      {loading ? <p className="py-16 text-center text-muted-foreground">Chargement...</p> :
        listings.length === 0 ? <div className="mt-8 rounded-xl border border-dashed p-10 text-center"><h2 className="font-semibold">Tu n'as pas encore d'annonce</h2><p className="mt-2 text-sm text-muted-foreground">Publie ton premier produit pour commencer à vendre.</p><Button asChild className="mt-5"><Link href="/deposer">Créer une annonce</Link></Button></div> :
        <div className="mt-8 space-y-3">
          {listings.map((listing) => (
            <article key={listing.id} className="flex flex-col gap-4 rounded-xl border bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h2 className="font-semibold">{listing.title}</h2><span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs">{statusLabel[listing.status]}</span></div><p className="mt-1 text-sm text-muted-foreground">{listing.category} · {price.format(Number(listing.price))}</p>{listing.location && <p className="mt-1 text-xs text-muted-foreground">Expédition depuis : {listing.location}</p>}<p className="mt-1 text-xs text-muted-foreground">Publiée le {new Date(listing.created_at).toLocaleDateString("fr-FR")}</p></div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" asChild><Link href={`/account/annonces/${listing.id}/modifier`}>Modifier</Link></Button>
                {listing.status === "active" ? <Button size="sm" variant="outline" onClick={() => void changeStatus(listing.id, "sold")}>Marquer vendu</Button> : listing.status === "sold" || listing.status === "archived" ? <Button size="sm" variant="outline" onClick={() => void changeStatus(listing.id, "active")}>Remettre en ligne</Button> : null}
                <Button size="sm" variant="destructive" onClick={() => void removeListing(listing.id)}>Supprimer</Button>
              </div>
            </article>
          ))}
        </div>
      }
    </section>
  )
}
