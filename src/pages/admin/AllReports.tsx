import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import MatchManager from "@/components/MatchManager"
import { adminUnmatch, adminRunMatch, adminConfirmMatch, adminDismissMatch, adminGetSuggestions } from "@/api/adminReportApi"
import {
  ClipboardList, Search, Eye, CheckCircle, XCircle, Clock,
  MapPin, Tag, Calendar, AlertTriangle, Package, X,
  RefreshCw, Zap, Hash, Layers, FileText, Flag, TrendingUp,
  Sparkles, Phone, Mail, Image, DollarSign, ShieldCheck,
  User, MessageSquare, Trash2, Check, Ban, Filter, Download,
  Link2, Unlink, Activity, Cpu, ChevronDown,
  Brain, BarChart2, ThumbsDown, ThumbsUp,
} from "lucide-react"
import { useAdminReportStore } from "@/store/adminReportStore"
import type {
  AdminLostReportListItem,
  ReportStatus,
  ReportCategory,
  ReportType,
  MatchSuggestion,
} from "@/types/reportTypes"
import type { AdminReportFilters } from "@/api/adminReportApi"

// ─────────────────────────────────────────────────────────────────────────────
//  HOOKS
// ─────────────────────────────────────────────────────────────────────────────
function useIsMobile(bp = 768) {
  const [v, setV] = React.useState(() =>
    typeof window !== "undefined" ? window.innerWidth < bp : false
  )
  React.useEffect(() => {
    const h = () => setV(window.innerWidth < bp)
    window.addEventListener("resize", h)
    return () => window.removeEventListener("resize", h)
  }, [bp])
  return v
}

function useDebounce<T>(value: T, delay = 400): T {
  const [dv, setDv] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDv(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return dv
}

// ─────────────────────────────────────────────────────────────────────────────
//  CONFIG
// ─────────────────────────────────────────────────────────────────────────────
const STATUS_CFG: Record<ReportStatus, { label: string; color: string; bg: string; border: string }> = {
  open:         { label: "Open",         color: "#34d399", bg: "rgba(52,211,153,0.1)",  border: "rgba(52,211,153,0.25)"  },
  under_review: { label: "Under Review", color: "#fbbf24", bg: "rgba(251,191,36,0.1)",  border: "rgba(251,191,36,0.25)"  },
  matched:      { label: "Matched",      color: "#818cf8", bg: "rgba(129,140,248,0.1)", border: "rgba(129,140,248,0.25)" },
  claimed:      { label: "Claimed",      color: "#38bdf8", bg: "rgba(56,189,248,0.1)",  border: "rgba(56,189,248,0.25)"  },
  closed:       { label: "Closed",       color: "#6b7280", bg: "rgba(107,114,128,0.1)", border: "rgba(107,114,128,0.25)" },
  rejected:     { label: "Rejected",     color: "#f87171", bg: "rgba(248,113,113,0.1)", border: "rgba(248,113,113,0.25)" },
}

const CATEGORY_ICONS: Record<ReportCategory, React.ElementType> = {
  "Electronics":    Zap,
  "Wallets & Bags": Package,
  "Keys":           Hash,
  "Clothing":       Layers,
  "Jewelry":        Sparkles,
  "Documents":      FileText,
  "Pets":           Flag,
  "Sports":         TrendingUp,
  "Other":          Tag,
}

const STATUS_FILTERS: { value: "all" | ReportStatus; label: string }[] = [
  { value: "all",          label: "All"          },
  { value: "open",         label: "Open"         },
  { value: "under_review", label: "Under Review" },
  { value: "matched",      label: "Matched"      },
  { value: "claimed",      label: "Claimed"      },
  { value: "closed",       label: "Closed"       },
  { value: "rejected",     label: "Rejected"     },
]

// Valid status transitions per current status
const STATUS_ACTIONS: Record<ReportStatus, { status: ReportStatus; label: string; color: string; icon: React.ElementType }[]> = {
  open:         [
    { status: "under_review", label: "Move to Under Review", color: "#fbbf24", icon: Clock       },
    { status: "rejected",     label: "Reject Report",        color: "#f87171", icon: XCircle     },
  ],
  under_review: [
    { status: "closed",       label: "Close Report",         color: "#6b7280", icon: Ban         },
    { status: "rejected",     label: "Reject Report",        color: "#f87171", icon: XCircle     },
  ],
  matched:      [
    { status: "claimed",      label: "Mark as Claimed",      color: "#38bdf8", icon: Check       },
    { status: "closed",       label: "Close Report",         color: "#6b7280", icon: Ban         },
  ],
  claimed:      [
    { status: "closed",       label: "Close Report",         color: "#6b7280", icon: Ban         },
  ],
  closed:       [],
  rejected:     [
    { status: "open",         label: "Re-open Report",       color: "#34d399", icon: RefreshCw   },
  ],
}

const CATEGORIES: ReportCategory[] = [
  "Electronics","Wallets & Bags","Keys","Clothing",
  "Jewelry","Documents","Pets","Sports","Other",
]

// ─────────────────────────────────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────────────────────────────────
function timeAgo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (diff < 1)     return "just now"
  if (diff < 60)    return `${diff}m ago`
  if (diff < 1440)  return `${Math.floor(diff / 60)}h ago`
  if (diff < 43200) return `${Math.floor(diff / 1440)}d ago`
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
}

function fmtTime(t: string | null) {
  if (!t) return null
  const [h, m] = t.split(":")
  const hr = parseInt(h)
  return `${hr % 12 || 12}:${m} ${hr >= 12 ? "PM" : "AM"}`
}

// ─────────────────────────────────────────────────────────────────────────────
//  STATUS PILL
// ─────────────────────────────────────────────────────────────────────────────
function StatusPill({ status }: { status: ReportStatus }) {
  const c = STATUS_CFG[status]
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 9px", borderRadius: 20, background: c.bg, border: `1px solid ${c.border}`, fontSize: 10, fontWeight: 700, color: c.color, letterSpacing: 0.4, whiteSpace: "nowrap" }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: c.color, flexShrink: 0 }} />
      {c.label}
    </span>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  SKELETON
// ─────────────────────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "36px 1fr 130px 120px 80px 60px", gap: 12, padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.05)", alignItems: "center" }}>
      {[36, "55%", 90, 80, 40, 40].map((w, i) => (
        <div key={i} className="ar-skeleton" style={{ height: 12, borderRadius: 6, background: "rgba(255,255,255,0.05)", width: w }} />
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  DELETE MODAL
// ─────────────────────────────────────────────────────────────────────────────
function DeleteModal({ itemName, onConfirm, onCancel, loading }: {
  itemName: string; onConfirm: () => void; onCancel: () => void; loading: boolean
}) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: "fixed", inset: 0, zIndex: 500, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <motion.div initial={{ scale: 0.92, y: 12 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 12 }}
        style={{ background: "linear-gradient(160deg,#0f0f24,#0a0a15)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 20, padding: "28px 28px 24px", maxWidth: 380, width: "100%", fontFamily: "'DM Sans',sans-serif" }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
          <Trash2 size={20} color="#f87171" />
        </div>
        <div style={{ fontSize: 17, fontWeight: 800, color: "#fff", fontFamily: "'Syne',sans-serif", marginBottom: 8 }}>Delete Report?</div>
        <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.65, marginBottom: 24 }}>
          Permanently delete <span style={{ color: "#e2e8f0", fontWeight: 600 }}>"{itemName}"</span>? This cannot be undone.
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <motion.button whileTap={{ scale: 0.97 }} onClick={onCancel}
            style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.5)", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
            Cancel
          </motion.button>
          <motion.button whileTap={{ scale: 0.97 }} onClick={onConfirm} disabled={loading}
            style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "none", background: loading ? "rgba(239,68,68,0.2)" : "linear-gradient(135deg,#ef4444,#dc2626)", fontSize: 13, fontWeight: 700, color: loading ? "rgba(255,255,255,0.3)" : "#fff", cursor: loading ? "not-allowed" : "pointer", fontFamily: "'DM Sans',sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
            {loading
              ? <><RefreshCw size={13} style={{ animation: "ar-spin 0.8s linear infinite" }} />Deleting…</>
              : <><Trash2 size={13} />Delete</>}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  DRAWER HELPERS
// ─────────────────────────────────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 10, fontWeight: 700, color: "#4b5563", textTransform: "uppercase", letterSpacing: 1.4, marginBottom: 10 }}>
      {children}
    </div>
  )
}

function InfoRow({ icon: Icon, label, children }: { icon: React.ElementType; label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 14px", borderRadius: 10, background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}>
      <Icon size={13} color="#4b5563" style={{ marginTop: 1, flexShrink: 0 }} />
      <div>
        <div style={{ fontSize: 9, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: 1, marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 13, color: "#c4c9e2" }}>{children}</div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  AI MATCH PANEL
// ─────────────────────────────────────────────────────────────────────────────

type AiPhase = "idle" | "loading" | "results" | "error"

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  const pct = Math.round(value * 100)
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ fontSize: 9, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: 0.8, width: 54, flexShrink: 0 }}>{label}</span>
      <div style={{ flex: 1, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          style={{ height: "100%", borderRadius: 2, background: color }}
        />
      </div>
      <span style={{ fontSize: 9, color, fontWeight: 700, width: 28, textAlign: "right", flexShrink: 0 }}>{pct}%</span>
    </div>
  )
}

function ConfidenceBadge({ confidence }: { confidence: "high" | "medium" | "low" }) {
  const cfg = {
    high:   { color: "#34d399", bg: "rgba(52,211,153,0.12)",  border: "rgba(52,211,153,0.3)",  label: "High Match"   },
    medium: { color: "#fbbf24", bg: "rgba(251,191,36,0.12)",  border: "rgba(251,191,36,0.3)",  label: "Possible Match" },
    low:    { color: "#f87171", bg: "rgba(248,113,113,0.12)", border: "rgba(248,113,113,0.3)", label: "Weak Match"   },
  }[confidence]
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 9px", borderRadius: 20, background: cfg.bg, border: `1px solid ${cfg.border}`, fontSize: 10, fontWeight: 700, color: cfg.color, letterSpacing: 0.3 }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: cfg.color, flexShrink: 0 }} />
      {cfg.label}
    </span>
  )
}

