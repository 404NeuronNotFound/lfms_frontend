// ─────────────────────────────────────────────────────────────────────────────
//  LANDING PAGE TYPES
//  Mirrors GET /api/public/stats/  (no auth required)
// ─────────────────────────────────────────────────────────────────────────────

export interface PublicStats {
  total_reports:   number
  items_recovered: number
  active_users:    number
  open_reports:    number
  matched_reports: number
  recovery_rate:   number   // 0–100 percentage
  new_this_month:  number
}

export interface PublicActivityItem {
  id:       number
  type:     "Lost" | "Found"
  item:     string
  location: string
  time:     string   // ISO datetime
  category: string
  match:    string | null   // e.g. "87%" or null
}

export interface PublicStatsResponse {
  stats:           PublicStats
  recent_activity: PublicActivityItem[]
}