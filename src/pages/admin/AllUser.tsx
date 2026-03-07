import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Users, Search, Filter, Shield, ShieldCheck, ShieldOff,
  Mail, Phone, MapPin, Calendar, X, Eye, Edit2, Trash2,
  UserCheck, UserX, Download, RefreshCw, Clock,
  SortAsc, SortDesc, TrendingUp, Activity, AlertTriangle,
  Loader2,
} from "lucide-react"

import type { ApiUser, SortField, SortDir, RoleFilter, StatusFilter } from "@/types/userTypes"
import { useUserStore } from "@/store/userStore"

// ── Date helpers ───────────────────────────────────────────────────────────
function formatJoinDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  })
}

function formatJoinShort(iso: string): string {
  const d       = new Date(iso)
  const diffDays = Math.floor((Date.now() - d.getTime()) / 86400000)
  if (diffDays === 0)  return "Today"
  if (diffDays === 1)  return "Yesterday"
  if (diffDays < 7)   return `${diffDays}d ago`
  if (diffDays < 30)  return `${Math.floor(diffDays / 7)}w ago`
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" })
}

function timeAgo(iso: string | null): string {
  if (!iso) return "Never"
  const diffMin = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (diffMin < 1)    return "Just now"
  if (diffMin < 60)   return `${diffMin}m ago`
  if (diffMin < 1440) return `${Math.floor(diffMin / 60)}h ago`
  return `${Math.floor(diffMin / 1440)}d ago`
}

// ── Avatar ─────────────────────────────────────────────────────────────────
function Avatar({ user, size = 38 }: { user: ApiUser; size?: number }) {
  const initials = `${user.first_name?.[0] ?? "?"}${user.last_name?.[0] ?? ""}`.toUpperCase()
  const grads    = [
    "135deg,#6366f1,#8b5cf6",
    "135deg,#0ea5e9,#6366f1",
    "135deg,#8b5cf6,#ec4899",
    "135deg,#10b981,#0ea5e9",
    "135deg,#f59e0b,#ef4444",
  ]
  if (user.profile?.avatar) {
    return (
      <img src={user.profile.avatar} alt={initials}
        style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
    )
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: `linear-gradient(${grads[user.id % grads.length]})`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: Math.round(size * 0.3), fontWeight: 700, color: "white",
      flexShrink: 0, letterSpacing: "-0.5px",
    }}>
      {initials}
    </div>
  )
}

// ── Status badge ───────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; border: string; color: string; dot: string; label: string }> = {
    active:   { bg: "rgba(52,211,153,0.1)",  border: "rgba(52,211,153,0.25)",  color: "#34d399", dot: "#34d399", label: "Active"   },
    inactive: { bg: "rgba(107,114,128,0.1)", border: "rgba(107,114,128,0.2)",  color: "#9ca3af", dot: "#6b7280", label: "Inactive" },
    banned:   { bg: "rgba(239,68,68,0.1)",   border: "rgba(239,68,68,0.25)",   color: "#f87171", dot: "#ef4444", label: "Banned"   },
  }
  const cfg = map[status] ?? map.inactive
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 9px", borderRadius: 20, background: cfg.bg, border: `1px solid ${cfg.border}` }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: cfg.dot, boxShadow: `0 0 5px ${cfg.dot}`, flexShrink: 0 }} />
      <span style={{ fontSize: 11, fontWeight: 600, color: cfg.color, letterSpacing: 0.3 }}>{cfg.label}</span>
    </div>
  )
}

// ── Role badge ─────────────────────────────────────────────────────────────
function RoleBadge({ role }: { role: string }) {
  const isAdmin = role === "ADMIN"
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 9px", borderRadius: 20,
      background: isAdmin ? "rgba(99,102,241,0.12)" : "rgba(255,255,255,0.05)",
      border: isAdmin ? "1px solid rgba(99,102,241,0.3)" : "1px solid rgba(255,255,255,0.08)",
    }}>
      {isAdmin ? <ShieldCheck size={10} color="#818cf8" /> : <Shield size={10} color="#6b7280" />}
      <span style={{ fontSize: 11, fontWeight: 600, color: isAdmin ? "#a5b4fc" : "#9ca3af", letterSpacing: 0.3 }}>
        {isAdmin ? "Admin" : "User"}
      </span>
    </div>
  )
}

