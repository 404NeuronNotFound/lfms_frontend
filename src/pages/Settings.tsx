import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useAuthStore } from "@/store/authStore"
import { useSettingsStore } from "@/store/settingsStore"
import {
  User, Mail, Lock, Eye, EyeOff, Bell, Shield,
  Trash2, Camera, CheckCircle, AlertTriangle,
  MapPin, Phone, FileText, ChevronRight, Save,
  Smartphone, Globe, Key, LogOut, X, Upload, ShieldOff,
} from "lucide-react"
import DeactivateModal from "@/components/DeactivateModal"

function AvatarDisplay({
  src, initials, size = 80, fontSize = 26, border = true,
}: {
  src: string | null; initials: string; size?: number; fontSize?: number; border?: boolean
}) {
  const borderStyle = border ? "3px solid rgba(99,102,241,0.35)" : undefined

  if (src?.startsWith("emoji:")) {
    const emoji = src.replace("emoji:", "")
    return (
      <div style={{ width: size, height: size, borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: fontSize, border: borderStyle, flexShrink: 0 }}>
        {emoji}
      </div>
    )
  }
  if (src) {
    return (
      <img src={src} alt="avatar" style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", border: borderStyle, flexShrink: 0 }} />
    )
  }
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: Math.round(size * 0.32), fontWeight: 700, border: borderStyle, flexShrink: 0 }}>
      {initials}
    </div>
  )
}

const TABS = [
  { id: "profile",       label: "Profile",       icon: User   },
  { id: "security",      label: "Security",      icon: Shield },
  { id: "notifications", label: "Notifications", icon: Bell   },
  { id: "danger",        label: "Danger Zone",   icon: Trash2 },
]


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
      <button onClick={() => onChange(!checked)} style={{
        width: 44, height: 24, borderRadius: 12, border: "none", cursor: "pointer", flexShrink: 0,
        background: checked ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "rgba(255,255,255,0.1)",
        position: "relative", transition: "all 0.25s ease",
        boxShadow: checked ? "0 0 12px rgba(99,102,241,0.4)" : "none",
      }}>
        <div style={{ position: "absolute", top: 3, width: 18, height: 18, borderRadius: "50%", background: "white", transition: "left 0.25s ease", left: checked ? 23 : 3, boxShadow: "0 1px 4px rgba(0,0,0,0.3)" }} />
      </button>
    </div>
  )
}

