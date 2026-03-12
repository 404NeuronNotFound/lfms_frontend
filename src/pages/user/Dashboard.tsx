import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion, easeOut } from "framer-motion"
import { useUserDashboardStore } from "@/store/userDashboardStore"
import {
  Tag, PackageSearch, CheckCircle, Clock, Bell,
  ClipboardList, ArrowRight, RefreshCw, AlertTriangle,
  Loader2, MapPin, Calendar, FileText, ShieldCheck,
  Zap, TrendingUp, Star,
} from "lucide-react"
import type {
  UserDashboardReport,
  UserDashboardClaim,
  UserDashboardNotif,
} from "@/types/userDashboardTypes"

// ── Helpers ────────────────────────────────────────────────────────────────
function timeAgo(iso: string) {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (m < 1)    return "Just now"
  if (m < 60)   return `${m}m ago`
  if (m < 1440) return `${Math.floor(m / 60)}h ago`
  return `${Math.floor(m / 1440)}d ago`
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
}

const fade = (delay = 0) => ({
  initial:    { opacity: 0, y: 14 },
  animate:    { opacity: 1, y: 0  },
  transition: { delay, duration: 0.38, ease: easeOut },
})

// ── Skeleton ───────────────────────────────────────────────────────────────
function Skel({ w = "100%", h = 13, r = 7 }: { w?: string | number; h?: number; r?: number }) {
  return <div style={{ width: w, height: h, borderRadius: r, background: "rgba(255,255,255,0.08)", flexShrink: 0 }} />
}

// ── Status pill ────────────────────────────────────────────────────────────
function StatusPill({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; border: string; label: string }> = {
    open:         { bg: "rgba(99,102,241,0.1)",  color: "#818cf8", border: "rgba(99,102,241,0.25)",  label: "Open"         },
    under_review: { bg: "rgba(99,102,241,0.08)", color: "#a5b4fc", border: "rgba(99,102,241,0.2)",   label: "In Review"    },
    matched:      { bg: "rgba(16,185,129,0.1)",  color: "#34d399", border: "rgba(16,185,129,0.25)",  label: "Matched"      },
    claimed:      { bg: "rgba(52,211,153,0.12)", color: "#6ee7b7", border: "rgba(52,211,153,0.25)",  label: "Claimed"      },
    closed:       { bg: "rgba(107,114,128,0.1)", color: "#9ca3af", border: "rgba(107,114,128,0.2)",  label: "Closed"       },
    rejected:     { bg: "rgba(239,68,68,0.1)",   color: "#f87171", border: "rgba(239,68,68,0.2)",    label: "Rejected"     },
    pending:      { bg: "rgba(245,158,11,0.12)", color: "#fbbf24", border: "rgba(245,158,11,0.25)",  label: "Pending"      },
    approved:     { bg: "rgba(52,211,153,0.12)", color: "#34d399", border: "rgba(52,211,153,0.25)",  label: "Approved"     },
  }
  const c = map[status] ?? map.open
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 9px", borderRadius: 20, background: c.bg, border: `1px solid ${c.border}`, fontSize: 10, fontWeight: 700, color: c.color, letterSpacing: 0.3, whiteSpace: "nowrap" }}>
      {c.label}
    </span>
  )
}

// ── Type chip ─────────────────────────────────────────────────────────────
function TypeChip({ type }: { type: "lost" | "found" }) {
  const lost = type === "lost"
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 7px", borderRadius: 6, background: lost ? "rgba(99,102,241,0.1)" : "rgba(16,185,129,0.1)", border: `1px solid ${lost ? "rgba(99,102,241,0.22)" : "rgba(16,185,129,0.22)"}`, fontSize: 10, fontWeight: 700, color: lost ? "#818cf8" : "#34d399", letterSpacing: 0.4 }}>
      {lost ? <Tag size={9} /> : <PackageSearch size={9} />}
      {lost ? "LOST" : "FOUND"}
    </span>
  )
}

