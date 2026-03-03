"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion"
import {
  Search, ShieldCheck, BellRing, Users, MapPin, Clock, Tag, ArrowRight,
  CheckCircle, Star, Menu, X, ChevronDown, Zap, Globe, Lock, TrendingUp,
  Package, Heart, Award, MessageSquare
} from "lucide-react"

const NAV_ITEMS = ["Features", "How It Works", "Pricing", "Testimonials"]

const STATS = [
  { value: "24K+", label: "Items Recovered", icon: Package },
  { value: "18K+", label: "Active Users", icon: Users },
  { value: "98.6%", label: "Success Rate", icon: TrendingUp },
  { value: "< 12h", label: "Avg. Match Time", icon: Clock },
]

const FEATURES = [
  {
    icon: Zap,
    color: "#f59e0b",
    title: "AI-Powered Matching",
    desc: "Our engine compares lost and found reports in real time using image recognition and semantic search — no manual browsing needed.",
    tag: "Smart"
  },
  {
    icon: MapPin,
    color: "#3b82f6",
    title: "Location Intelligence",
    desc: "Geo-tagged reports with interactive maps help you visualize exactly where items were lost or found within your campus or city.",
    tag: "Geo"
  },
  {
    icon: BellRing,
    color: "#a78bfa",
    title: "Instant Alerts",
    desc: "Push, email, and SMS notifications the moment a matching item is reported. Never miss a match again.",
    tag: "Live"
  },
  {
    icon: ShieldCheck,
    color: "#34d399",
    title: "Verified Claims",
    desc: "Multi-step identity verification and item ownership checks ensure only rightful owners can claim items.",
    tag: "Secure"
  },
  {
    icon: Globe,
    color: "#f87171",
    title: "Multi-Campus Support",
    desc: "Deploy across multiple locations, departments, or buildings under one unified admin dashboard.",
    tag: "Scale"
  },
  {
    icon: Lock,
    color: "#60a5fa",
    title: "Privacy First",
    desc: "End-to-end encrypted reports. Personal data is never shared without explicit consent.",
    tag: "Private"
  },
]

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Report Your Item",
    desc: "Submit a detailed report with photos, description, and location. Takes under 60 seconds.",
    color: "#6366f1"
  },
  {
    step: "02",
    title: "AI Scans for Matches",
    desc: "Our system instantly cross-references your report against all active found items in the database.",
    color: "#8b5cf6"
  },
  {
    step: "03",
    title: "Get Notified",
    desc: "Receive instant alerts when a potential match is found, with confidence score and details.",
    color: "#a78bfa"
  },
  {
    step: "04",
    title: "Claim & Reunite",
    desc: "Verify ownership through our secure process and arrange a safe handoff or pickup.",
    color: "#c4b5fd"
  },
]

const TESTIMONIALS = [
  {
    quote: "I recovered my laptop within 18 hours. The AI match was uncanny — it found it before I even finished filling the form.",
    author: "Marcus T.",
    role: "Computer Science Student",
    rating: 5,
    avatar: "MT"
  },
  {
    quote: "We manage lost property for 3 university campuses. This system cut our admin time by 70% and tripled recovery rates.",
    author: "Dr. Sarah Chen",
    role: "Campus Operations Director",
    rating: 5,
    avatar: "SC"
  },
  {
    quote: "The notification system is phenomenal. I got a push alert 6 minutes after my wallet was turned in at the library.",
    author: "Aiden R.",
    role: "MBA Candidate",
    rating: 5,
    avatar: "AR"
  },
  {
    quote: "Finally a lost & found platform that doesn't feel like it's from 2005. Clean, fast, and it actually works.",
    author: "Priya M.",
    role: "Office Manager, TechCorp",
    rating: 5,
    avatar: "PM"
  },
  {
    quote: "The geo-tagging feature helped us locate a cluster of unreported lost items near the cafeteria. Game changer.",
    author: "James L.",
    role: "Security Coordinator",
    rating: 5,
    avatar: "JL"
  },
  {
    quote: "Our students trust the system because of the verification flow. No more disputes, no more false claims.",
    author: "Prof. Ana Vega",
    role: "Student Affairs Lead",
    rating: 5,
    avatar: "AV"
  },
]

