import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { useRegisterStore } from "@/store/registerStore"
import {
  User, Mail, Lock, Eye, EyeOff,
  ArrowRight, Search, CheckCircle,
  Tag, PackageSearch, Bell, ShieldCheck,
} from "lucide-react"

const FEATURES = [
  { icon: PackageSearch, color: "#6366f1", text: "AI-powered item matching"  },
  { icon: Bell,          color: "#a78bfa", text: "Instant recovery alerts"   },
  { icon: ShieldCheck,   color: "#34d399", text: "Verified claim process"    },
  { icon: Tag,           color: "#f59e0b", text: "Real-time report tracking" },
]

const FLOATING_ITEMS = [
  { emoji: "💻", label: "MacBook Pro",  sub: "Found — Library 2F",  delay: 0,   top: 0,   left: 0   },
  { emoji: "🎧", label: "AirPods Pro",  sub: "87% match found",     delay: 1.8, top: 60,  left: 170 },
  { emoji: "🪪", label: "Student ID",   sub: "Claimed successfully", delay: 3.5, top: 120, left: 55  },
  { emoji: "👛", label: "Black Wallet", sub: "Found — Cafeteria",    delay: 2.6, top: 30,  left: 265 },
]

function useIsMobile() {
  const [m, setM] = useState(false)
  useEffect(() => {
    const c = () => setM(window.innerWidth < 900)
    c()
    window.addEventListener("resize", c)
    return () => window.removeEventListener("resize", c)
  }, [])
  return m
}

