// ─────────────────────────────────────────────────────────────────────────────
//  AUDIT LOG TYPES  —  mirrors GET /api/admin/audit-logs/
// ─────────────────────────────────────────────────────────────────────────────

export type AuditAction =
  | "login" | "logout" | "register" | "password_change"
  | "report_created" | "report_updated" | "report_deleted" | "report_closed"
  | "claim_submitted" | "claim_approved" | "claim_rejected"
  | "match_confirmed" | "match_dismissed" | "match_run"
  | "user_banned" | "user_unbanned" | "user_deleted" | "role_changed"

export type AuditActorType = "user" | "admin" | "system"

export interface AuditLogEntry {
  id:             number
  action:         AuditAction
  actor_type:     AuditActorType
  actor:          string          // username or "System"
  actor_id:       number | null
  target_user:    string | null
  target_user_id: number | null
  report_id:      number | null
  claim_id:       number | null
  detail:         string
  ip:             string | null
  created_at:     string          // ISO datetime
}

export interface AuditActionChoice {
  value: AuditAction
  label: string
}

export interface AuditLogStats {
  total:           number
  today:           number
  last_24h:        number
  admin_actions:   number
  user_actions:    number
  system_actions:  number
  security_events: number
}

export interface AuditLogResponse {
  total:   number
  page:    number
  pages:   number
  results: AuditLogEntry[]
  choices: AuditActionChoice[]
  stats:   AuditLogStats
}

export interface AuditLogFilters {
  action:     AuditAction | ""
  actor_type: AuditActorType | ""
  search:     string
  date_from:  string
  date_to:    string
  page:       number
}