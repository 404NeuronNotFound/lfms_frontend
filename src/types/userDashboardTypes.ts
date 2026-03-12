// ─────────────────────────────────────────────────────────────────────────────
//  USER DASHBOARD TYPES  —  mirrors GET /api/user-dashboard/
// ─────────────────────────────────────────────────────────────────────────────

export interface UserDashboardUserInfo {
  id:          number
  username:    string
  full_name:   string
  first_name:  string
  email:       string
  date_joined: string
  avatar:      string | null
}

export interface UserDashboardStats {
  total_reports:      number
  open_reports:       number
  matched_reports:    number
  claimed_reports:    number
  reports_this_month: number
  total_claims:       number
  pending_claims:     number
  approved_claims:    number
  unread_notifs:      number
}

export interface UserDashboardReport {
  id:            number
  item_name:     string
  report_type:   "lost" | "found"
  category:      string
  location:      string
  status:        string
  date_reported: string
  is_urgent:     boolean
  match_score:   number | null
}

export interface UserDashboardClaim {
  id:             number
  item_name:      string
  report_type:    "lost" | "found"
  status:         "pending" | "approved" | "rejected"
  date_submitted: string
  admin_response: string | null
}

export interface UserDashboardNotif {
  id:         number
  type:       string
  title:      string
  message:    string
  is_read:    boolean
  created_at: string
}

export interface UserDashboardData {
  user:            UserDashboardUserInfo
  stats:           UserDashboardStats
  recent_reports:  UserDashboardReport[]
  recent_claims:   UserDashboardClaim[]
  recent_notifs:   UserDashboardNotif[]
}