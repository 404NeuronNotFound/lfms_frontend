// ─────────────────────────────────────────────────────────────────────────────
//  REPORT TYPES  — mirrors Django models (LostReport, MatchSuggestion,
//                   ClaimRequest, Notification)
//
//  Phase 1 changes:
//    • Added report_type  ("lost" | "found")
//    • Renamed date_lost  → date_event  (works for both lost + found)
//    • Renamed time_lost  → time_event
//    • Added found_stored_at  (where finder is keeping the item)
//    • Added matched_report   (FK to counterpart report when matched)
//    • Added MatchSuggestion, ClaimRequest, Notification types
// ─────────────────────────────────────────────────────────────────────────────

export type ReportType = "lost" | "found"

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

export type MatchConfidence = "high" | "medium" | "low"

export type MatchSuggestionStatus = "pending" | "confirmed" | "dismissed"

export type ClaimStatus = "pending" | "approved" | "rejected"

export type NotificationType =
  // user-facing
  | "report_received"
  | "under_review"
  | "matched"
  | "claim_received"
  | "claim_approved"
  | "claim_rejected"
  | "report_closed"
  | "report_rejected"
  // admin-facing
  | "new_report"
  | "new_claim"

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

// ── Extended user info returned by admin endpoints ────────────────────────────
export interface AdminReportUserInfo extends ReportUserInfo {
  email: string
  phone: string | null
}

// ─────────────────────────────────────────────────────────────────────────────
//  CORE REPORT (used for both Lost and Found)
// ─────────────────────────────────────────────────────────────────────────────

export interface Report {
  id:                      number
  user_info:               ReportUserInfo

  // type flag
  report_type:             ReportType

  // required fields
  item_name:               string
  category:                ReportCategory
  location:                string
  date_event:              string           // "YYYY-MM-DD" (was date_lost)
  description:             string

  // optional fields (nullable)
  location_detail:         string | null
  time_event:              string | null    // "HH:MM:SS" (was time_lost)
  brand:                   string | null
  color:                   string | null
  distinguishing_features: string | null
  reward:                  string | null    // only meaningful for lost reports
  contact_phone:           string | null
  is_urgent:               boolean

  // found-specific optional
  found_stored_at:         string | null    // where the found item is being kept

  // matching
  matched_report:          number | null    // FK to the counterpart report id

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
export interface ReportListItem {
  id:            number
  user_info:     ReportUserInfo
  report_type:   ReportType
  item_name:     string
  category:      ReportCategory
  location:      string
  date_event:    string
  date_reported: string
  status:        ReportStatus
  is_urgent:     boolean
  reward:        string | null
  views:         number
  image_count:   number
  main_image:    string | null
}

// ── Admin versions (extended user_info) ──────────────────────────────────────
export interface AdminReport extends Omit<Report, "user_info"> {
  user_info: AdminReportUserInfo
}

export interface AdminReportListItem extends Omit<ReportListItem, "user_info"> {
  user_info:      AdminReportUserInfo
  matched_report: number | null
}

// ─────────────────────────────────────────────────────────────────────────────
//  BACKWARD-COMPATIBLE ALIASES  (so existing imports don't break)
// ─────────────────────────────────────────────────────────────────────────────

/** @deprecated use Report instead */
export type LostReport = Report

/** @deprecated use ReportListItem instead */
export type LostReportListItem = ReportListItem

/** @deprecated use AdminReport instead */
export type AdminLostReport = AdminReport

/** @deprecated use AdminReportListItem instead */
export type AdminLostReportListItem = AdminReportListItem

// ─────────────────────────────────────────────────────────────────────────────
//  PAYLOADS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /api/reports/
 * Send report_type: "lost" | "found" in body.
 */
export interface CreateReportPayload {
  // type
  report_type:  ReportType

  // required
  item_name:    string
  category:     ReportCategory
  location:     string
  date_event:   string    // "YYYY-MM-DD"
  description:  string

