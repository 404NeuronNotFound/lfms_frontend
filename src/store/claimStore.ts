import { create } from "zustand"
import { getMyClams } from "@/api/claimApi"
import type { ClaimRequest, ClaimStatus } from "@/types/reportTypes"

// ─────────────────────────────────────────────────────────────────────────────
//  STATE SHAPE
// ─────────────────────────────────────────────────────────────────────────────

interface ClaimState {
  claims:       ClaimRequest[]
  total:        number
  loading:      boolean
  error:        string

  // active filter
  filter:       "all" | ClaimStatus

  // expanded detail id
  openId:       number | null

  // actions
  fetchClaims:  () => Promise<void>
  setFilter:    (f: "all" | ClaimStatus) => void
  setOpenId:    (id: number | null) => void
  clearError:   () => void
}

// ─────────────────────────────────────────────────────────────────────────────
//  STORE
// ─────────────────────────────────────────────────────────────────────────────

export const useClaimStore = create<ClaimState>((set,) => ({
  claims:  [],
  total:   0,
  loading: false,
  error:   "",
  filter:  "all",
  openId:  null,

  fetchClaims: async () => {
    set({ loading: true, error: "" })
    try {
      const res = await getMyClams()
      set({ claims: res.results, total: res.count, loading: false })
    } catch (e: any) {
      set({ error: e.message ?? "Failed to load claims.", loading: false })
    }
  },

  setFilter:  (filter) => set({ filter }),
  setOpenId:  (openId) => set({ openId }),
  clearError: () => set({ error: "" }),
}))