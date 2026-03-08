import type { ReportCategory, ReportStatus } from "@/types/reportTypes"

// ─────────────────────────────────────────────────────────────────────────────
//  SHARED
// ─────────────────────────────────────────────────────────────────────────────

export type ClaimStatusValue = "pending" | "approved" | "rejected"
export type MyClaimStatus = ClaimStatusValue | null

// ─────────────────────────────────────────────────────────────────────────────
//  BROWSE FILTERS
// ─────────────────────────────────────────────────────────────────────────────

export type BrowseOrdering =
  | "-date_reported"
  | "date_reported"
  | "-views"
  | "views"
  | "item_name"

export interface BrowseFilters {
  category?: ReportCategory
  search?:   string
  ordering?: BrowseOrdering
}

// ─────────────────────────────────────────────────────────────────────────────
//  RESPONSE SHAPES
// ─────────────────────────────────────────────────────────────────────────────

export interface FoundItemListItem {
  id:              number
  item_name:       string
  category:        ReportCategory
  location:        string
  date_event:      string
  date_reported:   string
  status:          ReportStatus
  reward:          string | null
  views:           number
  image_count:     number
  main_image:      string | null
  is_urgent:       boolean
  found_stored_at: string | null
  user_info:       { id: number; username: string; name: string }
  my_claim_status: MyClaimStatus
}

export interface FoundItemDetail extends FoundItemListItem {
  description:             string
  location_detail:         string | null
  time_event:              string | null
  brand:                   string | null
  color:                   string | null
  distinguishing_features: string | null
  contact_phone:           string | null
  report_type:             "found"
  images: {
    id:          number
    image_url:   string
    is_main:     boolean
    order:       number
  }[]
}

export interface BrowseResponse {
  count:   number
  results: FoundItemListItem[]
}