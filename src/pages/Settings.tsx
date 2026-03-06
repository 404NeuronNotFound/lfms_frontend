import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useAuthStore } from "@/store/authStore"
import { useSettingsStore } from "@/store/settingsStore"
import {
  User, Mail, Lock, Eye, EyeOff, Bell, Shield,
  Trash2, Camera, CheckCircle, AlertTriangle,
  MapPin, Phone, FileText, ChevronRight, Save,
  Smartphone, Globe, Key, LogOut, X,
} from "lucide-react"

// ── Section tab config ────────────────────────────────────────────────────
const TABS = [
  { id: "profile",       label: "Profile",       icon: User     },
  { id: "security",      label: "Security",      icon: Shield   },
  { id: "notifications", label: "Notifications", icon: Bell     },
  { id: "danger",        label: "Danger Zone",   icon: Trash2   },
]

// ── Small reusable components ─────────────────────────────────────────────
function SectionCard({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 18, padding: "26px 28px", marginBottom: 16 }}>
      <div style={{ marginBottom: 20 }}>
        <h3 className="syne" style={{ fontSize: 16, fontWeight: 700, color: "#ffffff", marginBottom: 4 }}>{title}</h3>
        {desc && <p style={{ fontSize: 13, color: "#6b7280" }}>{desc}</p>}
      </div>
      {children}
    </div>
  )
}

function FieldInput({
  id, label, placeholder, type = "text", icon: Icon, value, onChange,
  disabled = false, right, hint,
}: {
  id: string; label: string; placeholder: string; type?: string
  icon: React.ElementType; value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  disabled?: boolean; right?: React.ReactNode; hint?: string
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label htmlFor={id} style={{ fontSize: 13, fontWeight: 500, color: "#c4c9e2" }}>{label}</label>
      <div style={{ position: "relative" }}>
        <Icon size={15} color="#6b7280" style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", zIndex: 1 }} />
        <input
          id={id} type={type} placeholder={placeholder} value={value} onChange={onChange} disabled={disabled}
          className="settings-input"
          style={{ paddingRight: right ? 42 : 14, opacity: disabled ? 0.5 : 1, cursor: disabled ? "not-allowed" : "text" }}
        />
        {right && <div style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", zIndex: 1 }}>{right}</div>}
      </div>
      {hint && <span style={{ fontSize: 11, color: "#4b5563" }}>{hint}</span>}
    </div>
  )
}

function Toggle({ checked, onChange, label, desc }: { checked: boolean; onChange: (v: boolean) => void; label: string; desc?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 500, color: "#e2e8f0" }}>{label}</div>
        {desc && <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>{desc}</div>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        style={{
          width: 44, height: 24, borderRadius: 12, border: "none", cursor: "pointer", flexShrink: 0,
          background: checked ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "rgba(255,255,255,0.1)",
          position: "relative", transition: "all 0.25s ease",
          boxShadow: checked ? "0 0 12px rgba(99,102,241,0.4)" : "none",
        }}
      >
        <div style={{
          position: "absolute", top: 3, width: 18, height: 18, borderRadius: "50%",
          background: "white", transition: "left 0.25s ease",
          left: checked ? 23 : 3,
          boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
        }} />
      </button>
    </div>
  )
}

