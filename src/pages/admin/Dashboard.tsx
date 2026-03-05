import { useState, useEffect } from "react"
import { motion, easeOut } from "framer-motion"
import { useAuthStore } from "@/store/authStore"
import {
  PackageSearch, Tag, CheckCircle, Users,
  TrendingUp, Clock, ArrowUp, ArrowDown,
  MapPin, Bell, Eye, MoreHorizontal,
  RefreshCw, Download, Filter,
} from "lucide-react"

// ── MOCK DATA ────────────────────────────────────────────────────────────────

const STATS = [
  {
    label: "Total Reports",
    value: "1,284",
    delta: "+12%",
    up: true,
    icon: Tag,
    color: "#6366f1",
    sub: "vs last month",
  },
  {
    label: "Items Recovered",
    value: "847",
    delta: "+8.4%",
    up: true,
    icon: CheckCircle,
    color: "#34d399",
    sub: "vs last month",
  },
  {
    label: "Pending Claims",
    value: "63",
    delta: "-3.2%",
    up: false,
    icon: Clock,
    color: "#f59e0b",
    sub: "needs review",
  },
  {
    label: "Active Users",
    value: "2,410",
    delta: "+21%",
    up: true,
    icon: Users,
    color: "#a78bfa",
    sub: "registered this month",
  },
]

const RECENT_REPORTS = [
  { id: "#R-1041", item: "MacBook Pro 14\"",   type: "Lost",  location: "Library 2F",     time: "2m ago",  status: "Pending",  match: "92%" },
  { id: "#R-1040", item: "AirPods Pro",         type: "Found", location: "Cafeteria",      time: "18m ago", status: "Matched",  match: "87%" },
  { id: "#R-1039", item: "Student ID — Ramos",  type: "Lost",  location: "Gym Entrance",   time: "34m ago", status: "Claimed",  match: null  },
  { id: "#R-1038", item: "Black Leather Wallet",type: "Found", location: "Parking Lot B",  time: "1h ago",  status: "Pending",  match: null  },
  { id: "#R-1037", item: "Blue Hydroflask",     type: "Found", location: "Study Hall",     time: "2h ago",  status: "Matched",  match: "78%" },
  { id: "#R-1036", item: "Car Keys (Honda)",    type: "Lost",  location: "Lobby",          time: "3h ago",  status: "Pending",  match: null  },
  { id: "#R-1035", item: "Glasses Case",        type: "Found", location: "Lab 301",        time: "5h ago",  status: "Claimed",  match: null  },
]

const TOP_LOCATIONS = [
  { name: "Library 2F",       count: 214, pct: 88 },
  { name: "Cafeteria",        count: 178, pct: 73 },
  { name: "Gym Entrance",     count: 132, pct: 54 },
  { name: "Parking Lot B",    count: 97,  pct: 40 },
  { name: "Study Hall",       count: 84,  pct: 35 },
]

const RECENT_USERS = [
  { initials: "JD", name: "Juan Dela Cruz",   role: "Student",  joined: "Today",    reports: 3 },
  { initials: "MR", name: "Maria Reyes",      role: "Faculty",  joined: "Today",    reports: 1 },
  { initials: "AC", name: "Angelo Castro",    role: "Student",  joined: "Yesterday",reports: 5 },
  { initials: "SP", name: "Sofia Pangilinan", role: "Staff",    joined: "2d ago",   reports: 2 },
]

const WEEKLY = [42, 68, 55, 91, 74, 110, 88]
const DAYS   = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]

// ── HELPERS ──────────────────────────────────────────────────────────────────

function statusStyle(status: string) {
  if (status === "Claimed")  return { bg: "rgba(52,211,153,0.12)",  color: "#34d399",  border: "rgba(52,211,153,0.25)"  }
  if (status === "Matched")  return { bg: "rgba(99,102,241,0.12)",  color: "#818cf8",  border: "rgba(99,102,241,0.25)"  }
  return                            { bg: "rgba(245,158,11,0.12)",  color: "#fbbf24",  border: "rgba(245,158,11,0.25)"  }
}

function useIsMobile() {
  const [m, setM] = useState(false)
  useEffect(() => {
    const c = () => setM(window.innerWidth < 768)
    c(); window.addEventListener("resize", c)
    return () => window.removeEventListener("resize", c)
  }, [])
  return m
}

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.45, ease: easeOut },
})

