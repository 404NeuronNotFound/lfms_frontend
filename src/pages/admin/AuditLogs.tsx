import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useAuditLogStore } from "@/store/auditLogStore"
import type { AuditLogEntry, AuditAction, AuditActorType } from "@/types/auditLogTypes"
import {
  ClipboardList, Search, Filter, RefreshCw, X, Shield,
  LogIn, LogOut, UserPlus, KeyRound, FileText, FilePen,
  FileX, FileCheck, ShieldCheck, ShieldX, Trash2, UserCog,
  Zap, CheckCircle, XCircle, Play, AlertTriangle, Loader2,
  Calendar, ChevronLeft, ChevronRight, Activity, Clock,
  Lock, Hash,
} from "lucide-react"

// ── Mobile hook ────────────────────────────────────────────────────────────
function useIsMobile(bp = 768) {
  const [v, setV] = useState(typeof window !== "undefined" ? window.innerWidth < bp : false)
  useEffect(() => {
    const h = () => setV(window.innerWidth < bp)
    window.addEventListener("resize", h)
    return () => window.removeEventListener("resize", h)
  }, [bp])
  return v
}

// ── Time helpers ───────────────────────────────────────────────────────────
function timeAgo(iso: string) {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (m < 1)    return "Just now"
  if (m < 60)   return `${m}m ago`
  if (m < 1440) return `${Math.floor(m / 60)}h ago`
  if (m < 10080) return `${Math.floor(m / 1440)}d ago`
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" })
}
function fmtFull(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit",
  })
}
function dateBucket(iso: string) {
  const d    = new Date(iso)
  const now  = new Date()
  const diff = Math.floor((now.getTime() - d.getTime()) / 86400000)
  if (diff === 0) return "Today"
  if (diff === 1) return "Yesterday"
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
}

// ── Action metadata map ────────────────────────────────────────────────────
interface ActionMeta { icon: React.ElementType; color: string; bg: string; border: string; label: string }

const ACTION_META: Record<string, ActionMeta> = {
  login:           { icon: LogIn,        color: "#34d399", bg: "rgba(52,211,153,0.10)",  border: "rgba(52,211,153,0.22)",  label: "Login"           },
  logout:          { icon: LogOut,       color: "#9ca3af", bg: "rgba(156,163,175,0.10)", border: "rgba(156,163,175,0.20)", label: "Logout"          },
  register:        { icon: UserPlus,     color: "#38bdf8", bg: "rgba(56,189,248,0.10)",  border: "rgba(56,189,248,0.22)",  label: "Register"        },
  password_change: { icon: KeyRound,     color: "#fbbf24", bg: "rgba(251,191,36,0.10)",  border: "rgba(251,191,36,0.22)",  label: "Password Change" },
  report_created:  { icon: FileText,     color: "#818cf8", bg: "rgba(99,102,241,0.10)",  border: "rgba(99,102,241,0.22)",  label: "Report Created"  },
  report_updated:  { icon: FilePen,      color: "#a78bfa", bg: "rgba(139,92,246,0.10)",  border: "rgba(139,92,246,0.22)",  label: "Report Updated"  },
  report_deleted:  { icon: FileX,        color: "#f87171", bg: "rgba(239,68,68,0.10)",   border: "rgba(239,68,68,0.22)",   label: "Report Deleted"  },
  report_closed:   { icon: FileCheck,    color: "#6ee7b7", bg: "rgba(52,211,153,0.08)",  border: "rgba(52,211,153,0.18)",  label: "Report Closed"   },
  claim_submitted: { icon: ClipboardList,color: "#818cf8", bg: "rgba(99,102,241,0.10)",  border: "rgba(99,102,241,0.22)",  label: "Claim Submitted" },
  claim_approved:  { icon: CheckCircle,  color: "#34d399", bg: "rgba(52,211,153,0.10)",  border: "rgba(52,211,153,0.22)",  label: "Claim Approved"  },
  claim_rejected:  { icon: XCircle,      color: "#f87171", bg: "rgba(239,68,68,0.10)",   border: "rgba(239,68,68,0.22)",   label: "Claim Rejected"  },
  match_confirmed: { icon: CheckCircle,  color: "#34d399", bg: "rgba(52,211,153,0.10)",  border: "rgba(52,211,153,0.22)",  label: "Match Confirmed" },
  match_dismissed: { icon: XCircle,      color: "#9ca3af", bg: "rgba(156,163,175,0.10)", border: "rgba(156,163,175,0.20)", label: "Match Dismissed" },
  match_run:       { icon: Play,         color: "#a78bfa", bg: "rgba(139,92,246,0.10)",  border: "rgba(139,92,246,0.22)",  label: "AI Match Run"    },
  user_banned:     { icon: ShieldX,      color: "#f87171", bg: "rgba(239,68,68,0.10)",   border: "rgba(239,68,68,0.22)",   label: "User Banned"     },
  user_unbanned:   { icon: ShieldCheck,  color: "#34d399", bg: "rgba(52,211,153,0.10)",  border: "rgba(52,211,153,0.22)",  label: "User Unbanned"   },
  user_deleted:    { icon: Trash2,       color: "#f87171", bg: "rgba(239,68,68,0.12)",   border: "rgba(239,68,68,0.28)",   label: "User Deleted"    },
  role_changed:    { icon: UserCog,      color: "#fbbf24", bg: "rgba(251,191,36,0.10)",  border: "rgba(251,191,36,0.22)",  label: "Role Changed"    },
}
const getMeta = (action: string): ActionMeta =>
  ACTION_META[action] ?? { icon: Zap, color: "#818cf8", bg: "rgba(99,102,241,0.10)", border: "rgba(99,102,241,0.22)", label: action }

