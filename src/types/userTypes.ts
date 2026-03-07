// ── User profile (nested) ─────────────────────────────────────────────────
export interface UserProfile {
  phone_number: string | null
  address:      string | null
  bio:          string | null
  avatar:       string | null
}

// ── Full user returned from API ───────────────────────────────────────────
export interface ApiUser {
  id:          number
  username:    string
  first_name:  string
  last_name:   string
  email:       string
  role:        "ADMIN" | "USER"
  status:      "active" | "inactive" | "banned"
  date_joined: string          // ISO-8601 string
  last_login:  string | null   // ISO-8601 string or null
  reports:     number
  claims:      number
  profile:     UserProfile | null
}

// ── Stats returned by /admin/users/stats/ ─────────────────────────────────
export interface UserStats {
  total:          number
  admins:         number
  active:         number
  inactive:       number
  banned:         number
  new_this_month: number
}

// ── List response from /admin/users/ ─────────────────────────────────────
export interface UserListResponse {
  count: number
  users: ApiUser[]
}

// ── UI-only filter / sort types ───────────────────────────────────────────
export type SortField    = "name" | "date_joined" | "reports" | "role"
export type SortDir      = "asc"  | "desc"
export type RoleFilter   = "all"  | "ADMIN" | "USER"
export type StatusFilter = "all"  | "active" | "inactive" | "banned"