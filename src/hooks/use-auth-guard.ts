"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/auth"

export function useAuthGuard() {
  const user = useAuthStore((state) => state.user)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isLoading = useAuthStore((state) => state.isLoading)
  const initialize = useAuthStore((state) => state.initialize)
  const router = useRouter()

  useEffect(() => initialize(), [initialize])

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace("/auth/login")
  }, [isLoading, isAuthenticated, router])

  return { user, isAuthenticated, isLoading, isReady: !isLoading && isAuthenticated }
}
