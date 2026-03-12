// ─────────────────────────────────────────────────────────────────────────────
//  ADMIN DASHBOARD TYPES
//  Mirrors GET /api/admin-dashboard/
// ─────────────────────────────────────────────────────────────────────────────

export interface DashboardStatCard {
  label:     string
  value:     number
  delta_pct: number   // e.g. 12.4  means +12.4% vs previous month
  sub:       string
}

export interface DashboardStats {
  total_reports:   DashboardStatCard
  items_recovered: DashboardStatCard
  pending_claims:  DashboardStatCard
  active_users:    DashboardStatCard
}

export interface WeeklyDay {
  day:   string   // "Mon" … "Sun"
  count: number
}

export interface TopLocation {
  name:  string
  count: number
}

export interface RecentReport {
  id:            number
  item_name:     string
  report_type:   "lost" | "found"
  location:      string
  date_reported: string   // ISO datetime
  status:        string
  match_score:   number | null   // 0-100
  username:      string
}

export interface RecentUser {
  id:          number
  full_name:   string
  username:    string
  role:        "ADMIN" | "USER"
  date_joined: string
  reports:     number
  avatar:      string | null
}

export interface RecoveryBreakdown {
  claimed: number
  matched: number
  pending: number
}

export interface AdminDashboardData {
  stats:             DashboardStats
  weekly_activity:   WeeklyDay[]
  top_locations:     TopLocation[]
  recent_reports:    RecentReport[]
  recent_users:      RecentUser[]
  recovery_rate:     number           // 0-100 percentage
  recovery_breakdown: RecoveryBreakdown
  total_reports:     number
}