// ── Actor type chip ────────────────────────────────────────────────────────
const ACTOR_META = {
  admin:  { color: "#a5b4fc", bg: "rgba(99,102,241,0.12)",  border: "rgba(99,102,241,0.28)",  icon: Shield,  label: "Admin"  },
  user:   { color: "#9ca3af", bg: "rgba(255,255,255,0.05)", border: "rgba(255,255,255,0.10)", icon: UserPlus,label: "User"   },
  system: { color: "#fbbf24", bg: "rgba(251,191,36,0.10)",  border: "rgba(251,191,36,0.22)",  icon: Zap,     label: "System" },
}
function ActorChip({ type }: { type: AuditActorType }) {
  const c = ACTOR_META[type] ?? ACTOR_META.user
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 20, background: c.bg, border: `1px solid ${c.border}`, fontSize: 10, fontWeight: 700, color: c.color, letterSpacing: 0.3, whiteSpace: "nowrap" }}>
      <c.icon size={9} />
      {c.label}
    </span>
  )
}

// ── Stat card ──────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color, sub, delay = 0, loading }: {
  label: string; value: number | string; icon: React.ElementType
  color: string; sub?: string; delay?: number; loading?: boolean
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.28 }}
      style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "18px 20px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, right: 0, width: 80, height: 80, borderRadius: "50%", background: `radial-gradient(circle,${color}18,transparent 70%)`, transform: "translate(20px,-20px)", pointerEvents: "none" }} />
      <div style={{ width: 34, height: 34, borderRadius: 10, background: `${color}18`, border: `1px solid ${color}30`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
        <Icon size={16} color={color} />
      </div>
      {loading
        ? <div style={{ height: 30 }}><Loader2 size={16} color={color} style={{ animation: "al-spin 1s linear infinite" }} /></div>
        : <div style={{ fontSize: 24, fontWeight: 800, color: "#fff", lineHeight: 1, marginBottom: 4, fontFamily: "'Syne',sans-serif" }}>{typeof value === "number" ? value.toLocaleString() : value}</div>
      }
      <div style={{ fontSize: 12, color: "#6b7280" }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color, fontWeight: 500, marginTop: 2 }}>{sub}</div>}
    </motion.div>
  )
}

// ── Skeleton ───────────────────────────────────────────────────────────────
function Skel({ w = "100%", h = 12, r = 6 }: { w?: number | string; h?: number; r?: number }) {
  return <div style={{ width: w, height: h, borderRadius: r, background: "rgba(255,255,255,0.06)", flexShrink: 0 }} />
}

