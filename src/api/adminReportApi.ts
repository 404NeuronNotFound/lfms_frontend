import { authFetch } from "@/api/authApi"
import type {
  AdminLostReport,
  AdminReportListResponse,
  AdminReportStats,
  AdminUpdateReportPayload,
  AdminUpdateReportResponse,
  ReportStatus,
  ReportCategory,
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

// ─────────────────────────────────────────────────────────────────────────────
//  ADMIN ENDPOINTS
// ─────────────────────────────────────────────────────────────────────────────

export interface AdminReportFilters {
  status?:   ReportStatus
  type?:     "lost" | "found"
  category?: ReportCategory
  urgent?:   boolean
  search?:   string
  ordering?: "date_reported" | "-date_reported" | "views" | "-views" | "item_name"
}

/**
 * GET /api/admin/reports/
 * Returns all reports with optional filters.
 */
export async function adminGetReports(
  filters: AdminReportFilters = {}
): Promise<AdminReportListResponse> {
  const params = new URLSearchParams()
  if (filters.status)   params.set("status",   filters.status)
  if (filters.type)     params.set("type",     filters.type)
  if (filters.category) params.set("category", filters.category)
  if (filters.urgent)   params.set("urgent",   "true")
  if (filters.search)   params.set("search",   filters.search)
  if (filters.ordering) params.set("ordering", filters.ordering)

  const url = `${BASE}/admin/reports/${params.toString() ? "?" + params : ""}`
  const res = await authFetch(url)
  return handleResponse<AdminReportListResponse>(res)
}

/**
 * GET /api/admin/reports/stats/
 */
export async function adminGetReportStats(): Promise<AdminReportStats> {
  const res = await authFetch(`${BASE}/admin/reports/stats/`)
  return handleResponse<AdminReportStats>(res)
}

/**
 * GET /api/admin/reports/<id>/
 */
export async function adminGetReport(id: number): Promise<AdminLostReport> {
  const res = await authFetch(`${BASE}/admin/reports/${id}/`)
  return handleResponse<AdminLostReport>(res)
}

/**
 * PATCH /api/admin/reports/<id>/
 * Update status, admin_notes, or any other field.
 */
export async function adminUpdateReport(
  id:      number,
  payload: AdminUpdateReportPayload
): Promise<AdminUpdateReportResponse> {
  const res = await authFetch(`${BASE}/admin/reports/${id}/`, {
    method:  "PATCH",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(payload),
  })
  return handleResponse<AdminUpdateReportResponse>(res)
}

/**
 * DELETE /api/admin/reports/<id>/
 */
export async function adminDeleteReport(id: number): Promise<{ message: string }> {
  const res = await authFetch(`${BASE}/admin/reports/${id}/`, { method: "DELETE" })
  return handleResponse<{ message: string }>(res)
}