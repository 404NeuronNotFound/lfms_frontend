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
 * Public endpoint — always uses plain fetch with optional Authorization header.
 * Never throws SESSION_EXPIRED since the endpoint is AllowAny.
 */
export async function getFoundItems(filters: BrowseFilters = {}): Promise<BrowseResponse> {
  const params = new URLSearchParams()
  if (filters.category) params.set("category", filters.category)
  if (filters.search)   params.set("search",   filters.search)
  if (filters.ordering) params.set("ordering", filters.ordering)

  const url = `${BASE}/found-items/${params.toString() ? "?" + params : ""}`

  const headers: Record<string, string> = {}
  const token = localStorage.getItem("access")
  if (token) headers["Authorization"] = `Bearer ${token}`

  const res = await fetch(url, { headers })
  return handleResponse<BrowseResponse>(res)
}

/**
 * GET /api/found-items/<id>/
 * Public endpoint — same approach as above.
 */
export async function getFoundItem(id: number): Promise<FoundItemDetail> {
  const url = `${BASE}/found-items/${id}/`

  const headers: Record<string, string> = {}
  const token = localStorage.getItem("access")
  if (token) headers["Authorization"] = `Bearer ${token}`

  const res = await fetch(url, { headers })
  return handleResponse<FoundItemDetail>(res)
}