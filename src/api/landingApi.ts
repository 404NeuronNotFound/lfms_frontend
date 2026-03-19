import type { PublicStatsResponse } from "@/types/landingTypes"

const BASE = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000/api"

export async function fetchPublicStats(): Promise<PublicStatsResponse> {
  const res = await fetch(`${BASE}/public/stats/`)
  console.log(BASE)
  if (!res.ok) throw new Error(`Failed to fetch public stats (${res.status})`)
  return res.json()
}