// ── Notif type colors ──────────────────────────────────────────────────────
function notifColor(type: string) {
  if (type.includes("claim_approved") || type === "matched") return "#34d399"
  if (type.includes("rejected"))                              return "#f87171"
  if (type.includes("claim"))                                 return "#f59e0b"
  return "#818cf8"
}

// ── Avatar ─────────────────────────────────────────────────────────────────
function Avatar({ name, avatar, size = 44 }: { name: string; avatar: string | null; size?: number }) {
  const initials = name.split(" ").map(p => p[0]).slice(0, 2).join("").toUpperCase()
  if (avatar)
    return <img src={avatar} alt={initials} style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: "2px solid rgba(99,102,241,0.3)" }} />
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: Math.round(size * 0.32), fontWeight: 700, color: "white", flexShrink: 0, border: "2px solid rgba(99,102,241,0.3)" }}>
      {initials}
    </div>
  )
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export default function UserDashboard() {
  const navigate = useNavigate()
  const { data, loading, error, fetch, clearError } = useUserDashboardStore()

  useEffect(() => { fetch() }, [])

  const user    = data?.user
  const stats   = data?.stats
  const reports = data?.recent_reports ?? []
  const claims  = data?.recent_claims  ?? []
  const notifs  = data?.recent_notifs  ?? []

  const now = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })

  // Stat cards config
  const STAT_CARDS = [
    { label: "My Reports",     value: stats?.total_reports,   color: "#6366f1", icon: FileText,     sub: `${stats?.reports_this_month ?? 0} this month`,  href: "/user-my-reports"    },
    { label: "Active",         value: stats?.open_reports,    color: "#f59e0b", icon: Clock,        sub: "open / in review",                               href: "/user-my-reports"    },
    { label: "Matched",        value: stats?.matched_reports, color: "#34d399", icon: TrendingUp,   sub: "potential matches",                              href: "/user-my-reports"    },
    { label: "My Claims",      value: stats?.total_claims,    color: "#8b5cf6", icon: ClipboardList,sub: `${stats?.pending_claims ?? 0} pending`,          href: "/user-my-claims"     },
    { label: "Notifications",  value: stats?.unread_notifs,   color: "#0ea5e9", icon: Bell,        sub: "unread alerts",                                   href: "/user-notifications" },
  ]

  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif", color: "#fff", minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
        @keyframes ud-spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        .ud-card { background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.07); border-radius:18px; }
        .ud-row { transition:background 0.14s; cursor:pointer; border-radius:10px; }
        .ud-row:hover { background:rgba(99,102,241,0.06); }
        .ud-stat { transition:border-color 0.2s, transform 0.2s; cursor:pointer; }
        .ud-stat:hover { border-color:rgba(99,102,241,0.35) !important; transform:translateY(-2px); }
        ::-webkit-scrollbar { width:3px; }
        ::-webkit-scrollbar-thumb { background:rgba(99,102,241,0.3); border-radius:2px; }
      `}</style>

      {/* ── Header ── */}
      <motion.div {...fade(0)} style={{ marginBottom: 30 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {/* Avatar */}
            {loading
              ? <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
              : <Avatar name={user?.full_name ?? "?"} avatar={user?.avatar ?? null} size={52} />
            }
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#34d399", boxShadow: "0 0 7px #34d399" }} />
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.38)" }}>{now}</span>
              </div>
              {loading
                ? <><Skel w={220} h={26} r={8} /><div style={{ marginTop: 7 }}><Skel w={160} h={13} /></div></>
                : <>
                    <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.8px", margin: 0, fontFamily: "'Syne',sans-serif" }}>
                      Hey, {user?.first_name || user?.username} ✦
                    </h1>
                    <p style={{ fontSize: 13, color: "rgba(255,255,255,0.38)", margin: "3px 0 0" }}>
                      Member since {fmtDate(user?.date_joined ?? new Date().toISOString())}
                    </p>
                  </>
              }
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/user-report-lost")}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 10, border: "1px solid rgba(99,102,241,0.3)", background: "rgba(99,102,241,0.1)", fontSize: 13, fontWeight: 600, color: "#a5b4fc", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
              <Tag size={13} /> Report Lost
            </motion.button>
            <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/user-report-found")}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#10b981,#059669)", fontSize: 13, fontWeight: 600, color: "#fff", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", boxShadow: "0 4px 14px rgba(16,185,129,0.3)" }}>
              <PackageSearch size={13} /> Report Found
            </motion.button>
            <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
              onClick={fetch} disabled={loading}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", fontSize: 13, color: "rgba(255,255,255,0.5)", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
              {loading
                ? <Loader2 size={14} style={{ animation: "ud-spin 1s linear infinite" }} />
                : <RefreshCw size={14} />}
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* ── Error ── */}
      {error && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderRadius: 12, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", marginBottom: 20 }}>
          <AlertTriangle size={14} color="#f87171" />
          <span style={{ fontSize: 13, color: "#f87171", flex: 1 }}>{error}</span>
          <button onClick={() => { clearError(); fetch() }}
            style={{ fontSize: 12, color: "#f87171", background: "none", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 7, padding: "4px 10px", cursor: "pointer" }}>Retry</button>
        </motion.div>
      )}

      {/* ── Stat Cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(148px,1fr))", gap: 12, marginBottom: 24 }}>
        {STAT_CARDS.map((s, i) => (
          <motion.div key={i} {...fade(i * 0.06)}
            className="ud-card ud-stat"
            onClick={() => navigate(s.href)}
            style={{ padding: "18px 20px", position: "relative", overflow: "hidden", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div style={{ position: "absolute", top: -20, right: -20, width: 70, height: 70, borderRadius: "50%", background: `${s.color}18`, pointerEvents: "none" }} />
            <div style={{ width: 32, height: 32, borderRadius: 9, background: `${s.color}18`, border: `1px solid ${s.color}28`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
              <s.icon size={15} color={s.color} />
            </div>
            {loading
              ? <><Skel w="55%" h={26} r={7} /><div style={{ marginTop: 7 }}><Skel w="70%" h={11} /></div></>
              : <>
                  <div style={{ fontSize: 24, fontWeight: 800, color: "#fff", lineHeight: 1, marginBottom: 3, fontFamily: "'Syne',sans-serif" }}>
                    {s.value ?? 0}
                  </div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", fontWeight: 500 }}>{s.label}</div>
                  <div style={{ fontSize: 11, color: s.color, marginTop: 2, fontWeight: 500 }}>{s.sub}</div>
                </>
            }
          </motion.div>
        ))}
      </div>

      {/* ── Main grid ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 14 }}>

        {/* ── Left: Recent Reports ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <motion.div {...fade(0.2)} className="ud-card" style={{ padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 2, fontFamily: "'Syne',sans-serif" }}>My Recent Reports</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>Your latest submissions</div>
              </div>
              <motion.button whileHover={{ x: 2 }} onClick={() => navigate("/user-my-reports")}
                style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#818cf8", background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 8, padding: "5px 11px", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
                View all <ArrowRight size={12} />
              </motion.button>
            </div>

            {/* Table header */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 110px 80px 70px", gap: 12, padding: "7px 12px", background: "rgba(255,255,255,0.02)", borderRadius: 8, marginBottom: 4 }}>
              {["Item", "Status", "Location", "Date"].map((h, i) => (
                <div key={i} style={{ fontSize: 10, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: 1 }}>{h}</div>
              ))}
            </div>

            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 110px 80px 70px", gap: 12, padding: "12px 12px", borderBottom: "1px solid rgba(255,255,255,0.04)", alignItems: "center" }}>
                    <div><Skel w="75%" h={13} /><div style={{ marginTop: 5 }}><Skel w="50%" h={10} /></div></div>
                    <Skel w={70} h={20} r={20} />
                    <Skel w={60} h={11} />
                    <Skel w={50} h={11} />
                  </div>
                ))
              : reports.length === 0
                ? (
                  <div style={{ textAlign: "center", padding: "36px 0" }}>
                    <div style={{ fontSize: 32, marginBottom: 10 }}>📭</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#6b7280", marginBottom: 6 }}>No reports yet</div>
                    <div style={{ fontSize: 12, color: "#374151", marginBottom: 18 }}>Start by reporting a lost or found item</div>
                    <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                      <button onClick={() => navigate("/report-lost")}
                        style={{ padding: "8px 16px", borderRadius: 9, border: "1px solid rgba(99,102,241,0.3)", background: "rgba(99,102,241,0.1)", fontSize: 12, color: "#a5b4fc", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>Report Lost</button>
                      <button onClick={() => navigate("/report-found")}
                        style={{ padding: "8px 16px", borderRadius: 9, border: "none", background: "linear-gradient(135deg,#10b981,#059669)", fontSize: 12, color: "#fff", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>Report Found</button>
                    </div>
                  </div>
                )
                : reports.map((r: UserDashboardReport, i: number) => (
                    <motion.div key={r.id}
                      initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                      className="ud-row"
                      onClick={() => navigate("/user-my-reports")}
                      style={{ display: "grid", gridTemplateColumns: "1fr 110px 80px 70px", gap: 12, padding: "12px 12px", borderBottom: i < reports.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none", alignItems: "center" }}>
                      {/* Item */}
                      <div style={{ minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3, flexWrap: "wrap" }}>
                          {r.is_urgent && (
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 3, padding: "1px 5px", borderRadius: 20, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.22)", fontSize: 9, fontWeight: 700, color: "#f87171" }}>
                              <Zap size={8} />URG
                            </span>
                          )}
                          <TypeChip type={r.report_type} />
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0", fontFamily: "'Syne',sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {r.item_name}
                        </div>
                        {r.match_score !== null && (
                          <div style={{ fontSize: 10, color: "#a78bfa", marginTop: 2, fontWeight: 600 }}>
                            ✦ {r.match_score}% match found
                          </div>
                        )}
                      </div>
                      {/* Status */}
                      <div><StatusPill status={r.status} /></div>
                      {/* Location */}
                      <div style={{ fontSize: 11, color: "#6b7280", display: "flex", alignItems: "center", gap: 3, overflow: "hidden" }}>
                        <MapPin size={9} color="#4b5563" style={{ flexShrink: 0 }} />
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.location}</span>
                      </div>
                      {/* Date */}
                      <div style={{ fontSize: 10, color: "#4b5563" }}>{timeAgo(r.date_reported)}</div>
                    </motion.div>
                  ))
            }
          </motion.div>

          {/* ── Recent Claims ── */}
          <motion.div {...fade(0.28)} className="ud-card" style={{ padding: 22 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 2, fontFamily: "'Syne',sans-serif" }}>My Claims</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>Items you've claimed</div>
              </div>
              <motion.button whileHover={{ x: 2 }} onClick={() => navigate("/user-my-claims")}
                style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#818cf8", background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 8, padding: "5px 11px", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
                View all <ArrowRight size={12} />
              </motion.button>
            </div>

            {loading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <Skel w={36} h={36} r={10} />
                    <div style={{ flex: 1 }}><Skel w="60%" h={13} /><div style={{ marginTop: 5 }}><Skel w="40%" h={10} /></div></div>
                    <Skel w={64} h={20} r={20} />
                  </div>
                ))
              : claims.length === 0
                ? (
                  <div style={{ textAlign: "center", padding: "24px 0" }}>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>📋</div>
                    <div style={{ fontSize: 13, color: "#6b7280" }}>No claims submitted yet</div>
                  </div>
                )
                : claims.map((c: UserDashboardClaim, i: number) => (
                    <motion.div key={c.id}
                      initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                      className="ud-row"
                      onClick={() => navigate("/user-my-claims")}
                      style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 10px", borderBottom: i < claims.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: c.report_type === "found" ? "rgba(16,185,129,0.1)" : "rgba(99,102,241,0.1)", border: `1px solid ${c.report_type === "found" ? "rgba(16,185,129,0.2)" : "rgba(99,102,241,0.2)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {c.report_type === "found" ? <PackageSearch size={15} color="#34d399" /> : <Tag size={15} color="#818cf8" />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0", fontFamily: "'Syne',sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.item_name}</div>
                        <div style={{ fontSize: 11, color: "#4b5563", marginTop: 1 }}>{timeAgo(c.date_submitted)}</div>
                      </div>
                      <StatusPill status={c.status} />
                    </motion.div>
                  ))
            }
          </motion.div>
        </div>

        {/* ── Right column ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Progress card */}
          <motion.div {...fade(0.18)} className="ud-card" style={{ padding: 22 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ fontSize: 15, fontWeight: 700, fontFamily: "'Syne',sans-serif" }}>Activity Summary</div>
              <Star size={15} color="#f59e0b" />
            </div>

            {loading
              ? Array.from({ length: 3 }).map((_, i) => <div key={i} style={{ marginBottom: 14 }}><Skel h={12} w="60%" /><div style={{ marginTop: 6 }}><Skel h={6} r={3} /></div></div>)
              : [
                  { label: "Reports Filed",  val: stats?.total_reports ?? 0,   max: Math.max(stats?.total_reports ?? 1, 1),  color: "#6366f1" },
                  { label: "Items Matched",  val: stats?.matched_reports ?? 0,  max: Math.max(stats?.total_reports ?? 1, 1),  color: "#34d399" },
                  { label: "Claims Approved",val: stats?.approved_claims ?? 0,  max: Math.max(stats?.total_claims ?? 1, 1),   color: "#8b5cf6" },
                ].map((row, i) => (
                  <div key={i} style={{ marginBottom: i < 2 ? 14 : 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                      <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>{row.label}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: row.color }}>{row.val}</span>
                    </div>
                    <div style={{ height: 5, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: row.max > 0 ? `${Math.min(100, (row.val / row.max) * 100)}%` : "0%" }}
                        transition={{ delay: 0.4 + i * 0.1, duration: 0.6, ease: "easeOut" }}
                        style={{ height: "100%", borderRadius: 3, background: row.color }}
                      />
                    </div>
                  </div>
                ))
            }

            {/* Recovery rate */}
            {!loading && (stats?.total_reports ?? 0) > 0 && (
              <div style={{ marginTop: 18, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 12 }}>
                <svg width={48} height={48} viewBox="0 0 48 48">
                  <circle cx="24" cy="24" r="18" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
                  <motion.circle cx="24" cy="24" r="18" fill="none" stroke="url(#ud-grad)" strokeWidth="5"
                    strokeLinecap="round" strokeDasharray="113.1"
                    initial={{ strokeDashoffset: 113.1 }}
                    animate={{ strokeDashoffset: 113.1 * (1 - (stats?.claimed_reports ?? 0) / Math.max(stats?.total_reports ?? 1, 1)) }}
                    transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" }}
                    transform="rotate(-90 24 24)" />
                  <defs>
                    <linearGradient id="ud-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#34d399" />
                    </linearGradient>
                  </defs>
                </svg>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", fontFamily: "'Syne',sans-serif", lineHeight: 1 }}>
                    {stats?.total_reports ? Math.round((stats.claimed_reports / stats.total_reports) * 100) : 0}%
                  </div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>Recovery rate</div>
                </div>
              </div>
            )}
          </motion.div>

          {/* Notifications */}
          <motion.div {...fade(0.26)} className="ud-card" style={{ padding: 22 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ fontSize: 15, fontWeight: 700, fontFamily: "'Syne',sans-serif" }}>Notifications</div>
                {!loading && (stats?.unread_notifs ?? 0) > 0 && (
                  <span style={{ padding: "2px 7px", borderRadius: 20, background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.35)", fontSize: 10, fontWeight: 700, color: "#a5b4fc" }}>
                    {stats?.unread_notifs} new
                  </span>
                )}
              </div>
              <motion.button whileHover={{ x: 2 }} onClick={() => navigate("/user-notifications")}
                style={{ fontSize: 11, color: "#818cf8", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 3, fontFamily: "'DM Sans',sans-serif" }}>
                All <ArrowRight size={11} />
              </motion.button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {loading
                ? Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} style={{ display: "flex", gap: 10, padding: "10px 12px", borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                      <Skel w={8} h={8} r={4} />
                      <div style={{ flex: 1 }}><Skel w="80%" h={12} /><div style={{ marginTop: 5 }}><Skel w="55%" h={10} /></div></div>
                    </div>
                  ))
                : notifs.length === 0
                  ? (
                    <div style={{ textAlign: "center", padding: "20px 0" }}>
                      <Bell size={24} color="#374151" style={{ marginBottom: 8 }} />
                      <div style={{ fontSize: 13, color: "#6b7280" }}>All caught up!</div>
                    </div>
                  )
                  : notifs.map((n: UserDashboardNotif, i: number) => {
                      const color = notifColor(n.type)
                      return (
                        <motion.div key={n.id}
                          initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                          className="ud-row"
                          onClick={() => navigate("/user-notifications")}
                          style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 12px", borderRadius: 10, background: n.is_read ? "rgba(255,255,255,0.02)" : "rgba(99,102,241,0.05)", border: `1px solid ${n.is_read ? "rgba(255,255,255,0.05)" : "rgba(99,102,241,0.15)"}` }}>
                          <span style={{ width: 7, height: 7, borderRadius: "50%", background: n.is_read ? "#374151" : color, boxShadow: n.is_read ? "none" : `0 0 6px ${color}`, marginTop: 4, flexShrink: 0 }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 12, fontWeight: n.is_read ? 500 : 700, color: n.is_read ? "#9ca3af" : "#e2e8f0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{n.title}</div>
                            <div style={{ fontSize: 11, color: "#4b5563", marginTop: 2 }}>{timeAgo(n.created_at)}</div>
                          </div>
                        </motion.div>
                      )
                    })
              }
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div {...fade(0.32)} className="ud-card" style={{ padding: 22 }}>
            <div style={{ fontSize: 15, fontWeight: 700, fontFamily: "'Syne',sans-serif", marginBottom: 14 }}>Quick Actions</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { icon: Tag,          label: "Report a Lost Item",  color: "#6366f1", href: "/user-report-lost"          },
                { icon: PackageSearch,label: "Report Found Item",   color: "#10b981", href: "/user-report-found"         },
                { icon: ClipboardList,label: "Browse Found Items",  color: "#8b5cf6", href: "/user-browse-items"          },
                { icon: ShieldCheck,  label: "My Claims",           color: "#0ea5e9", href: "/user-my-claims"       },
                { icon: Bell,         label: "Notifications",        color: "#f59e0b", href: "/user-notifications"   },
              ].map((a, i) => (
                <motion.button key={i} whileHover={{ x: 2 }} whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(a.href)}
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", cursor: "pointer", color: "white", transition: "all 0.18s", textAlign: "left", width: "100%", fontFamily: "'DM Sans',sans-serif" }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = `${a.color}0f`; el.style.borderColor = `${a.color}35` }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = "rgba(255,255,255,0.03)"; el.style.borderColor = "rgba(255,255,255,0.07)" }}>
                  <a.icon size={14} color={a.color} style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: 13, fontWeight: 500, flex: 1 }}>{a.label}</span>
                  <ArrowRight size={12} color="#374151" />
                </motion.button>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  )
}