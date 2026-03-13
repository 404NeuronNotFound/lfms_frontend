import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useAuthStore } from "@/store/authStore"
import { Search, ArrowRight, Lock, User, AlertTriangle, Eye, EyeOff } from "lucide-react"

// ── Full-screen loading overlay shown after successful login ──────────────
function LoginLoadingOverlay({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "#06060f",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {/* Pulsing logo */}
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1,   opacity: 1 }}
            transition={{ type: "spring", damping: 16, stiffness: 180, delay: 0.05 }}
            style={{ position: "relative", marginBottom: 32 }}
          >
            {/* Ripple rings */}
            {[0, 1, 2].map(i => (
              <motion.div key={i}
                initial={{ scale: 1, opacity: 0.35 - i * 0.1 }}
                animate={{ scale: 1.8 + i * 0.5, opacity: 0 }}
                transition={{ duration: 1.6, delay: i * 0.35, repeat: Infinity, ease: "easeOut" }}
                style={{
                  position: "absolute",
                  inset: 0, borderRadius: "50%",
                  border: "1.5px solid rgba(99,102,241,0.5)",
                }}
              />
            ))}

            {/* Icon */}
            <div style={{
              width: 64, height: 64, borderRadius: 18,
              background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 0 40px rgba(99,102,241,0.45)",
              position: "relative", zIndex: 1,
            }}>
              <Search size={26} color="white" />
            </div>
          </motion.div>

          {/* Brand name */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{
              fontSize: 22, fontWeight: 800, letterSpacing: "-0.6px",
              color: "#ffffff", fontFamily: "'Syne', sans-serif", marginBottom: 10,
            }}
          >
            Findify
          </motion.div>

          {/* Subtitle */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.32 }}
            style={{ fontSize: 13, color: "#4b5563", marginBottom: 36 }}
          >
            Signing you in…
          </motion.div>

          {/* Animated progress bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.28 }}
            style={{ width: 180, height: 3, borderRadius: 2, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}
          >
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
              style={{
                height: "100%", width: "60%", borderRadius: 2,
                background: "linear-gradient(90deg,transparent,#6366f1,#8b5cf6,transparent)",
              }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ── Main login page ───────────────────────────────────────────────────────
export function LoginField() {
  const [username,     setUsername]     = useState("")
  const [password,     setPassword]     = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error,        setError]        = useState("")
  const [isSuccess,    setIsSuccess]    = useState(false)  // triggers overlay

  const { login, loading } = useAuthStore()

  // Clear error as soon as the user types
  useEffect(() => { if (error) setError("") }, [username, password])

  const handleSubmit = async () => {
    setError("")
    if (!username.trim()) return setError("Username is required.")
    if (!password)        return setError("Password is required.")

    try {
      setIsSuccess(true)   // show overlay optimistically
      await login(username, password)
      // authStore.login redirects — overlay stays visible during the redirect
    } catch (err: any) {
      setIsSuccess(false)  // hide overlay on error
      setError(err?.message ?? "Something went wrong. Please try again.")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit()
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-[#06060f] relative overflow-hidden"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
        .syne { font-family: 'Syne', sans-serif; }
        .login-input {
          width: 100%;
          background: rgba(255,255,255,0.05) !important;
          border: 1px solid rgba(255,255,255,0.1) !important;
          border-radius: 10px !important;
          padding: 12px 42px 12px 40px !important;
          font-size: 14px !important;
          color: white !important;
          -webkit-text-fill-color: white !important;
          outline: none !important;
          transition: all 0.25s ease !important;
          font-family: 'DM Sans', sans-serif !important;
          box-sizing: border-box !important;
        }
        .login-input::placeholder { color: rgba(255,255,255,0.25) !important; }
        .login-input:focus {
          background: rgba(255,255,255,0.07) !important;
          border-color: rgba(99,102,241,0.6) !important;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.15) !important;
        }
        .login-input.error-state {
          border-color: rgba(239,68,68,0.55) !important;
          box-shadow: 0 0 0 3px rgba(239,68,68,0.1) !important;
        }
        .login-input:-webkit-autofill,
        .login-input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 40px rgba(255,255,255,0.05) inset !important;
          -webkit-text-fill-color: white !important;
        }
        .btn-login {
          width: 100%; padding: 13px; border-radius: 12px;
          font-size: 15px; font-weight: 600; color: white;
          border: none; cursor: pointer;
          background: linear-gradient(135deg,#6366f1,#8b5cf6);
          transition: all 0.3s ease;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          font-family: 'DM Sans', sans-serif;
        }
        .btn-login:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 16px 32px rgba(99,102,241,0.4);
        }
        .btn-login:disabled { opacity: 0.6; cursor: not-allowed; }
      `}</style>

      {/* Loading overlay */}
      <LoginLoadingOverlay show={isSuccess} />

      {/* Background orbs */}
      <div style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle,rgba(99,102,241,0.12) 0%,transparent 70%)", top: -150, left: -150, pointerEvents: "none" }} />
      <div style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle,rgba(139,92,246,0.10) 0%,transparent 70%)", bottom: -100, right: -100, pointerEvents: "none" }} />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0,  scale: 1    }}
        transition={{ type: "spring", damping: 22, stiffness: 180 }}
        style={{
          width: "100%", maxWidth: 420, margin: "0 16px",
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 24, padding: "40px 36px",
          backdropFilter: "blur(32px)",
          boxShadow: "0 32px 64px rgba(0,0,0,0.4)",
          position: "relative", zIndex: 1,
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 32 }}>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1,   opacity: 1 }}
            transition={{ delay: 0.1, type: "spring", damping: 14 }}
            style={{ width: 48, height: 48, borderRadius: 14, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, boxShadow: "0 8px 24px rgba(99,102,241,0.4)" }}>
            <Search size={22} color="white" />
          </motion.div>
          <h1 className="syne" style={{ fontSize: 24, fontWeight: 800, color: "white", letterSpacing: "-0.8px", marginBottom: 6 }}>
            Welcome back
          </h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", textAlign: "center" }}>
            Sign in to your Findify account
          </p>
        </div>

        {/* Fields */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

          {/* Username */}
          <div>
            <label htmlFor="username" style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.6)", display: "block", marginBottom: 6 }}>
              Username
            </label>
            <div style={{ position: "relative" }}>
              <User size={15} color="rgba(255,255,255,0.3)" style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", zIndex: 1 }} />
              <input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                onKeyDown={handleKeyDown}
                className={`login-input${error ? " error-state" : ""}`}
                autoComplete="username"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <label htmlFor="password" style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.6)" }}>
                Password
              </label>
              <a href="#" style={{ fontSize: 12, color: "#818cf8", textDecoration: "none", fontWeight: 500 }}>
                Forgot password?
              </a>
            </div>
            <div style={{ position: "relative" }}>
              <Lock size={15} color="rgba(255,255,255,0.3)" style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", zIndex: 1 }} />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                className={`login-input${error ? " error-state" : ""}`}
                autoComplete="current-password"
              />
              {/* Show/hide toggle */}
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", padding: 0, zIndex: 1 }}
              >
                {showPassword
                  ? <EyeOff size={15} color="rgba(255,255,255,0.3)" />
                  : <Eye    size={15} color="rgba(255,255,255,0.3)" />}
              </button>
            </div>
          </div>

        </div>

        {/* ── Error message ── */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: -6, height: 0 }}
              animate={{ opacity: 1, y: 0,  height: "auto" }}
              exit={{   opacity: 0, y: -4,  height: 0 }}
              transition={{ duration: 0.22 }}
              style={{ overflow: "hidden", marginTop: 14 }}
            >
              <div style={{
                display: "flex", alignItems: "flex-start", gap: 9,
                padding: "11px 14px", borderRadius: 10,
                background: "rgba(239,68,68,0.09)",
                border: "1px solid rgba(239,68,68,0.28)",
              }}>
                <AlertTriangle size={14} color="#f87171" style={{ flexShrink: 0, marginTop: 1 }} />
                <span style={{ fontSize: 13, color: "#f87171", lineHeight: 1.5 }}>{error}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit */}
        <button
          className="btn-login"
          onClick={handleSubmit}
          disabled={loading || isSuccess}
          style={{ marginTop: 22 }}
        >
          {loading || isSuccess
            ? (
              <>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"
                  style={{ animation: "login-spin 0.75s linear infinite", flexShrink: 0 }}>
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
                Signing in…
              </>
            )
            : (<>Sign In <ArrowRight size={16} /></>)
          }
        </button>


        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "24px 0" }}>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.25)" }}>or</span>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
        </div>

    
        <p style={{ textAlign: "center", fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
          Don't have an account?{" "}
          <a href="/register" style={{ color: "#818cf8", fontWeight: 600, textDecoration: "none" }}>Create one</a>
        </p>

      </motion.div>

      <style>{`@keyframes login-spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </div>
  )
}