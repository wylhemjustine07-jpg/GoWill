import { redirect } from "next/navigation"

type SearchParams = Promise<{ q?: string; page?: string }>

export default async function SearchPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const params = await searchParams
  const query = new URLSearchParams()
  const term = (params.q ?? "").trim().slice(0, 80)
  if (term) query.set("q", term)
  redirect("/annonces" + (query.toString() ? "?" + query.toString() : ""))
}
