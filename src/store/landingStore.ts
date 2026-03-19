import { create } from "zustand"
import { fetchPublicStats } from "@/api/landingApi"
import type { PublicStats, PublicActivityItem } from "@/types/landingTypes"

interface LandingStore {
  stats:           PublicStats | null
  activity:        PublicActivityItem[]
  loading:         boolean
  error:           string | null
  lastFetched:     number | null
  fetch:           () => Promise<void>
}

export const useLandingStore = create<LandingStore>((set, get) => ({
  stats:       null,
  activity:    [],
  loading:     false,
  error:       null,
  lastFetched: null,

  fetch: async () => {
    // Don't refetch if fetched within the last 60 seconds
    const now = Date.now()
    if (get().lastFetched && now - get().lastFetched! < 60_000) return

    set({ loading: true, error: null })
    try {
      const data = await fetchPublicStats()
      set({
        stats:       data.stats,
        activity:    data.recent_activity,
        loading:     false,
        lastFetched: now,
      })
    } catch (e: any) {
      set({ loading: false, error: e.message ?? "Failed to load stats" })
    }
  },
}))