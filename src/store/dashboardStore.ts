import { create } from "zustand"
import { fetchAdminDashboard } from "@/api/dashboardApi"
import type { AdminDashboardData } from "@/types/dashboardTypes"

interface DashboardStore {
  data:     AdminDashboardData | null
  loading:  boolean
  error:    string | null

  fetch:      () => Promise<void>
  clearError: () => void
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  data:    null,
  loading: false,
  error:   null,

  fetch: async () => {
    set({ loading: true, error: null })
    try {
      const data = await fetchAdminDashboard()
      set({ data, loading: false })
    } catch (e: any) {
      set({ error: e.message ?? "Failed to load dashboard", loading: false })
    }
  },

  clearError: () => set({ error: null }),
}))