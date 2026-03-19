import { create } from "zustand"
import {
  getMyReports,
  getReport,
  createReport,
  updateReport,
  deleteReport,
} from "@/api/reportApi"
import type {
  Report,
  ReportListItem,
  ReportStatus,
  ReportType,
  CreateReportPayload,
  UpdateReportPayload,
} from "@/types/reportTypes"

// ─────────────────────────────────────────────────────────────────────────────
//  STATE SHAPE
// ─────────────────────────────────────────────────────────────────────────────
interface ReportState {
  // list
  reports:       ReportListItem[]
  reportCount:   number
  loadingList:   boolean
  listError:     string | null

  // detail
  activeReport:  Report | null
  loadingDetail: boolean
  detailError:   string | null

  // create
  submitting:    boolean
  submitError:   string | null
  submitSuccess: boolean

  // edit
  editing:       boolean
  editError:     string | null
  editSuccess:   boolean

  // delete
  deleting:      boolean
  deleteError:   string | null

  // actions
  fetchMyReports: (filters?: { status?: ReportStatus; type?: ReportType }) => Promise<void>
  fetchReport:    (id: number) => Promise<void>
  submitReport:   (payload: CreateReportPayload) => Promise<void>
  editReport:     (id: number, payload: UpdateReportPayload) => Promise<boolean>
  removeReport:   (id: number) => Promise<boolean>
  resetSubmit:    () => void
  resetEdit:      () => void
  clearErrors:    () => void
}

// ─────────────────────────────────────────────────────────────────────────────
//  STORE
// ─────────────────────────────────────────────────────────────────────────────
export const useReportStore = create<ReportState>((set,) => ({
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

  editing:       false,
  editError:     null,
  editSuccess:   false,

  deleting:      false,
  deleteError:   null,

  // ── fetchMyReports ──────────────────────────────────────────────────────────
  fetchMyReports: async (filters) => {
    set({ loadingList: true, listError: null })
    try {
      const data = await getMyReports(filters)
      set({
        reports:     data.results ?? data,
        reportCount: data.count   ?? (data.results ?? data).length,
        loadingList: false,
      })
    } catch (err: any) {
      set({ loadingList: false, listError: err?.message ?? "Failed to load reports." })
    }
  },

  // ── fetchReport ─────────────────────────────────────────────────────────────
  fetchReport: async (id) => {
    set({ loadingDetail: true, detailError: null })
    try {
      const report = await getReport(id)
      set({ activeReport: report, loadingDetail: false })
    } catch (err: any) {
      set({ loadingDetail: false, detailError: err?.message ?? "Failed to load report." })
    }
  },

  // ── submitReport ────────────────────────────────────────────────────────────
  submitReport: async (payload) => {
    set({ submitting: true, submitError: null, submitSuccess: false })
    try {
      await createReport(payload)
      set({ submitting: false, submitSuccess: true })
    } catch (err: any) {
      set({ submitting: false, submitError: err?.message ?? "Failed to submit report." })
    }
  },

  // ── editReport ──────────────────────────────────────────────────────────────
  editReport: async (id, payload) => {
    set({ editing: true, editError: null, editSuccess: false })
    try {
      const { report } = await updateReport(id, payload)
      set(state => ({
        editing:      false,
        editSuccess:  true,
        activeReport: report,
        reports: state.reports.map(r =>
          r.id === id
            ? { ...r, ...report, main_image: report.images.find(i => i.is_main)?.image_url ?? null }
            : r
        ),
      }))
      return true
    } catch (err: any) {
      set({ editing: false, editError: err?.message ?? "Failed to update report." })
      return false
    }
  },

  // ── removeReport ────────────────────────────────────────────────────────────
  removeReport: async (id) => {
    set({ deleting: true, deleteError: null })
    try {
      await deleteReport(id)
      set(state => ({
        deleting:     false,
        reports:      state.reports.filter(r => r.id !== id),
        reportCount:  state.reportCount - 1,
        activeReport: state.activeReport?.id === id ? null : state.activeReport,
      }))
      return true
    } catch (err: any) {
      set({ deleting: false, deleteError: err?.message ?? "Failed to delete report." })
      return false
    }
  },

  // ── resetSubmit ─────────────────────────────────────────────────────────────
  resetSubmit: () => set({ submitting: false, submitError: null, submitSuccess: false }),

  // ── resetEdit ───────────────────────────────────────────────────────────────
  resetEdit: () => set({ editing: false, editError: null, editSuccess: false }),

  // ── clearErrors ─────────────────────────────────────────────────────────────
  clearErrors: () => set({
    listError:   null,
    detailError: null,
    submitError: null,
    editError:   null,
    deleteError: null,
  }),
}))