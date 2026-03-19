"use client"
import { useNavigate } from "react-router-dom"
import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion"
import {
  Search, ShieldCheck, BellRing, MapPin, Tag, ArrowRight,
  CheckCircle, Star, Menu, X, ChevronDown, Zap, Globe, Lock, RefreshCw,
} from "lucide-react"
import { useLandingStore } from "@/store/landingStore"
import type { PublicActivityItem } from "@/types/landingTypes"

// ─────────────────────────────────────────────────────────────────────────────
//  HOOKS
// ─────────────────────────────────────────────────────────────────────────────
function useIsMobile() {
  const [v, setV] = useState(false)
  useEffect(() => {
    const check = () => setV(window.innerWidth < 768)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])
  return v
}

// ─────────────────────────────────────────────────────────────────────────────
//  STATIC DATA
// ─────────────────────────────────────────────────────────────────────────────
const NAV_ITEMS = ["Features", "How It Works", "Testimonials"]

const FEATURES = [
  { icon: Zap,         color: "#f59e0b", title: "AI-Powered Matching",    tag: "Smart",   desc: "Our engine compares lost and found reports in real time — no manual browsing needed. Scores by name, location, description, and date." },
  { icon: MapPin,      color: "#3b82f6", title: "Location Intelligence",  tag: "Geo",     desc: "Geo-tagged reports with campus synonym clusters help you visualize exactly where items were lost or found." },
  { icon: BellRing,    color: "#a78bfa", title: "Instant Alerts",         tag: "Live",    desc: "Push, email, and in-app notifications the moment a matching item is reported. Never miss a match again." },
  { icon: ShieldCheck, color: "#34d399", title: "Verified Claims",        tag: "Secure",  desc: "Multi-step ownership verification and proof descriptions ensure only rightful owners can claim items." },
  { icon: Globe,       color: "#f87171", title: "Multi-Campus Support",   tag: "Scale",   desc: "Deploy across multiple buildings or departments under one unified admin dashboard." },
  { icon: Lock,        color: "#60a5fa", title: "Privacy First",          tag: "Private", desc: "Personal data is never shared without explicit consent. Only admins can see full reporter details." },
]

const HOW_IT_WORKS = [
  { step: "01", title: "Report Your Item",    desc: "Submit a detailed report with photos, description, and location. Takes under 60 seconds.", color: "#6366f1" },
  { step: "02", title: "AI Scans for Matches",desc: "Our engine instantly cross-references your report against all active found items.", color: "#8b5cf6" },
  { step: "03", title: "Get Notified",         desc: "Receive instant alerts when a potential match is found, with confidence score and details.", color: "#a78bfa" },
  { step: "04", title: "Claim & Reunite",      desc: "Verify ownership through our secure process and arrange a safe handoff or pickup.", color: "#c4b5fd" },
]

const TESTIMONIALS = [
  { quote: "I recovered my laptop within 18 hours. The AI match was uncanny — it found it before I even finished filling the form.", author: "Marcus T.", role: "Computer Science Student", rating: 5, avatar: "MT" },
  { quote: "We manage lost property for 3 university campuses. This system cut our admin time by 70% and tripled recovery rates.", author: "Dr. Sarah Chen", role: "Campus Operations Director", rating: 5, avatar: "SC" },
  { quote: "The notification system is phenomenal. I got a push alert 6 minutes after my wallet was turned in at the library.", author: "Aiden R.", role: "MBA Candidate", rating: 5, avatar: "AR" },
  { quote: "Finally a lost & found platform that doesn't feel like it's from 2005. Clean, fast, and it actually works.", author: "Priya M.", role: "Office Manager", rating: 5, avatar: "PM" },
  { quote: "The geo-tagging feature helped us locate a cluster of unreported lost items near the cafeteria. Game changer.", author: "James L.", role: "Security Coordinator", rating: 5, avatar: "JL" },
  { quote: "Our students trust the system because of the verification flow. No more disputes, no more false claims.", author: "Prof. Ana Vega", role: "Student Affairs Lead", rating: 5, avatar: "AV" },
]

const TICKER_ITEMS = [
  "✦ AI-powered matching", "✦ Real-time notifications",
  "✦ Campus-wide deployment", "✦ Verified ownership claims",
  "✦ End-to-end encrypted", "✦ Zero setup required",
  "✦ Bisaya & Tagalog supported", "✦ Free for students",
]

// const CATEGORY_ICONS: Record<string, React.ElementType> = {
//   "Electronics":    Zap,
//   "Wallets & Bags": Tag,
//   "Keys":           Tag,
//   "Clothing":       Tag,
//   "Jewelry":        Star,
//   "Documents":      Tag,
//   "Pets":           Tag,
//   "Sports":         TrendingUp,
//   "Other":          Tag,
// }

