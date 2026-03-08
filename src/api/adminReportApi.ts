import { authFetch } from "@/api/authApi"
import type {
  AdminLostReport,
  AdminReportListResponse,
  AdminReportStats,
  AdminUpdateReportPayload,
  AdminUpdateReportResponse,
  ReportStatus,
  ReportCategory,
  AdminLostReportListItem,
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

// ── Manual Matching ───────────────────────────────────────────────────────────

/**
 * POST /api/admin/match/manual/
 * Manually link a lost report + found report as a confirmed match.
 */
export async function adminManualMatch(
  lostReportId:  number,
  foundReportId: number,
): Promise<{ message: string; lost_report_id: number; found_report_id: number; suggestion_id: number }> {
  const res = await authFetch(`${BASE}/admin/match/manual/`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ lost_report_id: lostReportId, found_report_id: foundReportId }),
  })
  return handleResponse(res)
}

/**
 * POST /api/admin/match/unmatch/
 * Undo a match — resets both reports back to open.
 */
export async function adminUnmatch(
  reportId: number,
): Promise<{ message: string }> {
  const res = await authFetch(`${BASE}/admin/match/unmatch/`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ report_id: reportId }),
  })
  return handleResponse(res)
}

/**
 * GET /api/admin/reports/?type=lost&status=open  (reuse existing)
 * Used by match picker to list available lost/found reports.
 */
export async function adminGetReportsByType(
  type:    "lost" | "found",
  status?: string,
): Promise<{ count: number; results: AdminLostReportListItem[] }> {
  const params = new URLSearchParams({ type })
  if (status) params.set("status", status)
  const res = await authFetch(`${BASE}/admin/reports/?${params}`)
  return handleResponse(res)
}