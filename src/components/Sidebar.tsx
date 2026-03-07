"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useAuthStore } from "@/store/authStore"
import { useSettingsStore } from "@/store/settingsStore"
import {
  Search, LayoutDashboard, PackageSearch, PackagePlus, Bell,
  ClipboardList, Users, BarChart3, Settings, ShieldCheck, LogOut,
  ChevronRight, Menu, X, Tag, MapPin, CheckCircle, MessageSquare,
  FileText,
} from "lucide-react"

// ── Nav config ────────────────────────────────────────────────────────────
const ADMIN_NAV = [
  {
    group: "Overview",
    items: [
      { icon: LayoutDashboard, label: "Dashboard",     href: "/admin-dashboard",  badge: null },
      { icon: BarChart3,       label: "Analytics",     href: "/admin-analytics",  badge: null },
    ],
  },
  {
    group: "Management",
    items: [
      { icon: ClipboardList,  label: "All Reports",    href: "/admin-reports",    badge: "128" },
      { icon: PackageSearch,  label: "Lost Items",     href: "/admin-lost",       badge: "54"  },
      { icon: Tag,            label: "Found Items",    href: "/admin-found",      badge: "74"  },
      { icon: CheckCircle,    label: "Claimed",        href: "/admin-claimed",    badge: null  },
    ],
  },
  {
    group: "Users",
    items: [
      { icon: Users,          label: "All Users",      href: "/admin-all-users",      badge: null },
      { icon: ShieldCheck,    label: "Verifications",  href: "/admin-verify",     badge: "7"  },
      { icon: MessageSquare,  label: "Messages",       href: "/admin-messages",   badge: "3"  },
    ],
  },
  {
    group: "System",
    items: [
      { icon: FileText,       label: "Audit Logs",     href: "/admin-logs",       badge: null },
      { icon: Settings,       label: "Settings",       href: "/admin-settings",   badge: null },
    ],
  },
]

const USER_NAV = [
  {
    group: "Home",
    items: [
      { icon: LayoutDashboard, label: "Dashboard",     href: "/user-dashboard",    badge: null },
      { icon: Bell,            label: "Notifications", href: "/user-notifications",badge: "2"  },
    ],
  },
  {
    group: "Items",
    items: [
      { icon: PackagePlus,    label: "Report Lost",    href: "/user-report-lost",  badge: null },
      { icon: PackageSearch,  label: "Browse Found",   href: "/user-browse",       badge: null },
      { icon: ClipboardList,  label: "My Reports",     href: "/user-reports",      badge: null },
      { icon: CheckCircle,    label: "My Claims",      href: "/user-claims",       badge: null },
    ],
  },
  {
    group: "Account",
    items: [
      { icon: MapPin,         label: "My Location",    href: "/user-location",     badge: null },
      { icon: MessageSquare,  label: "Messages",       href: "/user-messages",     badge: "1"  },
      { icon: Settings,       label: "Settings",       href: "/user-settings",     badge: null },
    ],
  },
]

interface NavItem  { icon: React.ElementType; label: string; href: string; badge: string | null }
interface NavGroup { group: string; items: NavItem[] }
interface SidebarProps { collapsed: boolean; setCollapsed: (v: boolean) => void }

// ── Avatar renderer — handles URL / emoji / initials ─────────────────────
function SidebarAvatar({
  src, initials, size = 34,
}: { src?: string | null; initials: string; size?: number }) {
  const style: React.CSSProperties = {
    width: size, height: size, borderRadius: "50%", flexShrink: 0,
    display: "flex", alignItems: "center", justifyContent: "center",
    background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
    fontSize: Math.round(size * 0.35), fontWeight: 700, overflow: "hidden",
    border: "2px solid rgba(99,102,241,0.4)",
  }

  if (src?.startsWith("emoji:")) {
    return (
      <div style={style}>
        <span style={{ fontSize: Math.round(size * 0.52), lineHeight: 1 }}>
          {src.replace("emoji:", "")}
        </span>
      </div>
    )
  }

  if (src) {
    return (
      <img
        src={src} alt="avatar"
        style={{ ...style, objectFit: "cover" }}
        onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none" }}
      />
    )
  }

  return <div style={style}>{initials}</div>
}

