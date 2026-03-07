import { authFetch } from "@/api/authApi"
import type {
  CreateReportPayload,
  UpdateReportPayload,
  CreateReportResponse,
  UpdateReportResponse,
  DeleteReportResponse,
  ReportListResponse,
  LostReport,
  ReportStatus,
} from "@/types/reportTypes"

const BASE = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000/api"

// ── Generic error handler ────────────────────────────────────────────────────
async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))

    // Field-level validation errors: { item_name: ["..."], category: ["..."] }
    const fieldErrors = Object.entries(err)
      .filter(([key]) => key !== "detail")
      .map(([field, msgs]) => {
        const msg = Array.isArray(msgs) ? msgs[0] : msgs
        return `${field}: ${msg}`
      })
      .join(" · ")

    throw new Error(
      fieldErrors || err?.detail || err?.message || `Request failed (${res.status})`
    )
  }
  return res.json() as Promise<T>
}

// ── Serialize CreateReportPayload → FormData ──────────────────────────────────
// Uses multipart/form-data so images can be sent alongside text fields.
// The server expects images as images[0], images[1], … images[4].
function toFormData(payload: CreateReportPayload): FormData {
  const fd = new FormData()

  // Required fields
  fd.append("item_name",   payload.item_name)
  fd.append("category",    payload.category)
  fd.append("location",    payload.location)
  fd.append("date_lost",   payload.date_lost)
  fd.append("description", payload.description)

  // Optional fields — only append if the value is non-empty
  if (payload.location_detail?.trim())
    fd.append("location_detail",         payload.location_detail.trim())
  if (payload.time_lost)
    fd.append("time_lost",               payload.time_lost)
  if (payload.brand?.trim())
    fd.append("brand",                   payload.brand.trim())
  if (payload.color?.trim())
    fd.append("color",                   payload.color.trim())
  if (payload.distinguishing_features?.trim())
    fd.append("distinguishing_features", payload.distinguishing_features.trim())
  if (payload.reward?.trim())
    fd.append("reward",                  payload.reward.trim())
  if (payload.contact_phone?.trim())
    fd.append("contact_phone",           payload.contact_phone.trim())

  // Boolean — Django expects string "true"/"false" in form data
  fd.append("is_urgent", payload.is_urgent ? "true" : "false")

  // Images — up to 5 files, keyed as images[0] … images[4]
  if (payload.images?.length) {
    payload.images.slice(0, 5).forEach((file, idx) => {
      fd.append(`images[${idx}]`, file)
    })
  }

  return fd
}

// ─────────────────────────────────────────────────────────────────────────────
//  USER ENDPOINTS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /api/reports/
 * Creates a new lost report for the authenticated user.
 * Sends as multipart/form-data to support image uploads.
 */
export async function createReport(
  payload: CreateReportPayload
): Promise<CreateReportResponse> {
  const fd  = toFormData(payload)
  const res = await authFetch(`${BASE}/reports/`, { method: "POST", body: fd })
  return handleResponse<CreateReportResponse>(res)
}

/**
 * GET /api/reports/
 * Returns the current user's own reports (newest first).
 * Optional ?status= filter.
 */
export async function getMyReports(status?: ReportStatus): Promise<ReportListResponse> {
  const url = status
    ? `${BASE}/reports/?status=${status}`
    : `${BASE}/reports/`
  const res = await authFetch(url)
  return handleResponse<ReportListResponse>(res)
}

/**
 * GET /api/reports/<id>/
 * Returns the full detail of one report owned by the current user.
 */
export async function getReport(id: number): Promise<LostReport> {
  const res = await authFetch(`${BASE}/reports/${id}/`)
  return handleResponse<LostReport>(res)
}

/**
 * PATCH /api/reports/<id>/
 * Partially updates a report. Only allowed while status is open or under_review.
 */
export async function updateReport(
  id:      number,
  payload: UpdateReportPayload
): Promise<UpdateReportResponse> {
  // Re-use toFormData but cast — all fields are optional in UpdateReportPayload
  const fd  = toFormData(payload as CreateReportPayload)
  const res = await authFetch(`${BASE}/reports/${id}/`, { method: "PATCH", body: fd })
  return handleResponse<UpdateReportResponse>(res)
}

/**
 * DELETE /api/reports/<id>/
 * Deletes a report. Only allowed while status is open.
 */
export async function deleteReport(id: number): Promise<DeleteReportResponse> {
  const res = await authFetch(`${BASE}/reports/${id}/`, { method: "DELETE" })
  return handleResponse<DeleteReportResponse>(res)
}