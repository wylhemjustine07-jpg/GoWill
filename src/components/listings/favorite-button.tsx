"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Heart } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

type Props = { listingId: string; className?: string }

export function FavoriteButton({ listingId, className = "" }: Props) {
  const [userId, setUserId] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let active = true
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!active) return
      const id = data.user?.id ?? null
      setUserId(id)
      if (id) {
        const { data: favorite } = await supabase.from("favorites").select("listing_id").eq("user_id", id).eq("listing_id", listingId).maybeSingle()
        if (active) setSaved(Boolean(favorite))
      }
      if (active) setLoading(false)
    })
    return () => { active = false }
  }, [listingId])

  async function toggleFavorite() {
    if (!userId || busy) return
    setBusy(true)
    const supabase = createClient()
    if (saved) {
      const { error } = await supabase.from("favorites").delete().eq("user_id", userId).eq("listing_id", listingId)
      if (!error) setSaved(false)
    } else {
      const { error } = await supabase.from("favorites").insert({ user_id: userId, listing_id: listingId })
      if (!error) setSaved(true)
    }
    setBusy(false)
  }

  if (!userId && !loading) {
    return (
      <Link href="/auth/login" aria-label="Se connecter pour ajouter aux favoris" title="Connecte-toi pour enregistrer cette annonce" className={className}>
        <Heart className="h-5 w-5" />
      </Link>
    )
  }

  return (
    <button type="button" onClick={toggleFavorite} disabled={loading || busy || !userId} aria-label={saved ? "Retirer des favoris" : "Ajouter aux favoris"} aria-pressed={saved} title={saved ? "Retirer des favoris" : "Ajouter aux favoris"} className={className}>
      <Heart className={`h-5 w-5 transition-colors ${saved ? "fill-rose-500 text-rose-500" : ""}`} />
    </button>
  )
}
