import { authFetch } from "@/api/authApi"
import type {
  ClaimRequest,
  ClaimListResponse,
  CreateClaimPayload,
  AdminUpdateClaimPayload,
} from "@/types/reportTypes"

const BASE = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000/api"

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    const fieldErrors = Object.entries(err)
      .filter(([key]) => key !== "detail")
      .map(([field, msgs]) => {
        const msg = Array.isArray(msgs) ? msgs[0] : msgs
        return `${field}: ${msg}`
      })
      .join(" · ")
    throw new Error(fieldErrors || err?.detail || err?.message || `Request failed (${res.status})`)
  }
  return res.json() as Promise<T>
}

// ── User endpoints ────────────────────────────────────────────────────────────

/** POST /api/reports/<id>/claim/ — submit a claim for a matched report */
export async function submitClaim(
  reportId: number,
  payload: CreateClaimPayload
): Promise<ClaimRequest> {
  const res = await authFetch(`${BASE}/reports/${reportId}/claim/`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(payload),
  })
  return handleResponse<ClaimRequest>(res)
}

/** GET /api/claims/ — current user's own claims */
export async function getMyClams(): Promise<ClaimListResponse> {
  const res = await authFetch(`${BASE}/claims/`)
  return handleResponse<ClaimListResponse>(res)
}

// ── Admin endpoints ───────────────────────────────────────────────────────────

/** GET /api/admin/claims/?status=pending|approved|rejected */
export async function adminGetClaims(
  status?: "pending" | "approved" | "rejected"
): Promise<ClaimListResponse> {
  const params = status ? `?status=${status}` : ""
  const res = await authFetch(`${BASE}/admin/claims/${params}`)
  return handleResponse<ClaimListResponse>(res)
}

/** GET /api/admin/claims/<id>/ */
export async function adminGetClaim(id: number): Promise<ClaimRequest> {
  const res = await authFetch(`${BASE}/admin/claims/${id}/`)
  return handleResponse<ClaimRequest>(res)
}

/** PATCH /api/admin/claims/<id>/ — approve or reject */
export async function adminUpdateClaim(
  id:      number,
  payload: AdminUpdateClaimPayload
): Promise<{ message: string; claim: ClaimRequest }> {
  const res = await authFetch(`${BASE}/admin/claims/${id}/`, {
    method:  "PATCH",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(payload),
  })
  return handleResponse<{ message: string; claim: ClaimRequest }>(res)
}