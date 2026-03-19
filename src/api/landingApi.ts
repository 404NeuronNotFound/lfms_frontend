import type { PublicStatsResponse } from "@/types/landingTypes"

const BASE = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000/api"

/**
 * GET /api/public/stats/
 * No authentication required — called by the landing page.
 */
export async function fetchPublicStats(): Promise<PublicStatsResponse> {
  const res = await fetch(`${BASE}/public/stats/`)
  if (!res.ok) throw new Error(`Failed to fetch public stats (${res.status})`)
  return res.json()
}