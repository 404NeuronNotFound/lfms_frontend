
"use client"
import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion"
import {
  Search, ShieldCheck, BellRing, MapPin, Tag, ArrowRight,
  CheckCircle, Star, Menu, X, ChevronDown, Zap, Globe, Lock
} from "lucide-react"

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])
  return isMobile
}

const NAV_ITEMS = ["Features", "How It Works", "Pricing", "Testimonials"]

const STATS = [
  { value: "24K+", label: "Items Recovered" },
  { value: "18K+", label: "Active Users" },
  { value: "98.6%", label: "Success Rate" },
  { value: "< 12h", label: "Avg. Match Time" },
]

const FEATURES = [
  { icon: Zap, color: "#f59e0b", title: "AI-Powered Matching", desc: "Our engine compares lost and found reports in real time using image recognition and semantic search — no manual browsing needed.", tag: "Smart" },
  { icon: MapPin, color: "#3b82f6", title: "Location Intelligence", desc: "Geo-tagged reports with interactive maps help you visualize exactly where items were lost or found within your campus or city.", tag: "Geo" },
  { icon: BellRing, color: "#a78bfa", title: "Instant Alerts", desc: "Push, email, and SMS notifications the moment a matching item is reported. Never miss a match again.", tag: "Live" },
  { icon: ShieldCheck, color: "#34d399", title: "Verified Claims", desc: "Multi-step identity verification and item ownership checks ensure only rightful owners can claim items.", tag: "Secure" },
  { icon: Globe, color: "#f87171", title: "Multi-Campus Support", desc: "Deploy across multiple locations, departments, or buildings under one unified admin dashboard.", tag: "Scale" },
  { icon: Lock, color: "#60a5fa", title: "Privacy First", desc: "End-to-end encrypted reports. Personal data is never shared without explicit consent.", tag: "Private" },
]

const HOW_IT_WORKS = [
  { step: "01", title: "Report Your Item", desc: "Submit a detailed report with photos, description, and location. Takes under 60 seconds.", color: "#6366f1" },
  { step: "02", title: "AI Scans for Matches", desc: "Our system instantly cross-references your report against all active found items in the database.", color: "#8b5cf6" },
  { step: "03", title: "Get Notified", desc: "Receive instant alerts when a potential match is found, with confidence score and details.", color: "#a78bfa" },
  { step: "04", title: "Claim & Reunite", desc: "Verify ownership through our secure process and arrange a safe handoff or pickup.", color: "#c4b5fd" },
]

const TESTIMONIALS = [
  { quote: "I recovered my laptop within 18 hours. The AI match was uncanny — it found it before I even finished filling the form.", author: "Marcus T.", role: "Computer Science Student", rating: 5, avatar: "MT" },
  { quote: "We manage lost property for 3 university campuses. This system cut our admin time by 70% and tripled recovery rates.", author: "Dr. Sarah Chen", role: "Campus Operations Director", rating: 5, avatar: "SC" },
  { quote: "The notification system is phenomenal. I got a push alert 6 minutes after my wallet was turned in at the library.", author: "Aiden R.", role: "MBA Candidate", rating: 5, avatar: "AR" },
  { quote: "Finally a lost & found platform that doesn't feel like it's from 2005. Clean, fast, and it actually works.", author: "Priya M.", role: "Office Manager, TechCorp", rating: 5, avatar: "PM" },
  { quote: "The geo-tagging feature helped us locate a cluster of unreported lost items near the cafeteria. Game changer.", author: "James L.", role: "Security Coordinator", rating: 5, avatar: "JL" },
  { quote: "Our students trust the system because of the verification flow. No more disputes, no more false claims.", author: "Prof. Ana Vega", role: "Student Affairs Lead", rating: 5, avatar: "AV" },
]

const PRICING = [
  {
    name: "Starter", price: "Free", period: "", desc: "Perfect for small communities just getting started.",
    features: ["Up to 50 active reports", "Basic search & match", "Email notifications", "1 location", "7-day history"],
    cta: "Get Started", highlight: false
  },
  {
    name: "Pro", price: "$29", period: "/mo", desc: "For growing campuses and organizations.",
    features: ["Unlimited reports", "AI-powered matching", "Push + SMS + Email alerts", "5 locations", "Full history & analytics", "Priority support"],
    cta: "Start Free Trial", highlight: true
  },
  {
    name: "Enterprise", price: "Custom", period: "", desc: "Multi-site deployments with custom integrations.",
    features: ["Everything in Pro", "Unlimited locations", "Custom branding", "API access", "SSO & LDAP", "Dedicated account manager"],
    cta: "Contact Sales", highlight: false
  },
]