// ── Main Sidebar ──────────────────────────────────────────────────────────
export function Sidebar({ collapsed, setCollapsed }: SidebarProps) {
  const { user, role, logout } = useAuthStore()
  const { profile, fetchProfile } = useSettingsStore()

  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeHref, setActiveHref] = useState(
    typeof window !== "undefined" ? window.location.pathname : ""
  )
  const [isMobile, setIsMobile] = useState(false)
  const [showProfileCard, setShowProfileCard] = useState(false)

  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (mobile) setCollapsed(false)
    }
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  // Load profile on mount so avatar is always fresh
  useEffect(() => { fetchProfile() }, [])

  const isAdmin    = role === "ADMIN"
  const navGroups: NavGroup[] = isAdmin ? ADMIN_NAV : USER_NAV

  const displayName = profile
    ? `${profile.first_name} ${profile.last_name}`.trim() || profile.username
    : user ?? "Unknown"

  const initials = displayName
    ? displayName.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()
    : "??"

  const avatarSrc    = profile?.profile?.avatar ?? null
  const settingsHref = isAdmin ? "/admin-settings" : "/user-settings"

  // ── Profile popover card ──────────────────────────────────────────────
  const ProfileCard = () => (
    <AnimatePresence>
      {showProfileCard && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowProfileCard(false)}
            style={{ position: "fixed", inset: 0, zIndex: 45 }}
          />

          {/* Card */}
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            style={{
              position: "fixed",
              bottom: 80,
              left: collapsed ? 72 : 252,
              zIndex: 50,
              width: 260,
              background: "rgba(10,10,24,0.98)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 16,
              padding: 20,
              backdropFilter: "blur(24px)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
              fontFamily: "'DM Sans',sans-serif",
              color: "white",
            }}
          >
            {/* Avatar + name */}
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
              <div style={{ position: "relative", flexShrink: 0 }}>
                <SidebarAvatar src={avatarSrc} initials={initials} size={52} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#ffffff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {displayName}
                </div>
                <div style={{ fontSize: 12, color: "#6b7280", marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {profile?.email ?? ""}
                </div>
                {/* Role badge */}
                <div style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 5, padding: "2px 8px", borderRadius: 20, background: isAdmin ? "rgba(99,102,241,0.12)" : "rgba(52,211,153,0.1)", border: isAdmin ? "1px solid rgba(99,102,241,0.28)" : "1px solid rgba(52,211,153,0.2)" }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: isAdmin ? "#818cf8" : "#34d399", boxShadow: isAdmin ? "0 0 5px #818cf8" : "0 0 5px #34d399" }} />
                  <span style={{ fontSize: 10, fontWeight: 600, color: isAdmin ? "#a5b4fc" : "#6ee7b7", textTransform: "uppercase", letterSpacing: 0.5 }}>
                    {isAdmin ? "Administrator" : "User"}
                  </span>
                </div>
              </div>
            </div>

            {/* Profile details */}
            {(profile?.profile?.address || profile?.profile?.phone_number || profile?.profile?.bio) && (
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 14, marginBottom: 14, display: "flex", flexDirection: "column", gap: 8 }}>
                {profile.profile.phone_number && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 24, height: 24, borderRadius: 7, background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <svg width="11" height="11" fill="none" stroke="#818cf8" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6.16 6.16l1.02-.93a2 2 0 0 1 2.09-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    </div>
                    <span style={{ fontSize: 12, color: "#8b92b8" }}>{profile.profile.phone_number}</span>
                  </div>
                )}
                {profile.profile.address && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 24, height: 24, borderRadius: 7, background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <MapPin size={11} color="#818cf8" />
                    </div>
                    <span style={{ fontSize: 12, color: "#8b92b8" }}>{profile.profile.address}</span>
                  </div>
                )}
                {profile.profile.bio && (
                  <div style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.5, padding: "8px 10px", borderRadius: 9, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    "{profile.profile.bio}"
                  </div>
                )}
              </div>
            )}

            {/* Joined date */}
            {profile?.date_joined && (
              <div style={{ fontSize: 11, color: "#4b5563", marginBottom: 14 }}>
                Member since {new Date(profile.date_joined).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </div>
            )}

            {/* Actions */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <a href={settingsHref}
                onClick={() => setShowProfileCard(false)}
                style={{ display: "flex", alignItems: "center", gap: 9, padding: "9px 12px", borderRadius: 10, background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", textDecoration: "none", color: "#a5b4fc", fontSize: 13, fontWeight: 500, transition: "all 0.2s" }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(99,102,241,0.18)"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "rgba(99,102,241,0.1)"}>
                <Settings size={14} /><span>Edit Profile & Settings</span>
              </a>
              <button onClick={() => { setShowProfileCard(false); logout() }}
                style={{ display: "flex", alignItems: "center", gap: 9, padding: "9px 12px", borderRadius: 10, background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.18)", color: "#f87171", fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", transition: "all 0.2s", width: "100%" }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.14)"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.07)"}>
                <LogOut size={14} /><span>Logout</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )

  // ── Sidebar content ───────────────────────────────────────────────────
  const SidebarContent = ({ onNavigate }: { onNavigate?: () => void }) => (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>

      {/* Logo */}
      <div style={{ padding: collapsed ? "20px 0" : "24px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "space-between", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, overflow: "hidden" }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, flexShrink: 0, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(99,102,241,0.4)" }}>
            <Search size={15} color="white" />
          </div>
          {!collapsed && (
            <motion.span initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="syne" style={{ fontWeight: 800, fontSize: 16, letterSpacing: "-0.5px", whiteSpace: "nowrap" }}>
              Findify
            </motion.span>
          )}
        </div>
        {!isMobile && (
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => setCollapsed(!collapsed)}
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "rgba(255,255,255,0.5)", flexShrink: 0 }}>
            <ChevronRight size={14} style={{ transform: collapsed ? "rotate(0deg)" : "rotate(180deg)", transition: "transform 0.3s" }} />
          </motion.button>
        )}
      </div>

      {/* Role badge */}
      {!collapsed && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 20, background: isAdmin ? "rgba(99,102,241,0.12)" : "rgba(52,211,153,0.1)", border: isAdmin ? "1px solid rgba(99,102,241,0.25)" : "1px solid rgba(52,211,153,0.2)" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", flexShrink: 0, background: isAdmin ? "#818cf8" : "#34d399", boxShadow: isAdmin ? "0 0 6px #818cf8" : "0 0 6px #34d399" }} />
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", color: isAdmin ? "#a5b4fc" : "#6ee7b7" }}>
              {isAdmin ? "Administrator" : "User"}
            </span>
          </div>
        </motion.div>
      )}

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: "auto", padding: collapsed ? "12px 8px" : "12px 12px" }}>
        {navGroups.map((group, gi) => (
          <div key={gi} style={{ marginBottom: 8 }}>
            {!collapsed && (
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: "rgba(255,255,255,0.25)", textTransform: "uppercase", padding: "8px 8px 4px" }}>
                {group.group}
              </div>
            )}
            {group.items.map((item, ii) => {
              const isActive = activeHref === item.href
              return (
                <motion.a key={ii} href={item.href} whileHover={{ x: collapsed ? 0 : 2 }}
                  onClick={() => { setActiveHref(item.href); onNavigate?.() }}
                  title={collapsed ? item.label : undefined}
                  style={{ display: "flex", alignItems: "center", gap: collapsed ? 0 : 10, justifyContent: collapsed ? "center" : "flex-start", padding: collapsed ? "10px" : "9px 10px", borderRadius: 10, marginBottom: 2, textDecoration: "none", position: "relative", background: isActive ? "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.15))" : "transparent", border: isActive ? "1px solid rgba(99,102,241,0.3)" : "1px solid transparent", transition: "all 0.2s ease" }}
                  onMouseEnter={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.07)" } }}
                  onMouseLeave={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.borderColor = "transparent" } }}
                >
                  {isActive && !collapsed && <div style={{ position: "absolute", left: 0, top: "20%", bottom: "20%", width: 3, borderRadius: 2, background: "linear-gradient(180deg,#6366f1,#8b5cf6)" }} />}
                  <item.icon size={17} color={isActive ? "#818cf8" : "rgba(255,255,255,0.45)"} style={{ flexShrink: 0 }} />
                  {!collapsed && (
                    <>
                      <span style={{ flex: 1, fontSize: 13, fontWeight: isActive ? 600 : 400, color: isActive ? "#e0e7ff" : "rgba(255,255,255,0.6)", whiteSpace: "nowrap" }}>{item.label}</span>
                      {item.badge && <span style={{ fontSize: 10, fontWeight: 700, background: isActive ? "#6366f1" : "rgba(255,255,255,0.08)", color: isActive ? "white" : "rgba(255,255,255,0.5)", padding: "2px 7px", borderRadius: 20, flexShrink: 0 }}>{item.badge}</span>}
                    </>
                  )}
                  {collapsed && item.badge && <div style={{ position: "absolute", top: 6, right: 6, width: 6, height: 6, borderRadius: "50%", background: "#6366f1", boxShadow: "0 0 6px #6366f1" }} />}
                </motion.a>
              )
            })}
          </div>
        ))}
      </nav>

      {/* ── User profile section at bottom ── */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: collapsed ? "12px 8px" : "12px" }}>

        {/* Collapsed: just the avatar button */}
        {collapsed ? (
          <motion.button whileTap={{ scale: 0.95 }}
            onClick={() => setShowProfileCard(v => !v)}
            title={displayName}
            style={{ width: "100%", display: "flex", justifyContent: "center", background: "transparent", border: "none", cursor: "pointer", padding: "6px 0" }}>
            <div style={{ position: "relative" }}>
              <SidebarAvatar src={avatarSrc} initials={initials} size={36} />
              {/* Online dot */}
              <span style={{ position: "absolute", bottom: 1, right: 1, width: 8, height: 8, borderRadius: "50%", background: "#34d399", border: "2px solid #080814", boxShadow: "0 0 5px #34d399" }} />
            </div>
          </motion.button>
        ) : (
          /* Expanded: full profile card row */
          <motion.button
            whileHover={{ background: "rgba(255,255,255,0.04)" }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowProfileCard(v => !v)}
            style={{
              width: "100%", display: "flex", alignItems: "center", gap: 10,
              padding: "10px", borderRadius: 12,
              background: showProfileCard ? "rgba(99,102,241,0.1)" : "rgba(255,255,255,0.03)",
              border: showProfileCard ? "1px solid rgba(99,102,241,0.25)" : "1px solid rgba(255,255,255,0.07)",
              cursor: "pointer", transition: "all 0.2s", marginBottom: 8,
            }}>
            {/* Avatar */}
            <div style={{ position: "relative", flexShrink: 0 }}>
              <SidebarAvatar src={avatarSrc} initials={initials} size={36} />
              {/* Online dot */}
              <span style={{ position: "absolute", bottom: 0, right: 0, width: 9, height: 9, borderRadius: "50%", background: "#34d399", border: "2px solid #080814", boxShadow: "0 0 6px #34d399" }} />
            </div>

            {/* Name + role */}
            <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#ffffff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {displayName}
              </div>
              <div style={{ fontSize: 11, color: isAdmin ? "#818cf8" : "#34d399", marginTop: 1, fontWeight: 500 }}>
                {isAdmin ? "Administrator" : "Member"}
              </div>
            </div>

            {/* Chevron indicator */}
            <ChevronRight size={13} color="rgba(255,255,255,0.3)"
              style={{ flexShrink: 0, transform: showProfileCard ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
          </motion.button>
        )}

        {/* Logout button — always visible */}
        <motion.button whileTap={{ scale: 0.97 }} onClick={logout}
          style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "flex-start", gap: 8, padding: collapsed ? "10px" : "9px 10px", borderRadius: 10, background: "transparent", border: "1px solid transparent", color: "rgba(255,255,255,0.35)", cursor: "pointer", fontSize: 13, transition: "all 0.2s ease", fontFamily: "'DM Sans',sans-serif" }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.1)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(239,68,68,0.2)"; (e.currentTarget as HTMLElement).style.color = "#f87171" }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.borderColor = "transparent"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.35)" }}>
          <LogOut size={16} style={{ flexShrink: 0 }} />
          {!collapsed && <span style={{ fontWeight: 500 }}>Logout</span>}
        </motion.button>
      </div>

    </div>
  )

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
        .syne { font-family: 'Syne', sans-serif; }
        nav::-webkit-scrollbar { width: 2px; }
        nav::-webkit-scrollbar-track { background: transparent; }
        nav::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.3); border-radius: 2px; }
      `}</style>

      {/* Mobile hamburger */}
      {isMobile && (
        <button onClick={() => setMobileOpen(true)}
          style={{ position: "fixed", top: 16, left: 16, zIndex: 60, width: 40, height: 40, borderRadius: 10, background: "rgba(6,6,15,0.9)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "white" }}>
          <Menu size={18} />
        </button>
      )}

      {/* Profile popover */}
      <ProfileCard />

      {/* Mobile drawer */}
      <AnimatePresence>
        {isMobile && mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              style={{ position: "fixed", inset: 0, zIndex: 70, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }} />
            <motion.div
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              style={{ position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 80, width: 260, background: "rgba(8,8,20,0.98)", backdropFilter: "blur(32px)", borderRight: "1px solid rgba(255,255,255,0.07)", fontFamily: "'DM Sans', sans-serif", color: "white" }}>
              <button onClick={() => setMobileOpen(false)}
                style={{ position: "absolute", top: 14, right: 14, zIndex: 1, width: 30, height: 30, borderRadius: 8, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "rgba(255,255,255,0.6)" }}>
                <X size={14} />
              </button>
              <SidebarContent onNavigate={() => setMobileOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      {!isMobile && (
        <motion.aside
          animate={{ width: collapsed ? 64 : 240 }}
          transition={{ type: "spring", damping: 28, stiffness: 260 }}
          style={{ position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 40, background: "rgba(8,8,20,0.97)", backdropFilter: "blur(32px)", borderRight: "1px solid rgba(255,255,255,0.07)", fontFamily: "'DM Sans', sans-serif", color: "white", overflow: "hidden" }}>
          <SidebarContent />
        </motion.aside>
      )}
    </>
  )
}


export function SidebarLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const [isMobile,  setIsMobile]  = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#06060f", color: "white" }}>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <main style={{ flex: 1, marginLeft: isMobile ? 0 : (collapsed ? 64 : 240), transition: "margin-left 0.3s ease", padding: isMobile ? "72px 16px 24px" : "32px", minHeight: "100vh" }}>
        {children}
      </main>
    </div>
  )
}