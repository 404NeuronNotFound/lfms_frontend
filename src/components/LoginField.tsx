import { useState } from "react"
import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "./ui/button"
import { useAuthStore } from "@/store/authStore"
import { Search, ArrowRight, Lock, User } from "lucide-react"

export function LoginField() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const { login, loading } = useAuthStore()

  const handleSubmit = async () => {
    try {
      await login(username, password)
    } catch (error) {
      alert("Login failed. Please check your credentials.")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#06060f] relative overflow-hidden"
      style={{ fontFamily: "'DM Sans', sans-serif" }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
        .syne { font-family: 'Syne', sans-serif; }
        .login-input {
          width: 100%;
          background: rgba(255,255,255,0.05) !important;
          border: 1px solid rgba(255,255,255,0.1) !important;
          border-radius: 10px !important;
          padding: 12px 14px 12px 40px !important;
          font-size: 14px !important;
          color: white !important;
          outline: none !important;
          transition: all 0.25s ease !important;
        }
        .login-input::placeholder { color: rgba(255,255,255,0.25) !important; }
        .login-input:focus {
          background: rgba(255,255,255,0.07) !important;
          border-color: rgba(99,102,241,0.6) !important;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.15) !important;
        }
        .login-label {
          font-size: 13px !important;
          font-weight: 500 !important;
          color: rgba(255,255,255,0.6) !important;
          margin-bottom: 6px !important;
          display: block !important;
        }
        .btn-login {
          width: 100%;
          padding: 13px;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 600;
          color: white;
          border: none;
          cursor: pointer;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .btn-login:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 16px 32px rgba(99,102,241,0.4);
        }
        .btn-login:disabled { opacity: 0.6; cursor: not-allowed; }
      `}</style>

      {/* Background orbs */}
      <div style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)", top: -150, left: -150, pointerEvents: "none" }} />
      <div style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.10) 0%, transparent 70%)", bottom: -100, right: -100, pointerEvents: "none" }} />

      {/* Card */}
      <div style={{
        width: "100%", maxWidth: 420, margin: "0 16px",
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 24, padding: "40px 36px",
        backdropFilter: "blur(32px)",
        boxShadow: "0 32px 64px rgba(0,0,0,0.4)",
        position: "relative", zIndex: 1
      }}>

        {/* Logo */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 32 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, boxShadow: "0 8px 24px rgba(99,102,241,0.4)" }}>
            <Search size={22} color="white" />
          </div>
          <h1 className="syne" style={{ fontSize: 24, fontWeight: 800, color: "white", letterSpacing: "-0.8px", marginBottom: 6 }}>
            Welcome back
          </h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", textAlign: "center" }}>
            Sign in to your Findify account
          </p>
        </div>

        {/* Fields */}
        <FieldSet>
          <FieldGroup style={{ display: "flex", flexDirection: "column", gap: 18 }}>

            <Field>
              <FieldLabel htmlFor="username" className="login-label">Username</FieldLabel>
              <div style={{ position: "relative" }}>
                <User size={15} color="rgba(255,255,255,0.3)" style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="login-input"
                />
              </div>
            </Field>

            <Field>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <FieldLabel htmlFor="password" className="login-label" style={{ margin: 0 }}>Password</FieldLabel>
                <a href="#" style={{ fontSize: 12, color: "#818cf8", textDecoration: "none", fontWeight: 500 }}>Forgot password?</a>
              </div>
              <div style={{ position: "relative" }}>
                <Lock size={15} color="rgba(255,255,255,0.3)" style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="login-input"
                />
              </div>
            </Field>

          </FieldGroup>
        </FieldSet>

        {/* Submit */}
        <button
          className="btn-login"
          onClick={handleSubmit}
          disabled={loading}
          style={{ marginTop: 28 }}
        >
          {loading ? "Signing in..." : (<>Sign In <ArrowRight size={16} /></>)}
        </button>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "24px 0" }}>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.25)" }}>or</span>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
        </div>

        {/* Register link */}
        <p style={{ textAlign: "center", fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
          Don't have an account?{" "}
          <a href="/register" style={{ color: "#818cf8", fontWeight: 600, textDecoration: "none"}}>Create one</a>
        </p>

      </div>
    </div>
  )
}