const RECENT_ITEMS = [
  { type: "Lost", item: "AirPods Pro (White)", location: "Library 2F", time: "2 min ago", match: "87%" },
  { type: "Found", item: "Blue Hydroflask Bottle", location: "Cafeteria", time: "8 min ago", match: null },
  { type: "Lost", item: "Student ID Card", location: "Gym Entrance", time: "15 min ago", match: "92%" },
  { type: "Found", item: "Black Leather Wallet", location: "Parking Lot B", time: "23 min ago", match: null },
  { type: "Lost", item: "MacBook Pro 14\"", location: "Lab 301", time: "1h ago", match: "76%" },
]

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("lost")
  const isMobile = useIsMobile()
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] })
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  useEffect(() => { if (!isMobile) setMenuOpen(false) }, [isMobile])


  return (
      <div style={{ fontFamily: "'DM Sans', sans-serif" }} className="bg-[#06060f] text-white min-h-screen overflow-x-hidden relative">

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: #06060f; }
        ::-webkit-scrollbar-thumb { background: #6366f1; border-radius: 2px; }
        .syne { font-family: 'Syne', sans-serif; }
        .gradient-text {
          background: linear-gradient(135deg, #818cf8, #c084fc, #60a5fa);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .card-glass { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); backdrop-filter: blur(24px); }
        .card-hover { transition: all 0.3s ease; cursor: default; }
        .card-hover:hover { background: rgba(255,255,255,0.06); border-color: rgba(99,102,241,0.4); transform: translateY(-4px); box-shadow: 0 24px 48px rgba(99,102,241,0.15); }
        .btn-primary { background: linear-gradient(135deg, #6366f1, #8b5cf6); transition: all 0.3s ease; }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 16px 32px rgba(99,102,241,0.4); }
        .btn-secondary { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.15); transition: all 0.3s ease; }
        .btn-secondary:hover { background: rgba(255,255,255,0.12); border-color: rgba(255,255,255,0.3); }
        .grain { position: fixed; inset: 0; z-index: 100; pointer-events: none; opacity: 0.03;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          background-size: 150px 150px; }
        .ticker-wrap { overflow: hidden; white-space: nowrap; }
        .ticker { display: inline-block; animation: ticker 30s linear infinite; }
        @keyframes ticker { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        .float { animation: float 6s ease-in-out infinite; }
        .nav-link { font-size: 14px; color: rgba(255,255,255,0.6); text-decoration: none; transition: color 0.2s; }
        .nav-link:hover { color: white; }
      `}</style>

      <div className="grain" />

      {/* BG Orbs */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        <div style={{ position: "absolute", width: isMobile ? 280 : 600, height: isMobile ? 280 : 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)", top: -80, left: -80 }} />
        <div style={{ position: "absolute", width: isMobile ? 240 : 500, height: isMobile ? 240 : 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.10) 0%, transparent 70%)", bottom: 200, right: -80 }} />
      </div>

      {/* ── NAVBAR ── */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, padding: isMobile ? "10px 14px" : "16px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: isMobile ? "10px 14px" : "12px 24px", borderRadius: 14,
            background: "rgba(6,6,15,0.9)", backdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,0.08)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: 7, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Search size={13} color="white" />
              </div>
              <span className="syne" style={{ fontWeight: 700, fontSize: 15 }}>Findify</span>
            </div>

            {!isMobile && (
              <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
                {NAV_ITEMS.map(item => (
                  <a key={item} href={`#${item.toLowerCase().replace(" ", "-")}`} className="nav-link">{item}</a>
                ))}
              </div>
            )}

            {!isMobile ? (
              <div style={{ display: "flex", gap: 10 }}>
                
                <button className="btn-secondary" style={{ padding: "8px 18px", borderRadius: 10, fontSize: 14, fontWeight: 500, color: "white", cursor: "pointer" }}>Login</button>
                <button className="btn-primary" style={{ padding: "8px 18px", borderRadius: 10, fontSize: 14, fontWeight: 600, color: "white", border: "none", cursor: "pointer" }}>Get Started</button>
              </div>
            ) : (
              <button onClick={() => setMenuOpen(v => !v)} style={{ background: "none", border: "none", color: "white", cursor: "pointer", padding: 4, display: "flex" }}>
                {menuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Fullscreen Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, background: "rgba(6,6,15,0.97)", zIndex: 49, backdropFilter: "blur(24px)", display: "flex", flexDirection: "column", padding: "100px 28px 40px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 40 }}>
              {NAV_ITEMS.map((item, i) => (
                <motion.a key={item} href={`#${item.toLowerCase().replace(" ", "-")}`}
                  initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.07 }}
                  onClick={() => setMenuOpen(false)}
                  style={{ fontSize: 30, fontWeight: 700, color: "white", textDecoration: "none", padding: "14px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
                  className="syne">
                  {item}
                </motion.a>
              ))}
            </div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }}
              style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <button className="btn-secondary" style={{ padding: "14px", borderRadius: 12, fontSize: 15, fontWeight: 600, color: "white", cursor: "pointer", width: "100%" }}>Login</button>
              <button className="btn-primary" style={{ padding: "14px", borderRadius: 12, fontSize: 15, fontWeight: 600, color: "white", border: "none", cursor: "pointer", width: "100%" }}>Get Started Free</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── HERO ── */}
      <section ref={heroRef} style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", paddingTop: isMobile ? 80 : 100, zIndex: 1 }}>
        <motion.div style={{ y: heroY, opacity: heroOpacity, width: "100%", maxWidth: 1200, margin: "0 auto", padding: isMobile ? "0 16px 56px" : "0 24px" }}>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 14px", borderRadius: 100, background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.3)", marginBottom: 24 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#6366f1", boxShadow: "0 0 8px #6366f1", flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: "#a5b4fc", fontWeight: 500 }}>Now with AI Matching — Try it free</span>
          </motion.div>

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 36 : 64, alignItems: "center" }}>

            {/* Copy */}
            <div>
              <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.7 }}
                className="syne" style={{ fontSize: isMobile ? 40 : "clamp(42px,5vw,72px)", fontWeight: 800, lineHeight: 1.05, letterSpacing: isMobile ? "-1.5px" : "-2px", marginBottom: 18 }}>
                Find What's<br />
                <span className="gradient-text">Lost.</span> Return<br />
                What's Found.
              </motion.h1>

              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
                style={{ fontSize: isMobile ? 15 : 17, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, marginBottom: 28 }}>
                Findify connects communities with their lost belongings through intelligent matching, real-time alerts, and a seamless claim process. Trusted by 200+ institutions.
              </motion.p>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                style={{ display: "flex", gap: 10, marginBottom: 36, flexDirection: isMobile ? "column" : "row" }}>
                <button className="btn-primary" style={{ padding: "13px 24px", borderRadius: 12, fontSize: 15, fontWeight: 600, color: "white", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  Report Lost Item <ArrowRight size={15} />
                </button>
                <button className="btn-secondary" style={{ padding: "13px 24px", borderRadius: 12, fontSize: 15, fontWeight: 500, color: "white", cursor: "pointer", textAlign: "center" }}>
                  Browse Found Items
                </button>
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.65 }}
                style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "14px 24px" }}>
                {STATS.map((s, i) => (
                  <div key={i}>
                    <div className="syne" style={{ fontSize: isMobile ? 22 : 26, fontWeight: 800, color: "white", letterSpacing: "-1px" }}>{s.value}</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{s.label}</div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Live Feed */}
            <motion.div initial={{ opacity: 0, y: isMobile ? 20 : 0, x: isMobile ? 0 : 40 }} animate={{ opacity: 1, x: 0, y: 0 }} transition={{ delay: 0.4, duration: 0.7 }}
              className={isMobile ? "" : "float"} style={{ position: "relative" }}>
              <div style={{ borderRadius: 20, padding: isMobile ? 18 : 26, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(32px)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                  <span className="syne" style={{ fontWeight: 700, fontSize: 14 }}>Live Activity Feed</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#34d399" }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#34d399", boxShadow: "0 0 6px #34d399", flexShrink: 0 }} />Live
                  </span>
                </div>
                <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                  {["lost", "found"].map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                      style={{ padding: "5px 14px", borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: "pointer", border: "none",
                        background: activeTab === tab ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "rgba(255,255,255,0.05)",
                        color: activeTab === tab ? "white" : "rgba(255,255,255,0.4)" }}>
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  {RECENT_ITEMS.filter(i => activeTab === "lost" ? i.type === "Lost" : i.type === "Found").map((item, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                      style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 11px", borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <div style={{ width: 30, height: 30, borderRadius: 8, background: item.type === "Lost" ? "rgba(239,68,68,0.15)" : "rgba(52,211,153,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {item.type === "Lost" ? <Tag size={12} color="#f87171" /> : <CheckCircle size={12} color="#34d399" />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.item}</div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 1 }}>{item.location} · {item.time}</div>
                      </div>
                      {item.match && <span style={{ fontSize: 10, fontWeight: 600, color: "#a78bfa", background: "rgba(167,139,250,0.12)", padding: "2px 6px", borderRadius: 5, flexShrink: 0 }}>{item.match}</span>}
                    </motion.div>
                  ))}
                </div>
                <div style={{ marginTop: 12, padding: "8px 11px", borderRadius: 10, background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)", display: "flex", alignItems: "center", gap: 7 }}>
                  <Search size={12} color="#818cf8" />
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>Search 4,200+ active reports...</span>
                </div>
              </div>
              {!isMobile && (
                <>
                  <div style={{ position: "absolute", top: -14, right: -14, padding: "7px 13px", borderRadius: 10, background: "#6366f1", fontSize: 12, fontWeight: 600, boxShadow: "0 8px 24px rgba(99,102,241,0.5)" }}>🎯 Match Found!</div>
                  <div style={{ position: "absolute", bottom: -14, left: -14, padding: "7px 13px", borderRadius: 10, background: "rgba(6,6,15,0.95)", border: "1px solid rgba(255,255,255,0.1)", fontSize: 12, fontWeight: 500, color: "#34d399" }}>✓ 3 items recovered today</div>
                </>
              )}
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ── TICKER ── */}
      <div style={{ background: "rgba(99,102,241,0.08)", borderTop: "1px solid rgba(99,102,241,0.2)", borderBottom: "1px solid rgba(99,102,241,0.2)", padding: "12px 0", zIndex: 1, position: "relative" }}>
        <div className="ticker-wrap">
          <div className="ticker">
            {[...Array(3)].map((_, j) => (
              <span key={j}>
                {["✦ 24K+ items recovered", "✦ AI-powered matching", "✦ Real-time notifications", "✦ 200+ institutions", "✦ < 12h avg match time", "✦ 98.6% success rate", "✦ End-to-end encrypted"].map((t, i) => (
                  <span key={i} style={{ marginRight: 52, fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.4)", letterSpacing: "0.5px" }}>{t}</span>
                ))}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── FEATURES ── */}
      <section id="features" style={{ maxWidth: 1200, margin: "0 auto", padding: isMobile ? "72px 16px" : "120px 24px", position: "relative", zIndex: 1 }}>
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: "center", marginBottom: isMobile ? 40 : 72 }}>
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: 3, color: "#818cf8", textTransform: "uppercase", display: "block", marginBottom: 12 }}>Everything You Need</span>
          <h2 className="syne" style={{ fontSize: isMobile ? 30 : "clamp(32px,4vw,52px)", fontWeight: 800, letterSpacing: "-1.5px", marginBottom: 12 }}>
            Built for the <span className="gradient-text">modern campus</span>
          </h2>
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: isMobile ? 14 : 17, maxWidth: 500, margin: "0 auto" }}>
            Every feature is purpose-built to maximize recovery rates and minimize friction.
          </p>
        </motion.div>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3,1fr)", gap: 14 }}>
          {FEATURES.map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
              className="card-glass card-hover" style={{ borderRadius: 16, padding: isMobile ? 20 : 26 }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: `${f.color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <f.icon size={18} color={f.color} />
                </div>
                <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1, color: f.color, background: `${f.color}15`, padding: "3px 8px", borderRadius: 20, textTransform: "uppercase" }}>{f.tag}</span>
              </div>
              <h3 className="syne" style={{ fontWeight: 700, fontSize: 15, marginBottom: 8 }}>{f.title}</h3>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.65 }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" style={{ background: "rgba(255,255,255,0.015)", borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: isMobile ? "72px 16px" : "120px 24px" }}>
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: "center", marginBottom: isMobile ? 40 : 80 }}>
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: 3, color: "#818cf8", textTransform: "uppercase", display: "block", marginBottom: 12 }}>Simple Process</span>
            <h2 className="syne" style={{ fontSize: isMobile ? 28 : "clamp(32px,4vw,52px)", fontWeight: 800, letterSpacing: "-1.5px" }}>
              From lost to <span className="gradient-text">reunited</span><br />in four steps
            </h2>
          </motion.div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(4,1fr)", gap: isMobile ? 14 : 32 }}>
            {HOW_IT_WORKS.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                style={{
                  textAlign: isMobile ? "left" : "center",
                  display: isMobile ? "flex" : "block", alignItems: isMobile ? "flex-start" : undefined, gap: isMobile ? 16 : 0,
                  padding: isMobile ? "16px 18px" : 0, borderRadius: isMobile ? 14 : 0,
                  background: isMobile ? "rgba(255,255,255,0.02)" : "none",
                  border: isMobile ? "1px solid rgba(255,255,255,0.06)" : "none"
                }}>
                <div style={{ width: 52, height: 52, borderRadius: "50%", background: `linear-gradient(135deg, ${s.color}20, ${s.color}08)`, border: `1px solid ${s.color}40`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, margin: isMobile ? 0 : "0 auto 18px" }}>
                  <span className="syne" style={{ fontSize: 17, fontWeight: 800, color: s.color }}>{s.step}</span>
                </div>
                <div>
                  <h3 className="syne" style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>{s.title}</h3>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.6 }}>{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF ── */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: isMobile ? "48px 16px" : "72px 24px", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, flexWrap: "wrap" }}>
          {["MIT", "Stanford", "Harvard", "UCB", "Oxford", "ETH Zürich", "NUS", "KAIST"].map((uni, i) => (
            <motion.div key={i} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
              style={{ padding: "6px 14px", borderRadius: 8, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.35)" }}>
              {uni}
            </motion.div>
          ))}
        </div>
        <p style={{ textAlign: "center", marginTop: 14, fontSize: 12, color: "rgba(255,255,255,0.2)" }}>Trusted by 200+ institutions globally</p>
      </div>

      {/* ── TESTIMONIALS ── */}
      <section id="testimonials" style={{ maxWidth: 1200, margin: "0 auto", padding: isMobile ? "0 16px 72px" : "0 24px 120px", position: "relative", zIndex: 1 }}>
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: "center", marginBottom: isMobile ? 36 : 72 }}>
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: 3, color: "#818cf8", textTransform: "uppercase", display: "block", marginBottom: 12 }}>Real Stories</span>
          <h2 className="syne" style={{ fontSize: isMobile ? 28 : "clamp(32px,4vw,52px)", fontWeight: 800, letterSpacing: "-1.5px" }}>
            Loved by <span className="gradient-text">thousands</span>
          </h2>
        </motion.div>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3,1fr)", gap: 14 }}>
          {TESTIMONIALS.map((t, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
              className="card-glass card-hover" style={{ borderRadius: 16, padding: isMobile ? 18 : 26 }}>
              <div style={{ display: "flex", gap: 3, marginBottom: 12 }}>
                {[...Array(t.rating)].map((_, j) => <Star key={j} size={12} fill="#f59e0b" color="#f59e0b" />)}
              </div>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.7, marginBottom: 16 }}>"{t.quote}"</p>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{t.avatar}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{t.author}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" style={{ background: "rgba(255,255,255,0.015)", borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: isMobile ? "72px 16px" : "120px 24px" }}>
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: "center", marginBottom: isMobile ? 40 : 72 }}>
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: 3, color: "#818cf8", textTransform: "uppercase", display: "block", marginBottom: 12 }}>Pricing</span>
            <h2 className="syne" style={{ fontSize: isMobile ? 28 : "clamp(32px,4vw,52px)", fontWeight: 800, letterSpacing: "-1.5px", marginBottom: 10 }}>
              Simple, transparent <span className="gradient-text">pricing</span>
            </h2>
            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 14 }}>Start free. Scale when you're ready.</p>
          </motion.div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3,1fr)", gap: isMobile ? 14 : 24, alignItems: isMobile ? "stretch" : "center" }}>
            {PRICING.map((p, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                style={{
                  borderRadius: 20, padding: p.highlight ? (isMobile ? 26 : 34) : (isMobile ? 22 : 26),
                  background: p.highlight ? "linear-gradient(135deg,rgba(99,102,241,0.15),rgba(139,92,246,0.1))" : "rgba(255,255,255,0.03)",
                  border: p.highlight ? "1px solid rgba(99,102,241,0.4)" : "1px solid rgba(255,255,255,0.07)",
                  position: "relative",
                  boxShadow: p.highlight ? "0 24px 48px rgba(99,102,241,0.2)" : "none",
                  transform: (!isMobile && p.highlight) ? "scale(1.03)" : "none",
                  marginTop: (isMobile && p.highlight) ? 6 : 0
                }}>
                {p.highlight && <div style={{ position: "absolute", top: -11, left: "50%", transform: "translateX(-50%)", padding: "3px 12px", borderRadius: 20, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", fontSize: 11, fontWeight: 600, whiteSpace: "nowrap" }}>Most Popular</div>}
                <span className="syne" style={{ fontSize: 11, fontWeight: 700, color: p.highlight ? "#a5b4fc" : "rgba(255,255,255,0.4)", letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 6 }}>{p.name}</span>
                <div style={{ display: "flex", alignItems: "baseline", gap: 3, marginBottom: 6 }}>
                  <span className="syne" style={{ fontSize: 36, fontWeight: 800, letterSpacing: "-2px" }}>{p.price}</span>
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>{p.period}</span>
                </div>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 18, lineHeight: 1.5 }}>{p.desc}</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 22 }}>
                  {p.features.map((f, j) => (
                    <div key={j} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <CheckCircle size={13} color={p.highlight ? "#818cf8" : "#34d399"} />
                      <span style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>{f}</span>
                    </div>
                  ))}
                </div>
                <button style={{ width: "100%", padding: "11px", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", border: "none", background: p.highlight ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "rgba(255,255,255,0.06)", color: "white", transition: "all 0.3s ease" }}>{p.cta}</button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ maxWidth: 800, margin: "0 auto", padding: isMobile ? "72px 16px" : "120px 24px", position: "relative", zIndex: 1 }}>
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: "center", marginBottom: isMobile ? 36 : 64 }}>
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: 3, color: "#818cf8", textTransform: "uppercase", display: "block", marginBottom: 12 }}>FAQ</span>
          <h2 className="syne" style={{ fontSize: isMobile ? 26 : "clamp(28px,3vw,44px)", fontWeight: 800, letterSpacing: "-1px" }}>Common questions</h2>
        </motion.div>
        {[
          { q: "How accurate is the AI matching?", a: "Our matching engine achieves 94%+ accuracy on image-based queries and 89% on text-only reports, improving with each new submission." },
          { q: "Can I use Findify for multiple campuses?", a: "Yes. The Pro and Enterprise plans support multiple locations. Each location gets its own dashboard and report feed while sharing the global matching pool." },
          { q: "How is my personal data protected?", a: "All reports and personal data are encrypted at rest and in transit. We're SOC 2 Type II compliant and GDPR-ready. Users control what information is visible to others." },
          { q: "What happens to unclaimed items?", a: "Admins can set automated archiving policies. Items can be flagged for donation, disposal, or transfer to your local authority after a configurable time window." },
        ].map((faq, i) => <FAQItem key={i} faq={faq} i={i} />)}
      </section>

      {/* ── CTA ── */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: isMobile ? "0 16px 72px" : "0 24px 120px", position: "relative", zIndex: 1 }}>
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          style={{ borderRadius: isMobile ? 20 : 32, padding: isMobile ? "44px 22px" : "72px 64px", background: "linear-gradient(135deg,rgba(99,102,241,0.2),rgba(139,92,246,0.15))", border: "1px solid rgba(99,102,241,0.3)", textAlign: "center", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle,rgba(99,102,241,0.15) 0%,transparent 70%)", top: -80, left: -80, pointerEvents: "none" }} />
          <span className="syne" style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: 3, color: "#a5b4fc", textTransform: "uppercase", marginBottom: 14 }}>Get Started Today</span>
          <h2 className="syne" style={{ fontSize: isMobile ? 26 : "clamp(28px,4vw,52px)", fontWeight: 800, letterSpacing: "-1px", marginBottom: 14 }}>
            Ready to reconnect<br />your community?
          </h2>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: isMobile ? 14 : 16, marginBottom: 32, maxWidth: 420, margin: "0 auto 32px" }}>
            Join 200+ institutions. Set up in under 10 minutes. No credit card required.
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexDirection: isMobile ? "column" : "row", maxWidth: isMobile ? 320 : "none", margin: "0 auto" }}>
            <button className="btn-primary" style={{ padding: "13px 28px", borderRadius: 12, fontSize: 15, fontWeight: 600, color: "white", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              Start for Free <ArrowRight size={15} />
            </button>
            <button className="btn-secondary" style={{ padding: "13px 28px", borderRadius: 12, fontSize: 15, fontWeight: 500, color: "white", cursor: "pointer" }}>
              Schedule Demo
            </button>
          </div>
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: isMobile ? "44px 16px 28px" : "64px 24px 40px" }}>
          {isMobile ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 28, marginBottom: 32 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <div style={{ width: 26, height: 26, borderRadius: 7, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Search size={12} color="white" />
                  </div>
                  <span className="syne" style={{ fontWeight: 700, fontSize: 14 }}>Findify</span>
                </div>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", lineHeight: 1.6 }}>Intelligent lost & found management built for modern institutions.</p>
                <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                  {["Twitter", "LinkedIn", "GitHub"].map(s => (
                    <div key={s} style={{ padding: "5px 11px", borderRadius: 7, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", fontSize: 12, color: "rgba(255,255,255,0.4)", cursor: "pointer" }}>{s}</div>
                  ))}
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                {[
                  { title: "Product", links: ["Features", "How It Works", "Pricing", "Security"] },
                  { title: "Company", links: ["About", "Blog", "Careers", "Contact"] },
                  { title: "Resources", links: ["Docs", "API", "Support", "Status"] },
                  { title: "Legal", links: ["Privacy", "Terms", "Cookies", "GDPR"] },
                ].map((col, i) => (
                  <div key={i}>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>{col.title}</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                      {col.links.map(link => (
                        <a key={link} href="#" style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", textDecoration: "none" }}>{link}</a>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", gap: 48, marginBottom: 56 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Search size={14} color="white" />
                  </div>
                  <span className="syne" style={{ fontWeight: 700, fontSize: 15 }}>Findify</span>
                </div>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", lineHeight: 1.7, maxWidth: 240 }}>Intelligent lost & found management built for modern institutions.</p>
                <div style={{ display: "flex", gap: 8, marginTop: 18 }}>
                  {["Twitter", "LinkedIn", "GitHub"].map(s => (
                    <div key={s} style={{ padding: "5px 12px", borderRadius: 7, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", fontSize: 12, color: "rgba(255,255,255,0.4)", cursor: "pointer" }}>{s}</div>
                  ))}
                </div>
              </div>
              {[
                { title: "Product", links: ["Features", "How It Works", "Pricing", "Security", "Changelog"] },
                { title: "Company", links: ["About", "Blog", "Careers", "Press", "Contact"] },
                { title: "Resources", links: ["Documentation", "API Reference", "Support", "Community", "Status"] },
                { title: "Legal", links: ["Privacy Policy", "Terms of Use", "Cookie Policy", "GDPR", "Security"] },
              ].map((col, i) => (
                <div key={i}>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>{col.title}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                    {col.links.map(link => (
                      <a key={link} href="#" style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", textDecoration: "none", transition: "color 0.2s" }}
                        onMouseEnter={e => (e.target as HTMLElement).style.color = "white"}
                        onMouseLeave={e => (e.target as HTMLElement).style.color = "rgba(255,255,255,0.35)"}
                      >{link}</a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 18, display: "flex", flexDirection: isMobile ? "column" : "row", gap: isMobile ? 5 : 0, justifyContent: "space-between", alignItems: "center", textAlign: "center" }}>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.25)" }}>© 2025 Findify. All rights reserved.</span>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.25)" }}>Made with ♥ for communities everywhere</span>
          </div>
        </div>
      </footer>
      </div>
  )
}

function FAQItem({ faq, i }: { faq: { q: string; a: string }; i: number }) {
  const [open, setOpen] = useState(false)
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
      style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
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