// ── Reusable field component ──────────────────────────────────────────────
function Field({
  id, label, placeholder, type = "text", icon: Icon, value, onChange, onBlur,
  fieldError, right,
}: {
  id: string
  label: string
  placeholder: string
  type?: string
  icon: React.ElementType
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onBlur: () => void
  fieldError?: string
  right?: React.ReactNode
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label
        htmlFor={id}
        style={{ fontSize: 13, fontWeight: 500, color: "#c4c9e2", display: "block" }}
      >
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <Icon
          size={15}
          color="#6b7280"
          style={{
            position: "absolute", left: 13, top: "50%",
            transform: "translateY(-50%)", pointerEvents: "none", zIndex: 1,
          }}
        />
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          className="findify-input"
          style={{ paddingRight: right ? 42 : 14 }}
        />
        {right && (
          <div style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", zIndex: 1 }}>
            {right}
          </div>
        )}
      </div>
      <AnimatePresence>
        {fieldError && (
          <motion.span
            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ fontSize: 11, color: "#f87171", marginTop: 2 }}
          >
            {fieldError}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────
export default function RegisterPage() {
  const navigate = useNavigate()
  const { register, loading, error, reset } = useRegisterStore()
  const isMobile = useIsMobile()

  const [form, setForm] = useState({
    first_name: "", last_name: "", username: "", email: "", password: "", confirm_password: "",
  })
  const [showPass, setShowPass] = useState(false)
  const [touched,  setTouched]  = useState<Record<string, boolean>>({})
  const [step,     setStep]     = useState<"form" | "success">("form")

  const emailValid = !form.email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
  const passStrong = form.password.length >= 6

  const setField = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }))

  const touch = (k: string) => () => setTouched(t => ({ ...t, [k]: true }))

  const canSubmit = !!(
    form.first_name && form.last_name &&
    form.username && form.email && emailValid &&
    form.password && passStrong && form.confirm_password === form.password
  )

  const handleSubmit = async () => {
    if (!canSubmit) return
    try {
      await register({ ...form })
      setStep("success")
    } catch { /* error shown via store */ }
  }

  useEffect(() => {
    if (step === "success") {
      const t = setTimeout(() => { reset(); navigate("/login") }, 2800)
      return () => clearTimeout(t)
    }
  }, [step])

  const passLevel =
    form.password.length === 0 ? null :
    form.password.length < 4  ? "Weak" :
    form.password.length < 6  ? "Fair" :
    form.password.length < 10 ? "Good" : "Strong"

  const passColor =
    passLevel === "Weak"   ? "#f87171" :
    passLevel === "Fair"   ? "#fbbf24" :
    passLevel === "Good"   ? "#34d399" : "#6366f1"

  const passWidth =
    passLevel === "Weak" ? "25%" : passLevel === "Fair" ? "55%" :
    passLevel === "Good" ? "80%" : passLevel === "Strong" ? "100%" : "0%"

  return (
    <div style={{
      fontFamily: "'DM Sans', sans-serif",
      minHeight: "100vh",
      background: "#06060f",
      display: "flex",
      color: "#ffffff",
    }}>

      {/* ── ALL STYLES ──────────────────────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

        .syne { font-family: 'Syne', sans-serif !important; }

        .gradient-text {
          background: linear-gradient(135deg, #818cf8, #c084fc, #60a5fa);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* Force all text white by default */
        .register-root, .register-root * {
          color: inherit;
          box-sizing: border-box;
        }

        /* Input base */
        .findify-input {
          width: 100%;
          background: #10101e !important;
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 11px;
          padding: 11px 14px 11px 38px;
          font-size: 14px;
          color: #ffffff !important;
          -webkit-text-fill-color: #ffffff !important;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
          font-family: 'DM Sans', sans-serif;
        }
        .findify-input::placeholder {
          color: rgba(255,255,255,0.28) !important;
          -webkit-text-fill-color: rgba(255,255,255,0.28) !important;
        }
        .findify-input:focus {
          background: #14142a !important;
          border-color: rgba(99,102,241,0.7) !important;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.15) !important;
        }
        .findify-input.error {
          border-color: rgba(239,68,68,0.5) !important;
        }

        /* Chrome autofill */
        .findify-input:-webkit-autofill,
        .findify-input:-webkit-autofill:hover,
        .findify-input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 40px #10101e inset !important;
          -webkit-text-fill-color: #ffffff !important;
          caret-color: white;
          transition: background-color 9999s;
        }

        @keyframes drift0 { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-8px)} }
        @keyframes drift1 { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-10px)} }
        @keyframes drift2 { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-6px)} }
        @keyframes drift3 { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-9px)} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }

        .float-0 { animation: drift0 6s ease-in-out 0s   infinite; }
        .float-1 { animation: drift1 7s ease-in-out 1.8s infinite; }
        .float-2 { animation: drift2 8s ease-in-out 3.5s infinite; }
        .float-3 { animation: drift3 6.5s ease-in-out 2.6s infinite; }
      `}</style>

      {/* ── LEFT PANEL ───────────────────────────────────────────────── */}
      {!isMobile && (
        <div style={{
          flex: "0 0 460px",
          position: "relative",
          overflow: "hidden",
          background: "linear-gradient(160deg, rgba(99,102,241,0.1) 0%, #06060f 55%)",
          borderRight: "1px solid rgba(255,255,255,0.07)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "48px 44px",
          color: "#ffffff",
        }}>
          {/* BG orbs */}
          <div style={{ position:"absolute", width:400, height:400, borderRadius:"50%", background:"radial-gradient(circle,rgba(99,102,241,0.18) 0%,transparent 70%)", top:-100, left:-100, pointerEvents:"none" }} />
          <div style={{ position:"absolute", width:300, height:300, borderRadius:"50%", background:"radial-gradient(circle,rgba(139,92,246,0.13) 0%,transparent 70%)", bottom:-60, right:-60, pointerEvents:"none" }} />

          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            style={{ display:"flex", alignItems:"center", gap:10, marginBottom:48 }}
          >
            <div style={{ width:38, height:38, borderRadius:10, background:"linear-gradient(135deg,#6366f1,#8b5cf6)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 6px 20px rgba(99,102,241,0.45)", flexShrink:0 }}>
              <Search size={17} color="#ffffff" />
            </div>
            <span className="syne" style={{ fontWeight:800, fontSize:20, letterSpacing:"-0.5px", color:"#ffffff" }}>Findify</span>
          </motion.div>

          {/* Headline */}
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}>
            <h2 className="syne" style={{ fontSize:34, fontWeight:800, lineHeight:1.1, letterSpacing:"-1.5px", marginBottom:16, color:"#ffffff" }}>
              Reunite with<br />
              <span className="gradient-text">what matters.</span>
            </h2>
            <p style={{ fontSize:14, color:"#8b92b8", lineHeight:1.75, marginBottom:36, maxWidth:340 }}>
              Join thousands of students and staff who've already recovered their lost belongings through Findify's smart matching network.
            </p>
          </motion.div>

          {/* Features */}
          <div style={{ display:"flex", flexDirection:"column", gap:12, marginBottom:40 }}>
            {FEATURES.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity:0, x:-12 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.3 + i*0.08 }}
                style={{ display:"flex", alignItems:"center", gap:12 }}
              >
                <div style={{ width:34, height:34, borderRadius:9, background:`${f.color}18`, border:`1px solid ${f.color}35`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <f.icon size={15} color={f.color} />
                </div>
                <span style={{ fontSize:13, color:"#a8b0d0", fontWeight:500 }}>{f.text}</span>
              </motion.div>
            ))}
          </div>

          {/* Floating cards */}
          <div style={{ position:"relative", height:190, marginBottom:32 }}>
            {FLOATING_ITEMS.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity:0, scale:0.88 }}
                animate={{ opacity:1, scale:1 }}
                transition={{ delay:0.55 + i*0.12, duration:0.45 }}
                className={`float-${i}`}
                style={{
                  position:"absolute",
                  top: item.top,
                  left: item.left,
                  padding:"8px 14px",
                  borderRadius:12,
                  background:"rgba(255,255,255,0.05)",
                  border:"1px solid rgba(255,255,255,0.1)",
                  backdropFilter:"blur(10px)",
                  display:"flex", alignItems:"center", gap:9,
                  zIndex:2,
                  minWidth:140,
                }}
              >
                <span style={{ fontSize:18, lineHeight:1 }}>{item.emoji}</span>
                <div>
                  <div style={{ fontSize:12, fontWeight:600, color:"#ffffff", whiteSpace:"nowrap" }}>{item.label}</div>
                  <div style={{ fontSize:10, color:"#7880a0", whiteSpace:"nowrap", marginTop:1 }}>{item.sub}</div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Stats strip */}
          <motion.div
            initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.9 }}
            style={{ display:"flex", gap:28, paddingTop:20, borderTop:"1px solid rgba(255,255,255,0.08)" }}
          >
            {[
              { v:"24K+",   l:"Items Recovered" },
              { v:"98.6%",  l:"Success Rate"    },
              { v:"< 12h",  l:"Avg Match Time"  },
            ].map((s, i) => (
              <div key={i}>
                <div className="syne" style={{ fontSize:18, fontWeight:800, color:"#ffffff", letterSpacing:"-0.5px" }}>{s.v}</div>
                <div style={{ fontSize:11, color:"#636b8a", marginTop:2 }}>{s.l}</div>
              </div>
            ))}
          </motion.div>
        </div>
      )}

      {/* ── RIGHT PANEL ──────────────────────────────────────────────── */}
      <div style={{
        flex:1,
        display:"flex", alignItems:"center", justifyContent:"center",
        padding: isMobile ? "36px 20px" : "48px 40px",
        position:"relative", overflowY:"auto",
        color: "#ffffff",
      }}>
        {/* bg orb */}
        <div style={{ position:"fixed", width:500, height:500, borderRadius:"50%", background:"radial-gradient(circle,rgba(139,92,246,0.07) 0%,transparent 70%)", bottom:-120, right:-120, pointerEvents:"none", zIndex:0 }} />

        <AnimatePresence mode="wait">

          {/* SUCCESS */}
          {step === "success" ? (
            <motion.div
              key="success"
              initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0 }}
              style={{ textAlign:"center", maxWidth:380, zIndex:1 }}
            >
              <motion.div
                initial={{ scale:0 }} animate={{ scale:1 }} transition={{ type:"spring", delay:0.1 }}
                style={{ width:80, height:80, borderRadius:"50%", background:"rgba(52,211,153,0.12)", border:"1px solid rgba(52,211,153,0.3)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 24px" }}
              >
                <CheckCircle size={36} color="#34d399" />
              </motion.div>
              <h2 className="syne" style={{ fontSize:28, fontWeight:800, letterSpacing:"-1px", marginBottom:10, color:"#ffffff" }}>You're in!</h2>
              <p style={{ fontSize:15, color:"#8b92b8", lineHeight:1.7 }}>
                Account created for <strong style={{ color:"#ffffff" }}>{form.first_name}</strong>. Redirecting to login…
              </p>
              <div style={{ marginTop:24, height:3, borderRadius:2, background:"rgba(255,255,255,0.07)", overflow:"hidden" }}>
                <motion.div
                  initial={{ width:0 }} animate={{ width:"100%" }} transition={{ duration:2.8, ease:"linear" }}
                  style={{ height:"100%", background:"linear-gradient(90deg,#6366f1,#34d399)", borderRadius:2 }}
                />
              </div>
            </motion.div>

          ) : (

            /* FORM */
            <motion.div
              key="form"
              initial={{ opacity:0, y:18 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
              style={{ width:"100%", maxWidth:440, zIndex:1 }}
            >
              {/* Mobile logo */}
              {isMobile && (
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:28, justifyContent:"center" }}>
                  <div style={{ width:30, height:30, borderRadius:8, background:"linear-gradient(135deg,#6366f1,#8b5cf6)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <Search size={14} color="#ffffff" />
                  </div>
                  <span className="syne" style={{ fontWeight:800, fontSize:17, color:"#ffffff" }}>Findify</span>
                </div>
              )}

              {/* Heading */}
              <div style={{ marginBottom:28 }}>
                <div style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"4px 12px", borderRadius:100, background:"rgba(99,102,241,0.12)", border:"1px solid rgba(99,102,241,0.28)", marginBottom:14 }}>
                  <span style={{ width:6, height:6, borderRadius:"50%", background:"#6366f1", boxShadow:"0 0 6px #6366f1", flexShrink:0 }} />
                  <span style={{ fontSize:12, color:"#a5b4fc", fontWeight:500 }}>Free forever — no credit card</span>
                </div>
                <h1 className="syne" style={{ fontSize: isMobile ? 26 : 30, fontWeight:800, letterSpacing:"-1px", marginBottom:8, color:"#ffffff" }}>
                  Create your account
                </h1>
                <p style={{ fontSize:14, color:"#6b7280" }}>
                  Already have one?{" "}
                  <a href="/login" style={{ color:"#818cf8", fontWeight:600, textDecoration:"none" }}>Sign in</a>
                </p>
              </div>

              {/* Global API error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
                    style={{ padding:"11px 14px", borderRadius:11, background:"rgba(239,68,68,0.09)", border:"1px solid rgba(239,68,68,0.28)", fontSize:13, color:"#f87171", marginBottom:20, display:"flex", alignItems:"center", gap:8 }}
                  >
                    ⚠ {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Fields */}
              <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

                {/* Name row */}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                  <Field id="first_name" label="First Name" placeholder="John" icon={User}
                    value={form.first_name} onChange={setField("first_name")} onBlur={touch("first_name")}
                    fieldError={touched.first_name && !form.first_name ? "Required" : undefined} />
                  <Field id="last_name" label="Last Name" placeholder="Doe" icon={User}
                    value={form.last_name} onChange={setField("last_name")} onBlur={touch("last_name")}
                    fieldError={touched.last_name && !form.last_name ? "Required" : undefined} />
                </div>

                <Field id="username" label="Username" placeholder="john123" icon={User}
                  value={form.username} onChange={setField("username")} onBlur={touch("username")}
                  fieldError={touched.username && !form.username ? "Required" : undefined} />

                <Field id="email" label="Email Address" placeholder="john@email.com" icon={Mail}
                  value={form.email} onChange={setField("email")} onBlur={touch("email")}
                  fieldError={
                    touched.email && !form.email ? "Required" :
                    touched.email && !emailValid ? "Enter a valid email" : undefined
                  } />

                <Field
                  id="password" label="Password" placeholder="Min. 6 characters"
                  type={showPass ? "text" : "password"} icon={Lock}
                  value={form.password} onChange={setField("password")} onBlur={touch("password")}
                  fieldError={
                    touched.password && !form.password ? "Required" :
                    touched.password && !passStrong ? "At least 6 characters" : undefined
                  }
                  right={
                    <button
                      type="button"
                      onClick={() => setShowPass(v => !v)}
                      style={{ background:"none", border:"none", cursor:"pointer", color:"#6b7280", display:"flex", alignItems:"center", padding:0 }}
                    >
                      {showPass ? <EyeOff size={15} color="#9ca3af" /> : <Eye size={15} color="#9ca3af" />}
                    </button>
                  }
                />

                {/* Password strength */}
                {form.password && (
                  <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} style={{ marginTop:-4 }}>
                    <div style={{ height:3, borderRadius:2, background:"rgba(255,255,255,0.07)", overflow:"hidden" }}>
                      <div style={{ height:"100%", borderRadius:2, transition:"width 0.4s ease, background 0.3s", width:passWidth, background:passColor }} />
                    </div>
                    <span style={{ fontSize:11, color:"#6b7280", marginTop:4, display:"block" }}>
                      {passLevel} password
                    </span>
                  </motion.div>
                )}

                <Field
                  id="confirm_password" label="Confirm Password" placeholder="Min. 6 characters"
                  type={showPass ? "text" : "password"} icon={Lock}
                  value={form.confirm_password} onChange={setField("confirm_password")} onBlur={touch("confirm_password")}
                  fieldError={
                    touched.confirm_password && !form.confirm_password ? "Required" :
                    touched.confirm_password && form.confirm_password !== form.password ? "Passwords do not match" : undefined
                  }
                  right={
                    <button
                      type="button"
                      onClick={() => setShowPass(v => !v)}
                      style={{ background:"none", border:"none", cursor:"pointer", color:"#6b7280", display:"flex", alignItems:"center", padding:0 }}
                    >
                      {showPass ? <EyeOff size={15} color="#9ca3af" /> : <Eye size={15} color="#9ca3af" />}
                    </button>
                  }
                />
              </div>

              {/* Submit button */}
              <motion.button
                whileHover={canSubmit ? { y:-2, boxShadow:"0 16px 32px rgba(99,102,241,0.4)" } : {}}
                whileTap={canSubmit ? { scale:0.98 } : {}}
                onClick={handleSubmit}
                disabled={loading || !canSubmit}
                style={{
                  marginTop:24, width:"100%", padding:"13px",
                  borderRadius:12, fontSize:15, fontWeight:600,
                  color:"#ffffff", border:"none",
                  cursor: canSubmit ? "pointer" : "not-allowed",
                  background: canSubmit
                    ? "linear-gradient(135deg,#6366f1,#8b5cf6)"
                    : "rgba(255,255,255,0.07)",
                  opacity: loading ? 0.7 : 1,
                  display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                  transition:"all 0.3s ease",
                  fontFamily:"'DM Sans',sans-serif",
                }}
              >
                {loading ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5"
                      style={{ animation:"spin 0.8s linear infinite" }}>
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                    </svg>
                    Creating account…
                  </>
                ) : (
                  <>Create Account <ArrowRight size={16} color="#ffffff" /></>
                )}
              </motion.button>

              {/* Terms */}
              <p style={{ textAlign:"center", fontSize:12, color:"#4b5563", marginTop:16, lineHeight:1.6 }}>
                By registering you agree to our{" "}
                <a href="#" style={{ color:"#6b7280", textDecoration:"underline" }}>Terms of Service</a>
                {" "}and{" "}
                <a href="#" style={{ color:"#6b7280", textDecoration:"underline" }}>Privacy Policy</a>
              </p>

            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  )
}