function SaveButton({ loading, label = "Save Changes", onClick, disabled: extDisabled }: { loading: boolean; label?: string; onClick: () => void; disabled?: boolean }) {
  const isDisabled = loading || extDisabled
  return (
    <motion.button
      whileHover={!isDisabled ? { y: -1, boxShadow: "0 12px 28px rgba(99,102,241,0.35)" } : {}}
      whileTap={!isDisabled ? { scale: 0.98 } : {}}
      onClick={onClick}
      disabled={isDisabled}
      style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "10px 20px", borderRadius: 11, border: "none",
        cursor: isDisabled ? "not-allowed" : "pointer",
        background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#ffffff",
        fontSize: 14, fontWeight: 600, opacity: isDisabled ? 0.6 : 1, transition: "all 0.25s",
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

// ── MAIN PAGE ─────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const { user, role, logout } = useAuthStore()
  const {
    profile, loadingProfile, savingProfile, savingPassword, savingNotifs, deletingAccount,
    profileError, passwordError, notifsError, successMessage,
    fetchProfile, saveProfile, savePassword, saveNotifPrefs, removeAccount, clearMessages,
  } = useSettingsStore()

  const [activeTab,   setActiveTab]   = useState("profile")
  const [isMobile,    setIsMobile]    = useState(false)
  const [showTabMenu, setShowTabMenu] = useState(false)

  // ── Avatar state ──
  const fileInputRef      = useRef<HTMLInputElement>(null)
  const [avatarPreview,   setAvatarPreview]   = useState<string | null>(null)  // local preview (base64)
  const [avatarFile,      setAvatarFile]      = useState<File | null>(null)    // raw File for display info
  const [avatarError,     setAvatarError]     = useState<string>("")
  const [isDragOver,      setIsDragOver]      = useState(false)
  const [savingAvatar,    setSavingAvatar]    = useState(false)
  const [showAvatarModal, setShowAvatarModal] = useState(false)

  // ── Profile form ──
  const [profileForm, setProfileForm] = useState({
    first_name: "", last_name: "", email: "", phone: "", address: "", bio: "",
  })

  // ── Password form ──
  const [passForm, setPassForm] = useState({
    current_password: "", new_password: "", confirm_new_password: "",
  })
  const [showCurrent,  setShowCurrent]  = useState(false)
  const [showNew,      setShowNew]      = useState(false)
  const [showConfirm,  setShowConfirm]  = useState(false)
  const [passLocalErr, setPassLocalErr] = useState("")

  // ── Notifications ──
  const [notifs, setNotifs] = useState({
    notifications_email: true,
    notifications_push:  true,
    notifications_sms:   false,
  })

  // ── Danger zone ──
  const [deletePassword, setDeletePassword] = useState("")
  const [deleteConfirm,  setDeleteConfirm]  = useState(false)
  const [showDeletePass, setShowDeletePass] = useState(false)
  const [deleteError,    setDeleteError]    = useState("")
  const [showDeactivateModal, setShowDeactivateModal] = useState(false)

  // ── Toast ──
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null)

  // ── Responsive ──
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
        first_name: profile.first_name        ?? "",
        last_name:  profile.last_name         ?? "",
        email:      profile.email             ?? "",
        phone:      profile.profile?.phone_number ?? "",
        address:    profile.profile?.address  ?? "",
        bio:        profile.profile?.bio      ?? "",
      })
      setNotifs({
        notifications_email: profile.notifications_email ?? true,
        notifications_push:  profile.notifications_push  ?? true,
        notifications_sms:   profile.notifications_sms   ?? false,
      })
      // Always sync avatar preview from the server value.
      // This picks up the real URL after an upload completes.
      // Only skip if user currently has a local File selected (mid-upload preview).
      if (!avatarFile) {
        setAvatarPreview(profile.profile?.avatar ?? null)
      }
    }
  }, [profile])

  // Toast on success
  useEffect(() => {
    if (successMessage) {
      setToast({ msg: successMessage, type: "success" })
      const t = setTimeout(() => { setToast(null); clearMessages() }, 3200)
      return () => clearTimeout(t)
    }
  }, [successMessage])

  // Toast on error
  useEffect(() => {
    const err = profileError || passwordError || notifsError
    if (err) {
      setToast({ msg: err, type: "error" })
      const t = setTimeout(() => { setToast(null); clearMessages() }, 4000)
      return () => clearTimeout(t)
    }
  }, [profileError, passwordError, notifsError])

  // ── Avatar helpers ────────────────────────────────────────────────────
  const MAX_SIZE_MB = 2
  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]

  /**
   * Renders an emoji onto an offscreen canvas and returns it as a PNG File.
   * This lets us send emoji avatars to Django's ImageField just like any
   * other image upload — no special backend handling needed.
   */
  function emojiToFile(emoji: string, filename = "avatar.png"): Promise<File> {
    return new Promise((resolve, reject) => {
      const SIZE = 256
      const canvas = document.createElement("canvas")
      canvas.width  = SIZE
      canvas.height = SIZE
      const ctx = canvas.getContext("2d")
      if (!ctx) return reject(new Error("Canvas not supported"))

      // Indigo/violet gradient background matching Findify's design
      const grad = ctx.createLinearGradient(0, 0, SIZE, SIZE)
      grad.addColorStop(0, "#6366f1")
      grad.addColorStop(1, "#8b5cf6")

      // Draw circular clipping mask
      ctx.beginPath()
      ctx.arc(SIZE / 2, SIZE / 2, SIZE / 2, 0, Math.PI * 2)
      ctx.closePath()
      ctx.fillStyle = grad
      ctx.fill()

      // Draw emoji centered
      ctx.font        = `${SIZE * 0.52}px serif`
      ctx.textAlign   = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(emoji, SIZE / 2, SIZE / 2 + SIZE * 0.04)

      canvas.toBlob(blob => {
        if (!blob) return reject(new Error("Failed to render emoji"))
        resolve(new File([blob], filename, { type: "image/png" }))
      }, "image/png")
    })
  }

  function processFile(file: File) {
    setAvatarError("")
    if (!ALLOWED_TYPES.includes(file.type)) {
      setAvatarError("Only JPG, PNG, WebP, or GIF files are allowed.")
      return
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setAvatarError(`File must be under ${MAX_SIZE_MB}MB. Current: ${(file.size / 1024 / 1024).toFixed(1)}MB`)
      return
    }
    const reader = new FileReader()
    reader.onload = e => {
      setAvatarPreview(e.target?.result as string)
      setAvatarFile(file)
    }
    reader.readAsDataURL(file)
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) processFile(file)
    e.target.value = ""  // allow re-selecting same file
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) processFile(file)
  }

  function handleRemoveAvatar() {
    setAvatarPreview(null)
    setAvatarFile(null)
    setAvatarError("")
  }

  async function handleSaveAvatar() {
    setAvatarError("")
    setSavingAvatar(true)
    try {
      let fileToUpload: File | null = avatarFile

      // ── If emoji selected, render it to a PNG File first ─────────────────
      if (!fileToUpload && avatarPreview?.startsWith("emoji:")) {
        const emoji = avatarPreview.replace("emoji:", "")
        fileToUpload = await emojiToFile(emoji, `emoji-avatar.png`)
      }

      if (fileToUpload) {
        // ── Upload as real image file (works for both photo and emoji PNG) ──
        await saveProfile({
          first_name: profile?.first_name,
          last_name:  profile?.last_name,
          email:      profile?.email,
          profile: { avatar: fileToUpload },
        })
        await fetchProfile()   // sync avatarPreview with real server URL
        setAvatarFile(null)

      } else if (!avatarPreview) {
        // ── Remove avatar ─────────────────────────────────────────────────
        await saveProfile({
          first_name: profile?.first_name,
          last_name:  profile?.last_name,
          email:      profile?.email,
          profile: {
            phone_number: profile?.profile?.phone_number,
            address:      profile?.profile?.address,
            bio:          profile?.profile?.bio,
          },
        })
        await fetchProfile()
      }

      setShowAvatarModal(false)
    } catch (e: any) {
      setAvatarError(e.message ?? "Failed to save avatar")
    } finally {
      setSavingAvatar(false)
    }
  }

  // ── Profile save ──────────────────────────────────────────────────────
  const handleSaveProfile = async () => {
    await saveProfile({
      first_name: profileForm.first_name,
      last_name:  profileForm.last_name,
      email:      profileForm.email,
      profile: {
        phone_number: profileForm.phone,
        address:      profileForm.address,
        bio:          profileForm.bio,
        // ↑ never include avatar here — avatar is handled separately
        //   by the avatar modal so we don't accidentally overwrite it
      },
    })
  }

  const handleChangePassword = async () => {
    setPassLocalErr("")
    if (!passForm.current_password)                             return setPassLocalErr("Current password is required")
    if (passForm.new_password.length < 6)                      return setPassLocalErr("New password must be at least 6 characters")
    if (passForm.new_password !== passForm.confirm_new_password) return setPassLocalErr("New passwords do not match")
    try {
      await savePassword(passForm)
      setPassForm({ current_password: "", new_password: "", confirm_new_password: "" })
    } catch {}
  }

  const handleSaveNotifs    = async () => { await saveNotifPrefs(notifs) }
  const handleDeleteAccount = async () => {
    setDeleteError("")
    if (!deletePassword) return setDeleteError("Password is required to delete your account")
    try { await removeAccount({ password: deletePassword }) }
    catch (e: any) { setDeleteError(e.message ?? "Failed to delete account") }
  }

  // ── Derived ───────────────────────────────────────────────────────────
  const isAdmin  = role === "ADMIN"
  const initials = profile
    ? `${profile.first_name?.[0] ?? ""}${profile.last_name?.[0] ?? ""}`.toUpperCase() || user?.slice(0, 2).toUpperCase() || "??"
    : user?.slice(0, 2).toUpperCase() || "??"

  const currentAvatar = avatarPreview || profile?.profile?.avatar || null

  const newPassMatch    = passForm.new_password && passForm.confirm_new_password && passForm.new_password === passForm.confirm_new_password
  const newPassMismatch = passForm.confirm_new_password && passForm.new_password !== passForm.confirm_new_password

  // ── Avatar modal ──────────────────────────────────────────────────────
  const AvatarModal = () => (
    <AnimatePresence>
      {showAvatarModal && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={e => { if (e.target === e.currentTarget) setShowAvatarModal(false) }}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.94 }}
            style={{ background: "#0e0e1f", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: 28, width: "100%", maxWidth: 480, position: "relative" }}
          >
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <div>
                <h3 className="syne" style={{ fontSize: 18, fontWeight: 700, color: "#ffffff", marginBottom: 2 }}>Update Profile Photo</h3>
                <p style={{ fontSize: 12, color: "#6b7280" }}>JPG, PNG, WebP or GIF · Max {MAX_SIZE_MB}MB</p>
              </div>
              <button onClick={() => setShowAvatarModal(false)}
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: 6, cursor: "pointer", display: "flex" }}>
                <X size={16} color="rgba(255,255,255,0.5)" />
              </button>
            </div>

            {/* Preview + drop zone */}
            <div style={{ display: "flex", gap: 20, marginBottom: 20, flexWrap: "wrap" }}>

              {/* Current preview — uses AvatarDisplay so emoji never hits <img> */}
              <div style={{ flexShrink: 0 }}>
                <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>Preview</div>
                <div style={{ position: "relative", width: 88, height: 88 }}>
                  <AvatarDisplay src={currentAvatar} initials={initials} size={88} fontSize={34} />
                  {/* Remove X badge */}
                  {currentAvatar && (
                    <motion.button
                      whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                      onClick={handleRemoveAvatar}
                      style={{ position: "absolute", top: -4, right: -4, width: 22, height: 22, borderRadius: "50%", background: "#ef4444", border: "2px solid #0e0e1f", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <X size={11} color="white" />
                    </motion.button>
                  )}
                </div>
                {avatarFile && (
                  <div style={{ marginTop: 8, maxWidth: 88 }}>
                    <div style={{ fontSize: 10, color: "#6b7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{avatarFile.name}</div>
                    <div style={{ fontSize: 10, color: "#4b5563" }}>{(avatarFile.size / 1024).toFixed(0)} KB</div>
                  </div>
                )}
              </div>

              {/* Drop zone */}
              <div
                onDragOver={e => { e.preventDefault(); setIsDragOver(true) }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  flex: 1, minHeight: 120, borderRadius: 14,
                  border: `2px dashed ${isDragOver ? "rgba(99,102,241,0.7)" : "rgba(255,255,255,0.12)"}`,
                  background: isDragOver ? "rgba(99,102,241,0.08)" : "rgba(255,255,255,0.02)",
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8,
                  cursor: "pointer", transition: "all 0.2s", minWidth: 180,
                }}
              >
                <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Upload size={18} color="#818cf8" />
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "#c4c9e2" }}>
                    {isDragOver ? "Drop it here!" : "Drag & drop or click"}
                  </div>
                  <div style={{ fontSize: 11, color: "#4b5563", marginTop: 2 }}>to choose a photo</div>
                </div>
              </div>
            </div>

            {/* Hidden file input */}
            <input ref={fileInputRef} type="file" accept={ALLOWED_TYPES.join(",")} onChange={handleFileInput} style={{ display: "none" }} />

            {/* Error */}
            <AnimatePresence>
              {avatarError && (
                <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(239,68,68,0.09)", border: "1px solid rgba(239,68,68,0.25)", fontSize: 12, color: "#f87171", display: "flex", gap: 8, alignItems: "center", marginBottom: 16 }}>
                  <AlertTriangle size={13} /> {avatarError}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Quick-select emoji avatars */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>Or pick an avatar</div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {["🧑‍💻","👩‍🎓","🧑‍🔬","👩‍💼","🧑‍🏫","👨‍🚀","🦊","🐼"].map(emoji => (
                  <button key={emoji}
                    onClick={() => { setAvatarPreview(`emoji:${emoji}`); setAvatarFile(null); setAvatarError("") }}
                    style={{
                      width: 42, height: 42, borderRadius: 10,
                      border: `1px solid ${avatarPreview === `emoji:${emoji}` ? "rgba(99,102,241,0.7)" : "rgba(255,255,255,0.1)"}`,
                      background: avatarPreview === `emoji:${emoji}` ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.04)",
                      fontSize: 22, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "all 0.15s",
                    }}>
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => setShowAvatarModal(false)}
                style={{ padding: "9px 18px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.6)", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
                Cancel
              </button>
              <SaveButton
                loading={savingAvatar}
                label="Save Photo"
                onClick={handleSaveAvatar}
                // enable when: real file selected, emoji selected, or user cleared the avatar (wants to remove)
                disabled={!avatarFile && !avatarPreview?.startsWith("emoji:") && avatarPreview === profile?.profile?.avatar}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  // ── Render ────────────────────────────────────────────────────────────
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
        .settings-input:-webkit-autofill, .settings-input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 40px #10101e inset !important;
          -webkit-text-fill-color: #ffffff !important;
        }
        .tab-btn { display:flex; align-items:center; gap:10px; padding:10px 14px; border-radius:11px; border:none; cursor:pointer; transition:all 0.2s; font-family:'DM Sans',sans-serif; font-size:14px; font-weight:500; width:100%; text-align:left; }
        .tab-btn:hover { background:rgba(255,255,255,0.05); }
        .tab-btn.active { background:linear-gradient(135deg,rgba(99,102,241,0.18),rgba(139,92,246,0.12)); border:1px solid rgba(99,102,241,0.3); color:#a5b4fc; }
        .tab-btn:not(.active) { background:transparent; color:rgba(255,255,255,0.5); }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        textarea.settings-input { padding: 11px 14px; resize: vertical; min-height: 80px; line-height: 1.6; }
        .avatar-upload-btn:hover .avatar-overlay { opacity: 1 !important; }
      `}</style>

      {/* Avatar modal */}
      <AvatarModal />

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -12, scale: 0.95 }}
            style={{ position: "fixed", top: 20, right: 20, zIndex: 999, display: "flex", alignItems: "center", gap: 10, padding: "12px 18px", borderRadius: 12, maxWidth: 360, background: toast.type === "success" ? "rgba(52,211,153,0.12)" : "rgba(239,68,68,0.12)", border: `1px solid ${toast.type === "success" ? "rgba(52,211,153,0.35)" : "rgba(239,68,68,0.35)"}`, backdropFilter: "blur(16px)", boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}>
            {toast.type === "success" ? <CheckCircle size={16} color="#34d399" /> : <AlertTriangle size={16} color="#f87171" />}
            <span style={{ fontSize: 13, fontWeight: 500, color: toast.type === "success" ? "#34d399" : "#f87171", flex: 1 }}>{toast.msg}</span>
            <button onClick={() => setToast(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.4)", display: "flex", padding: 0 }}><X size={14} /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page header */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 className="syne" style={{ fontSize: isMobile ? 22 : 28, fontWeight: 800, letterSpacing: "-1px", color: "#ffffff", marginBottom: 4 }}>Settings</h1>
            <p style={{ fontSize: 14, color: "#6b7280" }}>Manage your account, security, and preferences</p>
          </div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 14px", borderRadius: 20, background: isAdmin ? "rgba(99,102,241,0.12)" : "rgba(52,211,153,0.1)", border: isAdmin ? "1px solid rgba(99,102,241,0.28)" : "1px solid rgba(52,211,153,0.22)" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", flexShrink: 0, background: isAdmin ? "#818cf8" : "#34d399", boxShadow: isAdmin ? "0 0 6px #818cf8" : "0 0 6px #34d399" }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: isAdmin ? "#a5b4fc" : "#6ee7b7", letterSpacing: 0.5, textTransform: "uppercase" }}>{isAdmin ? "Administrator" : "User"}</span>
          </div>
        </div>
      </motion.div>

      {/* Layout */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "220px 1fr", gap: 20, alignItems: "start" }}>

        {/* Sidebar */}
        <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 }}>
          {isMobile ? (
            <div style={{ marginBottom: 20 }}>
              <button onClick={() => setShowTabMenu(v => !v)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderRadius: 12, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", cursor: "pointer", color: "white", fontFamily: "'DM Sans',sans-serif" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {(() => { const t = TABS.find(t => t.id === activeTab)!; return <t.icon size={16} color="#818cf8" /> })()}
                  <span style={{ fontSize: 14, fontWeight: 500 }}>{TABS.find(t => t.id === activeTab)?.label}</span>
                </div>
                <ChevronRight size={15} color="#6b7280" style={{ transform: showTabMenu ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
              </button>
              <AnimatePresence>
                {showTabMenu && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ background: "rgba(10,10,24,0.98)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 12, marginTop: 6, overflow: "hidden", backdropFilter: "blur(20px)" }}>
                    {TABS.map(tab => (
                      <button key={tab.id} onClick={() => { setActiveTab(tab.id); setShowTabMenu(false) }}
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
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 10, position: "sticky", top: 24 }}>
              {/* Mini avatar in sidebar */}
              <div style={{ padding: "16px 12px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)", marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    className="avatar-upload-btn"
                    onClick={() => setShowAvatarModal(true)}
                    style={{ position: "relative", width: 40, height: 40, flexShrink: 0, cursor: "pointer" }}>
                    <AvatarDisplay src={currentAvatar} initials={initials} size={40} fontSize={16} border={false} />
                    {/* Hover overlay */}
                    <div className="avatar-overlay" style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: "opacity 0.2s" }}>
                      <Camera size={12} color="white" />
                    </div>
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#ffffff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {profile ? `${profile.first_name} ${profile.last_name}` : user ?? "—"}
                    </div>
                    <div style={{ fontSize: 11, color: "#6b7280", marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{profile?.email ?? ""}</div>
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {TABS.map(tab => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}>
                    <tab.icon size={16} color={activeTab === tab.id ? "#818cf8" : "#6b7280"} />
                    <span>{tab.label}</span>
                    {tab.id === "danger" && <span style={{ marginLeft: "auto", fontSize: 10, color: "#f87171", background: "rgba(239,68,68,0.1)", padding: "2px 7px", borderRadius: 4 }}>!</span>}
                    {activeTab === tab.id && <ChevronRight size={13} style={{ marginLeft: "auto" }} />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Main content */}
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }}>

            {/* ══════════════ PROFILE ══════════════ */}
            {activeTab === "profile" && (
              <div>
                {/* ── Avatar card ── */}
                <SectionCard title="Profile Photo" desc="Your avatar is shown across Findify">
                  <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
                    {/* Big avatar with click-to-edit */}
                    <div style={{ position: "relative", flexShrink: 0 }}>
                      <div
                        onClick={() => setShowAvatarModal(true)}
                        className="avatar-upload-btn"
                        style={{ width: 80, height: 80, borderRadius: "50%", cursor: "pointer", position: "relative", flexShrink: 0 }}>
                        <AvatarDisplay src={currentAvatar} initials={initials} size={80} fontSize={28} />
                        {/* Hover overlay */}
                        <div className="avatar-overlay" style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: "opacity 0.2s" }}>
                          <Camera size={20} color="white" />
                        </div>
                      </div>
                      {/* Camera badge */}
                      <div onClick={() => setShowAvatarModal(true)} style={{ position: "absolute", bottom: 0, right: 0, width: 24, height: 24, borderRadius: "50%", background: "#6366f1", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #06060f", cursor: "pointer", boxShadow: "0 2px 8px rgba(99,102,241,0.5)" }}>
                        <Camera size={11} color="white" />
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: 15, fontWeight: 600, color: "#ffffff", marginBottom: 2 }}>
                        {profile ? `${profile.first_name} ${profile.last_name}` : user ?? "—"}
                      </div>
                      <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 12 }}>
                        {isAdmin ? "Administrator" : "Member"} · joined {profile?.date_joined ? new Date(profile.date_joined).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "—"}
                      </div>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <motion.button
                          whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
                          onClick={() => setShowAvatarModal(true)}
                          style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 9, border: "1px solid rgba(99,102,241,0.35)", background: "rgba(99,102,241,0.1)", fontSize: 13, fontWeight: 500, color: "#a5b4fc", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", transition: "all 0.2s" }}>
                          <Upload size={13} /> Change Photo
                        </motion.button>
                        {currentAvatar && (
                          <button onClick={handleRemoveAvatar}
                            style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 9, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.45)", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
                            <X size={13} /> Remove
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </SectionCard>

                {/* ── Personal info ── */}
                <SectionCard title="Personal Information" desc="Update your name, email and contact details">
                  {loadingProfile ? (
                    <div style={{ display: "flex", justifyContent: "center", padding: "24px 0" }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.5" style={{ animation: "spin 0.8s linear infinite" }}>
                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
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
                        <FieldInput id="address" label="Location / Campus" placeholder="e.g. Main Campus" icon={MapPin}
                          value={profileForm.address ?? ""} onChange={e => setProfileForm(f => ({ ...f, address: e.target.value }))} />
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <label style={{ fontSize: 13, fontWeight: 500, color: "#c4c9e2" }}>Bio</label>
                        <div style={{ position: "relative" }}>
                          <FileText size={15} color="#6b7280" style={{ position: "absolute", left: 13, top: 13, pointerEvents: "none", zIndex: 1 }} />
                          <textarea placeholder="A short bio about yourself…" value={profileForm.bio ?? ""}
                            onChange={e => setProfileForm(f => ({ ...f, bio: e.target.value }))}
                            className="settings-input" style={{ paddingLeft: 38, paddingTop: 11 }} />
                        </div>
                        <span style={{ fontSize: 11, color: "#4b5563" }}>Optional — visible on your public profile</span>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 14 }}>
                        <FieldInput id="username_ro" label="Username" placeholder="" icon={User}
                          value={profile?.username ?? user ?? ""} onChange={() => {}} disabled hint="Username cannot be changed" />
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

            {/* ══════════════ SECURITY ══════════════ */}
            {activeTab === "security" && (
              <div>
                <SectionCard title="Change Password" desc="Use a strong password you don't use elsewhere">
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <FieldInput id="current_password" label="Current Password" placeholder="Enter current password"
                      type={showCurrent ? "text" : "password"} icon={Lock}
                      value={passForm.current_password} onChange={e => setPassForm(f => ({ ...f, current_password: e.target.value }))}
                      right={<button type="button" onClick={() => setShowCurrent(v => !v)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", padding: 0 }}>{showCurrent ? <EyeOff size={15} color="#9ca3af" /> : <Eye size={15} color="#9ca3af" />}</button>} />
                    <FieldInput id="new_password" label="New Password" placeholder="Min. 6 characters"
                      type={showNew ? "text" : "password"} icon={Key}
                      value={passForm.new_password} onChange={e => setPassForm(f => ({ ...f, new_password: e.target.value }))}
                      hint="At least 6 characters recommended"
                      right={<button type="button" onClick={() => setShowNew(v => !v)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", padding: 0 }}>{showNew ? <EyeOff size={15} color="#9ca3af" /> : <Eye size={15} color="#9ca3af" />}</button>} />
                    {passForm.new_password && (
                      <div style={{ marginTop: -8 }}>
                        <div style={{ height: 3, borderRadius: 2, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
                          <div style={{ height: "100%", borderRadius: 2, transition: "width 0.4s, background 0.3s", width: passForm.new_password.length < 4 ? "25%" : passForm.new_password.length < 6 ? "55%" : passForm.new_password.length < 10 ? "80%" : "100%", background: passForm.new_password.length < 4 ? "#f87171" : passForm.new_password.length < 6 ? "#fbbf24" : "#34d399" }} />
                        </div>
                      </div>
                    )}
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <label style={{ fontSize: 13, fontWeight: 500, color: "#c4c9e2" }}>Confirm New Password</label>
                      <div style={{ position: "relative" }}>
                        <Lock size={15} color="#6b7280" style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", zIndex: 1 }} />
                        <input type={showConfirm ? "text" : "password"} placeholder="Repeat new password"
                          value={passForm.confirm_new_password} onChange={e => setPassForm(f => ({ ...f, confirm_new_password: e.target.value }))}
                          className="settings-input"
                          style={{ paddingRight: 42, borderColor: newPassMismatch ? "rgba(239,68,68,0.5)" : newPassMatch ? "rgba(52,211,153,0.5)" : undefined }} />
                        <div style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", zIndex: 1, display: "flex", gap: 6, alignItems: "center" }}>
                          {passForm.confirm_new_password && (newPassMatch ? <CheckCircle size={14} color="#34d399" /> : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>)}
                          <button type="button" onClick={() => setShowConfirm(v => !v)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", padding: 0 }}>{showConfirm ? <EyeOff size={15} color="#9ca3af" /> : <Eye size={15} color="#9ca3af" />}</button>
                        </div>
                      </div>
                      {passForm.confirm_new_password && (
                        <span style={{ fontSize: 11, color: newPassMatch ? "#34d399" : "#f87171", display: "flex", alignItems: "center", gap: 4 }}>
                          <span style={{ width: 4, height: 4, borderRadius: "50%", background: newPassMatch ? "#34d399" : "#f87171", display: "inline-block" }} />
                          {newPassMatch ? "Passwords match" : "Passwords do not match"}
                        </span>
                      )}
                    </div>
                    <AnimatePresence>
                      {passLocalErr && (
                        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                          style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(239,68,68,0.09)", border: "1px solid rgba(239,68,68,0.25)", fontSize: 13, color: "#f87171", display: "flex", gap: 8, alignItems: "center" }}>
                          <AlertTriangle size={14} /> {passLocalErr}
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                      <SaveButton loading={savingPassword} label="Update Password" onClick={handleChangePassword} />
                    </div>
                  </div>
                </SectionCard>
                <SectionCard title="Two-Factor Authentication" desc="Add an extra layer of security to your account">
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 14 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.25)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Smartphone size={20} color="#818cf8" /></div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "#ffffff" }}>Authenticator App</div>
                        <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>Use an app like Google Authenticator or Authy</div>
                      </div>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 600, color: "#fbbf24", background: "rgba(245,158,11,0.12)", padding: "3px 10px", borderRadius: 20, border: "1px solid rgba(245,158,11,0.25)" }}>Coming Soon</span>
                  </div>
                </SectionCard>
                <SectionCard title="Active Sessions" desc="Devices currently logged into your account">
                  {[{ device: "Chrome — Windows", location: "Davao City, PH", time: "Now", current: true }, { device: "Mobile Safari", location: "Davao City, PH", time: "2 days ago", current: false }].map((s, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 0", borderBottom: i < 1 ? "1px solid rgba(255,255,255,0.05)" : "none", flexWrap: "wrap", gap: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Globe size={16} color="#6b7280" /></div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 500, color: "#e2e8f0", display: "flex", alignItems: "center", gap: 8 }}>
                            {s.device}
                            {s.current && <span style={{ fontSize: 10, fontWeight: 600, color: "#34d399", background: "rgba(52,211,153,0.12)", padding: "1px 7px", borderRadius: 10 }}>Current</span>}
                          </div>
                          <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>{s.location} · {s.time}</div>
                        </div>
                      </div>
                      {!s.current && <button style={{ padding: "5px 12px", borderRadius: 8, border: "1px solid rgba(239,68,68,0.25)", background: "rgba(239,68,68,0.06)", fontSize: 12, color: "#f87171", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>Revoke</button>}
                    </div>
                  ))}
                </SectionCard>
              </div>
            )}

            {/* ══════════════ NOTIFICATIONS ══════════════ */}
            {activeTab === "notifications" && (
              <div>
                <SectionCard title="Notification Channels" desc="Choose how Findify contacts you">
                  <Toggle checked={notifs.notifications_email} onChange={v => setNotifs(n => ({ ...n, notifications_email: v }))} label="Email Notifications" desc="Get match alerts and updates to your inbox" />
                  <Toggle checked={notifs.notifications_push}  onChange={v => setNotifs(n => ({ ...n, notifications_push: v }))}  label="Push Notifications"  desc="Browser and mobile push alerts" />
                  <Toggle checked={notifs.notifications_sms}   onChange={v => setNotifs(n => ({ ...n, notifications_sms: v }))}   label="SMS Notifications"   desc="Text message alerts (requires phone number)" />
                  <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: 20 }}>
                    <SaveButton loading={savingNotifs} label="Save Preferences" onClick={handleSaveNotifs} />
                  </div>
                </SectionCard>
                <SectionCard title="Notification Events" desc="Pick which events trigger a notification">
                  {(() => {
                    const EVENTS = [
                      { label: "New item match found",      desc: "When AI finds a potential match for your report",    def: true  },
                      { label: "Item successfully claimed", desc: "When a claim is verified and approved",              def: true  },
                      { label: "Report status updated",     desc: "When admin updates the status of your report",       def: true  },
                      { label: "New message received",      desc: "When someone sends you a message on Findify",        def: true  },
                      { label: "Weekly digest",             desc: "A weekly summary of activity on your reports",       def: false },
                      { label: "System announcements",      desc: "Product updates and important notices from Findify", def: false },
                    ]
                    const [evts, setEvts] = useState(() => EVENTS.map(e => e.def))
                    return EVENTS.map((item, i) => (
                      <Toggle key={i} checked={evts[i]} onChange={v => setEvts(a => { const n=[...a]; n[i]=v; return n })} label={item.label} desc={item.desc} />
                    ))
                  })()}
                </SectionCard>
              </div>
            )}

            {/* ══════════════ DANGER ZONE ══════════════ */}
            {activeTab === "danger" && (
              <div>
                <SectionCard title="Export Your Data" desc="Download a copy of all your Findify data including reports and messages">
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 14 }}>
                    <div style={{ fontSize: 13, color: "#8b92b8", lineHeight: 1.6, maxWidth: 480 }}>Your export will include all reports, messages, and account information in JSON format.</div>
                    <button style={{ padding: "9px 18px", borderRadius: 10, border: "1px solid rgba(99,102,241,0.3)", background: "rgba(99,102,241,0.08)", fontSize: 13, fontWeight: 500, color: "#a5b4fc", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", whiteSpace: "nowrap" }}>Request Export</button>
                  </div>
                </SectionCard>
                <DeactivateModal
                  open={showDeactivateModal}
                  onClose={() => setShowDeactivateModal(false)}
                />
                <SectionCard title="Deactivate Account" desc="Temporarily hide your profile and pause all activity">
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 14 }}>
                    <div style={{ fontSize: 13, color: "#8b92b8", maxWidth: 440, lineHeight: 1.7 }}>
                      Your account will be hidden and notifications paused.{" "}
                      <span style={{ color: "#a5b4fc" }}>
                        Log back in at any time to reactivate automatically.
                      </span>
                    </div>
                    <motion.button
                      whileHover={{ y: -1, boxShadow: "0 6px 20px rgba(245,158,11,0.18)" }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setShowDeactivateModal(true)}
                      style={{
                        padding: "9px 18px", borderRadius: 10,
                        border: "1px solid rgba(245,158,11,0.3)",
                        background: "rgba(245,158,11,0.07)",
                        fontSize: 13, fontWeight: 600, color: "#fbbf24",
                        cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
                        whiteSpace: "nowrap", transition: "all 0.2s",
                        display: "flex", alignItems: "center", gap: 7,
                      }}>
                      <ShieldOff size={13} />
                      Deactivate Account
                    </motion.button>
                  </div>
                </SectionCard>
                <div style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 18, padding: "26px 28px" }}>
                  <h3 className="syne" style={{ fontSize: 16, fontWeight: 700, color: "#f87171", marginBottom: 6 }}>Delete Account</h3>
                  <p style={{ fontSize: 13, color: "#8b92b8", marginBottom: 18 }}>Permanently delete your account and all associated data. This action is <strong style={{ color: "#f87171" }}>irreversible</strong>.</p>
                  {!deleteConfirm ? (
                    <button onClick={() => setDeleteConfirm(true)} style={{ padding: "10px 20px", borderRadius: 10, border: "1px solid rgba(239,68,68,0.4)", background: "rgba(239,68,68,0.1)", fontSize: 14, fontWeight: 600, color: "#f87171", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", display: "flex", alignItems: "center", gap: 8 }}>
                      <Trash2 size={15} /> Delete My Account
                    </button>
                  ) : (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                      <div style={{ padding: "12px 14px", borderRadius: 10, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", fontSize: 13, color: "#f87171", display: "flex", gap: 8, alignItems: "flex-start" }}>
                        <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
                        <span>This will permanently delete your account, all reports, messages, and data. You cannot undo this.</span>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <label style={{ fontSize: 13, fontWeight: 500, color: "#c4c9e2" }}>Enter your password to confirm</label>
                        <div style={{ position: "relative" }}>
                          <Lock size={15} color="#6b7280" style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", zIndex: 1 }} />
                          <input type={showDeletePass ? "text" : "password"} placeholder="Your current password" value={deletePassword} onChange={e => setDeletePassword(e.target.value)} className="settings-input" style={{ borderColor: "rgba(239,68,68,0.35)", paddingRight: 42 }} />
                          <button type="button" onClick={() => setShowDeletePass(v => !v)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", zIndex: 1, display: "flex" }}>{showDeletePass ? <EyeOff size={15} color="#9ca3af" /> : <Eye size={15} color="#9ca3af" />}</button>
                        </div>
                        {deleteError && <span style={{ fontSize: 11, color: "#f87171", display: "flex", alignItems: "center", gap: 4 }}><AlertTriangle size={11} />{deleteError}</span>}
                      </div>
                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        <button onClick={() => { setDeleteConfirm(false); setDeletePassword(""); setDeleteError("") }} style={{ padding: "10px 18px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.6)", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>Cancel</button>
                        <button onClick={handleDeleteAccount} disabled={deletingAccount} style={{ padding: "10px 20px", borderRadius: 10, border: "none", background: deletingAccount ? "rgba(239,68,68,0.4)" : "#ef4444", fontSize: 14, fontWeight: 600, color: "#ffffff", cursor: deletingAccount ? "not-allowed" : "pointer", fontFamily: "'DM Sans',sans-serif", display: "flex", alignItems: "center", gap: 8 }}>
                          {deletingAccount ? <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" style={{ animation: "spin 0.8s linear infinite" }}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" /></svg>Deleting…</> : <><Trash2 size={14} />Yes, Delete Permanently</>}
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