function AiMatchPanel({
  reportId,
  reportType,
  onConfirmed,
  autoRun,
}: {
  reportId: number
  reportType: "lost" | "found"
  onConfirmed: () => void
  autoRun?: boolean
}) {
  const [phase,       setPhase]       = useState<AiPhase>("idle")
  const [suggestions, setSuggestions] = useState<MatchSuggestion[]>([])
  const [error,       setError]       = useState("")
  const [actioning,   setActioning]   = useState<number | null>(null)
  const [expanded,    setExpanded]    = useState<number | null>(null)

  async function runEngine() {
    setPhase("loading"); setError("")
    try {
      const res = await adminRunMatch(reportId)
      setSuggestions(res.suggestions)
      setPhase(res.suggestions.length > 0 ? "results" : "idle")
      if (res.suggestions.length === 0) setError("No matching candidates found. Try again after more reports are submitted.")
    } catch (e: any) {
      setError(e.message ?? "Engine failed.")
      setPhase("error")
    }
  }

  // On mount: if autoRun flag is set, fire engine immediately; otherwise restore existing suggestions
  useEffect(() => {
    if (autoRun) {
      runEngine()
    } else {
      setPhase("loading")
      adminGetSuggestions(reportId)
        .then(res => {
          setSuggestions(res.suggestions)
          setPhase(res.suggestions.length > 0 ? "results" : "idle")
        })
        .catch(() => setPhase("idle"))
    }
  }, [reportId])

  async function confirm(suggestion: MatchSuggestion) {
    const key = suggestion.id ?? `${suggestion.lost_report}-${suggestion.found_report}`
    setActioning(key as any)
    try {
      await adminConfirmMatch(suggestion.id ?? null, suggestion)
      setSuggestions(p => p.filter(s => s.id !== suggestion.id ||
        (s.lost_report === suggestion.lost_report && s.found_report === suggestion.found_report ? false : true)))
      onConfirmed()
    } catch (e: any) {
      alert(e.message ?? "Failed to confirm.")
    } finally {
      setActioning(null)
    }
  }

  async function dismiss(suggestion: MatchSuggestion) {
    const key = suggestion.id ?? `${suggestion.lost_report}-${suggestion.found_report}`
    setActioning(key as any)
    try {
      await adminDismissMatch(suggestion.id ?? null)
      setSuggestions(p => p.filter(s =>
        !(s.lost_report === suggestion.lost_report && s.found_report === suggestion.found_report)
      ))
    } catch (e: any) {
      alert(e.message ?? "Failed to dismiss.")
    } finally {
      setActioning(null)
    }
  }

  const counterpartLabel = reportType === "lost" ? "Found" : "Lost"
  const accentColor      = reportType === "lost" ? "#818cf8" : "#34d399"
  const accentBg         = reportType === "lost" ? "rgba(99,102,241,0.08)" : "rgba(16,185,129,0.08)"
  const accentBorder     = reportType === "lost" ? "rgba(99,102,241,0.25)" : "rgba(16,185,129,0.25)"

  return (
    <div style={{ borderRadius: 14, border: "1px solid rgba(129,140,248,0.2)", background: "rgba(6,6,15,0.6)", overflow: "hidden" }}>
      {/* Header row */}
      <div style={{ padding: "12px 16px", background: "rgba(99,102,241,0.06)", borderBottom: "1px solid rgba(99,102,241,0.12)", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Cpu size={13} color="#818cf8" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#a5b4fc" }}>AI Match Engine</div>
          <div style={{ fontSize: 9, color: "#374151" }}>
            {phase === "results" && suggestions.length > 0
              ? `${suggestions.length} suggestion${suggestions.length !== 1 ? "s" : ""} found`
              : "Scored matches for this report"
            }
          </div>
        </div>
        <motion.button
          whileHover={phase !== "loading" ? { y: -1, boxShadow: "0 4px 14px rgba(99,102,241,0.3)" } : {}}
          whileTap={phase !== "loading" ? { scale: 0.96 } : {}}
          onClick={runEngine}
          disabled={phase === "loading"}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "6px 13px", borderRadius: 8, border: "none",
            background: phase === "loading" ? "rgba(255,255,255,0.06)" : "linear-gradient(135deg,#6366f1,#8b5cf6)",
            fontSize: 11, fontWeight: 700,
            color: phase === "loading" ? "rgba(255,255,255,0.3)" : "#fff",
            cursor: phase === "loading" ? "not-allowed" : "pointer",
            fontFamily: "'DM Sans',sans-serif", flexShrink: 0, transition: "all 0.2s",
          }}>
          {phase === "loading"
            ? <><motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}><RefreshCw size={11} /></motion.div>Scanning…</>
            : <><Sparkles size={11} />{phase === "results" && suggestions.length > 0 ? "Re-run" : "Run AI Match"}</>
          }
        </motion.button>
      </div>

      {/* Body */}
      <div style={{ padding: phase === "idle" && !error && suggestions.length === 0 ? "14px 16px" : "10px 12px", display: "flex", flexDirection: "column", gap: 8 }}>

        {/* Idle / empty */}
        {phase === "idle" && suggestions.length === 0 && !error && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 0" }}>
            <Activity size={13} color="#1f2937" style={{ flexShrink: 0 }} />
            <p style={{ fontSize: 11, color: "#374151", margin: 0, lineHeight: 1.5 }}>
              Click <strong style={{ color: "#818cf8" }}>Run AI Match</strong> to scan for {counterpartLabel.toLowerCase()} reports that might match this one. Scores are based on category, name, location and date.
            </p>
          </div>
        )}

        {/* Error */}
        {(phase === "error" || (phase === "idle" && error)) && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 9, background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.22)" }}>
            <AlertTriangle size={12} color="#f87171" style={{ flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: "#f87171", lineHeight: 1.4 }}>{error}</span>
          </div>
        )}

        {/* Suggestion cards */}
        <AnimatePresence mode="popLayout">
          {suggestions.map((s, idx) => {
            const isExpanded  = expanded === s.id
            const isActioning = actioning === (s.id ?? `${s.lost_report}-${s.found_report}` as any)
            const other       = reportType === "lost" ? s.found_report_summary : s.lost_report_summary
            const pct         = Math.round(s.score * 100)
            const alreadyConfirmed = s.status === "confirmed"
            const scoreColor  = s.confidence === "high" ? "#34d399" : s.confidence === "medium" ? "#fbbf24" : "#f87171"

            return (
              <motion.div
                key={s.id}
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                transition={{ delay: idx * 0.04 }}
                style={{
                  borderRadius: 11,
                  border: `1px solid ${alreadyConfirmed ? "rgba(52,211,153,0.3)" : "rgba(255,255,255,0.07)"}`,
                  background: alreadyConfirmed ? "rgba(52,211,153,0.05)" : "rgba(255,255,255,0.02)",
                  overflow: "hidden",
                }}
              >
                {/* Card header — always visible */}
                <div
                  onClick={() => setExpanded(isExpanded ? null : s.id)}
                  style={{ padding: "10px 12px", cursor: "pointer", display: "flex", alignItems: "flex-start", gap: 10 }}
                >
                  {/* Score ring */}
                  <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, paddingTop: 2 }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: "50%",
                      background: `conic-gradient(${scoreColor} ${pct * 3.6}deg, rgba(255,255,255,0.05) 0deg)`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      boxShadow: `0 0 0 2px rgba(6,6,15,1), 0 0 0 3px ${scoreColor}44`,
                    }}>
                      <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#09090f", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ fontSize: 9, fontWeight: 800, color: scoreColor, fontFamily: "'Syne',sans-serif" }}>{pct}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Item info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4, flexWrap: "wrap" }}>
                      <ConfidenceBadge confidence={s.confidence as any} />
                      <span style={{ fontSize: 9, color: "#374151", display: "flex", alignItems: "center", gap: 3, marginLeft: "auto" }}>
                        #{other.id}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#e2e8f0", letterSpacing: "-0.1px", marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {other.item_name}
                    </div>
                    <div style={{ fontSize: 10, color: "#4b5563", display: "flex", alignItems: "center", gap: 4 }}>
                      <MapPin size={8} />
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{other.location}</span>
                    </div>
                  </div>

                  {/* Expand chevron */}
                  <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }} style={{ flexShrink: 0, paddingTop: 4 }}>
                    <ChevronDown size={13} color="#374151" />
                  </motion.div>
                </div>

                {/* Expandable detail */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      style={{ overflow: "hidden" }}
                    >
                      <div style={{ padding: "0 12px 12px", display: "flex", flexDirection: "column", gap: 10, borderTop: "1px solid rgba(255,255,255,0.05)" }}>

                        {/* Score breakdown bars */}
                        <div style={{ paddingTop: 10, display: "flex", flexDirection: "column", gap: 7 }}>
                          <div style={{ fontSize: 9, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 2 }}>Score Breakdown</div>
                          <ScoreBar label="Category"    value={s.score_breakdown.category}    color="#818cf8" />
                          <ScoreBar label="Name"        value={s.score_breakdown.name}        color="#a78bfa" />
                          <ScoreBar label="Description" value={s.score_breakdown.description ?? 0.3} color="#34d399" />
                          <ScoreBar label="Location"    value={s.score_breakdown.location}    color="#38bdf8" />
                          <ScoreBar label="Date"        value={s.score_breakdown.date}        color="#fbbf24" />
                        </div>

                        {/* Counterpart snapshot */}
                        <div style={{ padding: "10px 12px", borderRadius: 9, background: accentBg, border: `1px solid ${accentBorder}` }}>
                          <div style={{ fontSize: 9, fontWeight: 700, color: accentColor, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>
                            {counterpartLabel} Report #{other.id}
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            {[
                              { icon: Tag,      label: other.category  },
                              { icon: MapPin,   label: other.location  },
                              { icon: Calendar, label: new Date(other.date_event).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) },
                            ].map((row, i) => (
                              <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#6b7280" }}>
                                <row.icon size={9} color="#374151" style={{ flexShrink: 0 }} />
                                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.label}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Claude's reasoning */}
                        {s.reasoning && (
                          <div style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "8px 11px", borderRadius: 9, background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.15)" }}>
                            <Brain size={10} color="#818cf8" style={{ flexShrink: 0, marginTop: 2 }} />
                            <span style={{ fontSize: 11, color: "#a5b4fc", lineHeight: 1.5, fontStyle: "italic" }}>{s.reasoning}</span>
                          </div>
                        )}

                        {/* Action buttons */}
                        {!alreadyConfirmed && (
                          <div style={{ display: "flex", gap: 8 }}>
                            <motion.button
                              whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
                              onClick={() => dismiss(s)}
                              disabled={isActioning}
                              style={{
                                flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                                padding: "8px 0", borderRadius: 9,
                                border: "1px solid rgba(239,68,68,0.25)", background: "rgba(239,68,68,0.07)",
                                fontSize: 11, fontWeight: 600, color: "#f87171",
                                cursor: isActioning ? "not-allowed" : "pointer", fontFamily: "'DM Sans',sans-serif",
                                opacity: isActioning ? 0.5 : 1,
                              }}>
                              {isActioning
                                ? <RefreshCw size={11} style={{ animation: "ar-spin 0.8s linear infinite" }} />
                                : <><XCircle size={11} />Dismiss</>
                              }
                            </motion.button>
                            <motion.button
                              whileHover={{ y: -1, boxShadow: "0 4px 14px rgba(99,102,241,0.3)" }}
                              whileTap={{ scale: 0.97 }}
                              onClick={() => confirm(s)}
                              disabled={isActioning}
                              style={{
                                flex: 2, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                                padding: "8px 0", borderRadius: 9, border: "none",
                                background: isActioning ? "rgba(255,255,255,0.06)" : "linear-gradient(135deg,#6366f1,#8b5cf6)",
                                fontSize: 11, fontWeight: 700,
                                color: isActioning ? "rgba(255,255,255,0.3)" : "#fff",
                                cursor: isActioning ? "not-allowed" : "pointer", fontFamily: "'DM Sans',sans-serif",
                              }}>
                              {isActioning
                                ? <RefreshCw size={11} style={{ animation: "ar-spin 0.8s linear infinite" }} />
                                : <><Check size={11} />Confirm Match</>
                              }
                            </motion.button>
                          </div>
                        )}
                        {alreadyConfirmed && (
                          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#34d399" }}>
                            <CheckCircle size={11} />Match already confirmed
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  REVIEW DRAWER
// ─────────────────────────────────────────────────────────────────────────────
function ReviewDrawer({
  reportId, onClose, isMobile, onDeleteRequest, onUnmatched, onOpenMatcher, autoRunAi,
}: {
  reportId: number | null
  autoRunAi?: boolean
  onClose: () => void
  isMobile: boolean
  onDeleteRequest: (id: number, name: string) => void
  onUnmatched: () => void
  onOpenMatcher: () => void
}) {
  const {
    activeReport, loadingDetail, detailError,
    fetchReport, reviewReport, updating, updateError, clearErrors,
  } = useAdminReportStore()

  const [notes,       setNotes]       = useState("")
  const [notesDirty,  setNotesDirty]  = useState(false)
  const [savingNotes, setSavingNotes] = useState(false)
  const [notesSaved,  setNotesSaved]  = useState(false)
  const [imgIdx,      setImgIdx]      = useState(0)

  useEffect(() => {
    if (reportId !== null) fetchReport(reportId)
  }, [reportId])

  useEffect(() => {
    if (activeReport) {
      setNotes(activeReport.admin_notes ?? "")
      setNotesDirty(false)
      setNotesSaved(false)
      setImgIdx(0)
    }
  }, [activeReport?.id])

  const r       = activeReport
  const isOpen  = reportId !== null
  const CatIcon = r ? (CATEGORY_ICONS[r.category] ?? Tag) : Tag
  const actions = r ? STATUS_ACTIONS[r.status] : []

  async function handleStatusChange(newStatus: ReportStatus) {
    if (!r) return
    await reviewReport(r.id, { status: newStatus })
  }

  async function handleSaveNotes() {
    if (!r) return
    setSavingNotes(true)
    await reviewReport(r.id, { admin_notes: notes.trim() || null })
    setSavingNotes(false)
    setNotesDirty(false)
    setNotesSaved(true)
    setTimeout(() => setNotesSaved(false), 2500)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div key="bd" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)" }} />

          <motion.div
            key="drawer"
            initial={isMobile ? { y: "100%" } : { x: "100%" }}
            animate={isMobile ? { y: 0 } : { x: 0 }}
            exit={isMobile ? { y: "100%" } : { x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
            style={isMobile ? {
              position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 301,
              maxHeight: "94dvh", borderRadius: "20px 20px 0 0", overflowY: "auto",
              background: "linear-gradient(160deg,#0d0d1f,#090910)",
              border: "1px solid rgba(255,255,255,0.08)",
              fontFamily: "'DM Sans',sans-serif", color: "white",
            } : {
              position: "fixed", top: 0, right: 0, bottom: 0, zIndex: 301,
              width: 480, overflowY: "auto",
              background: "linear-gradient(160deg,#0d0d1f,#090910)",
              borderLeft: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "-24px 0 80px rgba(0,0,0,0.6)",
              fontFamily: "'DM Sans',sans-serif", color: "white",
            }}>

            {isMobile && (
              <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 4px" }}>
                <div style={{ width: 36, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.18)" }} />
              </div>
            )}

            {/* Header */}
            <div style={{ padding: isMobile ? "14px 18px 12px" : "20px 24px 16px", borderBottom: "1px solid rgba(255,255,255,0.07)", position: "sticky", top: 0, background: "rgba(9,9,16,0.97)", backdropFilter: "blur(20px)", zIndex: 2 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#4b5563", textTransform: "uppercase", letterSpacing: 1.2 }}>Review Report</div>
                  {r && <div style={{ fontSize: 11, color: "#374151", marginTop: 1 }}>#{r.id} · {timeAgo(r.date_reported)}</div>}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {r && (
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      onClick={() => onDeleteRequest(r.id, r.item_name)}
                      style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: 8, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.22)", fontSize: 11, fontWeight: 600, color: "#f87171", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
                      <Trash2 size={11} />Delete
                    </motion.button>
                  )}
                  <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.93 }} onClick={onClose}
                    style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                    <X size={13} color="rgba(255,255,255,0.5)" />
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Loading */}
            {loadingDetail && (
              <div style={{ padding: "60px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                  <RefreshCw size={22} color="#4b5563" />
                </motion.div>
                <span style={{ fontSize: 13, color: "#374151" }}>Loading report…</span>
              </div>
            )}

            {detailError && !loadingDetail && (
              <div style={{ padding: "40px 24px", textAlign: "center" }}>
                <AlertTriangle size={28} color="#f87171" style={{ marginBottom: 12 }} />
                <div style={{ fontSize: 13, color: "#f87171" }}>{detailError}</div>
              </div>
            )}

            {r && !loadingDetail && (
              <div style={{ padding: isMobile ? "16px 18px 40px" : "20px 24px 48px", display: "flex", flexDirection: "column", gap: 22 }}>

                {/* Update error */}
                <AnimatePresence>
                  {updateError && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} style={{ overflow: "hidden" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, padding: "10px 14px", borderRadius: 10, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.22)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                          <AlertTriangle size={12} color="#f87171" />
                          <span style={{ fontSize: 12, color: "#f87171" }}>{updateError}</span>
                        </div>
                        <button onClick={clearErrors} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                          <X size={12} color="#f87171" />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Item identity card */}
                <div style={{ padding: 18, borderRadius: 16, background: "linear-gradient(135deg,rgba(99,102,241,0.1),rgba(139,92,246,0.06))", border: "1px solid rgba(99,102,241,0.2)" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <CatIcon size={20} color="#818cf8" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap", marginBottom: 6 }}>
                        <StatusPill status={r.status} />
                        <span style={{
                          display: "inline-flex", alignItems: "center",
                          padding: "3px 8px", borderRadius: 20, fontSize: 10, fontWeight: 700, letterSpacing: 0.4,
                          background: r.report_type === "found" ? "rgba(16,185,129,0.1)"  : "rgba(99,102,241,0.1)",
                          border:     r.report_type === "found" ? "1px solid rgba(16,185,129,0.28)" : "1px solid rgba(99,102,241,0.28)",
                          color:      r.report_type === "found" ? "#34d399" : "#818cf8",
                        }}>
                          {r.report_type === "found" ? "FOUND" : "LOST"}
                        </span>
                        {r.is_urgent && (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 8px", borderRadius: 20, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.28)", fontSize: 10, fontWeight: 700, color: "#f87171" }}>
                            <Zap size={9} />URGENT
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: "#fff", fontFamily: "'Syne',sans-serif", letterSpacing: "-0.3px", lineHeight: 1.3, marginBottom: 4 }}>
                        {r.item_name}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 11, color: "#4b5563" }}>{r.category}</span>
                        {r.brand && <span style={{ fontSize: 11, color: "#4b5563" }}>· {r.brand}</span>}
                        {r.color && <span style={{ fontSize: 11, color: "#4b5563" }}>· {r.color}</span>}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", marginTop: 14, borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 14 }}>
                    {[
                      { icon: Eye,      label: "Views",   value: r.views       },
                      { icon: Image,    label: "Photos",  value: r.image_count },
                      { icon: Calendar, label: "Reported",value: timeAgo(r.date_reported) },
                    ].map((s, i) => (
                      <div key={i} style={{ flex: 1, textAlign: "center", borderRight: i < 2 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, marginBottom: 2 }}>
                          <s.icon size={10} color="#4b5563" />
                          <span style={{ fontSize: 9, color: "#374151", textTransform: "uppercase", letterSpacing: 1, fontWeight: 700 }}>{s.label}</span>
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 800, color: "#a5b4fc", fontFamily: "'Syne',sans-serif" }}>{s.value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Reporter */}
                <div>
                  <SectionLabel>Reported By</SectionLabel>
                  <div style={{ padding: "14px 16px", borderRadius: 12, background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg,rgba(99,102,241,0.2),rgba(139,92,246,0.15))", border: "1px solid rgba(99,102,241,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <User size={16} color="#818cf8" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0", marginBottom: 2 }}>{r.user_info.name}</div>
                      <div style={{ fontSize: 11, color: "#4b5563" }}>@{r.user_info.username}</div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" }}>
                      {r.user_info.email && (
                        <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#4b5563" }}>
                          <Mail size={10} color="#374151" />{r.user_info.email}
                        </span>
                      )}
                      {r.user_info.phone && (
                        <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#4b5563" }}>
                          <Phone size={10} color="#374151" />{r.user_info.phone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Photos */}
                {r.images.length > 0 && (
                  <div>
                    <SectionLabel>Photos ({r.images.length})</SectionLabel>
                    <div style={{ borderRadius: 12, overflow: "hidden", aspectRatio: "16/9", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", marginBottom: 8, position: "relative" }}>
                      <AnimatePresence mode="wait">
                        <motion.img
                          key={imgIdx}
                          src={r.images[imgIdx]?.image_url ?? ""}
                          alt={r.item_name}
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      </AnimatePresence>
                      {r.images.length > 1 && (
                        <div style={{ position: "absolute", bottom: 8, right: 8, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)", borderRadius: 8, padding: "3px 8px", fontSize: 10, color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>
                          {imgIdx + 1} / {r.images.length}
                        </div>
                      )}
                    </div>
                    {r.images.length > 1 && (
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {r.images.map((img, i) => (
                          <motion.button key={img.id} whileTap={{ scale: 0.95 }}
                            onClick={() => setImgIdx(i)}
                            style={{ width: 52, height: 52, borderRadius: 8, overflow: "hidden", border: `2px solid ${i === imgIdx ? "rgba(99,102,241,0.6)" : "rgba(255,255,255,0.08)"}`, padding: 0, cursor: "pointer", background: "none", flexShrink: 0 }}>
                            <img src={img.image_url ?? ""} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          </motion.button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Where & When */}
                <div>
                  <SectionLabel>{r.report_type === "found" ? "Where & When Found" : "Where & When Lost"}</SectionLabel>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <InfoRow icon={MapPin} label="Location">
                      {r.location}{r.location_detail ? ` — ${r.location_detail}` : ""}
                    </InfoRow>
                    <InfoRow icon={Calendar} label={r.report_type === "found" ? "Date Found" : "Date Lost"}>{fmtDate(r.date_event)}</InfoRow>
                    {r.time_event && <InfoRow icon={Clock} label={r.report_type === "found" ? "Time Found" : "Time Lost"}>{fmtTime(r.time_event)}</InfoRow>}
                    {r.report_type === "found" && (r as any).found_stored_at && (
                      <InfoRow icon={MapPin} label="Item Currently At">{(r as any).found_stored_at}</InfoRow>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <SectionLabel>Description</SectionLabel>
                  <p style={{ fontSize: 13, color: "#c4c9e2", lineHeight: 1.75, margin: 0, padding: "14px 16px", borderRadius: 12, background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}>
                    {r.description}
                  </p>
                </div>

                {/* Distinguishing features */}
                {r.distinguishing_features && (
                  <div>
                    <SectionLabel>Distinguishing Features</SectionLabel>
                    <p style={{ fontSize: 13, color: "#c4c9e2", lineHeight: 1.75, margin: 0, padding: "14px 16px", borderRadius: 12, background: "rgba(251,191,36,0.05)", border: "1px solid rgba(251,191,36,0.15)" }}>
                      {r.distinguishing_features}
                    </p>
                  </div>
                )}

                {/* Contact & reward */}
                {(r.reward || r.contact_phone) && (
                  <div>
                    <SectionLabel>Contact & Reward</SectionLabel>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {r.reward        && <InfoRow icon={DollarSign} label="Reward">{r.reward}</InfoRow>}
                      {r.contact_phone && <InfoRow icon={Phone}      label="Contact">{r.contact_phone}</InfoRow>}
                    </div>
                  </div>
                )}

                {/* ── ADMIN REVIEW PANEL ── */}
                <div style={{ borderRadius: 16, border: "1px solid rgba(99,102,241,0.25)", background: "rgba(99,102,241,0.05)", overflow: "hidden" }}>
                  <div style={{ padding: "14px 18px", borderBottom: "1px solid rgba(99,102,241,0.15)", display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 30, height: 30, borderRadius: 9, background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <ShieldCheck size={14} color="#818cf8" />
                    </div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#a5b4fc" }}>Admin Review</div>
                      <div style={{ fontSize: 10, color: "#4b5563" }}>Change status · Add notes</div>
                    </div>
                  </div>

                  <div style={{ padding: "18px 18px 20px", display: "flex", flexDirection: "column", gap: 16 }}>

                    {/* ── MATCHING SECTION ── */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: "#4b5563", textTransform: "uppercase", letterSpacing: 1.2 }}>Matching</div>

                      {/* Already matched — show partner card + unmatch */}
                      {r.matched_report ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          <div style={{ padding: "12px 14px", borderRadius: 12, background: "linear-gradient(135deg,rgba(99,102,241,0.1),rgba(139,92,246,0.06))", border: "1px solid rgba(99,102,241,0.25)" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}>
                              <div style={{ width: 22, height: 22, borderRadius: 6, background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.35)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                <Link2 size={11} color="#818cf8" />
                              </div>
                              <span style={{ fontWeight: 700, fontSize: 11, color: "#818cf8", letterSpacing: 0.4 }}>Matched with Report</span>
                              <span style={{ fontSize: 11, color: "#a5b4fc", fontWeight: 800, marginLeft: "auto", fontFamily: "'Syne',sans-serif" }}>
                                #{typeof r.matched_report === "number" ? r.matched_report : (r.matched_report as any)?.id}
                              </span>
                            </div>
                            {r.status === "under_review" && (
                              <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 10px", borderRadius: 8, background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)", fontSize: 11, color: "#fbbf24" }}>
                                <Clock size={10} color="#fbbf24" style={{ flexShrink: 0 }} />
                                Claim submitted — both reports under review
                              </div>
                            )}
                            {r.status === "claimed" && (
                              <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 10px", borderRadius: 8, background: "rgba(52,211,153,0.07)", border: "1px solid rgba(52,211,153,0.2)", fontSize: 11, color: "#34d399" }}>
                                <CheckCircle size={10} color="#34d399" style={{ flexShrink: 0 }} />
                                Claim approved — item returned to owner
                              </div>
                            )}
                          </div>
                          <motion.button whileHover={{ x: 2 }} whileTap={{ scale: 0.98 }}
                            onClick={async () => {
                              try {
                                await adminUnmatch(r.id)
                                onUnmatched()
                                onClose()
                              } catch (e: any) {
                                alert(e.message ?? "Failed to unmatch.")
                              }
                            }}
                            style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 10, border: "1px solid rgba(239,68,68,0.25)", background: "rgba(239,68,68,0.06)", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
                            <Unlink size={13} color="#f87171" />
                            <span style={{ fontSize: 12, fontWeight: 600, color: "#f87171", flex: 1, textAlign: "left" }}>Unmatch Reports</span>
                          </motion.button>
                        </div>
                      ) : (
                        /* Not matched yet — show AI panel + manual match button */
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                          {/* AI Match Engine panel */}
                          <AiMatchPanel
                            reportId={r.id}
                            reportType={r.report_type}
                            autoRun={autoRunAi}
                            onConfirmed={() => {
                              fetchReport(r.id)
                              onUnmatched()
                            }}
                          />

                          {/* Divider */}
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.05)" }} />
                            <span style={{ fontSize: 9, color: "#1f2937", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>or match manually</span>
                            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.05)" }} />
                          </div>

                          {/* Manual match button */}
                          <motion.button whileHover={{ x: 2 }} whileTap={{ scale: 0.98 }}
                            onClick={() => onOpenMatcher()}
                            style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 10, border: "1px solid rgba(99,102,241,0.22)", background: "rgba(99,102,241,0.05)", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", width: "100%" }}>
                            <Link2 size={13} color="#6366f1" />
                            <span style={{ fontSize: 12, fontWeight: 600, color: "#818cf8", flex: 1, textAlign: "left" }}>
                              Match with {r.report_type === "lost" ? "a Found" : "a Lost"} Report
                            </span>
                          </motion.button>
                        </div>
                      )}
                    </div>

                    {/* Status actions */}
                    {actions.length > 0 ? (
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: "#4b5563", textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 10 }}>Change Status</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          {actions.map(a => (
                            <motion.button
                              key={a.status}
                              whileHover={{ x: 2 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleStatusChange(a.status)}
                              disabled={updating}
                              style={{
                                display: "flex", alignItems: "center", gap: 10,
                                padding: "10px 14px", borderRadius: 10,
                                border: `1px solid ${a.color}33`,
                                background: `${a.color}0f`,
                                cursor: updating ? "not-allowed" : "pointer",
                                opacity: updating ? 0.6 : 1,
                                fontFamily: "'DM Sans',sans-serif",
                                transition: "all 0.15s",
                              }}>
                              <a.icon size={14} color={a.color} />
                              <span style={{ fontSize: 13, fontWeight: 600, color: a.color, flex: 1, textAlign: "left" }}>
                                {a.label}
                              </span>
                              {updating && <RefreshCw size={12} color={a.color} style={{ animation: "ar-spin 0.8s linear infinite" }} />}
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div style={{ fontSize: 12, color: "#374151", fontStyle: "italic" }}>
                        No further status actions for <span style={{ color: STATUS_CFG[r.status].color }}>{STATUS_CFG[r.status].label}</span> reports.
                      </div>
                    )}

                    <div style={{ height: 1, background: "rgba(255,255,255,0.06)" }} />

                    {/* Admin notes */}
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: "#4b5563", textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 8 }}>Admin Notes</div>
                      <textarea
                        value={notes}
                        onChange={e => { setNotes(e.target.value); setNotesDirty(true); setNotesSaved(false) }}
                        placeholder="Internal notes visible to admins only…"
                        rows={4}
                        style={{
                          width: "100%", boxSizing: "border-box",
                          background: "rgba(255,255,255,0.03)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: 10, padding: "12px 14px",
                          resize: "vertical", fontSize: 13, color: "#c4c9e2",
                          lineHeight: 1.65, fontFamily: "'DM Sans',sans-serif", outline: "none",
                        }}
                      />
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
                        <AnimatePresence>
                          {notesSaved && (
                            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                              style={{ fontSize: 11, color: "#34d399", display: "flex", alignItems: "center", gap: 5 }}>
                              <CheckCircle size={11} />Notes saved
                            </motion.span>
                          )}
                        </AnimatePresence>
                        <motion.button
                          whileHover={notesDirty ? { y: -1 } : {}}
                          whileTap={notesDirty ? { scale: 0.97 } : {}}
                          onClick={handleSaveNotes}
                          disabled={!notesDirty || savingNotes}
                          style={{
                            marginLeft: "auto",
                            display: "flex", alignItems: "center", gap: 6,
                            padding: "8px 16px", borderRadius: 9, border: "none",
                            background: notesDirty ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "rgba(255,255,255,0.05)",
                            fontSize: 12, fontWeight: 700,
                            color: notesDirty ? "#fff" : "#374151",
                            cursor: notesDirty ? "pointer" : "not-allowed",
                            fontFamily: "'DM Sans',sans-serif", transition: "all 0.2s",
                          }}>
                          {savingNotes
                            ? <><RefreshCw size={11} style={{ animation: "ar-spin 0.8s linear infinite" }} />Saving…</>
                            : <><MessageSquare size={11} />Save Notes</>}
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Metadata */}
                <div style={{ padding: "14px 16px", borderRadius: 12, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    {[
                      { label: "Report ID",    value: `#${r.id}` },
                      { label: "Status",       value: STATUS_CFG[r.status].label },
                      { label: "Date Reported",value: fmtDate(r.date_reported) },
                      { label: "Last Updated", value: timeAgo(r.date_updated) },
                    ].map((m, i) => (
                      <div key={i}>
                        <div style={{ fontSize: 9, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 3 }}>{m.label}</div>
                        <div style={{ fontSize: 12, color: "#6b7280", fontWeight: 500 }}>{m.value}</div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  MATCHED PAIRS VIEW
// ─────────────────────────────────────────────────────────────────────────────
function MatchedPairsView({
  reports,
  onOpen,
  isMobile,
}: {
  reports: AdminLostReportListItem[]
  onOpen: (id: number) => void
  isMobile: boolean
}) {
  // Build pairs: for each matched report, find lost + found counterparts
  const pairs: Array<{ lost: AdminLostReportListItem; found: AdminLostReportListItem }> = []
  const seen = new Set<number>()

  for (const r of reports) {
    if (seen.has(r.id)) continue
    if (r.matched_report === null) continue
    const partner = reports.find(p => p.id === r.matched_report)
    if (!partner) continue
    seen.add(r.id)
    seen.add(partner.id)
    const lost  = r.report_type === "lost"  ? r : partner
    const found = r.report_type === "found" ? r : partner
    pairs.push({ lost, found })
  }

  // Any matched reports whose partner isn't in the current list (filtered out)
  const orphans = reports.filter(r => !seen.has(r.id))

  if (pairs.length === 0 && orphans.length === 0) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        style={{ textAlign: "center", padding: "56px 24px", borderRadius: 16, border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.01)" }}>
        <Link2 size={28} color="#374151" style={{ marginBottom: 14 }} />
        <div style={{ fontSize: 15, fontWeight: 700, color: "#374151", fontFamily: "'Syne',sans-serif", marginBottom: 6 }}>No matched pairs</div>
        <div style={{ fontSize: 12, color: "#374151" }}>Match reports using the Match Reports button above.</div>
      </motion.div>
    )
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 14 : 18 }}>
      {pairs.map(({ lost, found }, idx) => (
        <MatchedPairCard key={`${lost.id}-${found.id}`} lost={lost} found={found} onOpen={onOpen} index={idx} isMobile={isMobile} />
      ))}
      {orphans.length > 0 && (
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 10, paddingLeft: 4 }}>
            Matched — Partner Not in Current Filter
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {orphans.map((r, i) => (
              <motion.div key={r.id}
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                onClick={() => onOpen(r.id)}
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.01)", cursor: "pointer" }}>
                <StatusPill status={r.status} />
                <span style={{ fontSize: 13, fontWeight: 600, color: "#c4c9e2", flex: 1 }}>{r.item_name}</span>
                <span style={{ fontSize: 10, color: "#374151" }}>#{r.id}</span>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function MatchedPairCard({
  lost, found, onOpen, index, isMobile,
}: {
  lost: AdminLostReportListItem
  found: AdminLostReportListItem
  onOpen: (id: number) => void
  index: number
  isMobile: boolean
}) {
  const LostIcon  = CATEGORY_ICONS[lost.category]  ?? Tag
  const FoundIcon = CATEGORY_ICONS[found.category] ?? Tag

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      style={{
        borderRadius: 16,
        border: "1px solid rgba(129,140,248,0.2)",
        background: "linear-gradient(135deg,rgba(99,102,241,0.04),rgba(16,185,129,0.03))",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Matched label */}
      <div style={{
        padding: "8px 16px",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        display: "flex", alignItems: "center", gap: 8,
        background: "rgba(129,140,248,0.05)",
      }}>
        <Link2 size={10} color="#6366f1" />
        <span style={{ fontSize: 9, fontWeight: 700, color: "#6366f1", textTransform: "uppercase", letterSpacing: 1.2 }}>
          Matched Pair #{index + 1}
        </span>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
          <StatusPill status={lost.status} />
        </div>
      </div>

      {/* Two report cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "1fr auto 1fr",
        gap: 0,
      }}>
        {/* Lost report */}
        <motion.div
          whileHover={{ background: "rgba(99,102,241,0.07)" }}
          onClick={() => onOpen(lost.id)}
          style={{
            padding: "16px 18px", cursor: "pointer",
            borderRight: isMobile ? "none" : "1px solid rgba(255,255,255,0.05)",
            borderBottom: isMobile ? "1px solid rgba(255,255,255,0.05)" : "none",
            transition: "background 0.15s",
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 11, flexShrink: 0,
              background: "rgba(99,102,241,0.12)",
              border: "1px solid rgba(99,102,241,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <LostIcon size={15} color="#818cf8" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <span style={{ fontSize: 9, fontWeight: 700, color: "#818cf8", background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.25)", padding: "2px 7px", borderRadius: 20, letterSpacing: 0.5 }}>
                  LOST
                </span>
                {lost.is_urgent && <Zap size={9} color="#f87171" />}
                <span style={{ fontSize: 9, color: "#374151", marginLeft: "auto" }}>#{lost.id}</span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0", fontFamily: "'Syne',sans-serif", letterSpacing: "-0.2px", marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {lost.item_name}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <div style={{ fontSize: 11, color: "#4b5563", display: "flex", alignItems: "center", gap: 4 }}>
                  <User size={9} color="#374151" />
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {lost.user_info.name} · @{lost.user_info.username}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: "#374151", display: "flex", alignItems: "center", gap: 4 }}>
                  <MapPin size={9} color="#374151" />
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {lost.location}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Connector */}
        {isMobile ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "6px 0", gap: 8 }}>
            <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg,transparent,rgba(99,102,241,0.3))" }} />
            <div style={{ width: 26, height: 26, borderRadius: "50%", background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Link2 size={11} color="#818cf8" />
            </div>
            <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg,rgba(16,185,129,0.3),transparent)" }} />
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 12px", gap: 6 }}>
            <div style={{ width: 1, flex: 1, background: "linear-gradient(180deg,transparent,rgba(99,102,241,0.3))" }} />
            <div style={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Link2 size={13} color="#818cf8" />
            </div>
            <div style={{ width: 1, flex: 1, background: "linear-gradient(180deg,rgba(16,185,129,0.3),transparent)" }} />
          </div>
        )}

        {/* Found report */}
        <motion.div
          whileHover={{ background: "rgba(16,185,129,0.07)" }}
          onClick={() => onOpen(found.id)}
          style={{
            padding: "16px 18px", cursor: "pointer",
            borderLeft: isMobile ? "none" : "1px solid rgba(255,255,255,0.05)",
            transition: "background 0.15s",
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 11, flexShrink: 0,
              background: "rgba(16,185,129,0.12)",
              border: "1px solid rgba(16,185,129,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <FoundIcon size={15} color="#34d399" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <span style={{ fontSize: 9, fontWeight: 700, color: "#34d399", background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.25)", padding: "2px 7px", borderRadius: 20, letterSpacing: 0.5 }}>
                  FOUND
                </span>
                {found.is_urgent && <Zap size={9} color="#f87171" />}
                <span style={{ fontSize: 9, color: "#374151", marginLeft: "auto" }}>#{found.id}</span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0", fontFamily: "'Syne',sans-serif", letterSpacing: "-0.2px", marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {found.item_name}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <div style={{ fontSize: 11, color: "#4b5563", display: "flex", alignItems: "center", gap: 4 }}>
                  <User size={9} color="#374151" />
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {found.user_info.name} · @{found.user_info.username}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: "#374151", display: "flex", alignItems: "center", gap: 4 }}>
                  <MapPin size={9} color="#374151" />
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {found.location}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  TABLE ROW (desktop)
// ─────────────────────────────────────────────────────────────────────────────
function ReportRow({ report, onClick, onAiMatch, index }: {
  report: AdminLostReportListItem
  onClick: () => void
  onAiMatch: (e: React.MouseEvent) => void
  index: number
}) {
  const CatIcon = CATEGORY_ICONS[report.category] ?? Tag
  const canAiMatch = !report.matched_report && (report.status === "open" || report.status === "under_review")
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }}
      onClick={onClick}
      className="ar-row"
      style={{ display: "grid", gridTemplateColumns: "36px 1fr 130px 110px 50px 50px 96px", gap: 12, padding: "13px 20px", borderBottom: "1px solid rgba(255,255,255,0.04)", alignItems: "center", cursor: "pointer", transition: "all 0.15s" }}>
      <div style={{ width: 32, height: 32, borderRadius: 9, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <CatIcon size={13} color="#4b5563" />
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
          {report.is_urgent && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 3, padding: "1px 6px", borderRadius: 20, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.22)", fontSize: 9, fontWeight: 700, color: "#f87171" }}>
              <Zap size={8} />URG
            </span>
          )}
          <span style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0", fontFamily: "'Syne',sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {report.item_name}
          </span>
          <span style={{
            display: "inline-flex", alignItems: "center", flexShrink: 0,
            padding: "1px 6px", borderRadius: 6, fontSize: 9, fontWeight: 700, letterSpacing: 0.4,
            background: report.report_type === "found" ? "rgba(16,185,129,0.1)" : "rgba(99,102,241,0.1)",
            border: report.report_type === "found" ? "1px solid rgba(16,185,129,0.22)" : "1px solid rgba(99,102,241,0.22)",
            color: report.report_type === "found" ? "#34d399" : "#818cf8",
          }}>
            {report.report_type === "found" ? "FOUND" : "LOST"}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 11, color: "#374151", display: "flex", alignItems: "center", gap: 3 }}>
            <User size={9} color="#374151" />{report.user_info.name}
          </span>
          <span style={{ fontSize: 11, color: "#374151", display: "flex", alignItems: "center", gap: 3 }}>
            <MapPin size={9} color="#374151" />
            {report.location.length > 26 ? report.location.slice(0, 26) + "…" : report.location}
          </span>
        </div>
      </div>
      <StatusPill status={report.status} />
      <span style={{ fontSize: 11, color: "#4b5563", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        @{report.user_info.username}
      </span>
      <span style={{ fontSize: 11, color: "#374151", display: "flex", alignItems: "center", gap: 3 }}>
        <Eye size={10} color="#374151" />{report.views}
      </span>
      <span style={{ fontSize: 10, color: "#374151" }}>{timeAgo(report.date_reported)}</span>
      {/* AI Match quick-action — stop row click from firing */}
      <div onClick={e => e.stopPropagation()} style={{ display: "flex", justifyContent: "flex-end" }}>
        {canAiMatch ? (
          <motion.button
            whileHover={{ scale: 1.06, boxShadow: "0 0 14px rgba(99,102,241,0.5)" }}
            whileTap={{ scale: 0.94 }}
            onClick={onAiMatch}
            style={{
              display: "flex", alignItems: "center", gap: 5,
              padding: "5px 10px", borderRadius: 7, border: "none",
              background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
              fontSize: 10, fontWeight: 700, color: "#fff",
              cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
              whiteSpace: "nowrap", letterSpacing: 0.3,
            }}>
            <Brain size={10} />AI Match
          </motion.button>
        ) : (
          <span style={{ fontSize: 10, color: "#1f2937" }}>—</span>
        )}
      </div>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  REPORT CARD (mobile)
// ─────────────────────────────────────────────────────────────────────────────
function ReportCard({ report, onClick, onAiMatch, index }: {
  report: AdminLostReportListItem
  onClick: () => void
  onAiMatch: (e: React.MouseEvent) => void
  index: number
}) {
  const CatIcon = CATEGORY_ICONS[report.category] ?? Tag
  const canAiMatch = !report.matched_report && (report.status === "open" || report.status === "under_review")
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}
      onClick={onClick}
      className="ar-card"
      style={{ borderRadius: 14, border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)", padding: "14px 16px", cursor: "pointer", transition: "all 0.2s" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, flex: 1, minWidth: 0 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <CatIcon size={14} color="#4b5563" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3, flexWrap: "wrap" }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0", fontFamily: "'Syne',sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {report.item_name}
              </span>
              <span style={{
                display: "inline-flex", alignItems: "center", flexShrink: 0,
                padding: "1px 6px", borderRadius: 6, fontSize: 9, fontWeight: 700, letterSpacing: 0.4,
                background: report.report_type === "found" ? "rgba(16,185,129,0.1)" : "rgba(99,102,241,0.1)",
                border: report.report_type === "found" ? "1px solid rgba(16,185,129,0.22)" : "1px solid rgba(99,102,241,0.22)",
                color: report.report_type === "found" ? "#34d399" : "#818cf8",
              }}>
                {report.report_type === "found" ? "FOUND" : "LOST"}
              </span>
            </div>
            <div style={{ fontSize: 11, color: "#4b5563" }}>@{report.user_info.username} · {timeAgo(report.date_reported)}</div>
          </div>
        </div>
        <StatusPill status={report.status} />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        {report.is_urgent && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 10, fontWeight: 700, color: "#f87171" }}>
            <Zap size={9} />URGENT
          </span>
        )}
        <span style={{ fontSize: 11, color: "#374151", display: "flex", alignItems: "center", gap: 3 }}>
          <MapPin size={9} />{report.location.length > 28 ? report.location.slice(0, 28) + "…" : report.location}
        </span>
        <span style={{ fontSize: 11, color: "#374151", display: "flex", alignItems: "center", gap: 3 }}>
          <Eye size={9} />{report.views}
        </span>
        {canAiMatch && (
          <div onClick={e => e.stopPropagation()} style={{ marginLeft: "auto" }}>
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={onAiMatch}
              style={{
                display: "flex", alignItems: "center", gap: 5,
                padding: "5px 10px", borderRadius: 7, border: "none",
                background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                fontSize: 10, fontWeight: 700, color: "#fff",
                cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
              }}>
              <Brain size={10} />AI Match
            </motion.button>
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function AllReports() {
  const isMobile = useIsMobile(768)
  const {
    reports, reportCount, loadingList, listError,
    stats, loadingStats,
    fetchReports, fetchStats,
    removeReport, deleting, deleteError, clearErrors,
  } = useAdminReportStore()

  const [statusFilter,   setStatusFilter]   = useState<"all" | ReportStatus>("all")
  const [typeFilter,     setTypeFilter]     = useState<"all" | ReportType>("all")
  const [categoryFilter, setCategoryFilter] = useState<"all" | ReportCategory>("all")
  const [urgentFilter,   setUrgentFilter]   = useState(false)
  const [searchRaw,      setSearchRaw]      = useState("")
  const [ordering,       setOrdering]       = useState<AdminReportFilters["ordering"]>("-date_reported")
  const [openId,         setOpenId]         = useState<number | null>(null)
  const [deleteTarget,   setDeleteTarget]   = useState<{ id: number; name: string } | null>(null)
  const [showFilters,    setShowFilters]    = useState(false)
  const [showMatcher,   setShowMatcher]   = useState(false)
  const [autoRunAiId,   setAutoRunAiId]   = useState<number | null>(null)

  const activeFilterCount = (statusFilter !== "all" ? 1 : 0) + (typeFilter !== "all" ? 1 : 0) + (categoryFilter !== "all" ? 1 : 0) + (urgentFilter ? 1 : 0)

  const search = useDebounce(searchRaw, 400)

  useEffect(() => {
    const filters: AdminReportFilters = { ordering }
    if (statusFilter   !== "all") filters.status   = statusFilter
    if (typeFilter     !== "all") filters.type     = typeFilter
    if (categoryFilter !== "all") filters.category = categoryFilter
    if (urgentFilter)             filters.urgent   = true
    if (search.trim())            filters.search   = search.trim()
    fetchReports(filters)
  }, [statusFilter, typeFilter, categoryFilter, urgentFilter, search, ordering])

  useEffect(() => { fetchStats() }, [])

  async function confirmDelete() {
    if (!deleteTarget) return
    await removeReport(deleteTarget.id)
    setDeleteTarget(null)
    if (openId === deleteTarget.id) setOpenId(null)
  }

  return (
    <div style={{ minHeight: "100vh", background: "#06060f", color: "white", fontFamily: "'DM Sans',sans-serif", padding: isMobile ? "0 0 48px" : "0 0 60px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        .ar-row:hover  { background: rgba(99,102,241,0.04) !important; }
        .ar-card:hover { border-color: rgba(99,102,241,0.3) !important; background: rgba(99,102,241,0.04) !important; transform: translateY(-1px); }
        .ar-pill-active { background: rgba(99,102,241,0.15) !important; border-color: rgba(99,102,241,0.4) !important; color: #a5b4fc !important; }
        .ar-skeleton { animation: ar-pulse 1.6s ease-in-out infinite; }
        @keyframes ar-pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes ar-spin   { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        textarea:focus { border-color: rgba(99,102,241,0.4) !important; box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }
        select { appearance: none; }
        input:focus { border-color: rgba(99,102,241,0.4) !important; box-shadow: 0 0 0 3px rgba(99,102,241,0.08); }
      `}</style>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: isMobile ? 20 : 28, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 18px rgba(99,102,241,0.35)", flexShrink: 0 }}>
            <ClipboardList size={18} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: isMobile ? 18 : 22, fontWeight: 800, letterSpacing: "-0.5px", color: "#fff", margin: 0, fontFamily: "'Syne',sans-serif" }}>All Reports</h1>
            <p style={{ fontSize: 12, color: "#4b5563", margin: 0 }}>
              {loadingList ? "Loading…" : `${reportCount} report${reportCount !== 1 ? "s" : ""}`}
              {stats ? ` · ${stats.open} open · ${stats.under_review} in review` : ""}
            </p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {!isMobile && (
            <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
              style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 16px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.55)", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
              <Download size={13} />Export
            </motion.button>
          )}
          <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
            onClick={() => setShowMatcher(true)}
            style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 16px", borderRadius: 10, border: "1px solid rgba(99,102,241,0.35)", background: "rgba(99,102,241,0.1)", fontSize: 13, fontWeight: 600, color: "#a5b4fc", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
            <Link2 size={13} />{!isMobile && "Match Reports"}
          </motion.button>
          <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
            onClick={() => { fetchReports({ ordering }); fetchStats() }}
            disabled={loadingList}
            style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 16px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", fontSize: 13, fontWeight: 600, color: "#fff", cursor: loadingList ? "not-allowed" : "pointer", fontFamily: "'DM Sans',sans-serif", boxShadow: "0 4px 16px rgba(99,102,241,0.3)", opacity: loadingList ? 0.7 : 1 }}>
            <motion.div animate={loadingList ? { rotate: 360 } : {}} transition={{ duration: 1, repeat: loadingList ? Infinity : 0, ease: "linear" }}>
              <RefreshCw size={13} />
            </motion.div>
            {!isMobile && "Refresh"}
          </motion.button>
        </div>
      </div>

      {/* Stat cards */}
      {stats && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(4,1fr)", gap: 10, marginBottom: 22 }}>
          {[
            { label: "Total",      value: stats.total,          color: "#818cf8", glow: "rgba(129,140,248,0.2)" },
            { label: "Open",       value: stats.open,           color: "#34d399", glow: "rgba(52,211,153,0.2)"  },
            { label: "In Review",  value: stats.under_review,   color: "#fbbf24", glow: "rgba(251,191,36,0.2)"  },
            { label: "Urgent",     value: stats.urgent,         color: "#f87171", glow: "rgba(248,113,113,0.2)" },
            { label: "Matched",    value: stats.matched,        color: "#818cf8", glow: "rgba(129,140,248,0.2)" },
            { label: "Claimed",    value: stats.claimed,        color: "#38bdf8", glow: "rgba(56,189,248,0.2)"  },
            { label: "Closed",     value: stats.closed,         color: "#6b7280", glow: "rgba(107,114,128,0.2)" },
            { label: "This Month", value: stats.new_this_month, color: "#a78bfa", glow: "rgba(167,139,250,0.2)" },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              style={{ borderRadius: 14, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", padding: "12px 14px", textAlign: "center", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", width: 40, height: 40, borderRadius: "50%", background: s.glow, filter: "blur(14px)", pointerEvents: "none" }} />
              <div style={{ fontSize: isMobile ? 18 : 20, fontWeight: 800, color: s.color, fontFamily: "'Syne',sans-serif", lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 9, color: "#374151", textTransform: "uppercase", letterSpacing: 0.8, fontWeight: 600, marginTop: 4 }}>{s.label}</div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Toolbar — search + filter (AllUsers-style) */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "12px 14px", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "nowrap" }}>
          {/* Search */}
          <div style={{ position: "relative", flex: 1, minWidth: 0 }}>
            <Search size={13} color="#6b7280" style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
            <input
              value={searchRaw}
              onChange={e => setSearchRaw(e.target.value)}
              placeholder={isMobile ? "Search…" : "Search by item, location, or username…"}
              style={{ width: "100%", background: "#10101e", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 9, padding: "8px 32px 8px 32px", fontSize: 13, color: "#ffffff", outline: "none", fontFamily: "'DM Sans',sans-serif", boxSizing: "border-box", transition: "border-color 0.2s, box-shadow 0.2s" }}
              onFocus={e => { e.currentTarget.style.borderColor = "rgba(99,102,241,0.5)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.1)" }}
              onBlur={e  => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)"; e.currentTarget.style.boxShadow = "none" }}
            />
            {searchRaw && (
              <button onClick={() => setSearchRaw("")}
                style={{ position: "absolute", right: 9, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", display: "flex", padding: 0 }}>
                <X size={12} color="#6b7280" />
              </button>
            )}
          </div>

          {/* Filters toggle */}
          <motion.button whileTap={{ scale: 0.96 }} onClick={() => setShowFilters(p => !p)}
            style={{
              display: "flex", alignItems: "center", gap: 5, padding: "8px 12px", borderRadius: 9, flexShrink: 0,
              border:     showFilters ? "1px solid rgba(99,102,241,0.4)" : "1px solid rgba(255,255,255,0.1)",
              background: showFilters ? "rgba(99,102,241,0.12)"          : "rgba(255,255,255,0.04)",
              fontSize: 12, fontWeight: 500, color: showFilters ? "#a5b4fc" : "rgba(255,255,255,0.55)",
              cursor: "pointer", fontFamily: "'DM Sans',sans-serif", transition: "all 0.2s",
            }}>
            <Filter size={12} />
            {!isMobile && "Filters"}
            {activeFilterCount > 0 && (
              <span style={{ width: 14, height: 14, borderRadius: "50%", background: "#6366f1", fontSize: 8, fontWeight: 700, color: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {activeFilterCount}
              </span>
            )}
          </motion.button>

          {/* Count */}
          <div style={{ fontSize: 11, color: "#4b5563", whiteSpace: "nowrap", flexShrink: 0 }}>
            {loadingList ? "…" : `${reports.length}/${reportCount}`}
          </div>
        </div>

        {/* Expandable filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.18 }} style={{ overflow: "hidden" }}>
              <div style={{ paddingTop: 12, marginTop: 12, borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-end" }}>

                {/* Status */}
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#4b5563", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 7 }}>Status</div>
                  <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                    {STATUS_FILTERS.map(f => (
                      <button key={f.value} onClick={() => setStatusFilter(f.value)}
                        style={{ padding: "4px 11px", borderRadius: 7, border: statusFilter === f.value ? "1px solid rgba(99,102,241,0.4)" : "1px solid rgba(255,255,255,0.1)", background: statusFilter === f.value ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.04)", fontSize: 11, fontWeight: 500, color: statusFilter === f.value ? "#a5b4fc" : "rgba(255,255,255,0.5)", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Type */}
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#4b5563", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 7 }}>Type</div>
                  <div style={{ display: "flex", gap: 5 }}>
                    {([["all","All"],["lost","Lost"],["found","Found"]] as [string,string][]).map(([val, label]) => (
                      <button key={val} onClick={() => setTypeFilter(val as any)}
                        style={{
                          padding: "4px 11px", borderRadius: 7, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontSize: 11, fontWeight: 500,
                          border: typeFilter === val ? (val === "found" ? "1px solid rgba(16,185,129,0.4)" : "1px solid rgba(99,102,241,0.4)") : "1px solid rgba(255,255,255,0.1)",
                          background: typeFilter === val ? (val === "found" ? "rgba(16,185,129,0.12)" : "rgba(99,102,241,0.15)") : "rgba(255,255,255,0.04)",
                          color: typeFilter === val ? (val === "found" ? "#34d399" : "#a5b4fc") : "rgba(255,255,255,0.5)",
                        }}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category */}
                <div style={{ flex: "1 1 160px" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#4b5563", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 7 }}>Category</div>
                  <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value as any)}
                    style={{ width: "100%", padding: "6px 10px", borderRadius: 7, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "#c4c9e2", fontSize: 11, fontFamily: "'DM Sans',sans-serif", outline: "none", cursor: "pointer" }}>
                    <option value="all">All Categories</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                {/* Sort */}
                <div style={{ flex: "1 1 140px" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#4b5563", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 7 }}>Sort By</div>
                  <select value={ordering} onChange={e => setOrdering(e.target.value as any)}
                    style={{ width: "100%", padding: "6px 10px", borderRadius: 7, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "#c4c9e2", fontSize: 11, fontFamily: "'DM Sans',sans-serif", outline: "none", cursor: "pointer" }}>
                    <option value="-date_reported">Newest First</option>
                    <option value="date_reported">Oldest First</option>
                    <option value="-views">Most Viewed</option>
                    <option value="views">Least Viewed</option>
                    <option value="item_name">A–Z by Name</option>
                  </select>
                </div>

                {/* Urgent toggle */}
                <motion.button whileTap={{ scale: 0.97 }} onClick={() => setUrgentFilter(p => !p)}
                  style={{ display: "flex", alignItems: "center", gap: 7, padding: "6px 12px", borderRadius: 7, border: `1px solid ${urgentFilter ? "rgba(239,68,68,0.4)" : "rgba(255,255,255,0.1)"}`, background: urgentFilter ? "rgba(239,68,68,0.1)" : "rgba(255,255,255,0.04)", fontSize: 11, fontWeight: 600, color: urgentFilter ? "#f87171" : "rgba(255,255,255,0.5)", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
                  <Zap size={11} color={urgentFilter ? "#f87171" : "#4b5563"} />Urgent Only
                </motion.button>

                {/* Reset */}
                {activeFilterCount > 0 && (
                  <button onClick={() => { setStatusFilter("all"); setTypeFilter("all"); setCategoryFilter("all"); setUrgentFilter(false); setOrdering("-date_reported") }}
                    style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 7, border: "1px solid rgba(239,68,68,0.25)", background: "rgba(239,68,68,0.07)", fontSize: 11, color: "#f87171", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
                    <X size={10} />Reset
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Error banner */}
      <AnimatePresence>
        {(listError || deleteError) && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            style={{ overflow: "hidden", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "11px 14px", borderRadius: 12, background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.22)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <AlertTriangle size={13} color="#f87171" />
                <span style={{ fontSize: 12, color: "#f87171" }}>{listError ?? deleteError}</span>
              </div>
              <button onClick={clearErrors} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", padding: 0 }}>
                <X size={13} color="#f87171" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table / Cards / Empty */}
      {loadingList ? (
        <div style={{ borderRadius: 16, border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.01)", overflow: "hidden" }}>
          {Array.from({ length: 7 }).map((_, i) => <SkeletonRow key={i} />)}
        </div>
      ) : reports.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ textAlign: "center", padding: "56px 24px", borderRadius: 16, border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.01)" }}>
          <ClipboardList size={28} color="#374151" style={{ marginBottom: 14 }} />
          <div style={{ fontSize: 15, fontWeight: 700, color: "#374151", fontFamily: "'Syne',sans-serif", marginBottom: 6 }}>No reports found</div>
          <div style={{ fontSize: 12, color: "#374151" }}>Try adjusting your filters or search terms.</div>
        </motion.div>
      ) : statusFilter === "matched" ? (
        <MatchedPairsView reports={reports} onOpen={id => setOpenId(id)} isMobile={isMobile} />
      ) : isMobile ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {reports.map((r, i) => (
            <ReportCard key={r.id} report={r} index={i} onClick={() => setOpenId(r.id)} onAiMatch={e => { e.stopPropagation(); setOpenId(r.id); setAutoRunAiId(r.id) }} />
          ))}
        </div>
      ) : (
        <div style={{ borderRadius: 16, border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.01)", overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "36px 1fr 130px 110px 50px 50px 96px", gap: 12, padding: "10px 20px", borderBottom: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}>
            {["", "Item", "Status", "Reporter", "Views", "Date", ""].map((h, i) => (
              <div key={i} style={{ fontSize: 10, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: 1 }}>{h}</div>
            ))}
          </div>
          {reports.map((r, i) => (
            <ReportRow key={r.id} report={r} index={i} onClick={() => setOpenId(r.id)} onAiMatch={e => { e.stopPropagation(); setOpenId(r.id); setAutoRunAiId(r.id) }} />
          ))}
        </div>
      )}

      {!loadingList && reports.length > 0 && (
        <div style={{ textAlign: "center", marginTop: 16, fontSize: 11, color: "#374151" }}>
          Showing {reports.length} of {reportCount} report{reportCount !== 1 ? "s" : ""}
        </div>
      )}

      {/* Match Manager modal */}
      <AnimatePresence>
        {showMatcher && (
          <MatchManager
            onClose={() => setShowMatcher(false)}
            onMatched={() => { fetchReports({ ordering }); fetchStats() }}
          />
        )}
      </AnimatePresence>

      {/* Review drawer */}
      <ReviewDrawer
        reportId={openId}
        autoRunAi={autoRunAiId !== null && autoRunAiId === openId}
        onClose={() => { setOpenId(null); setAutoRunAiId(null) }}
        isMobile={isMobile}
        onDeleteRequest={(id, name) => setDeleteTarget({ id, name })}
        onUnmatched={() => { fetchReports({ ordering }); fetchStats() }}
        onOpenMatcher={() => setShowMatcher(true)}
      />

      {/* Delete modal */}
      <AnimatePresence>
        {deleteTarget && (
          <DeleteModal
            itemName={deleteTarget.name}
            onConfirm={confirmDelete}
            onCancel={() => setDeleteTarget(null)}
            loading={deleting}
          />
        )}
      </AnimatePresence>
    </div>
  )
}