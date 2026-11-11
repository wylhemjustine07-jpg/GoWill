"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ShoppingBag } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useCartStore } from "@/store/cart"

interface BuyListingButtonProps {
  listing: {
    id: string
    title: string
    price: number
    image_urls: string[] | null
    seller_id: string
    location: string | null
    shipping_fee_amount: number
    shipping_fee_payer: "buyer" | "seller" | "split"
    ships_internationally: boolean
  }
  className?: string
  size?: "default" | "sm" | "lg"
}

export function BuyListingButton({ listing, className, size = "default" }: BuyListingButtonProps) {
  const router = useRouter()
  const addItem = useCartStore((state) => state.addItem)
  const [loading, setLoading] = useState(false)

  async function buyListing() {
    if (loading) return
    setLoading(true)

    try {
      const { data: { user }, error } = await createClient().auth.getUser()
      if (error || !user) {
        router.push("/auth/login")
        return
      }

      if (user.id === listing.seller_id) {
        toast.info("Tu ne peux pas acheter ta propre annonce.")
        return
      }

      addItem({
        variantId: `gowill-listing-${listing.id}`,
        productId: listing.id,
        name: listing.title,
        variantName: "Annonce GoWill",
        image: {
          url: listing.image_urls?.[0] ?? "",
          alt: listing.title,
        },
        slug: `annonces/${listing.id}`,
        // Les annonces GoWill sont enregistrées en euros, le panier utilise les centimes.
        price: Math.round(Number(listing.price) * 100),
        quantity: 1,
        sellerId: listing.seller_id,
        shippingOrigin: listing.location,
        shippingFeeAmount: Math.round(Number(listing.shipping_fee_amount ?? 0) * 100),
        shippingFeePayer: listing.shipping_fee_payer ?? "buyer",
        shipsInternationally: listing.ships_internationally ?? true,
      })

      router.push("/checkout")
    } catch {
      toast.error("Impossible de préparer cet achat. Réessaie.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button type="button" onClick={() => void buyListing()} disabled={loading} size={size} className={className}>
      <ShoppingBag className="mr-2 h-4 w-4" />
      {loading ? "Préparation..." : "Acheter l'article"}
    </Button>
  )
}