// ── Stat card ──────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon: Icon, color, delay = 0, loading }: {
  label: string; value: string | number; sub?: string
  icon: React.ElementType; color: string; delay?: number; loading?: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.3 }}
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "20px 22px", position: "relative", overflow: "hidden" }}
    >
      <div style={{ position: "absolute", top: 0, right: 0, width: 80, height: 80, borderRadius: "50%", background: `radial-gradient(circle, ${color}18 0%, transparent 70%)`, transform: "translate(20px,-20px)" }} />
      <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}18`, border: `1px solid ${color}30`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
        <Icon size={17} color={color} />
      </div>
      {loading
        ? <div style={{ height: 34, display: "flex", alignItems: "center" }}><Loader2 size={18} color={color} style={{ animation: "spin 1s linear infinite" }} /></div>
        : <div className="syne" style={{ fontSize: 28, fontWeight: 800, color: "#ffffff", lineHeight: 1, marginBottom: 4 }}>{value}</div>
      }
      <div style={{ fontSize: 12, color: "#6b7280", marginBottom: sub ? 4 : 0 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color, fontWeight: 500 }}>{sub}</div>}
    </motion.div>
  )
}

// ── Drawer action button ───────────────────────────────────────────────────
function DrawerAction({ icon: Icon, label, color, warn = false, loading = false, onClick }: {
  icon: React.ElementType; label: string; color: string
  warn?: boolean; loading?: boolean; onClick?: () => void
}) {
  return (
    <motion.button whileHover={{ x: 2 }} whileTap={{ scale: 0.98 }}
      onClick={onClick} disabled={loading}
      style={{
        display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
        borderRadius: 10, background: warn ? `${color}10` : "rgba(255,255,255,0.03)",
        border: `1px solid ${warn ? `${color}30` : "rgba(255,255,255,0.07)"}`,
        cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1,
        color: warn ? color : "#c4c9e2",
        fontSize: 13, fontWeight: 500, fontFamily: "'DM Sans',sans-serif",
        width: "100%", textAlign: "left", transition: "all 0.2s",
      }}
      onMouseEnter={e => { if (!loading) { const el = e.currentTarget as HTMLElement; el.style.background = `${color}15`; el.style.borderColor = `${color}40` } }}
      onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = warn ? `${color}10` : "rgba(255,255,255,0.03)"; el.style.borderColor = warn ? `${color}30` : "rgba(255,255,255,0.07)" }}>
      {loading
        ? <Loader2 size={14} color={color} style={{ animation: "spin 1s linear infinite" }} />
        : <Icon    size={14} color={color} />}
      {label}
    </motion.button>
  )
}

// ── User detail drawer ─────────────────────────────────────────────────────
function UserDrawer({ user, onClose }: { user: ApiUser; onClose: () => void }) {
  const { ban, unban, remove, patchLocal } = useUserStore()
  const [actionLoading, setActionLoading]  = useState<string | null>(null)
  const [toast, setToast]                  = useState<{ msg: string; ok: boolean } | null>(null)

  // Keep local copy so the drawer reflects optimistic updates without closing
  const [localUser, setLocalUser] = useState<ApiUser>(user)

  function showToast(msg: string, ok = true) {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3200)
  }

  async function handleBan() {
    setActionLoading("ban")
    const result = await ban(localUser)
    if (result.ok) {
      const updated = { ...localUser, status: "banned" as const }
      setLocalUser(updated)
    }
    showToast(result.message, result.ok)
    setActionLoading(null)
  }

  async function handleUnban() {
    setActionLoading("unban")
    const result = await unban(localUser)
    if (result.ok) {
      const updated = { ...localUser, status: "active" as const }
      setLocalUser(updated)
    }
    showToast(result.message, result.ok)
    setActionLoading(null)
  }

  async function handleDelete() {
    if (!window.confirm(`Delete ${localUser.username}? This cannot be undone.`)) return
    setActionLoading("delete")
    const result = await remove(localUser)
    showToast(result.message, result.ok)
    if (result.ok) setTimeout(onClose, 900)
    else setActionLoading(null)
  }

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div key="bd"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", backdropFilter: "blur(8px)", zIndex: 200 }} />

      {/* Panel */}
      <motion.div key="pn"
        initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 220 }}
        style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 390, background: "rgba(8,8,20,0.99)", borderLeft: "1px solid rgba(255,255,255,0.09)", zIndex: 201, overflowY: "auto", fontFamily: "'DM Sans',sans-serif", color: "white" }}>

        {/* Toast */}
        <AnimatePresence>
          {toast && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              style={{ position: "sticky", top: 0, zIndex: 10, padding: "10px 18px", background: toast.ok ? "rgba(52,211,153,0.12)" : "rgba(239,68,68,0.12)", borderBottom: `1px solid ${toast.ok ? "rgba(52,211,153,0.25)" : "rgba(239,68,68,0.25)"}`, fontSize: 12, color: toast.ok ? "#34d399" : "#f87171", display: "flex", alignItems: "center", gap: 8 }}>
              {toast.ok ? <ShieldCheck size={13} /> : <AlertTriangle size={13} />}
              {toast.msg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sticky header */}
        <div style={{ padding: "22px 24px 18px", position: "sticky", top: 0, background: "rgba(8,8,20,0.98)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.06)", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: "#4b5563", textTransform: "uppercase", letterSpacing: 1.5 }}>User Detail</span>
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={onClose}
              style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <X size={14} color="rgba(255,255,255,0.5)" />
            </motion.button>
          </div>

          {/* Profile hero */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ position: "relative" }}>
              <Avatar user={localUser} size={56} />
              <span style={{
                position: "absolute", bottom: 1, right: 1, width: 12, height: 12, borderRadius: "50%",
                background: localUser.status === "active" ? "#34d399" : localUser.status === "banned" ? "#ef4444" : "#6b7280",
                border: "2px solid #080814",
              }} />
            </div>
            <div>
              <div className="syne" style={{ fontSize: 17, fontWeight: 800, color: "#ffffff" }}>
                {localUser.first_name} {localUser.last_name}
              </div>
              <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>@{localUser.username}</div>
              <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                <RoleBadge role={localUser.role} />
                <StatusBadge status={localUser.status} />
              </div>
            </div>
          </div>
        </div>

        <div style={{ padding: "20px 24px" }}>

          {/* Mini stats */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
            {[
              { label: "Reports Filed", value: localUser.reports, color: "#6366f1" },
              { label: "Claims Made",   value: localUser.claims,  color: "#8b5cf6" },
            ].map((s, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "14px 16px" }}>
                <div className="syne" style={{ fontSize: 22, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 11, color: "#6b7280", marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Contact info */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#4b5563", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 10 }}>Contact Info</div>
            {[
              { icon: Mail,     label: "Email",       value: localUser.email                        },
              { icon: Phone,    label: "Phone",        value: localUser.profile?.phone_number        },
              { icon: MapPin,   label: "Location",     value: localUser.profile?.address             },
              { icon: Calendar, label: "Member Since", value: formatJoinDate(localUser.date_joined)  },
              { icon: Clock,    label: "Last Login",   value: timeAgo(localUser.last_login)          },
            ].map((row, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 12, padding: "10px 0",
                borderBottom: i < 4 ? "1px solid rgba(255,255,255,0.05)" : "none",
                opacity: row.value ? 1 : 0.38,
              }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <row.icon size={13} color="#818cf8" />
                </div>
                <div>
                  <div style={{ fontSize: 10, color: "#4b5563", marginBottom: 1, textTransform: "uppercase", letterSpacing: 0.5 }}>{row.label}</div>
                  <div style={{ fontSize: 13, color: row.value ? "#e2e8f0" : "#4b5563" }}>{row.value ?? "Not provided"}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Bio */}
          {localUser.profile?.bio && (
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#4b5563", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8 }}>Bio</div>
              <div style={{ fontSize: 13, color: "#8b92b8", lineHeight: 1.7, padding: "12px 14px", borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", fontStyle: "italic" }}>
                "{localUser.profile.bio}"
              </div>
            </div>
          )}

          {/* Admin actions */}
          <div style={{ fontSize: 10, fontWeight: 700, color: "#4b5563", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 10 }}>Admin Actions</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <DrawerAction icon={Edit2} label="Edit User Profile" color="#6366f1" />
            <DrawerAction icon={Mail}  label="Send Message"      color="#0ea5e9" />
            {localUser.status !== "banned"
              ? <DrawerAction icon={UserX}    label="Ban User"    color="#f59e0b" warn loading={actionLoading === "ban"}   onClick={handleBan}   />
              : <DrawerAction icon={UserCheck}label="Unban User"  color="#34d399"       loading={actionLoading === "unban"} onClick={handleUnban} />
            }
            <DrawerAction icon={Trash2} label="Delete Account" color="#ef4444" warn loading={actionLoading === "delete"} onClick={handleDelete} />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

// ── Pagination button ──────────────────────────────────────────────────────
function PageBtn({ label, onClick, active, disabled }: {
  label: string; onClick: () => void; active?: boolean; disabled?: boolean
}) {
  return (
    <motion.button whileTap={!disabled ? { scale: 0.93 } : {}} onClick={onClick} disabled={disabled}
      style={{
        minWidth: 32, height: 32, padding: "0 8px", borderRadius: 8,
        border:     active ? "1px solid rgba(99,102,241,0.5)" : "1px solid rgba(255,255,255,0.08)",
        background: active ? "rgba(99,102,241,0.2)"           : "rgba(255,255,255,0.03)",
        fontSize: 13, fontWeight: active ? 700 : 400,
        color:    active ? "#a5b4fc" : disabled ? "#2d2d3d" : "rgba(255,255,255,0.5)",
        cursor: disabled ? "not-allowed" : "pointer",
        fontFamily: "'DM Sans',sans-serif", transition: "all 0.15s",
      }}>
      {label}
    </motion.button>
  )
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  MAIN PAGE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export default function AllUsers() {
  const { users, stats, loading, statsLoading, error, refresh, clearError } = useUserStore()

  const [search,       setSearch]       = useState("")
  const [roleFilter,   setRoleFilter]   = useState<RoleFilter>("all")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [sortField,    setSortField]    = useState<SortField>("date_joined")
  const [sortDir,      setSortDir]      = useState<SortDir>("desc")
  const [selectedUser, setSelectedUser] = useState<ApiUser | null>(null)
  const [showFilters,  setShowFilters]  = useState(false)
  const [page,         setPage]         = useState(1)
  const PER_PAGE = 8

  useEffect(() => { refresh() }, [])

  // ── Filter + sort ──────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = [...users]
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(u =>
        `${u.first_name} ${u.last_name} ${u.username} ${u.email}`.toLowerCase().includes(q)
      )
    }
    if (roleFilter   !== "all") list = list.filter(u => u.role   === roleFilter)
    if (statusFilter !== "all") list = list.filter(u => u.status === statusFilter)

    list.sort((a, b) => {
      let av: any, bv: any
      if      (sortField === "name")        { av = a.first_name;  bv = b.first_name  }
      else if (sortField === "date_joined") { av = a.date_joined; bv = b.date_joined }
      else if (sortField === "reports")     { av = a.reports;     bv = b.reports     }
      else                                  { av = a.role;        bv = b.role        }
      if (av < bv) return sortDir === "asc" ? -1 :  1
      if (av > bv) return sortDir === "asc" ?  1 : -1
      return 0
    })
    return list
  }, [users, search, roleFilter, statusFilter, sortField, sortDir])

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  function toggleSort(field: SortField) {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc")
    else { setSortField(field); setSortDir("asc") }
    setPage(1)
  }

  function SortIcon({ field }: { field: SortField }) {
    if (sortField !== field) return <SortAsc  size={11} color="rgba(255,255,255,0.18)" />
    return sortDir === "asc"
      ? <SortAsc  size={11} color="#818cf8" />
      : <SortDesc size={11} color="#818cf8" />
  }

  const activeFilterCount = (roleFilter !== "all" ? 1 : 0) + (statusFilter !== "all" ? 1 : 0)

  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif", color: "#ffffff", minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        .syne { font-family:'Syne',sans-serif !important; }
        .user-row { transition: background 0.14s; cursor: pointer; }
        .user-row:hover { background: rgba(99,102,241,0.06) !important; }
        .filter-pill { transition: all 0.18s; cursor: pointer; }
        .col-sort { cursor: pointer; user-select: none; transition: color 0.15s; }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.3); border-radius: 4px; }
      `}</style>

      {/* Drawer */}
      {selectedUser && (
        <UserDrawer user={selectedUser} onClose={() => setSelectedUser(null)} />
      )}

      {/* ── Page header ── */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Users size={17} color="#818cf8" />
              </div>
              <h1 className="syne" style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.8px", color: "#ffffff", margin: 0 }}>
                All Users
              </h1>
            </div>
            <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>
              Manage accounts, roles, and access across Findify
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
              style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 16px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.55)", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
              <Download size={13} /> Export
            </motion.button>
            <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
              onClick={refresh} disabled={loading}
              style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 16px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", fontSize: 13, fontWeight: 600, color: "#ffffff", cursor: loading ? "not-allowed" : "pointer", fontFamily: "'DM Sans',sans-serif", boxShadow: "0 4px 16px rgba(99,102,241,0.3)", opacity: loading ? 0.7 : 1, transition: "opacity 0.2s" }}>
              {loading
                ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} />
                : <RefreshCw size={13} />}
              Refresh
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* ── Error banner ── */}
      {error && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderRadius: 12, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", marginBottom: 20 }}>
          <AlertTriangle size={15} color="#f87171" />
          <span style={{ fontSize: 13, color: "#f87171" }}>{error}</span>
          <button onClick={() => { clearError(); refresh() }}
            style={{ marginLeft: "auto", fontSize: 12, color: "#f87171", background: "none", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 7, padding: "4px 10px", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
            Retry
          </button>
        </motion.div>
      )}

      {/* ── Stat cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(152px,1fr))", gap: 12, marginBottom: 24 }}>
        <StatCard icon={Users}      label="Total Users"    value={stats?.total          ?? "—"} sub="All accounts"     color="#6366f1" delay={0}    loading={statsLoading} />
        <StatCard icon={ShieldCheck}label="Administrators" value={stats?.admins         ?? "—"} sub="Full access"      color="#8b5cf6" delay={0.06} loading={statsLoading} />
        <StatCard icon={Activity}   label="Active"         value={stats?.active         ?? "—"} sub="Currently active" color="#34d399" delay={0.12} loading={statsLoading} />
        <StatCard icon={ShieldOff}  label="Banned"         value={stats?.banned         ?? "—"} sub="Access revoked"   color="#ef4444" delay={0.18} loading={statsLoading} />
        <StatCard icon={TrendingUp} label="New This Month" value={stats?.new_this_month ?? "—"} sub="Recent sign-ups"  color="#0ea5e9" delay={0.24} loading={statsLoading} />
      </div>

      {/* ── Toolbar ── */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "14px 16px", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          {/* Search */}
          <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
            <Search size={14} color="#6b7280" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
            <input
              placeholder="Search name, username or email…"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              style={{ width: "100%", background: "#10101e", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 10, padding: "9px 36px 9px 36px", fontSize: 13, color: "#ffffff", outline: "none", fontFamily: "'DM Sans',sans-serif", boxSizing: "border-box", transition: "border-color 0.2s, box-shadow 0.2s" }}
              onFocus={e => { e.currentTarget.style.borderColor = "rgba(99,102,241,0.5)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.1)" }}
              onBlur={e  => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)"; e.currentTarget.style.boxShadow = "none" }}
            />
            {search && (
              <button onClick={() => { setSearch(""); setPage(1) }}
                style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", display: "flex", padding: 0 }}>
                <X size={13} color="#6b7280" />
              </button>
            )}
          </div>

          {/* Filters toggle */}
          <motion.button whileTap={{ scale: 0.96 }} onClick={() => setShowFilters(v => !v)}
            style={{
              display: "flex", alignItems: "center", gap: 6, padding: "9px 14px", borderRadius: 10,
              border:     showFilters ? "1px solid rgba(99,102,241,0.4)" : "1px solid rgba(255,255,255,0.1)",
              background: showFilters ? "rgba(99,102,241,0.12)"          : "rgba(255,255,255,0.04)",
              fontSize: 13, fontWeight: 500, color: showFilters ? "#a5b4fc" : "rgba(255,255,255,0.55)",
              cursor: "pointer", fontFamily: "'DM Sans',sans-serif", whiteSpace: "nowrap", transition: "all 0.2s",
            }}>
            <Filter size={13} />
            Filters
            {activeFilterCount > 0 && (
              <span style={{ width: 16, height: 16, borderRadius: "50%", background: "#6366f1", fontSize: 9, fontWeight: 700, color: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {activeFilterCount}
              </span>
            )}
          </motion.button>

          {/* Count */}
          <div style={{ fontSize: 12, color: "#4b5563", whiteSpace: "nowrap", marginLeft: "auto" }}>
            <span style={{ color: "#6b7280" }}>{loading ? "…" : filtered.length}</span>
            <span> / {loading ? "…" : users.length} users</span>
          </div>
        </div>

        {/* Expandable filter panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.18 }} style={{ overflow: "hidden" }}>
              <div style={{ paddingTop: 14, marginTop: 14, borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", gap: 24, flexWrap: "wrap", alignItems: "flex-end" }}>
                {/* Role */}
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#4b5563", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8 }}>Role</div>
                  <div style={{ display: "flex", gap: 6 }}>
                    {(["all","ADMIN","USER"] as RoleFilter[]).map(r => (
                      <button key={r} onClick={() => { setRoleFilter(r); setPage(1) }}
                        className="filter-pill"
                        style={{ padding: "5px 12px", borderRadius: 8, border: roleFilter === r ? "1px solid rgba(99,102,241,0.4)" : "1px solid rgba(255,255,255,0.1)", background: roleFilter === r ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.04)", fontSize: 12, fontWeight: 500, color: roleFilter === r ? "#a5b4fc" : "rgba(255,255,255,0.5)", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
                        {r === "all" ? "All" : r === "ADMIN" ? "Admin" : "User"}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Status */}
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#4b5563", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8 }}>Status</div>
                  <div style={{ display: "flex", gap: 6 }}>
                    {(["all","active","inactive","banned"] as StatusFilter[]).map(s => (
                      <button key={s} onClick={() => { setStatusFilter(s); setPage(1) }}
                        className="filter-pill"
                        style={{ padding: "5px 12px", borderRadius: 8, border: statusFilter === s ? "1px solid rgba(99,102,241,0.4)" : "1px solid rgba(255,255,255,0.1)", background: statusFilter === s ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.04)", fontSize: 12, fontWeight: 500, color: statusFilter === s ? "#a5b4fc" : "rgba(255,255,255,0.5)", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", textTransform: "capitalize" }}>
                        {s === "all" ? "All" : s}
                      </button>
                    ))}
                  </div>
                </div>
                {activeFilterCount > 0 && (
                  <button onClick={() => { setRoleFilter("all"); setStatusFilter("all"); setPage(1) }}
                    style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 11px", borderRadius: 8, border: "1px solid rgba(239,68,68,0.25)", background: "rgba(239,68,68,0.07)", fontSize: 11, color: "#f87171", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
                    <X size={10} /> Clear
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── Table ── */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, overflow: "hidden" }}>

        {/* Column headers */}
        <div style={{ display: "grid", gridTemplateColumns: "minmax(180px,2fr) minmax(160px,1.5fr) 170px 90px 130px 44px", padding: "11px 20px", borderBottom: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.015)" }}>
          {([
            { label: "User",          field: "name"        },
            { label: "Email",         field: null          },
            { label: "Role / Status", field: "role"        },
            { label: "Reports",       field: "reports"     },
            { label: "Member Since",  field: "date_joined" },
            { label: "",              field: null          },
          ] as { label: string; field: SortField | null }[]).map((col, i) => (
            <div key={i}
              onClick={col.field ? () => toggleSort(col.field as SortField) : undefined}
              className={col.field ? "col-sort" : ""}
              style={{ fontSize: 10, fontWeight: 700, color: sortField === col.field ? "#818cf8" : "#4b5563", textTransform: "uppercase", letterSpacing: 1.2, display: "flex", alignItems: "center", gap: 5 }}>
              {col.label}
              {col.field && <SortIcon field={col.field as SortField} />}
            </div>
          ))}
        </div>

        {/* Loading skeleton */}
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "minmax(180px,2fr) minmax(160px,1.5fr) 170px 90px 130px 44px", padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.04)", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
                <div>
                  <div style={{ width: 120, height: 12, borderRadius: 6, background: "rgba(255,255,255,0.06)", marginBottom: 6 }} />
                  <div style={{ width: 80, height: 10, borderRadius: 6, background: "rgba(255,255,255,0.04)" }} />
                </div>
              </div>
              {[160, 130, 50, 90].map((w, j) => (
                <div key={j} style={{ width: w, height: 12, borderRadius: 6, background: "rgba(255,255,255,0.05)" }} />
              ))}
              <div style={{ width: 28, height: 28, borderRadius: 7, background: "rgba(255,255,255,0.04)" }} />
            </div>
          ))
        ) : paginated.length === 0 ? (
          <div style={{ padding: "60px 20px", textAlign: "center" }}>
            <div style={{ fontSize: 36, marginBottom: 14 }}>🔍</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#6b7280", marginBottom: 6 }}>No users found</div>
            <div style={{ fontSize: 13, color: "#4b5563" }}>Try adjusting your search or filters</div>
          </div>
        ) : (
          paginated.map((user, idx) => (
            <motion.div key={user.id}
              initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.03 }}
              className="user-row"
              onClick={() => setSelectedUser(user)}
              style={{ display: "grid", gridTemplateColumns: "minmax(180px,2fr) minmax(160px,1.5fr) 170px 90px 130px 44px", padding: "13px 20px", borderBottom: idx < paginated.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none", alignItems: "center" }}
            >
              {/* Avatar + name */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                <Avatar user={user} size={36} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {user.first_name} {user.last_name}
                  </div>
                  <div style={{ fontSize: 11, color: "#4b5563", marginTop: 1 }}>@{user.username}</div>
                </div>
              </div>

              {/* Email */}
              <div style={{ fontSize: 12, color: "#6b7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", paddingRight: 12 }}>
                {user.email}
              </div>

              {/* Role + Status */}
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                <RoleBadge role={user.role} />
                <StatusBadge status={user.status} />
              </div>

              {/* Reports / claims */}
              <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: user.reports > 0 ? "#a5b4fc" : "#4b5563" }}>{user.reports}</span>
                {user.claims > 0 && <span style={{ fontSize: 11, color: "#6b7280" }}>/{user.claims}</span>}
              </div>

              {/* Member since */}
              <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <div style={{ fontSize: 12, color: "#9ca3af", display: "flex", alignItems: "center", gap: 5 }}>
                  <Calendar size={10} color="#4b5563" />
                  {new Date(user.date_joined).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </div>
                <div style={{ fontSize: 10, color: "#4b5563" }}>
                  {new Date(user.date_joined).getFullYear()} · {formatJoinShort(user.date_joined)}
                </div>
              </div>

              {/* View button */}
              <div style={{ display: "flex", justifyContent: "center" }} onClick={e => e.stopPropagation()}>
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.92 }}
                  onClick={() => setSelectedUser(user)}
                  style={{ width: 28, height: 28, borderRadius: 7, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                  <Eye size={13} color="#6b7280" />
                </motion.button>
              </div>
            </motion.div>
          ))
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
            <div style={{ fontSize: 12, color: "#4b5563" }}>
              Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}
            </div>
            <div style={{ display: "flex", gap: 5 }}>
              <PageBtn label="←" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} />
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <PageBtn key={p} label={String(p)} onClick={() => setPage(p)} active={p === page} />
              ))}
              <PageBtn label="→" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} />
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}