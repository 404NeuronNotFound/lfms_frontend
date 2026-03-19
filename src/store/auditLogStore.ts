import { create } from "zustand"
import { fetchAuditLogs } from "@/api/auditLogApi"
import type {
  AuditLogEntry,
  AuditActionChoice,
  AuditLogFilters,
  AuditLogStats,
} from "@/types/auditLogTypes"

interface AuditLogState {
  entries:  AuditLogEntry[]
  choices:  AuditActionChoice[]
  stats:    AuditLogStats | null
  total:    number
  pages:    number
  loading:  boolean
  error:    string | null
  filters:  AuditLogFilters

  fetch:        () => Promise<void>
  setFilter:    <K extends keyof AuditLogFilters>(key: K, value: AuditLogFilters[K]) => void
  resetFilters: () => void
  clearError:   () => void
}

const DEFAULT_FILTERS: AuditLogFilters = {
  action:     "",
  actor_type: "",
  search:     "",
  date_from:  "",
  date_to:    "",
  page:       1,
}

export const useAuditLogStore = create<AuditLogState>((set, get) => ({
  entries:  [],
  choices:  [],
  stats:    null,
  total:    0,
  pages:    1,
  loading:  false,
  error:    null,
  filters:  { ...DEFAULT_FILTERS },

  fetch: async () => {
    set({ loading: true, error: null })
    try {
      const res = await fetchAuditLogs(get().filters)
      set({
        entries: res.results,
        choices: res.choices,
        stats:   res.stats,
        total:   res.total,
        pages:   res.pages,
        loading: false,
      })
    } catch (e: any) {
      set({ error: e.message ?? "Failed to load audit logs", loading: false })
    }
  },

  setFilter: (key, value) => {
    const reset = key !== "page" ? { page: 1 } : {}
    set(s => ({ filters: { ...s.filters, [key]: value, ...reset } }))
    get().fetch()
  },

  resetFilters: () => {
    set({ filters: { ...DEFAULT_FILTERS } })
    get().fetch()
  },

  clearError: () => set({ error: null }),
}))