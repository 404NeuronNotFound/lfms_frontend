import React, { useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Bell, CheckCheck, RefreshCw, Inbox, AlertTriangle, X,
  PackagePlus, ShieldCheck, XCircle, GitMerge, ClipboardList,
  Clock, CheckCircle2, FileText, ChevronRight, Download,
} from "lucide-react"
import { useNotificationStore } from "@/store/notificationStore"
import { useAuthStore } from "@/store/authStore"
import type { Notification, NotificationType } from "@/types/reportTypes"

// ─────────────────────────────────────────────────────────────────────────────
//  HOOKS
// ─────────────────────────────────────────────────────────────────────────────
function useIsMobile(bp = 640) {
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

// ─────────────────────────────────────────────────────────────────────────────
//  CONFIG — per type: icon, accent color, label
// ─────────────────────────────────────────────────────────────────────────────
const NOTIF_CFG: Record<NotificationType, {
  icon: React.ElementType; color: string; bg: string; border: string; label: string
}> = {
  // user-facing
  report_received: { icon: FileText,     color: "#a5b4fc", bg: "rgba(165,180,252,0.08)", border: "rgba(165,180,252,0.18)", label: "Report Received"  },
  under_review:    { icon: Clock,         color: "#fbbf24", bg: "rgba(251,191,36,0.08)",  border: "rgba(251,191,36,0.18)",  label: "Under Review"    },
  matched:         { icon: GitMerge,      color: "#818cf8", bg: "rgba(129,140,248,0.08)", border: "rgba(129,140,248,0.18)", label: "Match Found"     },
  claim_received:  { icon: ClipboardList, color: "#38bdf8", bg: "rgba(56,189,248,0.08)",  border: "rgba(56,189,248,0.18)",  label: "Claim Submitted" },
  claim_approved:  { icon: CheckCircle2,  color: "#34d399", bg: "rgba(52,211,153,0.08)",  border: "rgba(52,211,153,0.18)",  label: "Claim Approved"  },
  claim_rejected:  { icon: XCircle,       color: "#f87171", bg: "rgba(248,113,113,0.08)", border: "rgba(248,113,113,0.18)", label: "Claim Rejected"  },
  report_closed:   { icon: CheckCheck,    color: "#6b7280", bg: "rgba(107,114,128,0.08)", border: "rgba(107,114,128,0.18)", label: "Report Closed"   },
  report_rejected: { icon: XCircle,       color: "#f87171", bg: "rgba(248,113,113,0.08)", border: "rgba(248,113,113,0.18)", label: "Report Rejected" },
  // admin-facing
  new_report:      { icon: PackagePlus,   color: "#fb923c", bg: "rgba(251,146,60,0.08)",  border: "rgba(251,146,60,0.18)",  label: "New Report"      },
  new_claim:       { icon: ShieldCheck,   color: "#c084fc", bg: "rgba(192,132,252,0.08)", border: "rgba(192,132,252,0.18)", label: "New Claim"       },
}

// ─────────────────────────────────────────────────────────────────────────────
//  NAVIGATION MAP
//  Admin → management pages | User → their own pages
// ─────────────────────────────────────────────────────────────────────────────
function getNotifHref(notif: Notification, isAdmin: boolean): string | null {
  const { type } = notif

  if (isAdmin) {
    if (type === "new_report") return "/admin-all-reports"
    if (type === "new_claim")  return "/admin-claims"
    // Admin also gets matched/claim notifs when they fire both-ways
    if (type === "matched" || type === "under_review") return "/admin-all-reports"
    return null
  }

  // User routes
  if (["claim_received", "claim_approved", "claim_rejected"].includes(type))
    return "/user-my-claims"
  if (["matched", "under_review", "report_received", "report_closed", "report_rejected"].includes(type))
    return "/user-my-reports"

  return null
}

// ─────────────────────────────────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────────────────────────────────
function timeAgo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (diff < 1)    return "just now"
  if (diff < 60)   return `${diff}m ago`
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`
  const d = Math.floor(diff / 1440)
  return d === 1 ? "yesterday" : `${d}d ago`
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

function groupByDate(list: Notification[]): { label: string; items: Notification[] }[] {
  const groups: Record<string, Notification[]> = {}
  const now       = new Date()
  const today     = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const yesterday = today - 86_400_000

  for (const n of list) {
    const t = new Date(n.created_at).getTime()
    const key = t >= today ? "Today" : t >= yesterday ? "Yesterday" : fmtDate(n.created_at)
    if (!groups[key]) groups[key] = []
    groups[key].push(n)
  }
  return Object.entries(groups).map(([label, items]) => ({ label, items }))
}

// ─────────────────────────────────────────────────────────────────────────────
//  SKELETON
// ─────────────────────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <div style={{ display: "flex", gap: 14, padding: "16px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
      <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(255,255,255,0.05)", flexShrink: 0, animation: "np-pulse 1.6s ease-in-out infinite" }} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ height: 13, width: "55%", borderRadius: 5, background: "rgba(255,255,255,0.05)", animation: "np-pulse 1.6s ease-in-out infinite", animationDelay: "0.1s" }} />
        <div style={{ height: 11, width: "80%", borderRadius: 5, background: "rgba(255,255,255,0.04)", animation: "np-pulse 1.6s ease-in-out infinite", animationDelay: "0.2s" }} />
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  NOTIFICATION ROW
// ─────────────────────────────────────────────────────────────────────────────
function NotifRow({ notif, onRead, index, isAdmin }: {
  notif:   Notification
  onRead:  (id: number) => void
  index:   number
  isAdmin: boolean
}) {
  const cfg       = NOTIF_CFG[notif.type] ?? NOTIF_CFG.report_received
  const Icon      = cfg.icon
  const href      = getNotifHref(notif, isAdmin)
  const isUnread  = !notif.is_read
  const clickable = !!href

  function handleClick() {
    if (isUnread) onRead(notif.id)
    if (href) window.location.href = href
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03, duration: 0.25 }}
      onClick={handleClick}
      whileHover={clickable ? { x: 3, background: isUnread ? cfg.bg : "rgba(255,255,255,0.03)" } : {}}
      style={{
        display: "flex", gap: 14, padding: "14px 16px",
        borderRadius: 14, position: "relative",
        cursor: clickable ? "pointer" : "default",
        background: isUnread ? cfg.bg : "transparent",
        border: `1px solid ${isUnread ? cfg.border : "transparent"}`,
        transition: "all 0.2s",
      }}
    >
      {/* Unread dot */}
      {isUnread && (
        <div style={{
          position: "absolute", top: 14, right: href ? 40 : 14,
          width: 7, height: 7, borderRadius: "50%",
          background: cfg.color, boxShadow: `0 0 8px ${cfg.color}`,
        }} />
      )}

      {/* Icon bubble */}
      <div style={{
        width: 40, height: 40, borderRadius: 12, flexShrink: 0,
        background: isUnread ? cfg.bg : "rgba(255,255,255,0.04)",
        border: `1px solid ${isUnread ? cfg.border : "rgba(255,255,255,0.07)"}`,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Icon size={16} color={isUnread ? cfg.color : "#4b5563"} />
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Title + time */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 4 }}>
          <span style={{
            fontSize: 13, fontWeight: isUnread ? 700 : 500,
            color: isUnread ? "#e2e8f0" : "#6b7280",
            fontFamily: "'Syne',sans-serif",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1,
          }}>
            {notif.title}
          </span>
          <span style={{ fontSize: 11, color: "#374151", flexShrink: 0, fontVariantNumeric: "tabular-nums" }}>
            {timeAgo(notif.created_at)}
          </span>
        </div>

        {/* Message */}
        <p style={{
          fontSize: 12, color: isUnread ? "#9ca3af" : "#374151",
          margin: 0, lineHeight: 1.55,
          overflow: "hidden", display: "-webkit-box",
          WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
        }}>
          {notif.message}
        </p>

        {/* Type pill + View link */}
        <div style={{ marginTop: 8, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            padding: "2px 8px", borderRadius: 20,
            background: isUnread ? `${cfg.color}18` : "rgba(255,255,255,0.04)",
            border: `1px solid ${isUnread ? `${cfg.color}30` : "rgba(255,255,255,0.07)"}`,
            fontSize: 10, fontWeight: 700,
            color: isUnread ? cfg.color : "#374151",
            textTransform: "uppercase", letterSpacing: 0.5,
          }}>
            <Icon size={8} />
            {cfg.label}
          </span>

          {href && (
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 3,
              fontSize: 11, fontWeight: 600,
              color: isUnread ? cfg.color : "#374151",
              opacity: isUnread ? 1 : 0.5,
            }}>
              View <ChevronRight size={12} />
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  MAIN PAGE  (recyclable — works for both admin and user)
// ─────────────────────────────────────────────────────────────────────────────
export default function Notifications() {
  const isMobile = useIsMobile()
  const { notifications, unreadCount, loading, error, fetchNotifications, markRead, markAllRead, clearError } = useNotificationStore()
  const { role } = useAuthStore()
  const isAdmin  = role === "ADMIN"

  const [filter, setFilter] = React.useState<"all" | "unread">("all")

  useEffect(() => { fetchNotifications() }, [])

  const filtered = filter === "unread" ? notifications.filter(n => !n.is_read) : notifications
  const grouped  = groupByDate(filtered)

  const TABS: { id: "all" | "unread"; label: string }[] = [
    { id: "all",    label: "All"    },
    { id: "unread", label: "Unread" },
  ]

  function handleExport() {
    if (!notifications.length) return
    const rows = [
      ["ID", "Type", "Title", "Message", "Read", "Date"],
      ...notifications.map(n => [
        n.id, n.type,
        `"${n.title.replace(/"/g, '""')}"`,
        `"${n.message.replace(/"/g, '""')}"`,
        n.is_read ? "Yes" : "No",
        fmtDate(n.created_at),
      ]),
    ]
    const csv  = rows.map(r => r.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement("a")
    a.href     = url
    a.download = `notifications-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <style>{`
        @keyframes np-pulse { 0%,100%{opacity:.4} 50%{opacity:.8} }
      `}</style>

      <div style={{
        minHeight: "100vh", background: "#06060f",
        padding: isMobile ? "20px 16px 48px" : "32px 32px 56px",
        fontFamily: "'DM Sans',sans-serif",
      }}>

        {/* ── Header ── */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 14, marginBottom: 28 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12, flexShrink: 0, position: "relative",
                background: "linear-gradient(135deg,rgba(99,102,241,0.25),rgba(139,92,246,0.12))",
                border: "1px solid rgba(99,102,241,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Bell size={18} color="#818cf8" />
                {unreadCount > 0 && (
                  <div style={{
                    position: "absolute", top: -5, right: -5,
                    minWidth: 18, height: 18, borderRadius: 9,
                    background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                    border: "2px solid #06060f",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 9, fontWeight: 800, color: "#fff", padding: "0 4px",
                    boxShadow: "0 0 10px rgba(99,102,241,0.6)",
                  }}>
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </div>
                )}
              </div>
              <h1 style={{ fontSize: isMobile ? 22 : 26, fontWeight: 800, fontFamily: "'Syne',sans-serif", color: "#e2e8f0", margin: 0, letterSpacing: "-0.5px" }}>
                Notifications
              </h1>
            </div>
            <p style={{ fontSize: 13, color: "#4b5563", margin: 0 }}>
              {isAdmin
                ? "New reports and claims from users"
                : unreadCount > 0
                  ? `${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`
                  : "You're all caught up"}
            </p>
          </div>

          {/* Buttons */}
          <div style={{ display: "flex", gap: 8 }}>
            {!isMobile && (
              <motion.button
                whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
                onClick={handleExport}
                style={{
                  display: "flex", alignItems: "center", gap: 7,
                  padding: "9px 16px", borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "rgba(255,255,255,0.04)",
                  fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.55)",
                  cursor: notifications.length ? "pointer" : "not-allowed",
                  fontFamily: "'DM Sans',sans-serif",
                  opacity: notifications.length ? 1 : 0.4,
                }}
              >
                <Download size={13} />Export
              </motion.button>
            )}
            {unreadCount > 0 && (
              <motion.button
                whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
                onClick={markAllRead}
                style={{
                  display: "flex", alignItems: "center", gap: 7,
                  padding: "9px 16px", borderRadius: 10,
                  border: "1px solid rgba(99,102,241,0.25)",
                  background: "rgba(99,102,241,0.08)",
                  fontSize: 13, fontWeight: 600, color: "#818cf8",
                  cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
                }}
              >
                <CheckCheck size={13} />
                {!isMobile && "Mark all read"}
              </motion.button>
            )}
            <motion.button
              whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
              onClick={fetchNotifications}
              disabled={loading}
              style={{
                display: "flex", alignItems: "center", gap: 7,
                padding: "9px 16px", borderRadius: 10, border: "none",
                background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                fontSize: 13, fontWeight: 600,
                color: loading ? "rgba(255,255,255,0.4)" : "#fff",
                cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "'DM Sans',sans-serif",
                boxShadow: "0 4px 16px rgba(99,102,241,0.3)",
                opacity: loading ? 0.7 : 1,
              }}
            >
              <motion.div
                animate={loading ? { rotate: 360 } : {}}
                transition={{ duration: 1, repeat: loading ? Infinity : 0, ease: "linear" }}
                style={{ display: "flex" }}
              >
                <RefreshCw size={13} />
              </motion.div>
              {!isMobile && "Refresh"}
            </motion.button>
          </div>
        </div>

        {/* ── Error ── */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ marginBottom: 20, padding: "12px 16px", borderRadius: 12, background: "rgba(248,113,113,0.07)", border: "1px solid rgba(248,113,113,0.2)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <AlertTriangle size={14} color="#f87171" />
                <span style={{ fontSize: 13, color: "#f87171" }}>{error}</span>
              </div>
              <button onClick={clearError} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                <X size={14} color="#f87171" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Stats ── */}
        {!loading && notifications.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(4,1fr)", gap: 10, marginBottom: 24 }}
          >
            {([
              { label: "Total",   value: notifications.length,                                                                      color: "#a5b4fc" },
              { label: "Unread",  value: unreadCount,                                                                                color: "#818cf8" },
              { label: "Today",   value: notifications.filter(n => Date.now() - new Date(n.created_at).getTime() < 86_400_000).length, color: "#fb923c" },
              { label: isAdmin ? "Pending" : "Actions",
                value: isAdmin
                  ? notifications.filter(n => ["new_report","new_claim"].includes(n.type) && !n.is_read).length
                  : notifications.filter(n => ["claim_approved","claim_rejected","matched"].includes(n.type)).length,
                color: "#34d399" },
            ] as { label: string; value: number; color: string }[]).map(({ label, value, color }, i) => (
              <motion.div key={label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                style={{ padding: "14px 16px", borderRadius: 14, border: `1px solid ${color}22`, background: `${color}0a`, textAlign: "center" }}
              >
                <div style={{ fontSize: 28, fontWeight: 800, color, fontFamily: "'Syne',sans-serif", lineHeight: 1 }}>{value}</div>
                <div style={{ fontSize: 10, color: "#374151", marginTop: 5, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8 }}>{label}</div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* ── Filter tabs ── */}
        {!loading && notifications.length > 0 && (
          <div style={{ display: "flex", gap: 6, marginBottom: 24, padding: "4px", borderRadius: 12, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", width: "fit-content" }}>
            {TABS.map(tab => {
              const active = filter === tab.id
              const count  = tab.id === "unread"
                ? notifications.filter(n => !n.is_read).length
                : notifications.length
              return (
                <motion.button
                  key={tab.id}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setFilter(tab.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "7px 14px", borderRadius: 9, border: "none",
                    background: active ? "rgba(99,102,241,0.15)" : "transparent",
                    boxShadow: active ? "inset 0 0 0 1px rgba(99,102,241,0.3)" : "none",
                    cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
                    fontSize: 12, fontWeight: active ? 700 : 500,
                    color: active ? "#a5b4fc" : "#4b5563",
                    transition: "all 0.18s",
                  }}
                >
                  {tab.id === "unread" ? <Bell size={11} /> : <CheckCheck size={11} />}
                  {tab.label}
                  {count > 0 && (
                    <span style={{
                      padding: "1px 6px", borderRadius: 20,
                      background: active ? "rgba(99,102,241,0.25)" : "rgba(255,255,255,0.06)",
                      fontSize: 10, fontWeight: 700,
                      color: active ? "#a5b4fc" : "#374151",
                    }}>
                      {count}
                    </span>
                  )}
                </motion.button>
              )
            })}
          </div>
        )}

        {/* ── Content ── */}
        {loading ? (
          <div style={{ padding: "8px 16px", borderRadius: 16, border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.01)" }}>
            {Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)}
          </div>

        ) : notifications.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            style={{ textAlign: "center", padding: "80px 24px", borderRadius: 20, border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.01)" }}
          >
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              style={{ width: 68, height: 68, borderRadius: 20, margin: "0 auto 22px", background: "rgba(99,102,241,0.07)", border: "1px solid rgba(99,102,241,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <Inbox size={28} color="#374151" />
            </motion.div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#374151", fontFamily: "'Syne',sans-serif", marginBottom: 10 }}>
              No notifications yet
            </div>
            <div style={{ fontSize: 13, color: "#1f2937", maxWidth: 320, margin: "0 auto", lineHeight: 1.65 }}>
              {isAdmin
                ? "You'll see new report and claim alerts here as users submit them."
                : "You'll be notified here when your reports are matched, claims are reviewed, and more."}
            </div>
          </motion.div>

        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ textAlign: "center", padding: "60px 24px", borderRadius: 16, border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.01)" }}
          >
            <CheckCheck size={26} color="#374151" style={{ marginBottom: 14 }} />
            <div style={{ fontSize: 16, fontWeight: 700, color: "#374151", fontFamily: "'Syne',sans-serif", marginBottom: 8 }}>All caught up!</div>
            <div style={{ fontSize: 13, color: "#1f2937" }}>You have no unread notifications.</div>
          </motion.div>

        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            <AnimatePresence>
              {grouped.map(({ label, items }) => (
                <motion.div key={label} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  {/* Date group header */}
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: 1.5, whiteSpace: "nowrap" }}>
                      {label}
                    </span>
                    <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.05)" }} />
                    <span style={{ fontSize: 11, color: "#1f2937", whiteSpace: "nowrap" }}>
                      {items.length} {items.length === 1 ? "item" : "items"}
                    </span>
                  </div>

                  {/* Rows */}
                  <div style={{ borderRadius: 16, border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.01)", overflow: "hidden", padding: "8px", display: "flex", flexDirection: "column", gap: 4 }}>
                    {items.map((notif, i) => (
                      <NotifRow
                        key={notif.id}
                        notif={notif}
                        onRead={markRead}
                        index={i}
                        isAdmin={isAdmin}
                      />
                    ))}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </>
  )
}