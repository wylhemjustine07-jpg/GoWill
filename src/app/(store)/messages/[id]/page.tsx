"use client"

import Link from "next/link"
import Image from "next/image"
import { FormEvent, useCallback, useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { ArrowLeft, MessageCircle, Send } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useAuthGuard } from "@/hooks/use-auth-guard"
import { createClient } from "@/lib/supabase/client"

type Conversation = { id: string; listing_id: string; buyer_id: string; seller_id: string }
type Listing = { id: string; title: string; price: number; image_urls: string[] }
type Profile = { id: string; display_name: string | null; username: string | null }
type Message = { id: string; conversation_id: string; sender_id: string; body: string; created_at: string }

const euro = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" })

export default function ConversationPage() {
  const params = useParams<{ id: string }>()
  const { user, isReady } = useAuthGuard()
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [listing, setListing] = useState<Listing | null>(null)
  const [other, setOther] = useState<Profile | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [body, setBody] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  const loadMessages = useCallback(async () => {
    if (!user) return
    const supabase = createClient()
    const { data, error } = await supabase.from("messages").select("id,conversation_id,sender_id,body,created_at").eq("conversation_id", params.id).order("created_at", { ascending: true })
    if (error) { toast.error("Impossible de charger les messages."); return }
    setMessages((data ?? []) as Message[])
  }, [params.id, user])

  useEffect(() => {
    if (!isReady || !user) return
    let active = true
    const supabase = createClient()
    async function initialize() {
      const { data: row, error } = await supabase.from("conversations").select("id,listing_id,buyer_id,seller_id").eq("id", params.id).maybeSingle()
      if (error || !row) { if (active) { toast.error("Conversation introuvable."); setLoading(false) }; return }
      const current = row as Conversation
      const otherId = current.buyer_id === user.id ? current.seller_id : current.buyer_id
      const [{ data: item }, { data: profile }] = await Promise.all([
        supabase.from("listings").select("id,title,price,image_urls").eq("id", current.listing_id).maybeSingle(),
        supabase.from("profiles").select("id,display_name,username").eq("id", otherId).maybeSingle(),
      ])
      if (!active) return
      setConversation(current)
      setListing(item as Listing | null)
      setOther(profile as Profile | null)
      await loadMessages()
      if (active) setLoading(false)
    }
    void initialize()
    const channel = supabase.channel(`messages-${params.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${params.id}` }, () => { void loadMessages() })
      .subscribe()
    return () => { active = false; void supabase.removeChannel(channel) }
  }, [isReady, user, params.id, loadMessages])

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const text = body.trim()
    if (!text || !user || !conversation || sending) return
    setSending(true)
    const { error } = await createClient().from("messages").insert({ conversation_id: conversation.id, sender_id: user.id, body: text })
    if (error) toast.error("Ton message n'a pas pu être envoyé.")
    else { setBody(""); await loadMessages() }
    setSending(false)
  }

  if (!isReady || loading) return <p className="py-20 text-center text-muted-foreground">Chargement de la conversation...</p>
  if (!conversation) return <section className="mx-auto max-w-2xl px-4 py-20 text-center"><h1 className="text-2xl font-bold">Conversation introuvable</h1><Button asChild className="mt-5"><Link href="/messages">Retour aux messages</Link></Button></section>

  return (
    <section className="mx-auto flex min-h-[70vh] max-w-4xl flex-col px-4 py-8 sm:px-6">
      <Link href="/messages" className="mb-5 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Toutes les conversations</Link>
      <div className="flex items-center gap-3 rounded-t-2xl border border-b-0 bg-white p-4">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-neutral-100">{listing?.image_urls?.[0] ? <Image src={listing.image_urls[0]} alt={listing.title} fill unoptimized className="object-cover" /> : <MessageCircle className="m-4 h-6 w-6 text-neutral-400" />}</div>
        <div className="min-w-0"><h1 className="truncate font-semibold">{listing?.title ?? "Annonce"}</h1><p className="text-sm text-muted-foreground">{other?.display_name || other?.username || "Membre GoWill"} · {listing ? euro.format(Number(listing.price)) : ""}</p></div>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto border-x bg-neutral-50 p-4">
        {messages.length === 0 ? <div className="py-12 text-center text-sm text-muted-foreground">Écris le premier message pour démarrer la discussion.</div> : messages.map((message) => {
          const mine = message.sender_id === user?.id
          return <div key={message.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}><div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm sm:max-w-[70%] ${mine ? "rounded-br-md bg-violet-700 text-white" : "rounded-bl-md border bg-white text-foreground"}`}><p className="whitespace-pre-wrap break-words">{message.body}</p><p className={`mt-2 text-[10px] ${mine ? "text-violet-100" : "text-muted-foreground"}`}>{new Date(message.created_at).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}</p></div></div>
        })}
      </div>
      <form onSubmit={sendMessage} className="flex items-end gap-2 rounded-b-2xl border bg-white p-3">
        <Textarea value={body} onChange={(event) => setBody(event.target.value)} maxLength={4000} rows={2} placeholder="Écris ton message..." className="min-h-12 resize-none" />
        <Button type="submit" disabled={!body.trim() || sending} size="icon" aria-label="Envoyer le message"><Send className="h-4 w-4" /></Button>
      </form>
      <p className="mt-2 text-center text-xs text-muted-foreground">Ne partage pas tes informations personnelles ou bancaires dans la conversation.</p>
    </section>
  )
}
