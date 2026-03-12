import { useEffect } from "react"
import { motion, easeOut } from "framer-motion"
import { useNavigate }       from "react-router-dom"
import { useAuthStore }      from "@/store/authStore"
import { useDashboardStore } from "@/store/dashboardStore"
import {
  PackageSearch, Tag, CheckCircle, Users,
  TrendingUp, Clock, ArrowUp, ArrowDown,
  MapPin, Bell, RefreshCw, Download, Filter,
  Loader2, AlertTriangle, Eye,
} from "lucide-react"
import type { RecentReport, RecentUser, TopLocation, WeeklyDay } from "@/types/dashboardTypes"

// ── Helpers ────────────────────────────────────────────────────────────────
function timeAgo(iso: string) {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (m < 1)    return "Just now"
  if (m < 60)   return `${m}m ago`
  if (m < 1440) return `${Math.floor(m / 60)}h ago`
  return `${Math.floor(m / 1440)}d ago`
}

function statusStyle(status: string) {
  if (status === "claimed")      return { bg: "rgba(52,211,153,0.12)",  color: "#34d399", border: "rgba(52,211,153,0.25)"  }
  if (status === "matched")      return { bg: "rgba(99,102,241,0.12)",  color: "#818cf8", border: "rgba(99,102,241,0.25)"  }
  if (status === "under_review") return { bg: "rgba(99,102,241,0.08)",  color: "#a5b4fc", border: "rgba(99,102,241,0.2)"   }
  if (status === "closed")       return { bg: "rgba(107,114,128,0.12)", color: "#9ca3af", border: "rgba(107,114,128,0.2)"  }
  if (status === "rejected")     return { bg: "rgba(239,68,68,0.1)",    color: "#f87171", border: "rgba(239,68,68,0.2)"    }
  return                                { bg: "rgba(245,158,11,0.12)",  color: "#fbbf24", border: "rgba(245,158,11,0.25)"  }
}

const fade = (delay = 0) => ({
  initial:    { opacity: 0, y: 16 },
  animate:    { opacity: 1, y: 0  },
  transition: { delay, duration: 0.42, ease: easeOut },
})

// ── Skeleton block ─────────────────────────────────────────────────────────
function Skel({ w = "100%", h = 14, r = 8 }: { w?: string | number; h?: number; r?: number }) {
  return <div style={{ width: w, height: h, borderRadius: r, background: "rgba(255,255,255,0.07)", flexShrink: 0 }} />
}

