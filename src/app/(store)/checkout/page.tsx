"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Home, MapPin, Search, PackageCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useCartStore } from "@/store/cart"
import { useOrdersStore } from "@/store/orders"
import { CartSummary } from "@/components/cart/cart-summary"
import { formatPrice } from "@/lib/utils"
import { toast } from "sonner"
import { siteConfig } from "@/lib/config"
import type { Order } from "@/types"

type DeliveryMethod = "home" | "relay"

export default function CheckoutPage() {
  const router = useRouter()
  const items = useCartStore((s) => s.items)
  const getSubtotal = useCartStore((s) => s.getSubtotal)
  const clearCart = useCartStore((s) => s.clearCart)
  const addOrder = useOrdersStore((s) => s.addOrder)
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("home")
  const [postalSearching, setPostalSearching] = useState(false)
  const [mapPosition, setMapPosition] = useState<{ lat: number; lon: number } | null>(null)

  const [form, setForm] = useState({
    email: "",
    firstName: "",
    lastName: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "France",
    phone: "",
    relayName: "",
    relayAddress: "",
    relayPostalCode: "",
    relayCity: "",
  })

  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8"><h1 className="text-3xl font-bold tracking-tight">Finaliser la commande</h1></div>
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight">Finaliser la commande</h1>
        <div className="mt-16 text-center">
          <p className="text-muted-foreground">Ton panier est vide. Ajoute un article avant de continuer.</p>
          <Button className="mt-8" asChild><Link href="/shop">Continuer mes achats</Link></Button>
        </div>
      </div>
    )
  }

  const subtotal = getSubtotal()

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function locatePostalCode() {
    const postalCode = form.relayPostalCode.trim()
    if (!/^\d{5}$/.test(postalCode)) {
      toast.error("Entre un code postal français à 5 chiffres.")
      return
    }

    setPostalSearching(true)
    try {
      const params = new URLSearchParams({
        postalcode: postalCode,
        country: "France",
        format: "jsonv2",
        limit: "1",
      })
      const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`)
      if (!response.ok) throw new Error("Geocoding unavailable")
      const results = (await response.json()) as Array<{ lat: string; lon: string; display_name?: string }>
      if (!results.length) {
        toast.error("Aucune commune trouvée pour ce code postal.")
        setMapPosition(null)
        return
      }
      const point = { lat: Number(results[0].lat), lon: Number(results[0].lon) }
      setMapPosition(point)
      if (!form.relayCity && results[0].display_name) {
        const city = results[0].display_name.split(",")[0]
        setForm((current) => ({ ...current, relayCity: city }))
      }
      toast.success("Zone du code postal localisée.")
    } catch {
      toast.error("Impossible de localiser ce code postal pour le moment.")
    } finally {
      setPostalSearching(false)
    }
  }

  const mapUrl = mapPosition
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${mapPosition.lon - 0.025}%2C${mapPosition.lat - 0.018}%2C${mapPosition.lon + 0.025}%2C${mapPosition.lat + 0.018}&layer=mapnik&marker=${mapPosition.lat}%2C${mapPosition.lon}`
    : null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!form.email || !form.firstName || !form.lastName) {
      toast.error("Renseigne tes coordonnées pour continuer.")
      return
    }

    if (deliveryMethod === "home" && (!form.line1 || !form.city || !form.postalCode)) {
      toast.error("Complète ton adresse de livraison.")
      return
    }

    if (deliveryMethod === "relay" && (!form.relayName || !form.relayAddress || !form.relayPostalCode || !form.relayCity)) {
      toast.error("Renseigne le nom et l'adresse du point relais.")
      return
    }

    setLoading(true)

    // Démonstration locale uniquement : aucun paiement ni transporteur réel n'est connecté.
    const shipping = subtotal >= siteConfig.freeShippingThreshold ? 0 : 599
    const tax = Math.round(subtotal * siteConfig.taxRate)
    const total = subtotal + shipping + tax
    const orderId = `DEMO-${Date.now().toString(36).toUpperCase()}`
    const address = deliveryMethod === "home"
      ? {
          id: "demo-home",
          type: "shipping" as const,
          firstName: form.firstName,
          lastName: form.lastName,
          line1: form.line1,
          line2: form.line2 || undefined,
          city: form.city,
          state: form.state,
          postalCode: form.postalCode,
          country: form.country,
          phone: form.phone || undefined,
          isDefault: false,
        }
      : {
          id: "demo-relay",
          type: "shipping" as const,
          firstName: form.firstName,
          lastName: form.lastName,
          line1: form.relayAddress,
          line2: form.relayName,
          city: form.relayCity,
          state: "",
          postalCode: form.relayPostalCode,
          country: form.country,
          phone: form.phone || undefined,
          isDefault: false,
        }

    const order: Order = {
      id: orderId,
      orderNumber: orderId,
      items: items.map((item) => ({
        id: item.id,
        productId: item.productId,
        variantId: item.variantId,
        name: item.name,
        variantName: item.variantName,
        sku: "",
        image: item.image,
        price: item.price,
        quantity: item.quantity,
        total: item.lineTotal,
      })),
      status: "pending",
      paymentStatus: "pending",
      subtotal,
      tax,
      shipping,
      total,
      currency: "USD",
      shippingAddress: address,
      customerEmail: form.email,
      customerName: `${form.firstName} ${form.lastName}`,
      deliveryMethod,
      relayName: deliveryMethod === "relay" ? form.relayName : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    addOrder(order)
    clearCart()
    toast.success("Aperçu de commande enregistré sur cet appareil.")
    router.push(`/checkout/success?order_id=${orderId}`)
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight">Choisir la livraison</h1>
      <p className="mt-2 text-sm text-muted-foreground">Indique où tu souhaites recevoir ton colis avant de vérifier ta commande.</p>

      <form onSubmit={handleSubmit} className="mt-8 grid gap-8 lg:grid-cols-5">
        <div className="space-y-8 lg:col-span-3">
          <Card>
            <CardHeader><CardTitle className="text-lg">Tes coordonnées</CardTitle></CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2"><Label htmlFor="email">Adresse e-mail</Label><Input id="email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="toi@exemple.fr" required /></div>
              <div className="space-y-2"><Label htmlFor="firstName">Prénom</Label><Input id="firstName" name="firstName" value={form.firstName} onChange={handleChange} required /></div>
              <div className="space-y-2"><Label htmlFor="lastName">Nom</Label><Input id="lastName" name="lastName" value={form.lastName} onChange={handleChange} required /></div>
              <div className="space-y-2 sm:col-span-2"><Label htmlFor="phone">Téléphone (facultatif)</Label><Input id="phone" name="phone" type="tel" value={form.phone} onChange={handleChange} /></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-lg">Où veux-tu recevoir ton colis ?</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <button type="button" onClick={() => setDeliveryMethod("home")} aria-pressed={deliveryMethod === "home"} className={`rounded-xl border p-4 text-left transition ${deliveryMethod === "home" ? "border-primary bg-primary/5 ring-1 ring-primary" : "hover:bg-muted/50"}`}>
                  <Home className="mb-3 h-5 w-5" />
                  <span className="block font-semibold">À domicile</span>
                  <span className="mt-1 block text-xs text-muted-foreground">Le colis arrive à ton adresse.</span>
                </button>
                <button type="button" onClick={() => setDeliveryMethod("relay")} aria-pressed={deliveryMethod === "relay"} className={`rounded-xl border p-4 text-left transition ${deliveryMethod === "relay" ? "border-primary bg-primary/5 ring-1 ring-primary" : "hover:bg-muted/50"}`}>
                  <MapPin className="mb-3 h-5 w-5" />
                  <span className="block font-semibold">Point relais</span>
                  <span className="mt-1 block text-xs text-muted-foreground">Tu récupères le colis dans un relais.</span>
                </button>
              </div>

              {deliveryMethod === "home" ? (
                <div className="space-y-4 border-t pt-4">
                  <div className="space-y-2"><Label htmlFor="line1">Adresse</Label><Input id="line1" name="line1" value={form.line1} onChange={handleChange} placeholder="Numéro et nom de rue" required /></div>
                  <div className="space-y-2"><Label htmlFor="line2">Complément (facultatif)</Label><Input id="line2" name="line2" value={form.line2} onChange={handleChange} placeholder="Appartement, bâtiment..." /></div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2"><Label htmlFor="postalCode">Code postal</Label><Input id="postalCode" name="postalCode" value={form.postalCode} onChange={handleChange} required /></div>
                    <div className="space-y-2 sm:col-span-2"><Label htmlFor="city">Ville</Label><Input id="city" name="city" value={form.city} onChange={handleChange} required /></div>
                  </div>
                  <div className="space-y-2"><Label htmlFor="country">Pays</Label><Input id="country" name="country" value={form.country} onChange={handleChange} required /></div>
                </div>
              ) : (
                <div className="space-y-4 border-t pt-4">
                  <div className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">Entre le code postal pour afficher la zone sur la carte, puis indique le relais que tu souhaites sélectionner.</div>
                  <div className="space-y-2"><Label htmlFor="relayPostalCode">Code postal du point relais</Label>
                    <div className="flex gap-2"><Input id="relayPostalCode" name="relayPostalCode" inputMode="numeric" maxLength={5} value={form.relayPostalCode} onChange={handleChange} placeholder="Ex. 75001" /><Button type="button" variant="outline" onClick={() => void locatePostalCode()} disabled={postalSearching}><Search className="mr-2 h-4 w-4" />{postalSearching ? "Recherche..." : "Localiser"}</Button></div>
                  </div>
                  {mapUrl && <div className="overflow-hidden rounded-xl border"><iframe title="Carte de la zone du point relais" src={mapUrl} className="h-64 w-full" loading="lazy" referrerPolicy="no-referrer-when-downgrade" /><p className="border-t px-3 py-2 text-xs text-muted-foreground">La carte localise le code postal, pas les points relais disponibles.</p></div>}
                  <div className="space-y-2"><Label htmlFor="relayName">Nom du point relais</Label><Input id="relayName" name="relayName" value={form.relayName} onChange={handleChange} placeholder="Nom du commerce ou du relais" required /></div>
                  <div className="space-y-2"><Label htmlFor="relayAddress">Adresse du point relais</Label><Input id="relayAddress" name="relayAddress" value={form.relayAddress} onChange={handleChange} placeholder="Numéro et nom de rue" required /></div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2"><Label htmlFor="relayCity">Ville</Label><Input id="relayCity" name="relayCity" value={form.relayCity} onChange={handleChange} required /></div>
                    <div className="space-y-2"><Label htmlFor="relayPostalCode2">Code postal</Label><Input id="relayPostalCode2" name="relayPostalCode" value={form.relayPostalCode} onChange={handleChange} required /></div>
                  </div>
                  <p className="text-xs text-amber-700">Prototype : la liste officielle des relais et leur disponibilité seront connectées à un transporteur dans une prochaine étape. Vérifie le relais auprès du transporteur avant toute utilisation réelle.</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-lg">Paiement</CardTitle></CardHeader>
            <CardContent><p className="text-sm text-muted-foreground">GoWill est actuellement en mode démonstration. Aucun paiement réel ne sera effectué et aucune expédition ne sera déclenchée.</p></CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="sticky top-24">
            <CardHeader><CardTitle className="text-lg">Récapitulatif</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {items.map((item) => <div key={item.variantId} className="flex justify-between gap-3 text-sm"><span className="text-muted-foreground">{item.name} × {item.quantity}</span><span>{formatPrice(item.lineTotal)}</span></div>)}
              <Separator />
              <CartSummary subtotal={subtotal} />
              <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground"><PackageCheck className="mr-2 inline h-4 w-4" />Mode choisi : {deliveryMethod === "home" ? "Livraison à domicile" : "Point relais"}</div>
              <Button type="submit" size="lg" className="w-full" disabled={loading}>{loading ? "Préparation..." : "Voir l'aperçu de commande"}</Button>
              <p className="text-center text-xs text-muted-foreground">Démonstration locale, sans paiement réel.</p>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  )
}