const PRICING = [
  {
    name: "Starter",
    price: "Free",
    period: "",
    desc: "Perfect for small communities just getting started.",
    features: ["Up to 50 active reports", "Basic search & match", "Email notifications", "1 location", "7-day history"],
    cta: "Get Started",
    highlight: false
  },
  {
    name: "Pro",
    price: "$29",
    period: "/mo",
    desc: "For growing campuses and organizations.",
    features: ["Unlimited reports", "AI-powered matching", "Push + SMS + Email alerts", "5 locations", "Full history & analytics", "Priority support"],
    cta: "Start Free Trial",
    highlight: true
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    desc: "Multi-site deployments with custom integrations.",
    features: ["Everything in Pro", "Unlimited locations", "Custom branding", "API access", "SSO & LDAP", "Dedicated account manager"],
    cta: "Contact Sales",
    highlight: false
  },
]

const RECENT_ITEMS = [
  { type: "Lost", item: "AirPods Pro (White)", location: "Library 2F", time: "2 min ago", match: "87%" },
  { type: "Found", item: "Blue Hydroflask Bottle", location: "Cafeteria", time: "8 min ago", match: null },
  { type: "Lost", item: "Student ID Card", location: "Gym Entrance", time: "15 min ago", match: "92%" },
  { type: "Found", item: "Black Leather Wallet", location: "Parking Lot B", time: "23 min ago", match: null },
  { type: "Lost", item: "MacBook Pro 14\"", location: "Lab 301", time: "1h ago", match: "76%" },
]

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("lost")
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] })
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  return (
    <div style={{ fontFamily: "'DM Sans', 'Syne', sans-serif" }} className="relative bg-[#06060f] text-white min-h-screen overflow-x-hidden">

      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #06060f; }
        ::-webkit-scrollbar-thumb { background: #6366f1; border-radius: 2px; }
        .syne { font-family: 'Syne', sans-serif; }
        .grain {
          position: fixed; inset: 0; z-index: 100; pointer-events: none; opacity: 0.035;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          background-repeat: repeat; background-size: 150px 150px;
        }
        .gradient-text {
          background: linear-gradient(135deg, #818cf8, #c084fc, #60a5fa);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .card-glass {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          backdrop-filter: blur(24px);
        }
        .card-hover { transition: all 0.3s ease; }
        .card-hover:hover {
          background: rgba(255,255,255,0.06);
          border-color: rgba(99,102,241,0.4);
          transform: translateY(-4px);
          box-shadow: 0 24px 48px rgba(99,102,241,0.15);
        }
        .btn-primary {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          transition: all 0.3s ease;
        }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 16px 32px rgba(99,102,241,0.4); }
        .btn-secondary {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.15);
          transition: all 0.3s ease;
        }
        .btn-secondary:hover { background: rgba(255,255,255,0.12); border-color: rgba(255,255,255,0.3); }
        .step-line::after {
          content: ''; position: absolute; top: 50%; left: 100%;
          width: 100%; height: 1px;
          background: linear-gradient(90deg, rgba(99,102,241,0.5), transparent);
        }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes pulse-ring { 0%{transform:scale(1);opacity:0.6} 100%{transform:scale(1.6);opacity:0} }
        .float { animation: float 6s ease-in-out infinite; }
        .ticker-wrap { overflow: hidden; white-space: nowrap; }
        .ticker { display: inline-block; animation: ticker 30s linear infinite; }
        @keyframes ticker { from{transform:translateX(0)} to{transform:translateX(-50%)} }
      `}</style>

      {/* Grain Overlay */}
      <div className="grain" />

      {/* Background Orbs */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        <div style={{ position: "absolute", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)", top: -100, left: -100 }} />
        <div style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.10) 0%, transparent 70%)", bottom: 200, right: -100 }} />
        <div style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(96,165,250,0.08) 0%, transparent 70%)", top: "50%", left: "40%" }} />
      </div>

      {/* NAVBAR */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, padding: "16px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "12px 24px", borderRadius: 16,
            background: "rgba(6,6,15,0.8)", backdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,0.08)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Search size={16} color="white" />
              </div>
              <span className="syne" style={{ fontWeight: 700, fontSize: 15, letterSpacing: "-0.3px" }}>Findify</span>
            </div>

            <div style={{ display: "flex", gap: 32, alignItems: "center" }} className="hidden-mobile">
              {NAV_ITEMS.map(item => (
                <a key={item} href={`#${item.toLowerCase().replace(" ", "-")}`} style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", textDecoration: "none", transition: "color 0.2s" }}
                  onMouseEnter={e => (e.target as HTMLElement).style.color = "white"}
                  onMouseLeave={e => (e.target as HTMLElement).style.color = "rgba(255,255,255,0.6)"}
                >{item}</a>
              ))}
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn-secondary" style={{ padding: "8px 18px", borderRadius: 10, fontSize: 14, fontWeight: 500, color: "white", cursor: "pointer" }}>Login</button>
              <button className="btn-primary" style={{ padding: "8px 18px", borderRadius: 10, fontSize: 14, fontWeight: 600, color: "white", border: "none", cursor: "pointer" }}>Get Started</button>
            </div>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section ref={heroRef} style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", paddingTop: 100, zIndex: 1 }}>
        <motion.div style={{ y: heroY, opacity: heroOpacity, width: "100%", maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>

          {/* Badge */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 16px", borderRadius: 100, background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.3)", marginBottom: 32 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#6366f1", boxShadow: "0 0 8px #6366f1" }} />
            <span style={{ fontSize: 13, color: "#a5b4fc", fontWeight: 500 }}>Now with AI Matching — Try it free</span>
          </motion.div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>
            <div>
              <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.7 }}
                className="syne" style={{ fontSize: "clamp(42px, 5vw, 72px)", fontWeight: 800, lineHeight: 1.05, letterSpacing: "-2px", marginBottom: 24 }}>
                Find What's<br />
                <span className="gradient-text">Lost.</span> Return<br />
                What's Found.
              </motion.h1>

              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
                style={{ fontSize: 17, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, maxWidth: 480, marginBottom: 40 }}>
                Findify connects communities with their lost belongings through intelligent matching, real-time alerts, and a seamless claim process. Trusted by 200+ institutions worldwide.
              </motion.p>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 56 }}>
                <button className="btn-primary" style={{ padding: "14px 28px", borderRadius: 12, fontSize: 15, fontWeight: 600, color: "white", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                  Report Lost Item <ArrowRight size={16} />
                </button>
                <button className="btn-secondary" style={{ padding: "14px 28px", borderRadius: 12, fontSize: 15, fontWeight: 500, color: "white", cursor: "pointer" }}>
                  Browse Found Items
                </button>
              </motion.div>

              {/* Stats Row */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.65 }}
                style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24 }}>
                {STATS.map((s, i) => (
                  <div key={i}>
                    <div className="syne" style={{ fontSize: 26, fontWeight: 800, color: "white", letterSpacing: "-1px" }}>{s.value}</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{s.label}</div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Live Activity Card */}
            <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4, duration: 0.7 }}
              className="float" style={{ position: "relative" }}>
              <div style={{ borderRadius: 24, padding: 28, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(32px)" }}>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                  <span className="syne" style={{ fontWeight: 700, fontSize: 15 }}>Live Activity Feed</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#34d399" }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#34d399", boxShadow: "0 0 6px #34d399" }} />
                    Live
                  </span>
                </div>

                {/* Tabs */}
                <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                  {["lost", "found"].map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                      style={{ padding: "6px 16px", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer", border: "none",
                        background: activeTab === tab ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "rgba(255,255,255,0.05)",
                        color: activeTab === tab ? "white" : "rgba(255,255,255,0.4)" }}>
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {RECENT_ITEMS.filter(i => activeTab === "lost" ? i.type === "Lost" : i.type === "Found").map((item, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                      style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 12, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: item.type === "Lost" ? "rgba(239,68,68,0.15)" : "rgba(52,211,153,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {item.type === "Lost" ? <Tag size={15} color="#f87171" /> : <CheckCircle size={15} color="#34d399" />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.item}</div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>{item.location} · {item.time}</div>
                      </div>
                      {item.match && (
                        <span style={{ fontSize: 11, fontWeight: 600, color: "#a78bfa", background: "rgba(167,139,250,0.12)", padding: "2px 8px", borderRadius: 6, flexShrink: 0 }}>{item.match} match</span>
                      )}
                    </motion.div>
                  ))}
                </div>

                <div style={{ marginTop: 16, padding: "10px 14px", borderRadius: 12, background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)", display: "flex", alignItems: "center", gap: 8 }}>
                  <Search size={14} color="#818cf8" />
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>Search across 4,200+ active reports...</span>
                </div>
              </div>

              {/* Floating badges */}
              <div style={{ position: "absolute", top: -16, right: -16, padding: "8px 14px", borderRadius: 12, background: "#6366f1", fontSize: 12, fontWeight: 600, boxShadow: "0 8px 24px rgba(99,102,241,0.5)" }}>
                🎯 Match Found!
              </div>
              <div style={{ position: "absolute", bottom: -16, left: -16, padding: "8px 14px", borderRadius: 12, background: "rgba(6,6,15,0.95)", border: "1px solid rgba(255,255,255,0.1)", fontSize: 12, fontWeight: 500, color: "#34d399" }}>
                ✓ 3 items recovered today
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* TICKER */}
      <div style={{ background: "rgba(99,102,241,0.08)", borderTop: "1px solid rgba(99,102,241,0.2)", borderBottom: "1px solid rgba(99,102,241,0.2)", padding: "14px 0", zIndex: 1, position: "relative" }}>
        <div className="ticker-wrap">
          <div className="ticker">
            {[...Array(3)].map((_, j) => (
              <span key={j}>
                {["✦ 24K+ items recovered", "✦ AI-powered matching", "✦ Real-time notifications", "✦ 200+ institutions trust Findify", "✦ < 12 hour avg match time", "✦ 98.6% success rate", "✦ End-to-end encrypted"].map((t, i) => (
                  <span key={i} style={{ marginRight: 60, fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.5)", letterSpacing: "0.5px" }}>{t}</span>
                ))}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* FEATURES */}
      <section id="features" style={{ maxWidth: 1200, margin: "0 auto", padding: "120px 24px", position: "relative", zIndex: 1 }}>
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          style={{ textAlign: "center", marginBottom: 72 }}>
          <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: 3, color: "#818cf8", textTransform: "uppercase", display: "block", marginBottom: 16 }}>Everything You Need</span>
          <h2 className="syne" style={{ fontSize: "clamp(32px, 4vw, 52px)", fontWeight: 800, letterSpacing: "-1.5px", marginBottom: 16 }}>
            Built for the <span className="gradient-text">modern campus</span>
          </h2>
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 17, maxWidth: 520, margin: "0 auto" }}>
            Every feature is purpose-built to maximize recovery rates and minimize the friction of finding what matters to you.
          </p>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
          {FEATURES.map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              className="card-glass card-hover" style={{ borderRadius: 20, padding: 28, cursor: "default" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: `${f.color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <f.icon size={20} color={f.color} />
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1, color: f.color, background: `${f.color}15`, padding: "3px 10px", borderRadius: 20, textTransform: "uppercase" }}>{f.tag}</span>
              </div>
              <h3 className="syne" style={{ fontWeight: 700, fontSize: 17, marginBottom: 10 }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", lineHeight: 1.65 }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" style={{ background: "rgba(255,255,255,0.015)", borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "120px 24px" }}>
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            style={{ textAlign: "center", marginBottom: 80 }}>
            <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: 3, color: "#818cf8", textTransform: "uppercase", display: "block", marginBottom: 16 }}>Simple Process</span>
            <h2 className="syne" style={{ fontSize: "clamp(32px, 4vw, 52px)", fontWeight: 800, letterSpacing: "-1.5px" }}>
              From lost to <span className="gradient-text">reunited</span><br />in four steps
            </h2>
          </motion.div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 32 }}>
            {HOW_IT_WORKS.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }}
                style={{ textAlign: "center" }}>
                <div style={{ position: "relative", display: "inline-block", marginBottom: 24 }}>
                  <div style={{ width: 72, height: 72, borderRadius: "50%", background: `linear-gradient(135deg, ${s.color}20, ${s.color}08)`, border: `1px solid ${s.color}40`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto" }}>
                    <span className="syne" style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.step}</span>
                  </div>
                  {i < 3 && (
                    <div style={{ position: "absolute", top: "50%", left: "100%", width: "calc(100% + 32px)", height: 1, background: "linear-gradient(90deg, rgba(99,102,241,0.4), transparent)", transform: "translateY(-50%)" }} />
                  )}
                </div>
                <h3 className="syne" style={{ fontWeight: 700, fontSize: 17, marginBottom: 10 }}>{s.title}</h3>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", lineHeight: 1.65 }}>{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF STRIP */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 24px", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
          {["MIT", "Stanford", "Harvard", "UCB", "Oxford", "ETH Zürich", "NUS", "KAIST"].map((uni, i) => (
            <motion.div key={i} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
              style={{ padding: "8px 20px", borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.35)" }}>
              {uni}
            </motion.div>
          ))}
        </div>
        <p style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "rgba(255,255,255,0.2)" }}>Trusted by 200+ institutions globally</p>
      </div>

      {/* TESTIMONIALS */}
      <section id="testimonials" style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px 120px", position: "relative", zIndex: 1 }}>
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          style={{ textAlign: "center", marginBottom: 72 }}>
          <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: 3, color: "#818cf8", textTransform: "uppercase", display: "block", marginBottom: 16 }}>Real Stories</span>
          <h2 className="syne" style={{ fontSize: "clamp(32px, 4vw, 52px)", fontWeight: 800, letterSpacing: "-1.5px" }}>
            Loved by <span className="gradient-text">thousands</span>
          </h2>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
          {TESTIMONIALS.map((t, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              className="card-glass card-hover" style={{ borderRadius: 20, padding: 28 }}>
              <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
                {[...Array(t.rating)].map((_, j) => <Star key={j} size={13} fill="#f59e0b" color="#f59e0b" />)}
              </div>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.7, marginBottom: 20 }}>"{t.quote}"</p>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{t.avatar}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{t.author}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" style={{ background: "rgba(255,255,255,0.015)", borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "120px 24px" }}>
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            style={{ textAlign: "center", marginBottom: 72 }}>
            <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: 3, color: "#818cf8", textTransform: "uppercase", display: "block", marginBottom: 16 }}>Pricing</span>
            <h2 className="syne" style={{ fontSize: "clamp(32px, 4vw, 52px)", fontWeight: 800, letterSpacing: "-1.5px", marginBottom: 16 }}>
              Simple, transparent<br /><span className="gradient-text">pricing</span>
            </h2>
            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 16 }}>Start free. Scale when you're ready.</p>
          </motion.div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, alignItems: "center" }}>
            {PRICING.map((p, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                style={{
                  borderRadius: 24, padding: p.highlight ? 36 : 28,
                  background: p.highlight ? "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))" : "rgba(255,255,255,0.03)",
                  border: p.highlight ? "1px solid rgba(99,102,241,0.4)" : "1px solid rgba(255,255,255,0.07)",
                  position: "relative",
                  boxShadow: p.highlight ? "0 32px 64px rgba(99,102,241,0.2)" : "none",
                  transform: p.highlight ? "scale(1.03)" : "none"
                }}>
                {p.highlight && (
                  <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", padding: "4px 16px", borderRadius: 20, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" }}>Most Popular</div>
                )}
                <div style={{ marginBottom: 8 }}>
                  <span className="syne" style={{ fontSize: 13, fontWeight: 700, color: p.highlight ? "#a5b4fc" : "rgba(255,255,255,0.4)", letterSpacing: 1, textTransform: "uppercase" }}>{p.name}</span>
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 8 }}>
                  <span className="syne" style={{ fontSize: 42, fontWeight: 800, letterSpacing: "-2px" }}>{p.price}</span>
                  <span style={{ fontSize: 15, color: "rgba(255,255,255,0.4)" }}>{p.period}</span>
                </div>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 24, lineHeight: 1.5 }}>{p.desc}</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
                  {p.features.map((f, j) => (
                    <div key={j} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <CheckCircle size={15} color={p.highlight ? "#818cf8" : "#34d399"} />
                      <span style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>{f}</span>
                    </div>
                  ))}
                </div>
                <button style={{
                  width: "100%", padding: "12px", borderRadius: 12, fontSize: 14, fontWeight: 600,
                  cursor: "pointer", border: "none",
                  background: p.highlight ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "rgba(255,255,255,0.06)",
                  color: "white", transition: "all 0.3s ease"
                }}
                  onMouseEnter={e => {
                    const target = e.target as HTMLElement;
                    target.style.transform = "translateY(-2px)";
                    target.style.boxShadow = p.highlight ? "0 12px 24px rgba(99,102,241,0.4)" : "none";
                  }}
                  onMouseLeave={e => {
                    const target = e.target as HTMLElement;
                    target.style.transform = "none";
                    target.style.boxShadow = "none";
                  }}>
                  {p.cta}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ maxWidth: 800, margin: "0 auto", padding: "120px 24px", position: "relative", zIndex: 1 }}>
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          style={{ textAlign: "center", marginBottom: 64 }}>
          <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: 3, color: "#818cf8", textTransform: "uppercase", display: "block", marginBottom: 16 }}>FAQ</span>
          <h2 className="syne" style={{ fontSize: "clamp(28px, 3vw, 44px)", fontWeight: 800, letterSpacing: "-1px" }}>
            Common questions
          </h2>
        </motion.div>

        {[
          { q: "How accurate is the AI matching?", a: "Our matching engine achieves 94%+ accuracy on image-based queries and 89% on text-only reports, improving with each new submission." },
          { q: "Can I use Findify for multiple campuses?", a: "Yes. The Pro and Enterprise plans support multiple locations. Each location gets its own dashboard and report feed while sharing the global matching pool." },
          { q: "How is my personal data protected?", a: "All reports and personal data are encrypted at rest and in transit. We're SOC 2 Type II compliant and GDPR-ready. Users control what information is visible to others." },
          { q: "What happens to unclaimed items?", a: "Admins can set automated archiving policies. Items can be flagged for donation, disposal, or transfer to your local authority after a configurable time window." },
        ].map((faq, i) => (
          <FAQItem key={i} faq={faq} i={i} />
        ))}
      </section>

      {/* CTA BANNER */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px 120px", position: "relative", zIndex: 1 }}>
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          style={{ borderRadius: 32, padding: "72px 64px", background: "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.15))", border: "1px solid rgba(99,102,241,0.3)", textAlign: "center", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)", top: -100, left: -100, pointerEvents: "none" }} />
          <div style={{ position: "absolute", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)", bottom: -80, right: -80, pointerEvents: "none" }} />

          <span className="syne" style={{ display: "block", fontSize: 13, fontWeight: 700, letterSpacing: 3, color: "#a5b4fc", textTransform: "uppercase", marginBottom: 20 }}>Get Started Today</span>
          <h2 className="syne" style={{ fontSize: "clamp(28px, 4vw, 52px)", fontWeight: 800, letterSpacing: "-1.5px", marginBottom: 20 }}>
            Ready to reconnect your<br />community with what's lost?
          </h2>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 16, marginBottom: 40, maxWidth: 480, margin: "0 auto 40px" }}>
            Join 200+ institutions. Set up in under 10 minutes. No credit card required.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button className="btn-primary" style={{ padding: "14px 32px", borderRadius: 12, fontSize: 15, fontWeight: 600, color: "white", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
              Start for Free <ArrowRight size={16} />
            </button>
            <button className="btn-secondary" style={{ padding: "14px 32px", borderRadius: 12, fontSize: 15, fontWeight: 500, color: "white", cursor: "pointer" }}>
              Schedule Demo
            </button>
          </div>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "64px 24px 40px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", gap: 48, marginBottom: 56 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Search size={16} color="white" />
                </div>
                <span className="syne" style={{ fontWeight: 700, fontSize: 16 }}>Findify</span>
              </div>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", lineHeight: 1.7, maxWidth: 260 }}>
                Intelligent lost & found management built for modern institutions. Recover more. Search less.
              </p>
              <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                {["Twitter", "LinkedIn", "GitHub"].map(s => (
                  <div key={s} style={{ padding: "6px 14px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", fontSize: 12, color: "rgba(255,255,255,0.4)", cursor: "pointer" }}>{s}</div>
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
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 16 }}>{col.title}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
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
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
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
      style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", marginBottom: 4 }}>
      <button onClick={() => setOpen(!open)}
        style={{ width: "100%", padding: "20px 0", display: "flex", alignItems: "center", justifyContent: "space-between", background: "none", border: "none", color: "white", cursor: "pointer", textAlign: "left" }}>
        <span style={{ fontSize: 15, fontWeight: 500 }}>{faq.q}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={18} color="rgba(255,255,255,0.4)" />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}
            style={{ overflow: "hidden" }}>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", lineHeight: 1.7, paddingBottom: 20 }}>{faq.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}