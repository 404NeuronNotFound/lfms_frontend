import { create } from "zustand"
import { getFoundItems, getFoundItem } from "@/api/browseApi"
import type {
  FoundItemListItem,
  FoundItemDetail,
  BrowseFilters,
  BrowseOrdering,
  MyClaimStatus,
} from "@/types/browseTypes"
import type { ReportCategory } from "@/types/reportTypes"

// ─────────────────────────────────────────────────────────────────────────────
//  STATE SHAPE
// ─────────────────────────────────────────────────────────────────────────────

interface BrowseState {
  // ── list ──
  items:        FoundItemListItem[]
  total:        number
  loadingList:  boolean
  listError:    string

  // ── filters ──
  search:       string
  category:     "all" | ReportCategory
  ordering:     BrowseOrdering

  // ── detail drawer ──
  openId:       number | null
  detail:       FoundItemDetail | null
  loadingDetail:boolean
  detailError:  string

  // ── actions ──
  setSearch:    (v: string) => void
  setCategory:  (v: "all" | ReportCategory) => void
  setOrdering:  (v: BrowseOrdering) => void
  resetFilters: () => void

  fetchItems:   () => Promise<void>
  openDetail:   (id: number) => Promise<void>
  closeDetail:  () => void

  /** Optimistically mark a claim as pending after user submits */
  markClaimed:  (itemId: number) => void
}

// ─────────────────────────────────────────────────────────────────────────────
//  STORE
// ─────────────────────────────────────────────────────────────────────────────

export const useBrowseStore = create<BrowseState>((set, get) => ({
  // ── list ──
  items:        [],
  total:        0,
  loadingList:  false,
  listError:    "",

  // ── filters ──
  search:       "",
  category:     "all",
  ordering:     "-date_reported",

  // ── detail ──
  openId:        null,
  detail:        null,
  loadingDetail: false,
  detailError:   "",

  // ── filter setters ──
  setSearch:   (v) => set({ search: v }),
  setCategory: (v) => set({ category: v }),
  setOrdering: (v) => set({ ordering: v }),
  resetFilters: () => set({ search: "", category: "all", ordering: "-date_reported" }),

  // ── fetch list ──
  fetchItems: async () => {
    const { search, category, ordering } = get()
    set({ loadingList: true, listError: "" })
    try {
      const filters: BrowseFilters = {}
      if (category !== "all")  filters.category = category
      if (search.trim())       filters.search   = search.trim()
      if (ordering)            filters.ordering = ordering
      const res = await getFoundItems(filters)
      set({ items: res.results, total: res.count })
    } catch (e: any) {
      set({ listError: e.message ?? "Failed to load found items." })
    } finally {
      set({ loadingList: false })
    }
  },

  // ── open detail drawer ──
  openDetail: async (id) => {
    set({ openId: id, detail: null, loadingDetail: true, detailError: "" })
    try {
      const item = await getFoundItem(id)
      set({ detail: item })
    } catch (e: any) {
      set({ detailError: e.message ?? "Failed to load item." })
    } finally {
      set({ loadingDetail: false })
    }
  },

  closeDetail: () => set({ openId: null, detail: null, detailError: "" }),

  // ── optimistic claim update ──
  markClaimed: (itemId) => {
    const mark = (i: FoundItemListItem) =>
      i.id === itemId ? { ...i, my_claim_status: "pending" as MyClaimStatus } : i
    set(s => ({
      items:  s.items.map(mark),
      detail: s.detail?.id === itemId
        ? { ...s.detail, my_claim_status: "pending" as MyClaimStatus }
        : s.detail,
    }))
  },
}))