// ── Avatar initials ────────────────────────────────────────────────────────
function UserAvatar({ user }: { user: RecentUser }) {
  const initials = user.full_name.split(" ").map(p => p[0]).slice(0, 2).join("").toUpperCase()
  if (user.avatar)
    return <img src={user.avatar} alt={initials} style={{ width: 34, height: 34, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
  return (
    <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "white", flexShrink: 0 }}>
      {initials}
    </div>
  )
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export default function AdminDashboard() {
  const { user }             = useAuthStore()
  const { data, loading, error, fetch, clearError } = useDashboardStore()
  const navigate = useNavigate()

  useEffect(() => { fetch() }, [])

  const now = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })

  // ── Derived ──────────────────────────────────────────────────────────────
  const stats = data?.stats
  const weekly = data?.weekly_activity ?? []
  const maxBar = Math.max(...weekly.map(d => d.count), 1)
  const locs   = data?.top_locations ?? []
  const maxLoc = Math.max(...locs.map(l => l.count), 1)
  const recentReports = data?.recent_reports ?? []
  const recentUsers   = data?.recent_users   ?? []
  const recoveryRate  = data?.recovery_rate  ?? 0
  const breakdown     = data?.recovery_breakdown
  const totalAll      = data?.total_reports ?? 0

  // circum = 2πr = 2 * π * 28 ≈ 175.9
  const CIRCUM = 175.93
  const dashOffset = CIRCUM * (1 - recoveryRate / 100)

  const STAT_KEYS = ["total_reports", "items_recovered", "pending_claims", "active_users"] as const
  const STAT_ICONS = [Tag, CheckCircle, Clock, Users]
  const STAT_COLORS = ["#6366f1", "#34d399", "#f59e0b", "#a78bfa"]

  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif", color: "white", minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
        .syne { font-family:'Syne',sans-serif; }
        .card { background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.07); border-radius:18px; }
        .btn { display:inline-flex; align-items:center; gap:6px; padding:8px 14px; border-radius:10px; font-size:13px; font-weight:500; cursor:pointer; transition:all 0.2s; border:none; font-family:'DM Sans',sans-serif; }
        .btn-ghost { background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.09)!important; color:rgba(255,255,255,0.6); }
        .btn-ghost:hover { background:rgba(255,255,255,0.09); color:white; }
        .btn-primary { background:linear-gradient(135deg,#6366f1,#8b5cf6); color:white; }
        .btn-primary:hover { box-shadow:0 8px 20px rgba(99,102,241,0.4); transform:translateY(-1px); }
        .tag { display:inline-flex; align-items:center; gap:4px; padding:3px 9px; border-radius:20px; font-size:11px; font-weight:600; letter-spacing:0.3px; }
        .row-hover { transition:background 0.15s; border-radius:10px; }
        .row-hover:hover { background:rgba(255,255,255,0.03); }
        .quick-action { display:flex; align-items:center; gap:10px; padding:10px 12px; border-radius:10px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.07); cursor:pointer; color:white; transition:all 0.2s; text-align:left; width:100%; }
        .quick-action:hover { background:rgba(255,255,255,0.06); border-color:rgba(99,102,241,0.3); }
        @keyframes ad-spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        ::-webkit-scrollbar { width:3px; height:3px; }
        ::-webkit-scrollbar-thumb { background:rgba(99,102,241,0.3); border-radius:2px; }
      `}</style>

      {/* ── Header ── */}
      <motion.div {...fade(0)} style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#34d399", boxShadow: "0 0 8px #34d399", flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{now}</span>
            </div>
            <h1 className="syne" style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-1px", marginBottom: 4, margin: 0 }}>
              Welcome back, {user ?? "Admin"} ✦
            </h1>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", margin: "4px 0 0" }}>
              Here's what's happening across the Findify network today.
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-ghost"><Download size={14} /> Export</button>
            <button className="btn btn-primary" onClick={fetch} disabled={loading}>
              {loading ? <Loader2 size={14} style={{ animation: "ad-spin 1s linear infinite" }} /> : <RefreshCw size={14} />}
              Refresh
            </button>
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
            style={{ fontSize: 12, color: "#f87171", background: "none", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 7, padding: "4px 10px", cursor: "pointer" }}>
            Retry
          </button>
        </motion.div>
      )}

      {/* ── Stat Cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 14, marginBottom: 28 }}>
        {STAT_KEYS.map((key, i) => {
          const s     = stats?.[key]
          const Icon  = STAT_ICONS[i]
          const color = STAT_COLORS[i]
          const up    = (s?.delta_pct ?? 0) >= 0
          return (
            <motion.div key={key} {...fade(i * 0.07)} className="card"
              style={{ padding: 22, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", width: 80, height: 80, borderRadius: "50%", background: `${color}18`, top: -20, right: -20, pointerEvents: "none" }} />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: `${color}18`, border: `1px solid ${color}28`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon size={17} color={color} />
                </div>
                {loading
                  ? <Skel w={48} h={14} />
                  : <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 12, fontWeight: 600, color: up ? "#34d399" : "#f87171" }}>
                      {up ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                      {Math.abs(s?.delta_pct ?? 0)}%
                    </span>
                }
              </div>
              {loading
                ? <><Skel h={28} w="55%" /><div style={{ marginTop: 8 }}><Skel h={12} w="70%" /></div></>
                : <>
                    <div className="syne" style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-1px", marginBottom: 2 }}>
                      {s?.value?.toLocaleString() ?? "—"}
                    </div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", fontWeight: 500 }}>{s?.label}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", marginTop: 2 }}>{s?.sub}</div>
                  </>
              }
            </motion.div>
          )
        })}
      </div>

      {/* ── Chart Row ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 14, marginBottom: 14 }}>

        {/* Weekly Activity */}
        <motion.div {...fade(0.18)} className="card" style={{ padding: 26 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
            <div>
              <div className="syne" style={{ fontSize: 15, fontWeight: 700, marginBottom: 2 }}>Weekly Activity</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>Reports submitted — last 7 days</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#6366f1" }} />
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>This week</span>
            </div>
          </div>

          {loading ? (
            <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 120 }}>
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  <div style={{ width: "100%", height: `${30 + Math.random() * 60}%`, borderRadius: "6px 6px 0 0", background: "rgba(255,255,255,0.07)" }} />
                  <Skel w={24} h={10} />
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 120 }}>
              {weekly.map((d: WeeklyDay, i: number) => (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  <motion.div
                    initial={{ height: 0 }} animate={{ height: `${(d.count / maxBar) * 100}%` }}
                    transition={{ delay: 0.3 + i * 0.05, duration: 0.5, ease: "easeOut" }}
                    title={`${d.count} reports`}
                    style={{
                      width: "100%", borderRadius: "6px 6px 0 0", minHeight: 4,
                      background: i === weekly.length - 1
                        ? "linear-gradient(180deg,#6366f1,#8b5cf6)"
                        : "rgba(99,102,241,0.28)",
                      border: i === weekly.length - 1
                        ? "1px solid rgba(99,102,241,0.5)"
                        : "1px solid rgba(255,255,255,0.05)",
                    }}
                  />
                  <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>{d.day}</span>
                </div>
              ))}
            </div>
          )}

          {/* Summary */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginTop: 20, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            {loading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} style={{ textAlign: "center" }}><Skel w="50%" h={20} /><div style={{ marginTop: 6 }}><Skel w="60%" h={10} /></div></div>
                ))
              : (() => {
                  const total = weekly.reduce((s: number, d: WeeklyDay) => s + d.count, 0)
                  const avg   = weekly.length ? (total / weekly.length).toFixed(1) : "0"
                  const peak  = weekly.reduce((best: WeeklyDay, d: WeeklyDay) => d.count > best.count ? d : best, weekly[0] ?? { day: "—", count: 0 })
                  return [
                    { label: "Total",   value: total.toLocaleString() },
                    { label: "Avg/day", value: avg                    },
                    { label: "Peak",    value: peak?.day ?? "—"       },
                  ].map((s: { label: string; value: string }, i: number) => (
                    <div key={i} style={{ textAlign: "center" }}>
                      <div className="syne" style={{ fontSize: 17, fontWeight: 700 }}>{s.value}</div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{s.label}</div>
                    </div>
                  ))
                })()
            }
          </div>
        </motion.div>

        {/* Top Locations */}
        <motion.div {...fade(0.22)} className="card" style={{ padding: 26 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div>
              <div className="syne" style={{ fontSize: 15, fontWeight: 700, marginBottom: 2 }}>Top Locations</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>Most active hotspots</div>
            </div>
            <MapPin size={16} color="rgba(255,255,255,0.3)" />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <div key={i}><Skel h={12} /><div style={{ marginTop: 6 }}><Skel h={5} r={3} /></div></div>
                ))
              : locs.length === 0
                ? <div style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", textAlign: "center", padding: "20px 0" }}>No location data yet</div>
                : locs.map((loc: TopLocation, i: number) => (
                    <div key={i}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                        <span style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.75)" }}>{loc.name}</span>
                        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>{loc.count} reports</span>
                      </div>
                      <div style={{ height: 5, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
                        <motion.div
                          initial={{ width: 0 }} animate={{ width: `${(loc.count / maxLoc) * 100}%` }}
                          transition={{ delay: 0.4 + i * 0.07, duration: 0.5, ease: "easeOut" }}
                          style={{ height: "100%", borderRadius: 3, background: i === 0 ? "linear-gradient(90deg,#6366f1,#a78bfa)" : "rgba(99,102,241,0.4)" }}
                        />
                      </div>
                    </div>
                  ))
            }
          </div>
        </motion.div>
      </div>

      {/* ── Bottom Row ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 14 }}>

        {/* Recent Reports */}
        <motion.div {...fade(0.26)} className="card" style={{ padding: 24, overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18, flexWrap: "wrap", gap: 10 }}>
            <div>
              <div className="syne" style={{ fontSize: 15, fontWeight: 700, marginBottom: 2 }}>Recent Reports</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>Latest submissions across all locations</div>
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["ID", "Item", "Type", "Location", "Time", "Status", "Reporter"].map((h, i) => (
                    <th key={i} style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.3)", textAlign: "left", padding: "6px 10px", borderBottom: "1px solid rgba(255,255,255,0.06)", whiteSpace: "nowrap", letterSpacing: "0.5px", textTransform: "uppercase" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array.from({ length: 6 }).map((_, i) => (
                      <tr key={i}>
                        {Array.from({ length: 7 }).map((__, j) => (
                          <td key={j} style={{ padding: "10px 10px" }}><Skel w={j === 1 ? 120 : j === 3 ? 90 : 60} /></td>
                        ))}
                      </tr>
                    ))
                  : recentReports.map((r: RecentReport, i: number) => {
                      const ss = statusStyle(r.status)
                      return (
                        <motion.tr key={r.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                          className="row-hover" onClick={() => navigate("/admin-all-reports")} style={{ cursor: "pointer" }}>
                          <td style={{ padding: "10px 10px", fontSize: 12, color: "rgba(255,255,255,0.35)", fontWeight: 500, whiteSpace: "nowrap" }}>#{r.id}</td>
                          <td style={{ padding: "10px 10px", fontSize: 13, fontWeight: 500, color: "white", whiteSpace: "nowrap", maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis" }}>{r.item_name}</td>
                          <td style={{ padding: "10px 10px" }}>
                            <span className="tag" style={{ background: r.report_type === "lost" ? "rgba(239,68,68,0.12)" : "rgba(52,211,153,0.12)", color: r.report_type === "lost" ? "#f87171" : "#34d399", border: `1px solid ${r.report_type === "lost" ? "rgba(239,68,68,0.2)" : "rgba(52,211,153,0.2)"}` }}>
                              {r.report_type === "lost" ? <Tag size={10} /> : <PackageSearch size={10} />}
                              {r.report_type === "lost" ? "Lost" : "Found"}
                            </span>
                          </td>
                          <td style={{ padding: "10px 10px", fontSize: 12, color: "rgba(255,255,255,0.45)", whiteSpace: "nowrap", maxWidth: 110, overflow: "hidden", textOverflow: "ellipsis" }}>{r.location}</td>
                          <td style={{ padding: "10px 10px", fontSize: 12, color: "rgba(255,255,255,0.3)", whiteSpace: "nowrap" }}>{timeAgo(r.date_reported)}</td>
                          <td style={{ padding: "10px 10px" }}>
                            <span className="tag" style={{ background: ss.bg, color: ss.color, border: `1px solid ${ss.border}`, textTransform: "capitalize" }}>
                              {r.status.replace("_", " ")}
                            </span>
                          </td>
                          <td style={{ padding: "10px 10px", fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>
                            @{r.username}
                          </td>
                        </motion.tr>
                      )
                    })
                }
              </tbody>
            </table>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
              {loading ? "Loading…" : `Showing ${recentReports.length} most recent reports`}
            </span>
            <a href="/admin-all-reports" style={{ textDecoration: "none" }}>
              <button className="btn btn-ghost" style={{ fontSize: 12, padding: "6px 12px" }}>View All Reports →</button>
            </a>
          </div>
        </motion.div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Recovery Rate */}
          <motion.div {...fade(0.3)} className="card" style={{ padding: 22 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div className="syne" style={{ fontSize: 15, fontWeight: 700 }}>Recovery Rate</div>
              <TrendingUp size={16} color="#34d399" />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
              <svg width={72} height={72} viewBox="0 0 72 72">
                <circle cx="36" cy="36" r="28" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7" />
                <motion.circle cx="36" cy="36" r="28" fill="none" stroke="url(#rr-grad)" strokeWidth="7"
                  strokeLinecap="round" strokeDasharray={CIRCUM}
                  initial={{ strokeDashoffset: CIRCUM }}
                  animate={{ strokeDashoffset: loading ? CIRCUM : dashOffset }}
                  transition={{ delay: 0.5, duration: 0.9, ease: "easeOut" }}
                  transform="rotate(-90 36 36)"
                />
                <defs>
                  <linearGradient id="rr-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#34d399" />
                  </linearGradient>
                </defs>
              </svg>
              <div>
                {loading
                  ? <><Skel w={70} h={28} /><div style={{ marginTop: 8 }}><Skel w={90} h={12} /></div></>
                  : <>
                      <div className="syne" style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-1px" }}>{recoveryRate}%</div>
                      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
                        {breakdown?.claimed ?? 0} of {totalAll} items
                      </div>
                    </>
                }
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {loading
                ? Array.from({ length: 3 }).map((_, i) => <Skel key={i} h={14} />)
                : [
                    { label: "Claimed", val: breakdown?.claimed ?? 0, color: "#34d399" },
                    { label: "Matched", val: breakdown?.matched ?? 0, color: "#6366f1" },
                    { label: "Pending", val: breakdown?.pending ?? 0, color: "#f59e0b" },
                  ].map((r, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: r.color, flexShrink: 0 }} />
                      <span style={{ flex: 1, fontSize: 12, color: "rgba(255,255,255,0.55)" }}>{r.label}</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.7)" }}>{r.val.toLocaleString()}</span>
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", width: 36, textAlign: "right" }}>
                        {totalAll ? Math.round(r.val / totalAll * 100) : 0}%
                      </span>
                    </div>
                  ))
              }
            </div>
          </motion.div>

          {/* Recent Users */}
          <motion.div {...fade(0.34)} className="card" style={{ padding: 22 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div className="syne" style={{ fontSize: 15, fontWeight: 700 }}>New Users</div>
              <Users size={14} color="rgba(255,255,255,0.3)" />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {loading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                      <div style={{ width: 34, height: 34, borderRadius: "50%", background: "rgba(255,255,255,0.08)", flexShrink: 0 }} />
                      <div style={{ flex: 1 }}><Skel h={12} w="70%" /><div style={{ marginTop: 6 }}><Skel h={10} w="50%" /></div></div>
                    </div>
                  ))
                : recentUsers.map((u: RecentUser, i: number) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                      <UserAvatar user={u} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.full_name}</div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
                          {u.role === "ADMIN" ? "Admin" : "User"} · {timeAgo(u.date_joined)}
                        </div>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 600, background: "rgba(99,102,241,0.12)", color: "#818cf8", padding: "2px 7px", borderRadius: 6, flexShrink: 0 }}>
                        {u.reports} rpts
                      </span>
                    </div>
                  ))
              }
            </div>
            <a href="/admin-all-users" style={{ textDecoration: "none" }}>
              <button className="btn btn-ghost" style={{ width: "100%", justifyContent: "center", marginTop: 12, fontSize: 12 }}>
                View All Users →
              </button>
            </a>
          </motion.div>

          {/* Quick Actions */}
          <motion.div {...fade(0.38)} className="card" style={{ padding: 22 }}>
            <div className="syne" style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Quick Actions</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                {
                  icon:  Bell,
                  label: "Review Pending Claims",
                  color: "#f59e0b",
                  badge: loading ? "…" : String(stats?.pending_claims?.value ?? 0),
                  href:  "/admin-claims",
                },
                {
                  icon:  CheckCircle,
                  label: "View All Reports",
                  color: "#34d399",
                  badge: loading ? "…" : String(stats?.total_reports?.value ?? 0),
                  href:  "/admin-all-reports",
                },
                {
                  icon:  Users,
                  label: "Manage Users",
                  color: "#a78bfa",
                  badge: loading ? "…" : String(stats?.active_users?.value ?? 0),
                  href:  "/admin-all-users",
                },
              ].map((a, i) => (
                <a key={i} href={a.href} style={{ textDecoration: "none" }}>
                  <button className="quick-action" style={{ fontFamily: "'DM Sans',sans-serif" }}>
                    <a.icon size={15} color={a.color} style={{ flexShrink: 0 }} />
                    <span style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>{a.label}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, background: `${a.color}18`, color: a.color, padding: "2px 7px", borderRadius: 6 }}>
                      {a.badge}
                    </span>
                  </button>
                </a>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  )
}