function SaveButton({ loading, label = "Save Changes", onClick }: { loading: boolean; label?: string; onClick: () => void }) {
  return (
    <motion.button
      whileHover={{ y: -1, boxShadow: "0 12px 28px rgba(99,102,241,0.35)" }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      disabled={loading}
      style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "10px 20px", borderRadius: 11, border: "none", cursor: loading ? "not-allowed" : "pointer",
        background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#ffffff",
        fontSize: 14, fontWeight: 600, opacity: loading ? 0.7 : 1, transition: "all 0.25s",
        fontFamily: "'DM Sans',sans-serif",
      }}
    >
      {loading ? (
        <>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" style={{ animation: "spin 0.8s linear infinite" }}>
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
          </svg>
          Saving…
        </>
      ) : (
        <><Save size={14} />{label}</>
      )}
    </motion.button>
  )
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────
export default function SettingsPage() {
  const { user, role, logout } = useAuthStore()
  const {
    profile, loadingProfile, savingProfile, savingPassword, savingNotifs, deletingAccount,
    profileError, passwordError, notifsError, successMessage,
    fetchProfile, saveProfile, savePassword, saveNotifPrefs, removeAccount, clearMessages,
  } = useSettingsStore()

  const [activeTab, setActiveTab] = useState("profile")
  const [isMobile, setIsMobile]   = useState(false)
  const [showTabMenu, setShowTabMenu] = useState(false)

  // ── Profile form ──
  const [profileForm, setProfileForm] = useState({
    first_name: "", last_name: "", email: "", phone: "", location: "", bio: "",
  })

  // ── Password form ──
  const [passForm, setPassForm] = useState({
    current_password: "", new_password: "", confirm_new_password: "",
  })
  const [showCurrent, setShowCurrent]   = useState(false)
  const [showNew,     setShowNew]       = useState(false)
  const [showConfirm, setShowConfirm]   = useState(false)
  const [passLocalErr, setPassLocalErr] = useState("")

  // ── Notifications ──
  const [notifs, setNotifs] = useState({
    notifications_email: true,
    notifications_push:  true,
    notifications_sms:   false,
  })

  // ── Danger zone ──
  const [deletePassword,  setDeletePassword]  = useState("")
  const [deleteConfirm,   setDeleteConfirm]   = useState(false)
  const [showDeletePass,  setShowDeletePass]  = useState(false)
  const [deleteError,     setDeleteError]     = useState("")

  // ── Toast ──
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null)

  useEffect(() => {
    const c = () => setIsMobile(window.innerWidth < 768)
    c(); window.addEventListener("resize", c)
    return () => window.removeEventListener("resize", c)
  }, [])

  useEffect(() => { fetchProfile() }, [])

  // Hydrate form from profile
  useEffect(() => {
    if (profile) {
      setProfileForm({
        first_name: profile.first_name ?? "",
        last_name:  profile.last_name  ?? "",
        email:      profile.email      ?? "",
        phone:      profile.phone      ?? "",
        location:   profile.location   ?? "",
        bio:        profile.bio        ?? "",
      })
      setNotifs({
        notifications_email: profile.notifications_email ?? true,
        notifications_push:  profile.notifications_push  ?? true,
        notifications_sms:   profile.notifications_sms   ?? false,
      })
    }
  }, [profile])

  // Show toast on success / error
  useEffect(() => {
    if (successMessage) {
      setToast({ msg: successMessage, type: "success" })
      const t = setTimeout(() => { setToast(null); clearMessages() }, 3200)
      return () => clearTimeout(t)
    }
  }, [successMessage])

  useEffect(() => {
    const err = profileError || passwordError || notifsError
    if (err) {
      setToast({ msg: err, type: "error" })
      const t = setTimeout(() => { setToast(null); clearMessages() }, 4000)
      return () => clearTimeout(t)
    }
  }, [profileError, passwordError, notifsError])

  // ── Handlers ──
  const handleSaveProfile = async () => {
    await saveProfile({ ...profileForm })
  }

  const handleChangePassword = async () => {
    setPassLocalErr("")
    if (!passForm.current_password) return setPassLocalErr("Current password is required")
    if (passForm.new_password.length < 6) return setPassLocalErr("New password must be at least 6 characters")
    if (passForm.new_password !== passForm.confirm_new_password) return setPassLocalErr("New passwords do not match")
    try {
      await savePassword(passForm)
      setPassForm({ current_password: "", new_password: "", confirm_new_password: "" })
    } catch {}
  }

  const handleSaveNotifs = async () => {
    await saveNotifPrefs(notifs)
  }

  const handleDeleteAccount = async () => {
    setDeleteError("")
    if (!deletePassword) return setDeleteError("Password is required to delete your account")
    try {
      await removeAccount({ password: deletePassword })
    } catch (e: any) {
      setDeleteError(e.message ?? "Failed to delete account")
    }
  }

  const isAdmin   = role === "ADMIN"
  const initials  = profile
    ? `${profile.first_name?.[0] ?? ""}${profile.last_name?.[0] ?? ""}`.toUpperCase() || user?.slice(0,2).toUpperCase() || "??"
    : user?.slice(0,2).toUpperCase() || "??"

  const newPassMatch = passForm.new_password && passForm.confirm_new_password &&
    passForm.new_password === passForm.confirm_new_password

  const newPassMismatch = passForm.confirm_new_password &&
    passForm.new_password !== passForm.confirm_new_password

  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif", color: "#ffffff", minHeight: "100vh" }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        .syne { font-family:'Syne',sans-serif !important; }
        .settings-input {
          width: 100%; background: #10101e !important;
          border: 1px solid rgba(255,255,255,0.1); border-radius: 11px;
          padding: 11px 14px 11px 38px; font-size: 14px;
          color: #ffffff !important; -webkit-text-fill-color: #ffffff !important;
          outline: none; transition: border-color 0.2s, box-shadow 0.2s;
          font-family: 'DM Sans',sans-serif;
        }
        .settings-input::placeholder { color: rgba(255,255,255,0.25) !important; -webkit-text-fill-color: rgba(255,255,255,0.25) !important; }
        .settings-input:focus { border-color: rgba(99,102,241,0.65) !important; box-shadow: 0 0 0 3px rgba(99,102,241,0.13) !important; background: #14142a !important; }
        .settings-input:-webkit-autofill,
        .settings-input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 40px #10101e inset !important;
          -webkit-text-fill-color: #ffffff !important;
        }
        .tab-btn { display:flex; align-items:center; gap:10px; padding:10px 14px; border-radius:11px; border:none; cursor:pointer; transition:all 0.2s; font-family:'DM Sans',sans-serif; font-size:14px; font-weight:500; width:100%; text-align:left; }
        .tab-btn:hover { background:rgba(255,255,255,0.05); }
        .tab-btn.active { background:linear-gradient(135deg,rgba(99,102,241,0.18),rgba(139,92,246,0.12)); border:1px solid rgba(99,102,241,0.3); color:#a5b4fc; }
        .tab-btn:not(.active) { background:transparent; color:rgba(255,255,255,0.5); }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        textarea.settings-input { padding: 11px 14px; resize: vertical; min-height: 80px; line-height: 1.6; }
      `}</style>

      {/* ── Toast ── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.95 }}
            style={{
              position: "fixed", top: 20, right: 20, zIndex: 999,
              display: "flex", alignItems: "center", gap: 10,
              padding: "12px 18px", borderRadius: 12, maxWidth: 360,
              background: toast.type === "success" ? "rgba(52,211,153,0.12)" : "rgba(239,68,68,0.12)",
              border: `1px solid ${toast.type === "success" ? "rgba(52,211,153,0.35)" : "rgba(239,68,68,0.35)"}`,
              backdropFilter: "blur(16px)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            }}>
            {toast.type === "success"
              ? <CheckCircle size={16} color="#34d399" />
              : <AlertTriangle size={16} color="#f87171" />}
            <span style={{ fontSize: 13, fontWeight: 500, color: toast.type === "success" ? "#34d399" : "#f87171", flex: 1 }}>
              {toast.msg}
            </span>
            <button onClick={() => setToast(null)} style={{ background:"none", border:"none", cursor:"pointer", color:"rgba(255,255,255,0.4)", display:"flex", padding:0 }}>
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Page header ── */}
      <motion.div
        initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 className="syne" style={{ fontSize: isMobile ? 22 : 28, fontWeight: 800, letterSpacing: "-1px", color: "#ffffff", marginBottom: 4 }}>
              Settings
            </h1>
            <p style={{ fontSize: 14, color: "#6b7280" }}>
              Manage your account, security, and preferences
            </p>
          </div>
          {/* Role badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "5px 14px", borderRadius: 20,
            background: isAdmin ? "rgba(99,102,241,0.12)" : "rgba(52,211,153,0.1)",
            border: isAdmin ? "1px solid rgba(99,102,241,0.28)" : "1px solid rgba(52,211,153,0.22)",
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", flexShrink: 0, background: isAdmin ? "#818cf8" : "#34d399", boxShadow: isAdmin ? "0 0 6px #818cf8" : "0 0 6px #34d399" }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: isAdmin ? "#a5b4fc" : "#6ee7b7", letterSpacing: 0.5, textTransform: "uppercase" }}>
              {isAdmin ? "Administrator" : "User"}
            </span>
          </div>
        </div>
      </motion.div>

      {/* ── Layout ── */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "220px 1fr", gap: 20, alignItems: "start" }}>

        {/* ── SIDEBAR TABS ── */}
        <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 }}>

          {/* Mobile tab picker */}
          {isMobile ? (
            <div style={{ marginBottom: 20 }}>
              <button
                onClick={() => setShowTabMenu(v => !v)}
                style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderRadius: 12, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", cursor: "pointer", color: "white", fontFamily: "'DM Sans',sans-serif" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {(() => { const t = TABS.find(t => t.id === activeTab)!; return <t.icon size={16} color="#818cf8" /> })()}
                  <span style={{ fontSize: 14, fontWeight: 500 }}>{TABS.find(t => t.id === activeTab)?.label}</span>
                </div>
                <ChevronRight size={15} color="#6b7280" style={{ transform: showTabMenu ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
              </button>
              <AnimatePresence>
                {showTabMenu && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    style={{ background: "rgba(10,10,24,0.98)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 12, marginTop: 6, overflow: "hidden", backdropFilter: "blur(20px)" }}>
                    {TABS.map(tab => (
                      <button key={tab.id}
                        onClick={() => { setActiveTab(tab.id); setShowTabMenu(false) }}
                        style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", border: "none", background: activeTab === tab.id ? "rgba(99,102,241,0.12)" : "transparent", cursor: "pointer", color: activeTab === tab.id ? "#a5b4fc" : "rgba(255,255,255,0.6)", fontFamily: "'DM Sans',sans-serif", fontSize: 14, textAlign: "left" }}>
                        <tab.icon size={16} color={activeTab === tab.id ? "#818cf8" : "#6b7280"} />
                        {tab.label}
                        {tab.id === "danger" && <span style={{ marginLeft: "auto", fontSize: 10, color: "#f87171", background: "rgba(239,68,68,0.12)", padding: "2px 7px", borderRadius: 4 }}>Caution</span>}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            /* Desktop sidebar */
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 10, position: "sticky", top: 24 }}>
              {/* Avatar block */}
              <div style={{ padding: "16px 12px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)", marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                    {initials}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#ffffff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {profile ? `${profile.first_name} ${profile.last_name}` : user ?? "—"}
                    </div>
                    <div style={{ fontSize: 11, color: "#6b7280", marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {profile?.email ?? ""}
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {TABS.map(tab => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}>
                    <tab.icon size={16} color={activeTab === tab.id ? "#818cf8" : "#6b7280"} />
                    <span>{tab.label}</span>
                    {tab.id === "danger" && (
                      <span style={{ marginLeft: "auto", fontSize: 10, color: "#f87171", background: "rgba(239,68,68,0.1)", padding: "2px 7px", borderRadius: 4 }}>!</span>
                    )}
                    {activeTab === tab.id && <ChevronRight size={13} style={{ marginLeft: "auto" }} />}
                  </button>
                ))}
              </div>

              {/* Logout shortcut */}
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", marginTop: 10, paddingTop: 10 }}>
                <button onClick={logout}
                  style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 11, border: "none", background: "transparent", cursor: "pointer", color: "rgba(255,255,255,0.4)", fontFamily: "'DM Sans',sans-serif", fontSize: 14, transition: "all 0.2s" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.08)"; (e.currentTarget as HTMLElement).style.color = "#f87171" }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.4)" }}>
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </motion.div>

        {/* ── MAIN CONTENT ── */}
        <AnimatePresence mode="wait">
          <motion.div key={activeTab}
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}>

            {/* ════════════════════ PROFILE TAB ════════════════════ */}
            {activeTab === "profile" && (
              <div>
                {/* Avatar card */}
                <SectionCard title="Profile Photo" desc="Your avatar is shown across Findify">
                  <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
                    <div style={{ position: "relative", flexShrink: 0 }}>
                      <div style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 700, border: "3px solid rgba(99,102,241,0.3)" }}>
                        {initials}
                      </div>
                      <div style={{ position: "absolute", bottom: 0, right: 0, width: 22, height: 22, borderRadius: "50%", background: "#6366f1", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #06060f", cursor: "pointer" }}>
                        <Camera size={11} color="white" />
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#ffffff", marginBottom: 2 }}>
                        {profile ? `${profile.first_name} ${profile.last_name}` : user ?? "—"}
                      </div>
                      <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 10 }}>
                        {isAdmin ? "Administrator" : "Member"} · joined {profile?.date_joined ? new Date(profile.date_joined).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "—"}
                      </div>
                      <button style={{ padding: "6px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.05)", fontSize: 12, color: "#c4c9e2", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
                        Upload Photo
                      </button>
                    </div>
                  </div>
                </SectionCard>

                {/* Personal info */}
                <SectionCard title="Personal Information" desc="Update your name, email and contact details">
                  {loadingProfile ? (
                    <div style={{ display: "flex", justifyContent: "center", padding: "24px 0" }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.5" style={{ animation: "spin 0.8s linear infinite" }}>
                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                      </svg>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 14 }}>
                        <FieldInput id="first_name" label="First Name" placeholder="John" icon={User}
                          value={profileForm.first_name} onChange={e => setProfileForm(f => ({ ...f, first_name: e.target.value }))} />
                        <FieldInput id="last_name" label="Last Name" placeholder="Doe" icon={User}
                          value={profileForm.last_name} onChange={e => setProfileForm(f => ({ ...f, last_name: e.target.value }))} />
                      </div>
                      <FieldInput id="email" label="Email Address" placeholder="you@email.com" icon={Mail}
                        value={profileForm.email} onChange={e => setProfileForm(f => ({ ...f, email: e.target.value }))} />
                      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 14 }}>
                        <FieldInput id="phone" label="Phone Number" placeholder="+63 912 345 6789" icon={Phone}
                          value={profileForm.phone ?? ""} onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))}
                          hint="Optional — used for SMS alerts" />
                        <FieldInput id="location" label="Location / Campus" placeholder="e.g. Main Campus" icon={MapPin}
                          value={profileForm.location ?? ""} onChange={e => setProfileForm(f => ({ ...f, location: e.target.value }))} />
                      </div>

                      {/* Bio textarea */}
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <label style={{ fontSize: 13, fontWeight: 500, color: "#c4c9e2" }}>Bio</label>
                        <div style={{ position: "relative" }}>
                          <FileText size={15} color="#6b7280" style={{ position: "absolute", left: 13, top: 13, pointerEvents: "none", zIndex: 1 }} />
                          <textarea
                            placeholder="A short bio about yourself…"
                            value={profileForm.bio ?? ""}
                            onChange={e => setProfileForm(f => ({ ...f, bio: e.target.value }))}
                            className="settings-input"
                            style={{ paddingLeft: 38, paddingTop: 11 }}
                          />
                        </div>
                        <span style={{ fontSize: 11, color: "#4b5563" }}>Optional — visible on your public profile</span>
                      </div>

                      {/* Read-only fields */}
                      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 14 }}>
                        <FieldInput id="username_ro" label="Username" placeholder="" icon={User}
                          value={profile?.username ?? user ?? ""} onChange={() => {}} disabled
                          hint="Username cannot be changed" />
                        <FieldInput id="role_ro" label="Account Role" placeholder="" icon={Shield}
                          value={isAdmin ? "Administrator" : "User"} onChange={() => {}} disabled />
                      </div>

                      <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: 4 }}>
                        <SaveButton loading={savingProfile} onClick={handleSaveProfile} />
                      </div>
                    </div>
                  )}
                </SectionCard>
              </div>
            )}

            {/* ════════════════════ SECURITY TAB ════════════════════ */}
            {activeTab === "security" && (
              <div>
                <SectionCard title="Change Password" desc="Use a strong password you don't use elsewhere">
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                    <FieldInput id="current_password" label="Current Password" placeholder="Enter current password"
                      type={showCurrent ? "text" : "password"} icon={Lock}
                      value={passForm.current_password}
                      onChange={e => setPassForm(f => ({ ...f, current_password: e.target.value }))}
                      right={
                        <button type="button" onClick={() => setShowCurrent(v => !v)}
                          style={{ background:"none", border:"none", cursor:"pointer", display:"flex", padding:0 }}>
                          {showCurrent ? <EyeOff size={15} color="#9ca3af" /> : <Eye size={15} color="#9ca3af" />}
                        </button>
                      }
                    />

                    <FieldInput id="new_password" label="New Password" placeholder="Min. 6 characters"
                      type={showNew ? "text" : "password"} icon={Key}
                      value={passForm.new_password}
                      onChange={e => setPassForm(f => ({ ...f, new_password: e.target.value }))}
                      hint="At least 6 characters recommended"
                      right={
                        <button type="button" onClick={() => setShowNew(v => !v)}
                          style={{ background:"none", border:"none", cursor:"pointer", display:"flex", padding:0 }}>
                          {showNew ? <EyeOff size={15} color="#9ca3af" /> : <Eye size={15} color="#9ca3af" />}
                        </button>
                      }
                    />

                    {/* New password strength */}
                    {passForm.new_password && (
                      <div style={{ marginTop: -8 }}>
                        <div style={{ height: 3, borderRadius: 2, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
                          <div style={{
                            height: "100%", borderRadius: 2, transition: "width 0.4s, background 0.3s",
                            width: passForm.new_password.length < 4 ? "25%" : passForm.new_password.length < 6 ? "55%" : passForm.new_password.length < 10 ? "80%" : "100%",
                            background: passForm.new_password.length < 4 ? "#f87171" : passForm.new_password.length < 6 ? "#fbbf24" : "#34d399",
                          }} />
                        </div>
                      </div>
                    )}

                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <label style={{ fontSize: 13, fontWeight: 500, color: "#c4c9e2" }}>Confirm New Password</label>
                      <div style={{ position: "relative" }}>
                        <Lock size={15} color="#6b7280" style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", pointerEvents:"none", zIndex:1 }} />
                        <input
                          type={showConfirm ? "text" : "password"}
                          placeholder="Repeat new password"
                          value={passForm.confirm_new_password}
                          onChange={e => setPassForm(f => ({ ...f, confirm_new_password: e.target.value }))}
                          className={`settings-input${newPassMismatch ? "" : newPassMatch ? "" : ""}`}
                          style={{
                            paddingRight: 42,
                            borderColor: newPassMismatch ? "rgba(239,68,68,0.5)" : newPassMatch ? "rgba(52,211,153,0.5)" : undefined,
                          }}
                        />
                        <div style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", zIndex:1, display:"flex", gap:6, alignItems:"center" }}>
                          {passForm.confirm_new_password && (
                            newPassMatch
                              ? <CheckCircle size={14} color="#34d399" />
                              : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                          )}
                          <button type="button" onClick={() => setShowConfirm(v => !v)}
                            style={{ background:"none", border:"none", cursor:"pointer", display:"flex", padding:0 }}>
                            {showConfirm ? <EyeOff size={15} color="#9ca3af" /> : <Eye size={15} color="#9ca3af" />}
                          </button>
                        </div>
                      </div>
                      {passForm.confirm_new_password && (
                        <span style={{ fontSize: 11, color: newPassMatch ? "#34d399" : "#f87171", display:"flex", alignItems:"center", gap:4 }}>
                          <span style={{ width:4, height:4, borderRadius:"50%", background: newPassMatch ? "#34d399" : "#f87171", display:"inline-block" }} />
                          {newPassMatch ? "Passwords match" : "Passwords do not match"}
                        </span>
                      )}
                    </div>

                    {/* Local error */}
                    <AnimatePresence>
                      {passLocalErr && (
                        <motion.div initial={{ opacity:0, y:-6 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
                          style={{ padding:"10px 14px", borderRadius:10, background:"rgba(239,68,68,0.09)", border:"1px solid rgba(239,68,68,0.25)", fontSize:13, color:"#f87171", display:"flex", gap:8, alignItems:"center" }}>
                          <AlertTriangle size={14} /> {passLocalErr}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div style={{ display:"flex", justifyContent:"flex-end" }}>
                      <SaveButton loading={savingPassword} label="Update Password" onClick={handleChangePassword} />
                    </div>
                  </div>
                </SectionCard>

                {/* 2FA info card */}
                <SectionCard title="Two-Factor Authentication" desc="Add an extra layer of security to your account">
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:14 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                      <div style={{ width:44, height:44, borderRadius:12, background:"rgba(99,102,241,0.12)", border:"1px solid rgba(99,102,241,0.25)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                        <Smartphone size={20} color="#818cf8" />
                      </div>
                      <div>
                        <div style={{ fontSize:14, fontWeight:600, color:"#ffffff" }}>Authenticator App</div>
                        <div style={{ fontSize:12, color:"#6b7280", marginTop:2 }}>Use an app like Google Authenticator or Authy</div>
                      </div>
                    </div>
                    <span style={{ fontSize:11, fontWeight:600, color:"#fbbf24", background:"rgba(245,158,11,0.12)", padding:"3px 10px", borderRadius:20, border:"1px solid rgba(245,158,11,0.25)" }}>
                      Coming Soon
                    </span>
                  </div>
                </SectionCard>

                {/* Active sessions */}
                <SectionCard title="Active Sessions" desc="Devices currently logged into your account">
                  {[
                    { device:"Chrome — Windows", location:"Davao City, PH",    time:"Now",       current:true  },
                    { device:"Mobile Safari",    location:"Davao City, PH",    time:"2 days ago", current:false },
                  ].map((s, i) => (
                    <div key={i} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"13px 0", borderBottom: i < 1 ? "1px solid rgba(255,255,255,0.05)" : "none", flexWrap:"wrap", gap:10 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                        <div style={{ width:38, height:38, borderRadius:10, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                          <Globe size={16} color="#6b7280" />
                        </div>
                        <div>
                          <div style={{ fontSize:13, fontWeight:500, color:"#e2e8f0", display:"flex", alignItems:"center", gap:8 }}>
                            {s.device}
                            {s.current && <span style={{ fontSize:10, fontWeight:600, color:"#34d399", background:"rgba(52,211,153,0.12)", padding:"1px 7px", borderRadius:10 }}>Current</span>}
                          </div>
                          <div style={{ fontSize:11, color:"#6b7280", marginTop:2 }}>{s.location} · {s.time}</div>
                        </div>
                      </div>
                      {!s.current && (
                        <button style={{ padding:"5px 12px", borderRadius:8, border:"1px solid rgba(239,68,68,0.25)", background:"rgba(239,68,68,0.06)", fontSize:12, color:"#f87171", cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                          Revoke
                        </button>
                      )}
                    </div>
                  ))}
                </SectionCard>
              </div>
            )}

            {/* ════════════════════ NOTIFICATIONS TAB ════════════════════ */}
            {activeTab === "notifications" && (
              <div>
                <SectionCard title="Notification Channels" desc="Choose how Findify contacts you when items are matched or updates occur">
                  <div>
                    <Toggle checked={notifs.notifications_email}
                      onChange={v => setNotifs(n => ({ ...n, notifications_email: v }))}
                      label="Email Notifications"
                      desc="Get match alerts and updates to your inbox" />
                    <Toggle checked={notifs.notifications_push}
                      onChange={v => setNotifs(n => ({ ...n, notifications_push: v }))}
                      label="Push Notifications"
                      desc="Browser and mobile push alerts" />
                    <Toggle checked={notifs.notifications_sms}
                      onChange={v => setNotifs(n => ({ ...n, notifications_sms: v }))}
                      label="SMS Notifications"
                      desc="Text message alerts (requires phone number)" />
                  </div>
                  <div style={{ display:"flex", justifyContent:"flex-end", paddingTop:20 }}>
                    <SaveButton loading={savingNotifs} label="Save Preferences" onClick={handleSaveNotifs} />
                  </div>
                </SectionCard>

                <SectionCard title="Notification Events" desc="Pick which events trigger a notification">
                  {[
                    { label:"New item match found",        desc:"When AI finds a potential match for your report",    default:true  },
                    { label:"Item successfully claimed",   desc:"When a claim is verified and approved",              default:true  },
                    { label:"Report status updated",       desc:"When admin updates the status of your report",       default:true  },
                    { label:"New message received",        desc:"When someone sends you a message on Findify",        default:true  },
                    { label:"Weekly digest",               desc:"A weekly summary of activity on your reports",       default:false },
                    { label:"System announcements",        desc:"Product updates and important notices from Findify", default:false },
                  ].map((item, i, arr) => {
                    const [on, setOn] = useState(item.default)
                    return (
                      <Toggle key={i} checked={on} onChange={setOn}
                        label={item.label} desc={item.desc} />
                    )
                  })}
                </SectionCard>
              </div>
            )}

            {/* ════════════════════ DANGER ZONE TAB ════════════════════ */}
            {activeTab === "danger" && (
              <div>
                {/* Export data */}
                <SectionCard title="Export Your Data" desc="Download a copy of all your Findify data including reports and messages">
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:14 }}>
                    <div>
                      <div style={{ fontSize:13, color:"#8b92b8", lineHeight:1.6, maxWidth:480 }}>
                        Your export will include all reports, messages, and account information in JSON format. This may take a few minutes to prepare.
                      </div>
                    </div>
                    <button style={{ padding:"9px 18px", borderRadius:10, border:"1px solid rgba(99,102,241,0.3)", background:"rgba(99,102,241,0.08)", fontSize:13, fontWeight:500, color:"#a5b4fc", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"all 0.2s", whiteSpace:"nowrap" }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(99,102,241,0.15)"}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "rgba(99,102,241,0.08)"}>
                      Request Export
                    </button>
                  </div>
                </SectionCard>

                {/* Deactivate */}
                <SectionCard title="Deactivate Account" desc="Temporarily hide your profile and pause all notifications">
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:14 }}>
                    <div style={{ fontSize:13, color:"#8b92b8", maxWidth:480, lineHeight:1.6 }}>
                      Your account will be hidden from other users. You can reactivate at any time by logging back in.
                    </div>
                    <button style={{ padding:"9px 18px", borderRadius:10, border:"1px solid rgba(245,158,11,0.3)", background:"rgba(245,158,11,0.07)", fontSize:13, fontWeight:500, color:"#fbbf24", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", whiteSpace:"nowrap" }}>
                      Deactivate Account
                    </button>
                  </div>
                </SectionCard>

                {/* Delete account */}
                <div style={{ background:"rgba(239,68,68,0.05)", border:"1px solid rgba(239,68,68,0.2)", borderRadius:18, padding:"26px 28px" }}>
                  <div style={{ marginBottom:18 }}>
                    <h3 className="syne" style={{ fontSize:16, fontWeight:700, color:"#f87171", marginBottom:4 }}>Delete Account</h3>
                    <p style={{ fontSize:13, color:"#8b92b8" }}>
                      Permanently delete your account and all associated data. This action is <strong style={{ color:"#f87171" }}>irreversible</strong>.
                    </p>
                  </div>

                  {!deleteConfirm ? (
                    <button
                      onClick={() => setDeleteConfirm(true)}
                      style={{ padding:"10px 20px", borderRadius:10, border:"1px solid rgba(239,68,68,0.4)", background:"rgba(239,68,68,0.1)", fontSize:14, fontWeight:600, color:"#f87171", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", display:"flex", alignItems:"center", gap:8, transition:"all 0.2s" }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.18)"}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.1)"}>
                      <Trash2 size={15} /> Delete My Account
                    </button>
                  ) : (
                    <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
                      style={{ display:"flex", flexDirection:"column", gap:14 }}>
                      <div style={{ padding:"12px 14px", borderRadius:10, background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.2)", fontSize:13, color:"#f87171", display:"flex", gap:8, alignItems:"flex-start" }}>
                        <AlertTriangle size={15} style={{ flexShrink:0, marginTop:1 }} />
                        <span>This will permanently delete your account, all reports, messages, and data. You cannot undo this.</span>
                      </div>

                      <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                        <label style={{ fontSize:13, fontWeight:500, color:"#c4c9e2" }}>Enter your password to confirm</label>
                        <div style={{ position:"relative" }}>
                          <Lock size={15} color="#6b7280" style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", pointerEvents:"none", zIndex:1 }} />
                          <input
                            type={showDeletePass ? "text" : "password"}
                            placeholder="Your current password"
                            value={deletePassword}
                            onChange={e => setDeletePassword(e.target.value)}
                            className="settings-input"
                            style={{ borderColor:"rgba(239,68,68,0.35)", paddingRight:42 }}
                          />
                          <button type="button" onClick={() => setShowDeletePass(v => !v)}
                            style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", zIndex:1, display:"flex" }}>
                            {showDeletePass ? <EyeOff size={15} color="#9ca3af" /> : <Eye size={15} color="#9ca3af" />}
                          </button>
                        </div>
                        {deleteError && <span style={{ fontSize:11, color:"#f87171", display:"flex", alignItems:"center", gap:4 }}><AlertTriangle size={11} />{deleteError}</span>}
                      </div>

                      <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                        <button onClick={() => { setDeleteConfirm(false); setDeletePassword(""); setDeleteError("") }}
                          style={{ padding:"10px 18px", borderRadius:10, border:"1px solid rgba(255,255,255,0.1)", background:"rgba(255,255,255,0.05)", fontSize:14, fontWeight:500, color:"rgba(255,255,255,0.6)", cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                          Cancel
                        </button>
                        <button onClick={handleDeleteAccount} disabled={deletingAccount}
                          style={{ padding:"10px 20px", borderRadius:10, border:"none", background: deletingAccount ? "rgba(239,68,68,0.4)" : "#ef4444", fontSize:14, fontWeight:600, color:"#ffffff", cursor: deletingAccount ? "not-allowed" : "pointer", fontFamily:"'DM Sans',sans-serif", display:"flex", alignItems:"center", gap:8 }}>
                          {deletingAccount ? (
                            <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" style={{ animation:"spin 0.8s linear infinite" }}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>Deleting…</>
                          ) : (
                            <><Trash2 size={14} />Yes, Delete Permanently</>
                          )}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}