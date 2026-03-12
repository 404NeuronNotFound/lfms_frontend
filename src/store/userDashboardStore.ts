import { create } from "zustand"
import { fetchUserDashboard } from "@/api/userDashboardApi"
import type { UserDashboardData } from "@/types/userDashboardTypes"

interface UserDashboardStore {
  data:       UserDashboardData | null
  loading:    boolean
  error:      string | null
  fetch:      () => Promise<void>
  clearError: () => void
}

export const useUserDashboardStore = create<UserDashboardStore>((set) => ({
  data:    null,
  loading: false,
  error:   null,

  fetch: async () => {
    set({ loading: true, error: null })
    try {
      const data = await fetchUserDashboard()
      set({ data, loading: false })
    } catch (e: any) {
      set({ error: e.message ?? "Failed to load dashboard", loading: false })
    }
  },

  clearError: () => set({ error: null }),
}))