// ── COMPONENT ────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const { user } = useAuthStore()
  const isMobile = useIsMobile()
  const [filter, setFilter] = useState<"All"|"Lost"|"Found">("All")
  const now = new Date().toLocaleDateString("en-US", { weekday:"long", month:"long", day:"numeric" })

  const filtered = RECENT_REPORTS.filter(r => filter === "All" || r.type === filter)
  const maxBar   = Math.max(...WEEKLY)

  return (
    <div style={{ fontFamily:"'DM Sans',sans-serif", color:"white", minHeight:"100vh" }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
        .syne { font-family:'Syne',sans-serif; }
        .card { background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.07); border-radius:18px; }
        .card-hover { transition:all 0.25s ease; }
        .card-hover:hover { background:rgba(255,255,255,0.05); border-color:rgba(99,102,241,0.3); transform:translateY(-2px); box-shadow:0 16px 40px rgba(0,0,0,0.3); }
        .tag { display:inline-flex; align-items:center; gap:4px; padding:3px 9px; border-radius:20px; font-size:11px; font-weight:600; }
        .btn { display:inline-flex; align-items:center; gap:6px; padding:8px 14px; border-radius:10px; font-size:13px; font-weight:500; cursor:pointer; transition:all 0.2s; border:none; }
        .btn-ghost { background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.09); color:rgba(255,255,255,0.6); }
        .btn-ghost:hover { background:rgba(255,255,255,0.09); color:white; }
        .btn-primary { background:linear-gradient(135deg,#6366f1,#8b5cf6); color:white; }
        .btn-primary:hover { box-shadow:0 8px 20px rgba(99,102,241,0.4); transform:translateY(-1px); }
        .row-hover { transition:background 0.15s; border-radius:10px; }
        .row-hover:hover { background:rgba(255,255,255,0.03); }
        ::-webkit-scrollbar { width:3px; height:3px; }
        ::-webkit-scrollbar-thumb { background:rgba(99,102,241,0.3); border-radius:2px; }
      `}</style>

      {/* ── Header ── */}
      <motion.div {...fade(0)} style={{ marginBottom: isMobile ? 24 : 32 }}>
        <div style={{ display:"flex", alignItems: isMobile ? "flex-start" : "center", justifyContent:"space-between", flexDirection: isMobile ? "column" : "row", gap:12 }}>
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
              <span style={{ width:8, height:8, borderRadius:"50%", background:"#34d399", boxShadow:"0 0 8px #34d399", flexShrink:0 }} />
              <span style={{ fontSize:12, color:"rgba(255,255,255,0.4)" }}>{now}</span>
            </div>
            <h1 className="syne" style={{ fontSize: isMobile ? 24 : 30, fontWeight:800, letterSpacing:"-1px", marginBottom:4 }}>
              Welcome back, {user ?? "Admin"} 👋
            </h1>
            <p style={{ fontSize:14, color:"rgba(255,255,255,0.4)" }}>
              Here's what's happening across the Findify network today.
            </p>
          </div>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            <button className="btn btn-ghost"><RefreshCw size={14} /> Refresh</button>
            <button className="btn btn-primary"><Download size={14} /> Export</button>
          </div>
        </div>
      </motion.div>

      {/* ── Stat Cards ── */}
      <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4,1fr)", gap:14, marginBottom: isMobile ? 24 : 28 }}>
        {STATS.map((s, i) => (
          <motion.div key={i} {...fade(i * 0.07)} className="card card-hover"
            style={{ padding: isMobile ? 16 : 22, position:"relative", overflow:"hidden" }}>
            {/* glow orb */}
            <div style={{ position:"absolute", width:80, height:80, borderRadius:"50%", background:`${s.color}18`, top:-20, right:-20, pointerEvents:"none" }} />
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
              <div style={{ width:38, height:38, borderRadius:10, background:`${s.color}18`, border:`1px solid ${s.color}28`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <s.icon size={17} color={s.color} />
              </div>
              <span style={{ display:"flex", alignItems:"center", gap:3, fontSize:12, fontWeight:600, color: s.up ? "#34d399" : "#f87171" }}>
                {s.up ? <ArrowUp size={12}/> : <ArrowDown size={12}/>}{s.delta}
              </span>
            </div>
            <div className="syne" style={{ fontSize: isMobile ? 22 : 26, fontWeight:800, letterSpacing:"-1px", marginBottom:2 }}>{s.value}</div>
            <div style={{ fontSize:12, color:"rgba(255,255,255,0.45)", fontWeight:500 }}>{s.label}</div>
            <div style={{ fontSize:11, color:"rgba(255,255,255,0.25)", marginTop:2 }}>{s.sub}</div>
          </motion.div>
        ))}
      </div>

      {/* ── Middle Row: Chart + Locations ── */}
      <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 340px", gap:14, marginBottom:14 }}>

        {/* Weekly Activity Chart */}
        <motion.div {...fade(0.18)} className="card" style={{ padding: isMobile ? 20 : 26 }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24 }}>
            <div>
              <div className="syne" style={{ fontSize:15, fontWeight:700, marginBottom:2 }}>Weekly Activity</div>
              <div style={{ fontSize:12, color:"rgba(255,255,255,0.35)" }}>Reports submitted per day</div>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
              <span style={{ width:8, height:8, borderRadius:"50%", background:"#6366f1" }} />
              <span style={{ fontSize:12, color:"rgba(255,255,255,0.4)" }}>This week</span>
            </div>
          </div>
          {/* Bar chart */}
          <div style={{ display:"flex", alignItems:"flex-end", gap: isMobile ? 8 : 12, height:120 }}>
            {WEEKLY.map((v, i) => (
              <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}>
                <motion.div
                  initial={{ height:0 }} animate={{ height:`${(v/maxBar)*100}%` }}
                  transition={{ delay: 0.3 + i*0.05, duration:0.5, ease:"easeOut" }}
                  style={{
                    width:"100%", borderRadius:"6px 6px 0 0",
                    background: i === 5
                      ? "linear-gradient(180deg,#6366f1,#8b5cf6)"
                      : "rgba(99,102,241,0.25)",
                    border: i === 5 ? "1px solid rgba(99,102,241,0.5)" : "1px solid rgba(255,255,255,0.05)",
                    minHeight:4,
                  }}
                />
                <span style={{ fontSize:10, color:"rgba(255,255,255,0.3)" }}>{DAYS[i]}</span>
              </div>
            ))}
          </div>
          {/* Summary row */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginTop:20, paddingTop:16, borderTop:"1px solid rgba(255,255,255,0.06)" }}>
            {[
              { label:"Total", value:"528" },
              { label:"Avg/day", value:"75.4" },
              { label:"Peak day", value:"Sat" },
            ].map((s,i) => (
              <div key={i} style={{ textAlign:"center" }}>
                <div className="syne" style={{ fontSize:17, fontWeight:700 }}>{s.value}</div>
                <div style={{ fontSize:11, color:"rgba(255,255,255,0.35)" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Top Locations */}
        <motion.div {...fade(0.22)} className="card" style={{ padding: isMobile ? 20 : 26 }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
            <div>
              <div className="syne" style={{ fontSize:15, fontWeight:700, marginBottom:2 }}>Top Locations</div>
              <div style={{ fontSize:12, color:"rgba(255,255,255,0.35)" }}>Most active hotspots</div>
            </div>
            <MapPin size={16} color="rgba(255,255,255,0.3)" />
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            {TOP_LOCATIONS.map((loc, i) => (
              <div key={i}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                  <span style={{ fontSize:13, fontWeight:500, color:"rgba(255,255,255,0.75)" }}>{loc.name}</span>
                  <span style={{ fontSize:12, color:"rgba(255,255,255,0.35)" }}>{loc.count} reports</span>
                </div>
                <div style={{ height:5, background:"rgba(255,255,255,0.06)", borderRadius:3, overflow:"hidden" }}>
                  <motion.div
                    initial={{ width:0 }} animate={{ width:`${loc.pct}%` }}
                    transition={{ delay: 0.4 + i*0.07, duration:0.5, ease:"easeOut" }}
                    style={{ height:"100%", borderRadius:3, background: i === 0 ? "linear-gradient(90deg,#6366f1,#a78bfa)" : "rgba(99,102,241,0.4)" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Bottom Row: Reports Table + Recent Users ── */}
      <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 300px", gap:14 }}>

        {/* Recent Reports */}
        <motion.div {...fade(0.26)} className="card" style={{ padding: isMobile ? 18 : 24, overflow:"hidden" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:18, flexWrap:"wrap", gap:10 }}>
            <div>
              <div className="syne" style={{ fontSize:15, fontWeight:700, marginBottom:2 }}>Recent Reports</div>
              <div style={{ fontSize:12, color:"rgba(255,255,255,0.35)" }}>Latest submissions across all locations</div>
            </div>
            <div style={{ display:"flex", gap:6 }}>
              {(["All","Lost","Found"] as const).map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  style={{
                    padding:"5px 12px", borderRadius:8, fontSize:12, fontWeight:500, cursor:"pointer", border:"none",
                    background: filter === f ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "rgba(255,255,255,0.05)",
                    color: filter === f ? "white" : "rgba(255,255,255,0.4)",
                    transition:"all 0.2s",
                  }}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead>
                <tr>
                  {["ID","Item","Type","Location","Time","Status","Match",""].map((h,i) => (
                    <th key={i} style={{ fontSize:11, fontWeight:600, color:"rgba(255,255,255,0.3)", textAlign:"left", padding:"6px 10px", borderBottom:"1px solid rgba(255,255,255,0.06)", whiteSpace:"nowrap", letterSpacing:"0.5px", textTransform:"uppercase" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => {
                  const ss = statusStyle(r.status)
                  return (
                    <motion.tr key={i} initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }} transition={{ delay: i*0.04 }}
                      className="row-hover" style={{ cursor:"pointer" }}>
                      <td style={{ padding:"10px 10px", fontSize:12, color:"rgba(255,255,255,0.35)", fontWeight:500, whiteSpace:"nowrap" }}>{r.id}</td>
                      <td style={{ padding:"10px 10px", fontSize:13, fontWeight:500, color:"white", whiteSpace:"nowrap", maxWidth:140, overflow:"hidden", textOverflow:"ellipsis" }}>{r.item}</td>
                      <td style={{ padding:"10px 10px" }}>
                        <span className="tag" style={{ background: r.type==="Lost" ? "rgba(239,68,68,0.12)" : "rgba(52,211,153,0.12)", color: r.type==="Lost" ? "#f87171" : "#34d399", border:`1px solid ${r.type==="Lost" ? "rgba(239,68,68,0.2)" : "rgba(52,211,153,0.2)"}` }}>
                          {r.type === "Lost" ? <Tag size={10}/> : <PackageSearch size={10}/>} {r.type}
                        </span>
                      </td>
                      <td style={{ padding:"10px 10px", fontSize:12, color:"rgba(255,255,255,0.45)", whiteSpace:"nowrap" }}>{r.location}</td>
                      <td style={{ padding:"10px 10px", fontSize:12, color:"rgba(255,255,255,0.3)", whiteSpace:"nowrap" }}>{r.time}</td>
                      <td style={{ padding:"10px 10px" }}>
                        <span className="tag" style={{ background:ss.bg, color:ss.color, border:`1px solid ${ss.border}` }}>
                          {r.status}
                        </span>
                      </td>
                      <td style={{ padding:"10px 10px", fontSize:12, color:"#a78bfa", fontWeight:600 }}>
                        {r.match ?? <span style={{ color:"rgba(255,255,255,0.2)" }}>—</span>}
                      </td>
                      <td style={{ padding:"10px 10px" }}>
                        <button style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:7, padding:"4px 8px", cursor:"pointer", color:"rgba(255,255,255,0.4)", display:"flex", alignItems:"center", gap:4, fontSize:12, transition:"all 0.2s" }}
                          onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.color="white"}}
                          onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.color="rgba(255,255,255,0.4)"}}>
                          <Eye size={12}/> View
                        </button>
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:16, paddingTop:14, borderTop:"1px solid rgba(255,255,255,0.06)" }}>
            <span style={{ fontSize:12, color:"rgba(255,255,255,0.3)" }}>Showing {filtered.length} of {RECENT_REPORTS.length} reports</span>
            <button className="btn btn-ghost" style={{ fontSize:12, padding:"6px 12px" }}>View All Reports →</button>
          </div>
        </motion.div>

        {/* Right column */}
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>

          {/* Recovery Rate */}
          <motion.div {...fade(0.3)} className="card" style={{ padding: isMobile ? 18 : 22 }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
              <div className="syne" style={{ fontSize:15, fontWeight:700 }}>Recovery Rate</div>
              <TrendingUp size={16} color="#34d399" />
            </div>
            {/* Ring visual */}
            <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:16 }}>
              <svg width={72} height={72} viewBox="0 0 72 72">
                <circle cx="36" cy="36" r="28" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7"/>
                <motion.circle cx="36" cy="36" r="28" fill="none" stroke="url(#grad)" strokeWidth="7"
                  strokeLinecap="round" strokeDasharray="175.9"
                  initial={{ strokeDashoffset: 175.9 }}
                  animate={{ strokeDashoffset: 175.9 * (1 - 0.659) }}
                  transition={{ delay:0.5, duration:0.9, ease:"easeOut" }}
                  transform="rotate(-90 36 36)" />
                <defs>
                  <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#6366f1"/>
                    <stop offset="100%" stopColor="#34d399"/>
                  </linearGradient>
                </defs>
              </svg>
              <div>
                <div className="syne" style={{ fontSize:28, fontWeight:800, letterSpacing:"-1px" }}>65.9%</div>
                <div style={{ fontSize:12, color:"rgba(255,255,255,0.4)" }}>847 of 1,284 items</div>
                <div style={{ fontSize:11, color:"#34d399", marginTop:2, display:"flex", alignItems:"center", gap:3 }}>
                  <ArrowUp size={10}/> +8.4% this month
                </div>
              </div>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {[
                { label:"Claimed",  val:847,  pct:66, color:"#34d399" },
                { label:"Matched",  val:186,  pct:14, color:"#6366f1" },
                { label:"Pending",  val:251,  pct:20, color:"#f59e0b" },
              ].map((r,i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ width:8, height:8, borderRadius:"50%", background:r.color, flexShrink:0 }} />
                  <span style={{ flex:1, fontSize:12, color:"rgba(255,255,255,0.55)" }}>{r.label}</span>
                  <span style={{ fontSize:12, fontWeight:600, color:"rgba(255,255,255,0.7)" }}>{r.val}</span>
                  <span style={{ fontSize:11, color:"rgba(255,255,255,0.3)", width:32, textAlign:"right" }}>{r.pct}%</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Recent Users */}
          <motion.div {...fade(0.34)} className="card" style={{ padding: isMobile ? 18 : 22 }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
              <div className="syne" style={{ fontSize:15, fontWeight:700 }}>New Users</div>
              <button className="btn btn-ghost" style={{ fontSize:11, padding:"4px 10px" }}><Filter size={11}/> Filter</button>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {RECENT_USERS.map((u, i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 10px", borderRadius:10, background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ width:34, height:34, borderRadius:"50%", background:"linear-gradient(135deg,#6366f1,#8b5cf6)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, flexShrink:0 }}>
                    {u.initials}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:13, fontWeight:600, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{u.name}</div>
                    <div style={{ fontSize:11, color:"rgba(255,255,255,0.35)" }}>{u.role} · {u.joined}</div>
                  </div>
                  <span style={{ fontSize:11, fontWeight:600, background:"rgba(99,102,241,0.12)", color:"#818cf8", padding:"2px 7px", borderRadius:6, flexShrink:0 }}>
                    {u.reports} rpts
                  </span>
                </div>
              ))}
            </div>
            <button className="btn btn-ghost" style={{ width:"100%", justifyContent:"center", marginTop:12, fontSize:12 }}>
              View All Users →
            </button>
          </motion.div>

          {/* Quick Actions */}
          <motion.div {...fade(0.38)} className="card" style={{ padding: isMobile ? 18 : 22 }}>
            <div className="syne" style={{ fontSize:15, fontWeight:700, marginBottom:14 }}>Quick Actions</div>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {[
                { icon: Bell,         label:"Review 7 Verifications", color:"#f59e0b", badge:"7"  },
                { icon: CheckCircle,  label:"Approve Pending Claims",  color:"#34d399", badge:"63" },
                { icon: Users,        label:"New User Registrations",  color:"#a78bfa", badge:"12" },
              ].map((a,i) => (
                <button key={i}
                  style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", borderRadius:10, background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", cursor:"pointer", color:"white", transition:"all 0.2s", textAlign:"left", width:"100%" }}
                  onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background="rgba(255,255,255,0.06)"; (e.currentTarget as HTMLElement).style.borderColor="rgba(99,102,241,0.3)"}}
                  onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background="rgba(255,255,255,0.03)"; (e.currentTarget as HTMLElement).style.borderColor="rgba(255,255,255,0.07)"}}>
                  <a.icon size={15} color={a.color} style={{ flexShrink:0 }} />
                  <span style={{ flex:1, fontSize:13, fontWeight:500 }}>{a.label}</span>
                  <span style={{ fontSize:11, fontWeight:700, background:`${a.color}18`, color:a.color, padding:"2px 7px", borderRadius:6 }}>{a.badge}</span>
                </button>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  )
}