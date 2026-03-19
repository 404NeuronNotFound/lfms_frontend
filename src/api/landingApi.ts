import type { PublicStatsResponse } from "@/types/landingTypes"

const BASE = "https://lfms-backend.onrender.com/api"

export async function fetchPublicStats(): Promise<PublicStatsResponse> {
  const res = await fetch(`${BASE}/public/stats/`)
  if (!res.ok) throw new Error(`Failed to fetch public stats (${res.status})`)
  return res.json()
}