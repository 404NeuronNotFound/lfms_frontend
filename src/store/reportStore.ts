import { create } from "zustand"
import {
  createReport,
  getMyReports,
  getReport,
  updateReport,
  deleteReport,
} from "@/api/reportApi"
import type {
  LostReport,
  LostReportListItem,
  CreateReportPayload,
  UpdateReportPayload,
  ReportStatus,
} from "@/types/reportTypes"

// ─────────────────────────────────────────────────────────────────────────────
//  STATE SHAPE
// ─────────────────────────────────────────────────────────────────────────────

interface ReportState {
  // list
  reports:       LostReportListItem[]
  reportCount:   number
  loadingList:   boolean
  listError:     string | null

  // active detail
  activeReport:  LostReport | null
  loadingDetail: boolean
  detailError:   string | null

  // mutations
  submitting:    boolean
  submitError:   string | null
  submitSuccess: boolean   // true after a successful create → triggers success screen

  deleting:      boolean
  deleteError:   string | null

  // ── Actions ────────────────────────────────────────────────────────────────

  /** Fetch current user's reports. Optional status filter. */
  fetchMyReports: (status?: ReportStatus) => Promise<void>

  /** Fetch one report by ID. */
  fetchReport: (id: number) => Promise<void>

  /**
   * Submit a new lost report.
   * Sets submitSuccess=true on success — the page watches this to show the
   * success screen. Call resetSubmit() when the user navigates away or resets.
   */
  submitReport: (payload: CreateReportPayload) => Promise<void>

  /** Partially update an existing report. */
  editReport: (id: number, payload: UpdateReportPayload) => Promise<void>

  /** Delete a report by ID. */
  removeReport: (id: number) => Promise<void>

  /** Reset submit state (error + success flag) — call before re-using the form. */
  resetSubmit: () => void

  /** Clear all error messages. */
  clearErrors: () => void
}

// ─────────────────────────────────────────────────────────────────────────────
//  STORE
// ─────────────────────────────────────────────────────────────────────────────

export const useReportStore = create<ReportState>((set, get) => ({
  reports:       [],
  reportCount:   0,
  loadingList:   false,
  listError:     null,

  activeReport:  null,
  loadingDetail: false,
  detailError:   null,

  submitting:    false,
  submitError:   null,
  submitSuccess: false,

  deleting:      false,
  deleteError:   null,

  // ── fetchMyReports ─────────────────────────────────────────────────────────
  fetchMyReports: async (status) => {
    set({ loadingList: true, listError: null })
    try {
      const data = await getMyReports(status)
      set({
        reports:     data.results,
        reportCount: data.count,
        loadingList: false,
      })
    } catch (err: any) {
      set({
        loadingList: false,
        listError:   err?.message ?? "Failed to load reports.",
      })
    }
  },

  // ── fetchReport ────────────────────────────────────────────────────────────
  fetchReport: async (id) => {
    set({ loadingDetail: true, detailError: null, activeReport: null })
    try {
      const report = await getReport(id)
      set({ activeReport: report, loadingDetail: false })
    } catch (err: any) {
      set({
        loadingDetail: false,
        detailError:   err?.message ?? "Failed to load report.",
      })
    }
  },

  // ── submitReport ───────────────────────────────────────────────────────────
  submitReport: async (payload) => {
    set({ submitting: true, submitError: null, submitSuccess: false })
    try {
      await createReport(payload)
      set({ submitting: false, submitSuccess: true })
    } catch (err: any) {
      set({
        submitting:  false,
        submitError: err?.message ?? "Failed to submit report. Please try again.",
      })
    }
  },

  // ── editReport ─────────────────────────────────────────────────────────────
  editReport: async (id, payload) => {
    set({ submitting: true, submitError: null })
    try {
      const { report } = await updateReport(id, payload)
      // Update in-list entry if it exists
      set(state => ({
        submitting:   false,
        activeReport: report,
        reports: state.reports.map(r =>
          r.id === id
            ? { ...r, ...report, main_image: report.images.find(i => i.is_main)?.image_url ?? null }
            : r
        ),
      }))
    } catch (err: any) {
      set({
        submitting:  false,
        submitError: err?.message ?? "Failed to update report.",
      })
    }
  },

  // ── removeReport ───────────────────────────────────────────────────────────
  removeReport: async (id) => {
    set({ deleting: true, deleteError: null })
    try {
      await deleteReport(id)
      set(state => ({
        deleting:    false,
        reports:     state.reports.filter(r => r.id !== id),
        reportCount: state.reportCount - 1,
        activeReport: state.activeReport?.id === id ? null : state.activeReport,
      }))
    } catch (err: any) {
      set({
        deleting:    false,
        deleteError: err?.message ?? "Failed to delete report.",
      })
    }
  },

  // ── resetSubmit ────────────────────────────────────────────────────────────
  resetSubmit: () => set({ submitting: false, submitError: null, submitSuccess: false }),

  // ── clearErrors ────────────────────────────────────────────────────────────
  clearErrors: () => set({
    listError:   null,
    detailError: null,
    submitError: null,
    deleteError: null,
  }),
}))