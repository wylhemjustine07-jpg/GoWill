"use client"

import Link from "next/link"
import Image from "next/image"
import { useCallback, useEffect, useState } from "react"
import { MessageCircle, Package } from "lucide-react"
import { useAuthGuard } from "@/hooks/use-auth-guard"
import { createClient } from "@/lib/supabase/client"

type Conversation = {
  id: string
  listing_id: string
  buyer_id: string
  seller_id: string
  updated_at: string
}
type Listing = { id: string; title: string; price: number; image_urls: string[] }
type Profile = { id: string; display_name: string | null; username: string | null }

const euro = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" })

export default function MessagesPage() {
  const { user, isReady } = useAuthGuard()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [listings, setListings] = useState<Record<string, Listing>>({})
  const [profiles, setProfiles] = useState<Record<string, Profile>>({})
  const [previews, setPreviews] = useState<Record<string, string>>({})
  const [unreadByConversation, setUnreadByConversation] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!user) return
    const supabase = createClient()
    const { data, error } = await supabase.from("conversations").select("id,listing_id,buyer_id,seller_id,updated_at").order("updated_at", { ascending: false })
    if (error) { setLoading(false); return }
    const rows = (data ?? []) as Conversation[]
    setConversations(rows)
    const listingIds = [...new Set(rows.map((row) => row.listing_id))]
    const profileIds = [...new Set(rows.flatMap((row) => [row.buyer_id, row.seller_id]))]
    const conversationIds = rows.map((row) => row.id)
    if (listingIds.length) {
      const { data: listingRows } = await supabase.from("listings").select("id,title,price,image_urls").in("id", listingIds)
      setListings(Object.fromEntries((listingRows ?? []).map((item) => [item.id, item as Listing])))
    }
    if (profileIds.length) {
      const { data: profileRows } = await supabase.from("profiles").select("id,display_name,username").in("id", profileIds)
      setProfiles(Object.fromEntries((profileRows ?? []).map((item) => [item.id, item as Profile])))
    }
    if (conversationIds.length) {
      const [{ data: messageRows }, { data: unreadRows }] = await Promise.all([
        supabase.from("messages").select("conversation_id,body,created_at").in("conversation_id", conversationIds).order("created_at", { ascending: false }),
        supabase.from("messages").select("conversation_id").in("conversation_id", conversationIds).neq("sender_id", user.id).is("read_at", null),
      ])
      const latest: Record<string, string> = {}
      for (const message of messageRows ?? []) if (!latest[message.conversation_id]) latest[message.conversation_id] = message.body
      const unread: Record<string, number> = {}
      for (const message of unreadRows ?? []) unread[message.conversation_id] = (unread[message.conversation_id] ?? 0) + 1
      setPreviews(latest)
      setUnreadByConversation(unread)
    } else {
      setPreviews({})
      setUnreadByConversation({})
    }
    setLoading(false)
  }, [user])

  useEffect(() => {
    if (!isReady || !user) return
    const supabase = createClient()
    const channel = supabase.channel(`inbox-refresh-${user.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, () => { void load() })
      .subscribe()
    void load()
    return () => { void supabase.removeChannel(channel) }
  }, [isReady, user, load])

  if (!isReady) return <p className="py-20 text-center text-muted-foreground">Chargement de ton espace...</p>

  return (
    <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-700"><MessageCircle className="h-6 w-6" /></div>
        <div><p className="text-sm font-semibold text-violet-700">Espace membre</p><h1 className="text-3xl font-bold">Mes messages</h1><p className="mt-1 text-sm text-muted-foreground">Discute avec les acheteurs et les vendeurs.</p></div>
      </div>
      {loading ? <p className="py-16 text-center text-muted-foreground">Chargement des conversations...</p> :
        conversations.length === 0 ? <div className="mt-8 rounded-2xl border border-dashed p-12 text-center"><MessageCircle className="mx-auto h-10 w-10 text-muted-foreground" /><h2 className="mt-4 font-semibold">Aucune conversation pour le moment</h2><p className="mt-2 text-sm text-muted-foreground">Tu pourras contacter un vendeur depuis la page d'une annonce.</p><Link href="/annonces" className="mt-5 inline-flex text-sm font-semibold text-violet-700 hover:underline">Découvrir les annonces</Link></div> :
        <div className="mt-8 space-y-3">
          {conversations.map((conversation) => {
            const listing = listings[conversation.listing_id]
            const otherId = conversation.buyer_id === user?.id ? conversation.seller_id : conversation.buyer_id
            const profile = profiles[otherId]
            return (
              <Link key={conversation.id} href={`/messages/${conversation.id}`} className="flex items-center gap-4 rounded-xl border bg-white p-4 transition hover:border-violet-300 hover:shadow-sm">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                  {listing?.image_urls?.[0] ? <Image src={listing.image_urls[0]} alt={listing.title} fill unoptimized className="object-cover" /> : <div className="flex h-full items-center justify-center"><Package className="h-6 w-6 text-neutral-400" /></div>}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="truncate font-semibold">{listing?.title ?? "Annonce"}</h2><span className="text-xs text-muted-foreground">{new Date(conversation.updated_at).toLocaleDateString("fr-FR")}</span></div>
                  <p className="mt-1 text-sm text-muted-foreground">{profile?.display_name || profile?.username || "Membre GoWill"} · {listing ? euro.format(Number(listing.price)) : ""}</p>
                  <div className="mt-1 flex items-center gap-2"><p className={`min-w-0 flex-1 truncate text-sm ${unreadByConversation[conversation.id] ? "font-semibold text-foreground" : "text-muted-foreground"}`}>{previews[conversation.id] ?? "Commencer la conversation"}</p>{Boolean(unreadByConversation[conversation.id]) && <span className="rounded-full bg-violet-700 px-2 py-0.5 text-[10px] font-semibold text-white">{unreadByConversation[conversation.id]} non lu{unreadByConversation[conversation.id] > 1 ? "s" : ""}</span>}</div>
                </div>
              </Link>
            )
          })}
        </div>
      }
    </section>
  )
}