  // optional
  location_detail?:         string
  time_event?:              string    // "HH:MM"
  brand?:                   string
  color?:                   string
  distinguishing_features?: string
  reward?:                  string
  contact_phone?:           string
  is_urgent?:               boolean
  found_stored_at?:         string    // found flow only

  // images handled as File[] appended to FormData
  images?: File[]
}

/** PATCH /api/reports/<id>/ */
export type UpdateReportPayload = Partial<CreateReportPayload>

/** PATCH /api/admin/reports/<id>/ */
export interface AdminUpdateReportPayload {
  status?:          ReportStatus
  admin_notes?:     string | null
  matched_report?:  number | null
  item_name?:       string
  category?:        ReportCategory
  location?:        string
  description?:     string
  found_stored_at?: string
}

// ─────────────────────────────────────────────────────────────────────────────
//  API RESPONSE WRAPPERS
// ─────────────────────────────────────────────────────────────────────────────

export interface ReportListResponse {
  count:   number
  results: ReportListItem[]
}

export interface AdminReportListResponse {
  count:   number
  results: AdminReportListItem[]
}

export interface AdminReportStats {
  total:          number
  lost:           number
  found:          number
  open:           number
  under_review:   number
  matched:        number
  claimed:        number
  closed:         number
  rejected:       number
  urgent:         number
  new_this_month: number
}

export interface CreateReportResponse extends Report {}

export interface UpdateReportResponse {
  message: string
  report:  Report
}

export interface AdminUpdateReportResponse {
  message: string
  report:  AdminReport
}

export interface DeleteReportResponse {
  message: string
}

// ─────────────────────────────────────────────────────────────────────────────
//  MATCH SUGGESTION
// ─────────────────────────────────────────────────────────────────────────────

export interface MatchScoreBreakdown {
  category:    number
  name:        number
  description: number
  location:    number
  date:        number
}

export interface ReportSummary {
  id:         number
  item_name:  string
  category:   ReportCategory
  location:   string
  date_event: string
  status:     ReportStatus
}

export interface MatchSuggestion {
  id:                   number | null    // null for fresh Claude AI suggestions (no DB row yet)
  lost_report:          number
  lost_report_summary:  ReportSummary
  found_report:         number
  found_report_summary: ReportSummary
  score:                number           // 0.0 – 1.0
  score_breakdown:      MatchScoreBreakdown
  confidence:           MatchConfidence
  reasoning?:           string           // Claude's one-line explanation
  status:               MatchSuggestionStatus
  created_at?:          string
  updated_at?:          string
}

export interface MatchRunResponse {
  report_id:      number
  report_type:    ReportType
  matches_found:  number
  suggestions:    MatchSuggestion[]
}

// ─────────────────────────────────────────────────────────────────────────────
//  CLAIM REQUEST
// ─────────────────────────────────────────────────────────────────────────────

export interface ClaimantInfo {
  id:       number
  username: string
  name:     string
  email:    string
  avatar:   string | null
}

export interface ClaimReportSummary {
  id:          number
  item_name:   string
  report_type: ReportType
  status:      ReportStatus
}

export interface ClaimRequest {
  id:                number
  report:            number
  report_summary:    ClaimReportSummary
  claimant:          number
  claimant_info:     ClaimantInfo
  proof_description: string
  status:            ClaimStatus
  admin_response:    string | null
  date_submitted:    string
  date_updated:      string
}

export interface CreateClaimPayload {
  proof_description: string
}

export interface AdminUpdateClaimPayload {
  status:          "approved" | "rejected"
  admin_response?: string
}

export interface ClaimListResponse {
  count:   number
  results: ClaimRequest[]
}

// ─────────────────────────────────────────────────────────────────────────────
//  NOTIFICATION
// ─────────────────────────────────────────────────────────────────────────────

export interface Notification {
  id:         number
  type:       NotificationType
  title:      string
  message:    string
  is_read:    boolean
  report_id:  number | null
  claim_id:   number | null
  created_at: string
}

export interface NotificationListResponse {
  unread_count: number
  results:      Notification[]
}