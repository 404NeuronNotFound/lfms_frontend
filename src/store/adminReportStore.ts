import { create } from "zustand"
import {
  adminGetReports,
  adminGetReport,
  adminGetReportStats,
  adminUpdateReport,
  adminDeleteReport,
} from "@/api/adminReportApi"
import type { AdminReportFilters } from "@/api/adminReportApi"
import type {
  AdminLostReport,
  AdminLostReportListItem,
  AdminReportStats,
  AdminUpdateReportPayload,
  ReportStatus,
} from "@/types/reportTypes"

// ─────────────────────────────────────────────────────────────────────────────
//  STATE SHAPE
// ─────────────────────────────────────────────────────────────────────────────
interface AdminReportState {
  // list
  reports:       AdminLostReportListItem[]
  reportCount:   number
  loadingList:   boolean
  listError:     string | null

  // stats
  stats:         AdminReportStats | null
  loadingStats:  boolean

  // active detail (for drawer)
  activeReport:  AdminLostReport | null
  loadingDetail: boolean
  detailError:   string | null

  // update (status change / notes)
  updating:      boolean
  updateError:   string | null

  // delete
  deleting:      boolean
  deleteError:   string | null

  // ── Actions ──────────────────────────────────────────────────────────────

  fetchReports:  (filters?: AdminReportFilters) => Promise<void>
  fetchStats:    () => Promise<void>
  fetchReport:   (id: number) => Promise<void>

  /**
   * PATCH status + optional admin_notes.
   * Updates the active detail and the row in the list in-memory.
   */
  reviewReport:  (id: number, payload: AdminUpdateReportPayload) => Promise<void>

  removeReport:  (id: number) => Promise<void>
  clearErrors:   () => void
}

// ─────────────────────────────────────────────────────────────────────────────
//  STORE
// ─────────────────────────────────────────────────────────────────────────────
export const useAdminReportStore = create<AdminReportState>((set, get) => ({
  reports:       [],
  reportCount:   0,
  loadingList:   false,
  listError:     null,

  stats:         null,
  loadingStats:  false,

  activeReport:  null,
  loadingDetail: false,
  detailError:   null,

  updating:      false,
  updateError:   null,

  deleting:      false,
  deleteError:   null,

  // ── fetchReports ───────────────────────────────────────────────────────────
  fetchReports: async (filters = {}) => {
    set({ loadingList: true, listError: null })
    try {
      const data = await adminGetReports(filters)
      set({ reports: data.results, reportCount: data.count, loadingList: false })
    } catch (err: any) {
      set({ loadingList: false, listError: err?.message ?? "Failed to load reports." })
    }
  },

  // ── fetchStats ─────────────────────────────────────────────────────────────
  fetchStats: async () => {
    set({ loadingStats: true })
    try {
      const stats = await adminGetReportStats()
      set({ stats, loadingStats: false })
    } catch {
      set({ loadingStats: false })
    }
  },

  // ── fetchReport ────────────────────────────────────────────────────────────
  fetchReport: async (id) => {
    set({ loadingDetail: true, detailError: null, activeReport: null })
    try {
      const report = await adminGetReport(id)
      set({ activeReport: report, loadingDetail: false })
    } catch (err: any) {
      set({ loadingDetail: false, detailError: err?.message ?? "Failed to load report." })
    }
  },

  // ── reviewReport ───────────────────────────────────────────────────────────
  reviewReport: async (id, payload) => {
    set({ updating: true, updateError: null })
    try {
      const { report } = await adminUpdateReport(id, payload)
      // Patch active detail
      set(state => ({
        updating:     false,
        activeReport: state.activeReport?.id === id ? report : state.activeReport,
        // Patch the row in the list too
        reports: state.reports.map(r =>
          r.id === id
            ? {
                ...r,
                status:      report.status,
                is_urgent:   report.is_urgent,
                item_name:   report.item_name,
                category:    report.category,
                location:    report.location,
              }
            : r
        ),
      }))
    } catch (err: any) {
      set({ updating: false, updateError: err?.message ?? "Failed to update report." })
    }
  },

  // ── removeReport ───────────────────────────────────────────────────────────
  removeReport: async (id) => {
    set({ deleting: true, deleteError: null })
    try {
      await adminDeleteReport(id)
      set(state => ({
        deleting:     false,
        reports:      state.reports.filter(r => r.id !== id),
        reportCount:  state.reportCount - 1,
        activeReport: state.activeReport?.id === id ? null : state.activeReport,
      }))
    } catch (err: any) {
      set({ deleting: false, deleteError: err?.message ?? "Failed to delete report." })
    }
  },

  // ── clearErrors ────────────────────────────────────────────────────────────
  clearErrors: () => set({
    listError:   null,
    detailError: null,
    updateError: null,
    deleteError: null,
  }),
}))