// ── Detail drawer ──────────────────────────────────────────────────────────
function LogDrawer({ entry, onClose, isMobile }: {
  entry: AuditLogEntry; onClose: () => void; isMobile: boolean
}) {
  const meta = getMeta(entry.action)
  const Icon = meta.icon

  const rows = [
    { icon: UserPlus,  label: "Actor",       value: `@${entry.actor}`,                  mono: false },
    { icon: Hash,      label: "Actor ID",     value: entry.actor_id ? `#${entry.actor_id}` : "—", mono: true },
    { icon: UserCog,   label: "Target User",  value: entry.target_user ? `@${entry.target_user}` : "—", mono: false },
    { icon: FileText,  label: "Report",       value: entry.report_id ? `#${entry.report_id}` : "—", mono: true },
    { icon: ClipboardList, label: "Claim",    value: entry.claim_id  ? `#${entry.claim_id}`  : "—", mono: true },
    { icon: Lock,      label: "IP Address",   value: entry.ip ?? "—",    mono: true },
    { icon: Clock,     label: "Timestamp",    value: fmtFull(entry.created_at), mono: false },
  ]

  return (
    <AnimatePresence>
      <motion.div key="bd"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", backdropFilter: "blur(8px)", zIndex: 200 }} />

      <motion.div key="pn"
        initial={isMobile ? { y: "100%" } : { x: "100%" }}
        animate={isMobile ? { y: 0 } : { x: 0 }}
        exit={isMobile ? { y: "100%" } : { x: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 220 }}
        style={{
          position: "fixed", zIndex: 201, overflowY: "auto",
          fontFamily: "'DM Sans',sans-serif", color: "white",
          background: "rgba(9,9,16,0.99)",
          ...(isMobile
            ? { left: 0, right: 0, bottom: 0, maxHeight: "85vh", borderRadius: "20px 20px 0 0", borderTop: "1px solid rgba(255,255,255,0.09)" }
            : { top: 0, right: 0, bottom: 0, width: 400, borderLeft: "1px solid rgba(255,255,255,0.09)" }
          ),
        }}>

        {/* Drag handle */}
        {isMobile && (
          <div style={{ display: "flex", justifyContent: "center", paddingTop: 10 }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.12)" }} />
          </div>
        )}

        {/* Sticky header */}
        <div style={{ padding: "20px 24px 18px", position: "sticky", top: 0, background: "rgba(9,9,16,0.98)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.07)", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: "#4b5563", textTransform: "uppercase", letterSpacing: 1.5 }}>
              Log Entry #{entry.id}
            </span>
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={onClose}
              style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <X size={14} color="rgba(255,255,255,0.5)" />
            </motion.button>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: meta.bg, border: `1px solid ${meta.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Icon size={22} color={meta.color} />
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", fontFamily: "'Syne',sans-serif", marginBottom: 5 }}>
                {meta.label}
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <ActorChip type={entry.actor_type} />
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 20, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", fontSize: 10, fontWeight: 600, color: "#6b7280" }}>
                  <Clock size={9} />{timeAgo(entry.created_at)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 10 }}>
          {/* Detail banner */}
          {entry.detail && (
            <div style={{ padding: "12px 16px", borderRadius: 12, background: `${meta.bg}`, border: `1px solid ${meta.border}`, fontSize: 13, color: "#c4c9e2", lineHeight: 1.65, marginBottom: 4 }}>
              {entry.detail}
            </div>
          )}

          {/* Info rows */}
          {rows.map((row, i) => {
            const isEmpty = row.value === "—"
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "10px 14px", borderRadius: 10, background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)", opacity: isEmpty ? 0.45 : 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <row.icon size={12} color="#4b5563" />
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#4b5563", textTransform: "uppercase", letterSpacing: 0.8 }}>{row.label}</span>
                </div>
                <span style={{ fontSize: 12, color: isEmpty ? "#374151" : "#c4c9e2", fontFamily: row.mono ? "'Courier New',monospace" : "inherit", textAlign: "right", wordBreak: "break-all" }}>
                  {row.value}
                </span>
              </div>
            )
          })}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

// ── Log row ────────────────────────────────────────────────────────────────
function LogRow({ entry, isMobile, onClick, idx }: {
  entry: AuditLogEntry; isMobile: boolean; onClick: () => void; idx: number
}) {
  const meta = getMeta(entry.action)
  const Icon = meta.icon
  const COLS = isMobile ? "32px 1fr auto" : "32px 1fr 110px 80px 100px 72px"
  return (
    <motion.div
      initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.022 }}
      onClick={onClick} className="al-row"
      style={{ display: "grid", gridTemplateColumns: COLS, gap: 12, padding: "12px 20px", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.04)", cursor: "pointer" }}>

      {/* Action icon */}
      <div style={{ width: 32, height: 32, borderRadius: 9, background: meta.bg, border: `1px solid ${meta.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon size={14} color={meta.color} />
      </div>

      {/* Label + detail */}
      <div style={{ minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 2 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0", fontFamily: "'Syne',sans-serif" }}>{meta.label}</span>
          {isMobile && <ActorChip type={entry.actor_type} />}
        </div>
        <div style={{ fontSize: 11, color: "#6b7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {entry.detail ? entry.detail : `by @${entry.actor}`}
        </div>
      </div>

      {/* Actor — desktop */}
      {!isMobile && (
        <div style={{ fontSize: 12, color: "#9ca3af", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 500 }}>
          @{entry.actor}
        </div>
      )}

      {/* Type chip — desktop */}
      {!isMobile && <ActorChip type={entry.actor_type} />}

      {/* IP — desktop */}
      {!isMobile && (
        <div style={{ fontSize: 11, color: "#374151", fontFamily: "'Courier New',monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {entry.ip ?? "—"}
        </div>
      )}

      {/* Time */}
      <div style={{ fontSize: 11, color: "#4b5563", whiteSpace: "nowrap", textAlign: "right" }}>
        {timeAgo(entry.created_at)}
      </div>
    </motion.div>
  )
}

// ── Pagination button ──────────────────────────────────────────────────────
function PgBtn({ icon: Icon, onClick, disabled }: { icon: React.ElementType; onClick: () => void; disabled?: boolean }) {
  return (
    <motion.button whileTap={!disabled ? { scale: 0.9 } : {}} onClick={onClick} disabled={disabled}
      style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", display: "flex", alignItems: "center", justifyContent: "center", cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.3 : 1 }}>
      <Icon size={14} color="rgba(255,255,255,0.5)" />
    </motion.button>
  )
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  MAIN PAGE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export default function AuditLogs() {
  const isMobile = useIsMobile(768)
  const {
    entries, choices, stats, total, pages, loading, error,
    filters, fetch, setFilter, resetFilters, clearError,
  } = useAuditLogStore()

  const [showFilters, setShowFilters] = useState(false)
  const [selected,    setSelected]    = useState<AuditLogEntry | null>(null)
  const [searchInput, setSearchInput] = useState("")

  useEffect(() => { fetch() }, [])

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => setFilter("search", searchInput), 380)
    return () => clearTimeout(t)
  }, [searchInput])

  const activeFilterCount = [
    filters.action, filters.actor_type, filters.date_from, filters.date_to,
  ].filter(Boolean).length

  // Group entries by date bucket
  let lastBucket = ""

  const COLS         = isMobile ? "32px 1fr auto" : "32px 1fr 110px 80px 100px 72px"
  const COL_HEADERS  = isMobile
    ? ["", "Action", "When"]
    : ["", "Action / Detail", "Actor", "Type", "IP Address", "When"]

  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif", color: "#fff", minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
        @keyframes al-spin { from { transform:rotate(0deg) } to { transform:rotate(360deg) } }
        .al-row { transition: background 0.13s; }
        .al-row:hover { background: rgba(99,102,241,0.05) !important; }
        .al-chip { display:flex; align-items:center; gap:6px; padding:5px 12px; border-radius:8px; font-size:12px; font-weight:500; cursor:pointer; font-family:'DM Sans',sans-serif; transition:all 0.18s; white-space:nowrap; }
        .al-chip-off { border:1px solid rgba(255,255,255,0.1); background:rgba(255,255,255,0.04); color:rgba(255,255,255,0.5); }
        .al-chip-on  { border:1px solid rgba(99,102,241,0.4); background:rgba(99,102,241,0.15); color:#a5b4fc; }
        ::-webkit-scrollbar { width:3px; height:3px; }
        ::-webkit-scrollbar-thumb { background:rgba(99,102,241,0.3); border-radius:3px; }
        select option { background:#13131f; }
      `}</style>

      {/* Detail drawer */}
      <AnimatePresence>
        {selected && (
          <LogDrawer key="drw" entry={selected} onClose={() => setSelected(null)} isMobile={isMobile} />
        )}
      </AnimatePresence>

      {/* ── Page header ── */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <ClipboardList size={17} color="#818cf8" />
              </div>
              <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.8px", color: "#fff", margin: 0, fontFamily: "'Syne',sans-serif" }}>
                Audit Logs
              </h1>
            </div>
            <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>
              Full activity trail across all users and admin actions
            </p>
          </div>
          <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }} onClick={fetch} disabled={loading}
            style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 18px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", fontSize: 13, fontWeight: 600, color: "#fff", cursor: loading ? "not-allowed" : "pointer", fontFamily: "'DM Sans',sans-serif", boxShadow: "0 4px 16px rgba(99,102,241,0.3)", opacity: loading ? 0.7 : 1, flexShrink: 0 }}>
            {loading
              ? <Loader2 size={13} style={{ animation: "al-spin 1s linear infinite" }} />
              : <RefreshCw size={13} />}
            Refresh
          </motion.button>
        </div>
      </motion.div>

      {/* ── Error ── */}
      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderRadius: 12, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", marginBottom: 20 }}>
            <AlertTriangle size={14} color="#f87171" />
            <span style={{ fontSize: 13, color: "#f87171", flex: 1 }}>{error}</span>
            <button onClick={() => { clearError(); fetch() }}
              style={{ fontSize: 12, color: "#f87171", background: "none", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 7, padding: "4px 10px", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
              Retry
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Stat cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(auto-fit,minmax(140px,1fr))", gap: 12, marginBottom: 24 }}>
        <StatCard icon={Activity}      label="Total Events"    value={stats?.total           ?? "—"} color="#6366f1" delay={0}    loading={!stats} />
        <StatCard icon={Clock}         label="Today"           value={stats?.today           ?? "—"} color="#38bdf8" delay={0.05} loading={!stats} sub="events today" />
        <StatCard icon={Zap}           label="Last 24h"        value={stats?.last_24h        ?? "—"} color="#a78bfa" delay={0.10} loading={!stats} />
        <StatCard icon={Shield}        label="Admin Actions"   value={stats?.admin_actions   ?? "—"} color="#818cf8" delay={0.15} loading={!stats} />
        <StatCard icon={UserPlus}      label="User Actions"    value={stats?.user_actions    ?? "—"} color="#34d399" delay={0.20} loading={!stats} />
        <StatCard icon={AlertTriangle} label="Security Events" value={stats?.security_events ?? "—"} color="#f87171" delay={0.25} loading={!stats} sub="bans, role changes…" />
      </div>

      {/* ── Toolbar ── */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
        style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "14px 16px", marginBottom: 12 }}>

        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          {/* Search */}
          <div style={{ position: "relative", flex: 1, minWidth: 160 }}>
            <Search size={13} color="#6b7280" style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
            <input
              placeholder={isMobile ? "Search…" : "Search actor, detail, target…"}
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              style={{ width: "100%", background: "#10101e", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 10, padding: "8px 32px", fontSize: 13, color: "#fff", outline: "none", fontFamily: "'DM Sans',sans-serif", boxSizing: "border-box", transition: "border-color 0.2s, box-shadow 0.2s" }}
              onFocus={e => { e.currentTarget.style.borderColor = "rgba(99,102,241,0.5)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.1)" }}
              onBlur={e  => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)"; e.currentTarget.style.boxShadow = "none" }}
            />
            {searchInput && (
              <button onClick={() => setSearchInput("")}
                style={{ position: "absolute", right: 9, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                <X size={12} color="#6b7280" />
              </button>
            )}
          </div>

          {/* Filter toggle */}
          <motion.button whileTap={{ scale: 0.96 }} onClick={() => setShowFilters(v => !v)}
            className={`al-chip ${showFilters ? "al-chip-on" : "al-chip-off"}`}>
            <Filter size={13} />
            {!isMobile && "Filters"}
            {activeFilterCount > 0 && (
              <span style={{ width: 16, height: 16, borderRadius: "50%", background: "#6366f1", fontSize: 9, fontWeight: 700, color: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {activeFilterCount}
              </span>
            )}
          </motion.button>

          <span style={{ fontSize: 12, color: "#4b5563", marginLeft: "auto", whiteSpace: "nowrap" }}>
            {loading ? "…" : `${total.toLocaleString()} events`}
          </span>
        </div>

        {/* Expanded filter panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }} style={{ overflow: "hidden" }}>
              <div style={{ paddingTop: 16, marginTop: 14, borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", gap: 20, flexWrap: "wrap", alignItems: "flex-start" }}>

                {/* Action select */}
                <div style={{ flex: "1 1 200px" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#4b5563", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8 }}>Action</div>
                  <select
                    value={filters.action}
                    onChange={e => setFilter("action", e.target.value as AuditAction | "")}
                    style={{ width: "100%", background: "#10101e", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 10, padding: "8px 12px", fontSize: 12, color: filters.action ? "#e2e8f0" : "#6b7280", outline: "none", fontFamily: "'DM Sans',sans-serif", cursor: "pointer" }}>
                    <option value="">All Actions</option>
                    {choices.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>

                {/* Actor type */}
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#4b5563", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8 }}>Actor Type</div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {([
                      { v: "" as AuditActorType | "", l: "All" },
                      { v: "admin"  as AuditActorType, l: "Admin"  },
                      { v: "user"   as AuditActorType, l: "User"   },
                      { v: "system" as AuditActorType, l: "System" },
                    ]).map(opt => (
                      <button key={opt.v || "all"} onClick={() => setFilter("actor_type", opt.v)}
                        className={`al-chip ${filters.actor_type === opt.v ? "al-chip-on" : "al-chip-off"}`}>
                        {opt.l}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date range */}
                <div style={{ flex: "1 1 220px" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#4b5563", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8 }}>Date Range</div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                      <Calendar size={12} color="#4b5563" style={{ position: "absolute", left: 9, pointerEvents: "none" }} />
                      <input type="date" value={filters.date_from}
                        onChange={e => setFilter("date_from", e.target.value)}
                        style={{ background: "#10101e", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 8, padding: "7px 10px 7px 28px", fontSize: 12, color: "#e2e8f0", outline: "none", fontFamily: "'DM Sans',sans-serif", colorScheme: "dark", width: 140 }} />
                    </div>
                    <span style={{ fontSize: 11, color: "#374151" }}>→</span>
                    <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                      <Calendar size={12} color="#4b5563" style={{ position: "absolute", left: 9, pointerEvents: "none" }} />
                      <input type="date" value={filters.date_to}
                        onChange={e => setFilter("date_to", e.target.value)}
                        style={{ background: "#10101e", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 8, padding: "7px 10px 7px 28px", fontSize: 12, color: "#e2e8f0", outline: "none", fontFamily: "'DM Sans',sans-serif", colorScheme: "dark", width: 140 }} />
                    </div>
                  </div>
                </div>

                {/* Clear all */}
                {activeFilterCount > 0 && (
                  <div style={{ display: "flex", alignItems: "flex-end" }}>
                    <button onClick={() => { resetFilters(); setSearchInput("") }}
                      style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 13px", borderRadius: 8, border: "1px solid rgba(239,68,68,0.25)", background: "rgba(239,68,68,0.07)", fontSize: 12, color: "#f87171", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
                      <X size={11} />Clear All
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── Table ── */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
        style={{ borderRadius: 16, border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.01)", overflow: "hidden" }}>

        {/* Column headers */}
        <div style={{ display: "grid", gridTemplateColumns: COLS, gap: 12, padding: "10px 20px", background: "rgba(255,255,255,0.02)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          {COL_HEADERS.map((h, i) => (
            <div key={i} style={{ fontSize: 10, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: 1.2, textAlign: i === COL_HEADERS.length - 1 ? "right" : "left" }}>{h}</div>
          ))}
        </div>

        {/* Loading skeletons */}
        {loading && Array.from({ length: 12 }).map((_, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: COLS, gap: 12, padding: "12px 20px", borderBottom: "1px solid rgba(255,255,255,0.04)", alignItems: "center" }}>
            <Skel w={32} h={32} r={9} />
            <div><Skel w="55%" h={12} /><div style={{ marginTop: 6 }}><Skel w="38%" h={10} /></div></div>
            {!isMobile && <><Skel w={80} h={11} /><Skel w={54} h={18} r={20} /><Skel w={90} h={11} /></>}
            <Skel w={52} h={11} />
          </div>
        ))}

        {/* Empty state */}
        {!loading && entries.length === 0 && (
          <div style={{ padding: "64px 20px", textAlign: "center" }}>
            <div style={{ fontSize: 38, marginBottom: 14 }}>🗒️</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#6b7280", marginBottom: 6 }}>No logs found</div>
            <div style={{ fontSize: 13, color: "#4b5563" }}>Try adjusting your search or filter criteria</div>
          </div>
        )}

        {/* Rows grouped by date */}
        {!loading && entries.length > 0 && entries.map((entry, idx) => {
          const bucket    = dateBucket(entry.created_at)
          const showBucket = bucket !== lastBucket
          lastBucket = bucket
          return (
            <div key={entry.id}>
              {showBucket && (
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 20px", background: "rgba(255,255,255,0.015)", borderBottom: "1px solid rgba(255,255,255,0.04)", borderTop: idx > 0 ? "1px solid rgba(255,255,255,0.04)" : undefined }}>
                  <Calendar size={10} color="#374151" />
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: 1.2 }}>
                    {bucket}
                  </span>
                </div>
              )}
              <LogRow entry={entry} isMobile={isMobile} idx={idx} onClick={() => setSelected(entry)} />
            </div>
          )
        })}

        {/* Pagination */}
        {!loading && pages > 1 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", borderTop: "1px solid rgba(255,255,255,0.07)", flexWrap: "wrap", gap: 10 }}>
            <span style={{ fontSize: 12, color: "#4b5563" }}>
              Page {filters.page} of {pages} · {total.toLocaleString()} total
            </span>
            <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
              <PgBtn icon={ChevronLeft}  onClick={() => setFilter("page", filters.page - 1)} disabled={filters.page <= 1} />
              {Array.from({ length: pages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === pages || Math.abs(p - filters.page) <= 1)
                .reduce<(number | "…")[]>((acc, p, i, arr) => {
                  if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push("…")
                  acc.push(p)
                  return acc
                }, [])
                .map((p, i) =>
                  p === "…"
                    ? <span key={`e${i}`} style={{ fontSize: 13, color: "#374151", padding: "0 4px" }}>…</span>
                    : (
                      <motion.button key={p} whileTap={{ scale: 0.93 }} onClick={() => setFilter("page", p as number)}
                        style={{ minWidth: 32, height: 32, padding: "0 8px", borderRadius: 8, border: filters.page === p ? "1px solid rgba(99,102,241,0.5)" : "1px solid rgba(255,255,255,0.08)", background: filters.page === p ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.03)", fontSize: 13, fontWeight: filters.page === p ? 700 : 400, color: filters.page === p ? "#a5b4fc" : "rgba(255,255,255,0.5)", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
                        {p}
                      </motion.button>
                    )
                )
              }
              <PgBtn icon={ChevronRight} onClick={() => setFilter("page", filters.page + 1)} disabled={filters.page >= pages} />
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}