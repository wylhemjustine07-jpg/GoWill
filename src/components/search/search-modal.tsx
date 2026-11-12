"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Search, X, ArrowRight } from "lucide-react"

const popularSearches = [
  "Mode",
  "Téléphones",
  "Maison",
  "High-tech",
  "Jeux vidéo",
  "Livres",
]

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const handleClose = useCallback(() => {
    setQuery("")
    onClose()
  }, [onClose])

  useEffect(() => {
    if (!isOpen) return
    const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 50)
    return () => window.clearTimeout(focusTimer)
  }, [isOpen])

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") handleClose()

      if (event.key === "Tab" && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'a[href], button, input, [tabindex]:not([tabindex="-1"])'
        )
        const first = focusable[0]
        const last = focusable[focusable.length - 1]

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last?.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first?.focus()
        }
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown)
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = ""
    }
  }, [isOpen, handleClose])

  if (!isOpen) return null

  const trimmedQuery = query.trim()
  const resultHref = "/annonces?q=" + encodeURIComponent(trimmedQuery)

  return (
    <div className="fixed inset-0 z-[100]">
      <button
        type="button"
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
        aria-label="Fermer la recherche"
      />

      <div
        ref={modalRef}
        className="relative mx-auto mt-[10vh] w-full max-w-2xl px-4"
        role="dialog"
        aria-modal="true"
        aria-label="Rechercher une annonce"
      >
        <div className="overflow-hidden rounded-xl bg-white shadow-2xl">
          <form
            className="flex items-center border-b px-4"
            onSubmit={(event) => {
              event.preventDefault()
              if (!trimmedQuery) return
              handleClose()
              router.push(resultHref)
            }}
          >
            <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Rechercher une annonce..."
              aria-label="Rechercher une annonce"
              className="flex-1 border-0 bg-transparent px-4 py-4 text-lg outline-none placeholder:text-muted-foreground/60"
            />
            {trimmedQuery ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="rounded-md p-1 text-muted-foreground hover:text-foreground"
                aria-label="Effacer la recherche"
              >
                <X className="h-4 w-4" />
              </button>
            ) : (
              <kbd className="hidden rounded border bg-neutral-100 px-1.5 py-0.5 text-xs text-muted-foreground sm:inline">
                ESC
              </kbd>
            )}
            <button
              type="submit"
              disabled={!trimmedQuery}
              className="ml-2 rounded-md p-2 text-violet-700 transition-colors hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Lancer la recherche"
            >
              <ArrowRight className="h-5 w-5" />
            </button>
          </form>

          <div className="max-h-[60vh] overflow-y-auto p-4">
            {trimmedQuery ? (
              <div className="rounded-lg bg-neutral-50 p-4">
                <p className="text-sm text-muted-foreground">
                  Rechercher « {trimmedQuery} » parmi les annonces publiées par les membres.
                </p>
                <Link
                  href={resultHref}
                  onClick={handleClose}
                  className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-violet-700 hover:underline"
                >
                  Voir les annonces correspondantes
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              <>
                <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Catégories populaires
                </p>
                <div className="flex flex-wrap gap-2">
                  {popularSearches.map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => setQuery(term)}
                      className="rounded-full border border-border px-3 py-1.5 text-sm transition-colors hover:border-foreground hover:bg-neutral-50"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
