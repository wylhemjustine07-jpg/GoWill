"use client"

import { create } from "zustand"
import type { User, Address } from "@/types"
import { createClient } from "@/lib/supabase/client"
import type { AuthChangeEvent, Session } from "@supabase/supabase-js"

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  initialize: () => () => void
  login: (email: string, password: string) => Promise<boolean>
  register: (data: { firstName: string; lastName: string; email: string; password: string }) => Promise<{ success: boolean; needsEmailConfirmation: boolean }>
  logout: () => void
  updateProfile: (data: Partial<Pick<User, "firstName" | "lastName" | "email">>) => void
  addAddress: (address: Omit<Address, "id">) => void
  removeAddress: (id: string) => void
}

function mapUser(sessionUser: { id: string; email?: string; created_at: string; user_metadata?: Record<string, unknown> }): User {
  const firstName = String(sessionUser.user_metadata?.first_name ?? sessionUser.user_metadata?.full_name ?? "Membre").split(" ")[0]
  const lastName = String(sessionUser.user_metadata?.last_name ?? "")
  return {
    id: sessionUser.id,
    email: sessionUser.email ?? "",
    firstName,
    lastName,
    role: "customer",
    addresses: [],
    createdAt: sessionUser.created_at,
    updatedAt: new Date().toISOString(),
  }
}

let unsubscribe: (() => void) | null = null
let initializationPromise: Promise<void> | null = null

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  initialize: () => {
    if (unsubscribe) return unsubscribe
    const supabase = createClient()
    const sync = (session: Session | null) => set({
      user: session?.user ? mapUser(session.user) : null,
      isAuthenticated: Boolean(session?.user),
      isLoading: false,
    })
    const { data } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session) => sync(session))
    unsubscribe = () => {
      data.subscription.unsubscribe()
      unsubscribe = null
      initializationPromise = null
    }
    if (!initializationPromise) {
      initializationPromise = supabase.auth.getSession().then(({ data: sessionData }) => sync(sessionData.session))
    }
    return unsubscribe
  },

  login: async (email, password) => {
    const { data, error } = await createClient().auth.signInWithPassword({ email, password })
    if (error || !data.user) return false
    set({ user: mapUser(data.user), isAuthenticated: true, isLoading: false })
    return true
  },

  register: async ({ firstName, lastName, email, password }) => {
    const { data, error } = await createClient().auth.signUp({
      email,
      password,
      options: { data: { first_name: firstName, last_name: lastName, full_name: `${firstName} ${lastName}`.trim() } },
    })
    if (error || !data.user) return { success: false, needsEmailConfirmation: false }
    if (data.session) {
      set({ user: mapUser(data.user), isAuthenticated: true, isLoading: false })
      return { success: true, needsEmailConfirmation: false }
    }
    return { success: true, needsEmailConfirmation: true }
  },

  logout: () => {
    void createClient().auth.signOut()
    set({ user: null, isAuthenticated: false, isLoading: false })
  },

  updateProfile: (data) => {
    const user = get().user
    if (!user) return
    set({ user: { ...user, ...data, updatedAt: new Date().toISOString() } })
  },

  addAddress: (address) => {
    const user = get().user
    if (!user) return
    set({ user: { ...user, addresses: [...user.addresses, { ...address, id: crypto.randomUUID() }] } })
  },

  removeAddress: (id) => {
    const user = get().user
    if (!user) return
    set({ user: { ...user, addresses: user.addresses.filter((address) => address.id !== id) } })
  },
}))
