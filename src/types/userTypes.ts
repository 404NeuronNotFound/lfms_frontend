
export interface UserProfile {
  phone_number: string | null
  address:      string | null
  bio:          string | null
  avatar:       string | null
}


export interface ApiUser {
  id:          number
  username:    string
  first_name:  string
  last_name:   string
  email:       string
  role:        "ADMIN" | "USER"
  status:      "active" | "inactive" | "banned"
  date_joined: string          
  last_login:  string | null   
  reports:     number
  claims:      number
  profile:     UserProfile | null
}


export interface UserStats {
  total:          number
  admins:         number
  active:         number
  inactive:       number
  banned:         number
  new_this_month: number
}


export interface UserListResponse {
  count: number
  users: ApiUser[]
}


export type SortField    = "name" | "date_joined" | "reports" | "role"
export type SortDir      = "asc"  | "desc"
export type RoleFilter   = "all"  | "ADMIN" | "USER"
export type StatusFilter = "all"  | "active" | "inactive" | "banned"