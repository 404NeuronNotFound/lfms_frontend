import { authFetch } from "@/api/authApi"
import type { AuditLogResponse, AuditLogFilters } from "@/types/auditLogTypes"

const BASE = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000/api"

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.detail ?? err?.message ?? `Request failed (${res.status})`)
  }
  return res.json() as Promise<T>
}

/** GET /api/admin/audit-logs/?action=&actor_type=&search=&date_from=&date_to=&page= */
export async function fetchAuditLogs(
  filters: Partial<AuditLogFilters> = {}
): Promise<AuditLogResponse> {
  const params = new URLSearchParams()
  if (filters.action)     params.set("action",     filters.action)
  if (filters.actor_type) params.set("actor_type", filters.actor_type)
  if (filters.search)     params.set("search",     filters.search)
  if (filters.date_from)  params.set("date_from",  filters.date_from)
  if (filters.date_to)    params.set("date_to",    filters.date_to)
  if (filters.page && filters.page > 1) params.set("page", String(filters.page))

  const qs  = params.toString()
  const res = await authFetch(`${BASE}/admin/audit-logs/${qs ? `?${qs}` : ""}`)
  return handleResponse<AuditLogResponse>(res)
}