import { authFetch } from "@/api/authApi"
import type { BrowseFilters, BrowseResponse, FoundItemDetail } from "@/types/browseTypes"

const BASE = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000/api"

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.detail || err?.message || `Request failed (${res.status})`)
  }
  return res.json() as Promise<T>
}

/**
 * GET /api/found-items/
 * Tries authenticated fetch first so my_claim_status is populated,
 * falls back to anonymous for unauthenticated users.
 */
export async function getFoundItems(filters: BrowseFilters = {}): Promise<BrowseResponse> {
  const params = new URLSearchParams()
  if (filters.category) params.set("category", filters.category)
  if (filters.search)   params.set("search",   filters.search)
  if (filters.ordering) params.set("ordering", filters.ordering)

  const url = `${BASE}/found-items/${params.toString() ? "?" + params : ""}`

  try {
    const res = await authFetch(url)
    return handleResponse<BrowseResponse>(res)
  } catch {
    const res = await fetch(url)
    return handleResponse<BrowseResponse>(res)
  }
}

/**
 * GET /api/found-items/<id>/
 * Increments view count server-side.
 */
export async function getFoundItem(id: number): Promise<FoundItemDetail> {
  const url = `${BASE}/found-items/${id}/`
  try {
    const res = await authFetch(url)
    return handleResponse<FoundItemDetail>(res)
  } catch {
    const res = await fetch(url)
    return handleResponse<FoundItemDetail>(res)
  }
}