// ─────────────────────────────────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────────────────────────────────
function timeAgo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (diff < 1)     return "just now"
  if (diff < 60)    return `${diff}m ago`
  if (diff < 1440)  return `${Math.floor(diff / 60)}h ago`
  if (diff < 10080) return `${Math.floor(diff / 1440)}d ago`
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function fmt(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}K+`
  return String(n)
}

// ─────────────────────────────────────────────────────────────────────────────
//  SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────
function FAQItem({ faq, i }: { faq: { q: string; a: string }; i: number }) {
  const [open, setOpen] = useState(false)
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }} transition={{ delay: i * 0.06 }}
      style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
    >
      <button onClick={() => setOpen(!open)}
        style={{ width: "100%", padding: "16px 0", display: "flex", alignItems: "center", justifyContent: "space-between", background: "none", border: "none", color: "white", cursor: "pointer", textAlign: "left", gap: 12 }}>
        <span style={{ fontSize: 14, fontWeight: 500 }}>{faq.q}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} style={{ flexShrink: 0 }}>
          <ChevronDown size={16} color="rgba(255,255,255,0.4)" />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} style={{ overflow: "hidden" }}>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", lineHeight: 1.7, paddingBottom: 16 }}>{faq.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function ActivityItem({ item, index }: { item: PublicActivityItem; index: number }) {
  //const CatIcon = CATEGORY_ICONS[item.category] ?? Tag
  const isLost = item.type === "Lost"
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06 }}
      style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 11px", borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
    >
      <div style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: isLost ? "rgba(239,68,68,0.15)" : "rgba(52,211,153,0.15)" }}>
        {isLost ? <Tag size={12} color="#f87171" /> : <CheckCircle size={12} color="#34d399" />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.item}</div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 1 }}>
          {item.location} · {timeAgo(item.time)}
        </div>
      </div>
      {item.match && (
        <span style={{ fontSize: 10, fontWeight: 600, color: "#a78bfa", background: "rgba(167,139,250,0.12)", padding: "2px 6px", borderRadius: 5, flexShrink: 0 }}>
          {item.match}
        </span>
      )}
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [menuOpen,   setMenuOpen]   = useState(false)
  const [activeTab,  setActiveTab]  = useState<"lost" | "found">("lost")
  const isMobile   = useIsMobile()
  const heroRef    = useRef(null)
  const navigate   = useNavigate()

  const { stats, activity, loading, fetch } = useLandingStore()

  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] })
  const heroY       = useTransform(scrollYProgress, [0, 1], ["0%", "30%"])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  useEffect(() => { fetch() }, [])
  useEffect(() => { if (!isMobile) setMenuOpen(false) }, [isMobile])

  // Derived stats — real data with fallback
  const STATS_DISPLAY = stats ? [
    { value: fmt(stats.items_recovered), label: "Items Recovered" },
    { value: fmt(stats.active_users),    label: "Active Users"    },
    { value: `${stats.recovery_rate}%`,  label: "Recovery Rate"   },
    { value: fmt(stats.open_reports),    label: "Open Reports"    },
  ] : [
    { value: "—", label: "Items Recovered" },
    { value: "—", label: "Active Users"    },
    { value: "—", label: "Recovery Rate"   },
    { value: "—", label: "Open Reports"    },
  ]

  const filteredActivity = activity.filter(i =>
    activeTab === "lost" ? i.type === "Lost" : i.type === "Found"
  )

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }} className="bg-[#06060f] text-white min-h-screen overflow-x-hidden relative">

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        html { scroll-behavior:smooth; }
        ::-webkit-scrollbar { width:3px; }
        ::-webkit-scrollbar-track { background:#06060f; }
        ::-webkit-scrollbar-thumb { background:#6366f1; border-radius:2px; }

        .syne { font-family:'Syne',sans-serif; }
        .gradient-text { background:linear-gradient(135deg,#818cf8,#c084fc,#60a5fa); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
        .card-glass { background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.07); backdrop-filter:blur(24px); }
        .card-hover { transition:all 0.3s ease; cursor:default; }
        .card-hover:hover { background:rgba(255,255,255,0.06); border-color:rgba(99,102,241,0.4); transform:translateY(-4px); box-shadow:0 24px 48px rgba(99,102,241,0.15); }
        .btn-primary { background:linear-gradient(135deg,#6366f1,#8b5cf6); transition:all 0.3s ease; }
        .btn-primary:hover { transform:translateY(-2px); box-shadow:0 16px 32px rgba(99,102,241,0.4); }
        .btn-secondary { background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.15); transition:all 0.3s ease; }
        .btn-secondary:hover { background:rgba(255,255,255,0.12); border-color:rgba(255,255,255,0.3); }
        .nav-link { font-size:14px; color:rgba(255,255,255,0.6); text-decoration:none; transition:color 0.2s; }
        .nav-link:hover { color:white; }
        .grain { position:fixed; inset:0; z-index:100; pointer-events:none; opacity:0.03;
          background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          background-size:150px 150px; }
        .ticker-wrap { overflow:hidden; white-space:nowrap; }
        .ticker { display:inline-block; animation:ticker 30s linear infinite; }
        @keyframes ticker { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        .float { animation:float 6s ease-in-out infinite; }
        @keyframes lp-spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }

        /* ── Responsive grid classes ── */
        .lp-hero-grid    { display:grid; grid-template-columns:1fr 1fr; gap:64px; align-items:center; }
        .lp-feat-grid    { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; }
        .lp-steps-grid   { display:grid; grid-template-columns:repeat(4,1fr); gap:32px; }
        .lp-test-grid    { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; }
        .lp-footer-grid  { display:grid; grid-template-columns:2fr 1fr 1fr 1fr 1fr; gap:48px; margin-bottom:56px; }
        .lp-stat-grid    { display:grid; grid-template-columns:repeat(2,1fr); gap:14px 24px; }
        .lp-footer-mob   { display:none; }
        .lp-footer-desk  { display:grid; }
        .lp-hide-mob     { display:block; }
        .lp-hero-floats  { display:block; }

        @media (max-width:1024px) {
          .lp-hero-grid   { gap:36px; }
          .lp-feat-grid   { grid-template-columns:repeat(2,1fr); }
          .lp-test-grid   { grid-template-columns:repeat(2,1fr); }
        }
        @media (max-width:768px) {
          .lp-hero-grid   { grid-template-columns:1fr; gap:36px; }
          .lp-feat-grid   { grid-template-columns:1fr; }
          .lp-steps-grid  { grid-template-columns:1fr; gap:14px; }
          .lp-test-grid   { grid-template-columns:1fr; }
          .lp-footer-grid { grid-template-columns:1fr; gap:28px; }
          .lp-footer-mob  { display:flex; flex-direction:column; gap:28px; margin-bottom:32px; }
          .lp-footer-desk { display:none; }
          .lp-hide-mob    { display:none !important; }
          .lp-hero-floats { display:none; }
        }
        @media (max-width:600px) {
          .lp-feat-grid   { grid-template-columns:1fr; }
          .lp-test-grid   { grid-template-columns:1fr; }
        }
      `}</style>

      <div className="grain" />

      {/* BG Orbs */}
      <div style={{ position:"fixed", inset:0, zIndex:0, pointerEvents:"none" }}>
        <div style={{ position:"absolute", width:isMobile?280:600, height:isMobile?280:600, borderRadius:"50%", background:"radial-gradient(circle,rgba(99,102,241,0.12) 0%,transparent 70%)", top:-80, left:-80 }} />
        <div style={{ position:"absolute", width:isMobile?240:500, height:isMobile?240:500, borderRadius:"50%", background:"radial-gradient(circle,rgba(139,92,246,0.10) 0%,transparent 70%)", bottom:200, right:-80 }} />
      </div>

      {/* ── NAVBAR ── */}
      <nav style={{ position:"fixed", top:0, left:0, right:0, zIndex:50, padding:isMobile?"10px 14px":"16px 24px" }}>
        <div style={{ maxWidth:1200, margin:"0 auto" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:isMobile?"10px 14px":"12px 24px", borderRadius:14, background:"rgba(6,6,15,0.9)", backdropFilter:"blur(24px)", border:"1px solid rgba(255,255,255,0.08)" }}>

            {/* Logo */}
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <div style={{ width:28, height:28, borderRadius:7, background:"linear-gradient(135deg,#6366f1,#8b5cf6)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <Search size={13} color="white" />
              </div>
              <span className="syne" style={{ fontWeight:700, fontSize:15 }}>Findify</span>
            </div>

            {/* Desktop links */}
            <div className="lp-hide-mob" style={{ display:"flex", gap:32, alignItems:"center" }}>
              {NAV_ITEMS.map(item => (
                <a key={item} href={`#${item.toLowerCase().replace(" ","-")}`} className="nav-link">{item}</a>
              ))}
            </div>

            {/* Desktop buttons */}
            <div className="lp-hide-mob" style={{ display:"flex", gap:10 }}>
              <button className="btn-secondary" onClick={() => navigate("/login")} style={{ padding:"8px 18px", borderRadius:10, fontSize:14, fontWeight:500, color:"white", cursor:"pointer" }}>Login</button>
              <button className="btn-primary"   onClick={() => navigate("/register")} style={{ padding:"8px 18px", borderRadius:10, fontSize:14, fontWeight:600, color:"white", border:"none", cursor:"pointer" }}>Get Started Free</button>
            </div>

            {/* Mobile hamburger */}
            <button onClick={() => setMenuOpen(v => !v)} style={{ background:"none", border:"none", color:"white", cursor:"pointer", padding:4, display:isMobile?"flex":"none" }}>
              {menuOpen ? <X size={22}/> : <Menu size={22}/>}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Fullscreen Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            style={{ position:"fixed", inset:0, background:"rgba(6,6,15,0.97)", zIndex:49, backdropFilter:"blur(24px)", display:"flex", flexDirection:"column", padding:"100px 28px 40px" }}>
            <div style={{ display:"flex", flexDirection:"column", gap:4, marginBottom:40 }}>
              {NAV_ITEMS.map((item,i) => (
                <motion.a key={item} href={`#${item.toLowerCase().replace(" ","-")}`}
                  initial={{ x:-20, opacity:0 }} animate={{ x:0, opacity:1 }} transition={{ delay:i*0.07 }}
                  onClick={() => setMenuOpen(false)}
                  style={{ fontSize:30, fontWeight:700, color:"white", textDecoration:"none", padding:"14px 0", borderBottom:"1px solid rgba(255,255,255,0.06)" }}
                  className="syne">{item}
                </motion.a>
              ))}
            </div>
            <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.28 }}
              style={{ display:"flex", flexDirection:"column", gap:12 }}>
              <button className="btn-secondary" onClick={() => { navigate("/login"); setMenuOpen(false) }} style={{ padding:"14px", borderRadius:12, fontSize:15, fontWeight:600, color:"white", cursor:"pointer", width:"100%" }}>Login</button>
              <button className="btn-primary"   onClick={() => { navigate("/register"); setMenuOpen(false) }} style={{ padding:"14px", borderRadius:12, fontSize:15, fontWeight:600, color:"white", border:"none", cursor:"pointer", width:"100%" }}>Get Started Free</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── HERO ── */}
      <section ref={heroRef} style={{ position:"relative", minHeight:"100vh", display:"flex", alignItems:"center", paddingTop:isMobile?80:100, zIndex:1 }}>
        <motion.div style={{ y:heroY, opacity:heroOpacity, width:"100%", maxWidth:1200, margin:"0 auto", padding:isMobile?"0 16px 56px":"0 24px" }}>

          {/* Badge */}
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
            style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"5px 14px", borderRadius:100, background:"rgba(99,102,241,0.12)", border:"1px solid rgba(99,102,241,0.3)", marginBottom:24 }}>
            <span style={{ width:6, height:6, borderRadius:"50%", background:"#6366f1", boxShadow:"0 0 8px #6366f1", flexShrink:0 }} />
            <span style={{ fontSize:12, color:"#a5b4fc", fontWeight:500 }}>
              {loading ? "Loading live data…" : stats ? `${fmt(stats.total_reports)} reports in the system — try it free` : "Now with AI Matching — Try it free"}
            </span>
          </motion.div>

          <div className="lp-hero-grid">
            {/* Copy */}
            <div>
              <motion.h1 initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2, duration:0.7 }}
                className="syne" style={{ fontSize:isMobile?40:"clamp(42px,5vw,72px)", fontWeight:800, lineHeight:1.05, letterSpacing:isMobile?"-1.5px":"-2px", marginBottom:18 }}>
                Find What's<br/>
                <span className="gradient-text">Lost.</span> Return<br/>
                What's Found.
              </motion.h1>

              <motion.p initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.35 }}
                style={{ fontSize:isMobile?15:17, color:"rgba(255,255,255,0.5)", lineHeight:1.7, marginBottom:28 }}>
                Findify connects your campus community with lost belongings through intelligent AI matching, real-time alerts, and a seamless claim process. Free for all students.
              </motion.p>

              <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.5 }}
                style={{ display:"flex", gap:10, marginBottom:36, flexDirection:isMobile?"column":"row" }}>
                <button className="btn-primary" onClick={() => navigate("/register")} style={{ padding:"13px 24px", borderRadius:12, fontSize:15, fontWeight:600, color:"white", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                  Report Lost Item <ArrowRight size={15}/>
                </button>
                <button className="btn-secondary" onClick={() => navigate("/browse")} style={{ padding:"13px 24px", borderRadius:12, fontSize:15, fontWeight:500, color:"white", cursor:"pointer", textAlign:"center" }}>
                  Browse Found Items
                </button>
              </motion.div>

              {/* Live stats from backend */}
              <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.65 }}
                className="lp-stat-grid">
                {STATS_DISPLAY.map((s,i) => (
                  <div key={i}>
                    {loading
                      ? <div style={{ height:28, width:60, borderRadius:6, background:"rgba(255,255,255,0.06)", animation:"lp-pulse 1.5s ease-in-out infinite" }} />
                      : <div className="syne" style={{ fontSize:isMobile?22:26, fontWeight:800, color:"white", letterSpacing:"-1px" }}>{s.value}</div>
                    }
                    <div style={{ fontSize:12, color:"rgba(255,255,255,0.4)", marginTop:2 }}>{s.label}</div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Live Activity Feed */}
            <motion.div initial={{ opacity:0, y:isMobile?20:0, x:isMobile?0:40 }} animate={{ opacity:1, x:0, y:0 }} transition={{ delay:0.4, duration:0.7 }}
              className={isMobile?"":"float"} style={{ position:"relative" }}>
              <div style={{ borderRadius:20, padding:isMobile?18:26, background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)", backdropFilter:"blur(32px)" }}>

                {/* Feed header */}
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
                  <span className="syne" style={{ fontWeight:700, fontSize:14 }}>Live Activity Feed</span>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    {loading && (
                      <motion.div animate={{ rotate:360 }} transition={{ duration:1, repeat:Infinity, ease:"linear" }}>
                        <RefreshCw size={11} color="#6366f1"/>
                      </motion.div>
                    )}
                    <span style={{ display:"flex", alignItems:"center", gap:5, fontSize:12, color:"#34d399" }}>
                      <span style={{ width:6, height:6, borderRadius:"50%", background:"#34d399", boxShadow:"0 0 6px #34d399", flexShrink:0 }}/>Live
                    </span>
                  </div>
                </div>

                {/* Tabs */}
                <div style={{ display:"flex", gap:8, marginBottom:14 }}>
                  {(["lost","found"] as const).map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                      style={{ padding:"5px 14px", borderRadius:8, fontSize:12, fontWeight:500, cursor:"pointer", border:"none",
                        background: activeTab===tab ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "rgba(255,255,255,0.05)",
                        color:      activeTab===tab ? "white" : "rgba(255,255,255,0.4)" }}>
                      {tab.charAt(0).toUpperCase()+tab.slice(1)}
                    </button>
                  ))}
                </div>

                {/* Activity list */}
                <div style={{ display:"flex", flexDirection:"column", gap:7, minHeight:160 }}>
                  <AnimatePresence mode="popLayout">
                    {loading ? (
                      [1,2,3].map(i => (
                        <div key={i} style={{ height:46, borderRadius:10, background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)", animation:"lp-pulse 1.5s ease-in-out infinite" }}/>
                      ))
                    ) : filteredActivity.length > 0 ? (
                      filteredActivity.slice(0,4).map((item,i) => (
                        <ActivityItem key={item.id} item={item} index={i}/>
                      ))
                    ) : (
                      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:100, fontSize:12, color:"rgba(255,255,255,0.25)" }}>
                        No {activeTab} reports yet
                      </div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Search bar */}
                <div style={{ marginTop:12, padding:"8px 11px", borderRadius:10, background:"rgba(99,102,241,0.08)", border:"1px solid rgba(99,102,241,0.2)", display:"flex", alignItems:"center", gap:7, cursor:"pointer" }}
                  onClick={() => navigate("/browse")}>
                  <Search size={12} color="#818cf8"/>
                  <span style={{ fontSize:12, color:"rgba(255,255,255,0.3)" }}>
                    Search {stats ? fmt(stats.total_reports) : "…"} active reports...
                  </span>
                </div>
              </div>

              {/* Floating badges — hidden on mobile via CSS */}
              <div className="lp-hero-floats">
                <div style={{ position:"absolute", top:-14, right:-14, padding:"7px 13px", borderRadius:10, background:"#6366f1", fontSize:12, fontWeight:600, boxShadow:"0 8px 24px rgba(99,102,241,0.5)", whiteSpace:"nowrap" }}>
                  🎯 {stats ? `${stats.matched_reports} matches confirmed!` : "Match Found!"}
                </div>
                <div style={{ position:"absolute", bottom:-14, left:-14, padding:"7px 13px", borderRadius:10, background:"rgba(6,6,15,0.95)", border:"1px solid rgba(255,255,255,0.1)", fontSize:12, fontWeight:500, color:"#34d399", whiteSpace:"nowrap" }}>
                  ✓ {stats ? `${stats.new_this_month} new reports this month` : "3 items recovered today"}
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ── TICKER ── */}
      <div style={{ background:"rgba(99,102,241,0.08)", borderTop:"1px solid rgba(99,102,241,0.2)", borderBottom:"1px solid rgba(99,102,241,0.2)", padding:"12px 0", zIndex:1, position:"relative", overflow:"hidden" }}>
        <div className="ticker-wrap">
          <div className="ticker">
            {[...Array(3)].map((_,j) => (
              <span key={j}>
                {TICKER_ITEMS.map((t,i) => (
                  <span key={i} style={{ marginRight:52, fontSize:12, fontWeight:500, color:"rgba(255,255,255,0.4)", letterSpacing:"0.5px" }}>{t}</span>
                ))}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── FEATURES ── */}
      <section id="features" style={{ maxWidth:1200, margin:"0 auto", padding:isMobile?"72px 16px":"120px 24px", position:"relative", zIndex:1 }}>
        <motion.div initial={{ opacity:0, y:30 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
          style={{ textAlign:"center", marginBottom:isMobile?40:72 }}>
          <span style={{ fontSize:11, fontWeight:600, letterSpacing:3, color:"#818cf8", textTransform:"uppercase", display:"block", marginBottom:12 }}>Everything You Need</span>
          <h2 className="syne" style={{ fontSize:isMobile?30:"clamp(32px,4vw,52px)", fontWeight:800, letterSpacing:"-1.5px", marginBottom:12 }}>
            Built for the <span className="gradient-text">modern campus</span>
          </h2>
          <p style={{ color:"rgba(255,255,255,0.45)", fontSize:isMobile?14:17, maxWidth:500, margin:"0 auto" }}>
            Every feature is purpose-built to maximize recovery rates and minimize friction.
          </p>
        </motion.div>
        <div className="lp-feat-grid">
          {FEATURES.map((f,i) => (
            <motion.div key={i} initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:i*0.07 }}
              className="card-glass card-hover" style={{ borderRadius:16, padding:isMobile?20:26 }}>
              <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:16 }}>
                <div style={{ width:40, height:40, borderRadius:10, background:`${f.color}18`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <f.icon size={18} color={f.color}/>
                </div>
                <span style={{ fontSize:10, fontWeight:600, letterSpacing:1, color:f.color, background:`${f.color}15`, padding:"3px 8px", borderRadius:20, textTransform:"uppercase" }}>{f.tag}</span>
              </div>
              <h3 className="syne" style={{ fontWeight:700, fontSize:15, marginBottom:8 }}>{f.title}</h3>
              <p style={{ fontSize:13, color:"rgba(255,255,255,0.45)", lineHeight:1.65 }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" style={{ background:"rgba(255,255,255,0.015)", borderTop:"1px solid rgba(255,255,255,0.05)", borderBottom:"1px solid rgba(255,255,255,0.05)", position:"relative", zIndex:1 }}>
        <div style={{ maxWidth:1200, margin:"0 auto", padding:isMobile?"72px 16px":"120px 24px" }}>
          <motion.div initial={{ opacity:0, y:30 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
            style={{ textAlign:"center", marginBottom:isMobile?40:80 }}>
            <span style={{ fontSize:11, fontWeight:600, letterSpacing:3, color:"#818cf8", textTransform:"uppercase", display:"block", marginBottom:12 }}>Simple Process</span>
            <h2 className="syne" style={{ fontSize:isMobile?28:"clamp(32px,4vw,52px)", fontWeight:800, letterSpacing:"-1.5px" }}>
              From lost to <span className="gradient-text">reunited</span><br/>in four steps
            </h2>
          </motion.div>
          <div className="lp-steps-grid">
            {HOW_IT_WORKS.map((s,i) => (
              <motion.div key={i} initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:i*0.1 }}
                style={{
                  textAlign:isMobile?"left":"center",
                  display:isMobile?"flex":"block", alignItems:isMobile?"flex-start":undefined, gap:isMobile?16:0,
                  padding:isMobile?"16px 18px":0, borderRadius:isMobile?14:0,
                  background:isMobile?"rgba(255,255,255,0.02)":"none",
                  border:isMobile?"1px solid rgba(255,255,255,0.06)":"none",
                }}>
                <div style={{ width:52, height:52, borderRadius:"50%", background:`linear-gradient(135deg,${s.color}20,${s.color}08)`, border:`1px solid ${s.color}40`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, margin:isMobile?0:"0 auto 18px" }}>
                  <span className="syne" style={{ fontSize:17, fontWeight:800, color:s.color }}>{s.step}</span>
                </div>
                <div>
                  <h3 className="syne" style={{ fontWeight:700, fontSize:15, marginBottom:6 }}>{s.title}</h3>
                  <p style={{ fontSize:13, color:"rgba(255,255,255,0.4)", lineHeight:1.6 }}>{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LIVE STATS BANNER ── */}
      {stats && (
        <div style={{ maxWidth:1200, margin:"0 auto", padding:isMobile?"48px 16px":"72px 24px", position:"relative", zIndex:1 }}>
          <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
            style={{ borderRadius:20, padding:isMobile?"24px 20px":"32px 48px", background:"linear-gradient(135deg,rgba(99,102,241,0.1),rgba(139,92,246,0.07))", border:"1px solid rgba(99,102,241,0.2)", display:"grid", gridTemplateColumns:isMobile?"repeat(2,1fr)":"repeat(4,1fr)", gap:isMobile?20:0 }}>
            {[
              { label:"Total Reports",    value:fmt(stats.total_reports),   color:"#818cf8" },
              { label:"Items Recovered",  value:fmt(stats.items_recovered), color:"#34d399" },
              { label:"Active Users",     value:fmt(stats.active_users),    color:"#a78bfa" },
              { label:"Recovery Rate",    value:`${stats.recovery_rate}%`,  color:"#fbbf24" },
            ].map((s,i) => (
              <div key={i} style={{ textAlign:"center", borderRight:(!isMobile && i<3)?"1px solid rgba(255,255,255,0.07)":undefined }}>
                <div className="syne" style={{ fontSize:isMobile?28:36, fontWeight:800, color:s.color, letterSpacing:"-1.5px", lineHeight:1 }}>{s.value}</div>
                <div style={{ fontSize:12, color:"rgba(255,255,255,0.4)", marginTop:6, fontWeight:500 }}>{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      )}

      {/* ── TESTIMONIALS ── */}
      <section id="testimonials" style={{ maxWidth:1200, margin:"0 auto", padding:isMobile?"0 16px 72px":"0 24px 120px", position:"relative", zIndex:1 }}>
        <motion.div initial={{ opacity:0, y:30 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
          style={{ textAlign:"center", marginBottom:isMobile?36:72 }}>
          <span style={{ fontSize:11, fontWeight:600, letterSpacing:3, color:"#818cf8", textTransform:"uppercase", display:"block", marginBottom:12 }}>Real Stories</span>
          <h2 className="syne" style={{ fontSize:isMobile?28:"clamp(32px,4vw,52px)", fontWeight:800, letterSpacing:"-1.5px" }}>
            Loved by <span className="gradient-text">thousands</span>
          </h2>
        </motion.div>
        <div className="lp-test-grid">
          {TESTIMONIALS.map((t,i) => (
            <motion.div key={i} initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:i*0.07 }}
              className="card-glass card-hover" style={{ borderRadius:16, padding:isMobile?18:26 }}>
              <div style={{ display:"flex", gap:3, marginBottom:12 }}>
                {[...Array(t.rating)].map((_,j) => <Star key={j} size={12} fill="#f59e0b" color="#f59e0b"/>)}
              </div>
              <p style={{ fontSize:13, color:"rgba(255,255,255,0.6)", lineHeight:1.7, marginBottom:16 }}>"{t.quote}"</p>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ width:34, height:34, borderRadius:"50%", background:"linear-gradient(135deg,#6366f1,#8b5cf6)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, flexShrink:0 }}>{t.avatar}</div>
                <div>
                  <div style={{ fontSize:13, fontWeight:600 }}>{t.author}</div>
                  <div style={{ fontSize:11, color:"rgba(255,255,255,0.35)" }}>{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ maxWidth:800, margin:"0 auto", padding:isMobile?"0 16px 72px":"0 24px 120px", position:"relative", zIndex:1 }}>
        <motion.div initial={{ opacity:0, y:30 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
          style={{ textAlign:"center", marginBottom:isMobile?36:64 }}>
          <span style={{ fontSize:11, fontWeight:600, letterSpacing:3, color:"#818cf8", textTransform:"uppercase", display:"block", marginBottom:12 }}>FAQ</span>
          <h2 className="syne" style={{ fontSize:isMobile?26:"clamp(28px,3vw,44px)", fontWeight:800, letterSpacing:"-1px" }}>Common questions</h2>
        </motion.div>
        {[
          { q:"How accurate is the AI matching?", a:"Our matching engine scores each pair on category, item name, description, distinguishing features, location, and date. It handles Bisaya, Tagalog, and English seamlessly." },
          { q:"Is it free for students?", a:"Yes — reporting a lost or found item is completely free. Students and staff can create accounts, submit reports, file claims, and receive notifications at no cost." },
          { q:"How is my personal data protected?", a:"Reporter contact details and personal information are only visible to admins and the item finder. Other users can see the report without any personal details." },
          { q:"What happens to unclaimed items?", a:"Admins can close or archive reports after a configurable time. The system tracks all status changes with a full audit log." },
        ].map((faq,i) => <FAQItem key={i} faq={faq} i={i}/>)}
      </section>

      {/* ── CTA ── */}
      <section style={{ maxWidth:1200, margin:"0 auto", padding:isMobile?"0 16px 72px":"0 24px 120px", position:"relative", zIndex:1 }}>
        <motion.div initial={{ opacity:0, y:30 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
          style={{ borderRadius:isMobile?20:32, padding:isMobile?"44px 22px":"72px 64px", background:"linear-gradient(135deg,rgba(99,102,241,0.2),rgba(139,92,246,0.15))", border:"1px solid rgba(99,102,241,0.3)", textAlign:"center", position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", width:300, height:300, borderRadius:"50%", background:"radial-gradient(circle,rgba(99,102,241,0.15) 0%,transparent 70%)", top:-80, left:-80, pointerEvents:"none" }}/>
          <span className="syne" style={{ display:"block", fontSize:11, fontWeight:700, letterSpacing:3, color:"#a5b4fc", textTransform:"uppercase", marginBottom:14 }}>Get Started Today</span>
          <h2 className="syne" style={{ fontSize:isMobile?26:"clamp(28px,4vw,52px)", fontWeight:800, letterSpacing:"-1px", marginBottom:14 }}>
            Ready to reconnect<br/>your community?
          </h2>
          <p style={{ color:"rgba(255,255,255,0.5)", fontSize:isMobile?14:16, marginBottom:32, maxWidth:420, margin:"0 auto 32px" }}>
            {stats ? `Join ${fmt(stats.active_users)} active users. Set up in under 2 minutes. Free for students.` : "Join thousands of students. Set up in under 2 minutes. No credit card required."}
          </p>
          <div style={{ display:"flex", gap:10, justifyContent:"center", flexDirection:isMobile?"column":"row", maxWidth:isMobile?320:"none", margin:"0 auto" }}>
            <button className="btn-primary" onClick={() => navigate("/register")} style={{ padding:"13px 28px", borderRadius:12, fontSize:15, fontWeight:600, color:"white", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
              Start for Free <ArrowRight size={15}/>
            </button>
            <button className="btn-secondary" onClick={() => navigate("/login")} style={{ padding:"13px 28px", borderRadius:12, fontSize:15, fontWeight:500, color:"white", cursor:"pointer" }}>
              Sign In
            </button>
          </div>
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop:"1px solid rgba(255,255,255,0.06)", background:"rgba(255,255,255,0.02)", position:"relative", zIndex:1 }}>
        <div style={{ maxWidth:1200, margin:"0 auto", padding:isMobile?"44px 16px 28px":"64px 24px 40px" }}>

          {/* Desktop footer */}
          <div className="lp-footer-desk lp-footer-grid">
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
                <div style={{ width:30, height:30, borderRadius:8, background:"linear-gradient(135deg,#6366f1,#8b5cf6)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <Search size={14} color="white"/>
                </div>
                <span className="syne" style={{ fontWeight:700, fontSize:15 }}>Findify</span>
              </div>
              <p style={{ fontSize:13, color:"rgba(255,255,255,0.35)", lineHeight:1.7, maxWidth:240 }}>Intelligent lost & found management built for modern campuses.</p>
              <div style={{ display:"flex", gap:8, marginTop:18 }}>
                {["Twitter","LinkedIn","GitHub"].map(s => (
                  <div key={s} style={{ padding:"5px 12px", borderRadius:7, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", fontSize:12, color:"rgba(255,255,255,0.4)", cursor:"pointer" }}>{s}</div>
                ))}
              </div>
            </div>
            {[
              { title:"Product",   links:["Features","How It Works","AI Matching","Security"] },
              { title:"Community", links:["Report Lost","Browse Found","Claims","Notifications"] },
              { title:"Resources", links:["Docs","Support","Status","Changelog"] },
              { title:"Legal",     links:["Privacy","Terms","Cookies","GDPR"] },
            ].map((col,i) => (
              <div key={i}>
                <div style={{ fontSize:13, fontWeight:600, marginBottom:14 }}>{col.title}</div>
                <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
                  {col.links.map(link => (
                    <a key={link} href="#" style={{ fontSize:13, color:"rgba(255,255,255,0.35)", textDecoration:"none", transition:"color 0.2s" }}
                      onMouseEnter={e => (e.target as HTMLElement).style.color="white"}
                      onMouseLeave={e => (e.target as HTMLElement).style.color="rgba(255,255,255,0.35)"}>{link}</a>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Mobile footer */}
          <div className="lp-footer-mob">
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
                <div style={{ width:26, height:26, borderRadius:7, background:"linear-gradient(135deg,#6366f1,#8b5cf6)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <Search size={12} color="white"/>
                </div>
                <span className="syne" style={{ fontWeight:700, fontSize:14 }}>Findify</span>
              </div>
              <p style={{ fontSize:13, color:"rgba(255,255,255,0.35)", lineHeight:1.6 }}>Intelligent lost & found management for modern campuses.</p>
              <div style={{ display:"flex", gap:8, marginTop:14 }}>
                {["Twitter","LinkedIn","GitHub"].map(s => (
                  <div key={s} style={{ padding:"5px 11px", borderRadius:7, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", fontSize:12, color:"rgba(255,255,255,0.4)", cursor:"pointer" }}>{s}</div>
                ))}
              </div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:24 }}>
              {[
                { title:"Product",   links:["Features","How It Works","AI Matching","Security"] },
                { title:"Community", links:["Report Lost","Browse Found","Claims"] },
                { title:"Resources", links:["Docs","Support","Status"] },
                { title:"Legal",     links:["Privacy","Terms","GDPR"] },
              ].map((col,i) => (
                <div key={i}>
                  <div style={{ fontSize:13, fontWeight:600, marginBottom:10 }}>{col.title}</div>
                  <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
                    {col.links.map(link => (
                      <a key={link} href="#" style={{ fontSize:13, color:"rgba(255,255,255,0.35)", textDecoration:"none" }}>{link}</a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer bottom */}
          <div style={{ borderTop:"1px solid rgba(255,255,255,0.06)", paddingTop:18, display:"flex", flexDirection:isMobile?"column":"row", gap:isMobile?5:0, justifyContent:"space-between", alignItems:"center", textAlign:"center" }}>
            <span style={{ fontSize:12, color:"rgba(255,255,255,0.25)" }}>© 2025 Findify. All rights reserved.</span>
            <span style={{ fontSize:12, color:"rgba(255,255,255,0.25)" }}>Made by Keybeen♥ for campuses everywhere</span>
          </div>
        </div>
      </footer>
    </div>
  )
}