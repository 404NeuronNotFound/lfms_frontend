// ─────────────────────────────────────────────────────────────────────────────
//  REPORT TYPES  — mirrors the Django LostReport / ReportImage models
// ─────────────────────────────────────────────────────────────────────────────

export type ReportCategory =
  | "Electronics"
  | "Wallets & Bags"
  | "Keys"
  | "Clothing"
  | "Jewelry"
  | "Documents"
  | "Pets"
  | "Sports"
  | "Other"

export type ReportStatus =
  | "open"
  | "under_review"
  | "matched"
  | "claimed"
  | "closed"
  | "rejected"

// ── Image row returned by the server ─────────────────────────────────────────
export interface ReportImage {
  id:          number
  image_url:   string | null
  is_main:     boolean
  order:       number
  uploaded_at: string
}

// ── Minimal user snapshot embedded in report responses ────────────────────────
export interface ReportUserInfo {
  id:       number
  username: string
  name:     string
}

// ── Full report detail (GET /api/reports/<id>/) ───────────────────────────────
export interface LostReport {
  id:                      number
  user_info:               ReportUserInfo
  // required fields
  item_name:               string
  category:                ReportCategory
  location:                string
  date_lost:               string           // "YYYY-MM-DD"
  description:             string
  // optional fields (nullable on the server)
  location_detail:         string | null
  time_lost:               string | null    // "HH:MM:SS"
  brand:                   string | null
  color:                   string | null
  distinguishing_features: string | null
  reward:                  string | null
  contact_phone:           string | null
  is_urgent:               boolean
  // admin / auto fields
  status:                  ReportStatus
  admin_notes:             string | null
  views:                   number
  image_count:             number
  images:                  ReportImage[]
  date_reported:           string           // ISO datetime
  date_updated:            string           // ISO datetime
}

// ── Lightweight row used in list views ────────────────────────────────────────
export interface LostReportListItem {
  id:           number
  user_info:    ReportUserInfo
  item_name:    string
  category:     ReportCategory
  location:     string
  date_lost:    string
  date_reported:string
  status:       ReportStatus
  is_urgent:    boolean
  reward:       string | null
  views:        number
  image_count:  number
  main_image:   string | null
}

// ─────────────────────────────────────────────────────────────────────────────
//  PAYLOADS  — what we send to the server
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /api/reports/
 * All required fields must be present.
 * Optional fields can be omitted — server treats missing/null as null.
 */
export interface CreateReportPayload {
  // required
  item_name:   string
  category:    ReportCategory
  location:    string
  date_lost:   string    // "YYYY-MM-DD"
  description: string
  // optional
  location_detail?:         string
  time_lost?:               string    // "HH:MM"
  brand?:                   string
  color?:                   string
  distinguishing_features?: string
  reward?:                  string
  contact_phone?:           string
  is_urgent?:               boolean
  // images handled separately as File[] — appended to FormData by the API layer
  images?: File[]
}

/**
 * PATCH /api/reports/<id>/
 * All fields are optional — only send what changed.
 */
export type UpdateReportPayload = Partial<CreateReportPayload>

// ─────────────────────────────────────────────────────────────────────────────
//  API RESPONSES
// ─────────────────────────────────────────────────────────────────────────────

export interface ReportListResponse {
  count:   number
  results: LostReportListItem[]
}

export interface CreateReportResponse extends LostReport {}

export interface UpdateReportResponse {
  message: string
  report:  LostReport
}

export interface DeleteReportResponse {
  message: string
}