import React, { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ShieldCheck, Clock, CheckCircle, XCircle, RefreshCw,
  ChevronRight, X, User, FileText, Calendar, MessageSquare,
  AlertTriangle, Package, Zap, Hash, Layers, Sparkles,
  Flag, TrendingUp, Tag, Check, Ban, Eye, Search,
  Inbox,
} from "lucide-react"
import { adminGetClaims, adminUpdateClaim } from "@/api/claimApi"
import type { ClaimRequest, ClaimStatus } from "@/types/reportTypes"

// ─────────────────────────────────────────────────────────────────────────────
//  HOOKS
// ─────────────────────────────────────────────────────────────────────────────
function useIsMobile(bp = 768) {
  const [v, setV] = React.useState(() =>
    typeof window !== "undefined" ? window.innerWidth < bp : false
  )
  React.useEffect(() => {
    const h = () => setV(window.innerWidth < bp)
    window.addEventListener("resize", h)
    return () => window.removeEventListener("resize", h)
  }, [bp])
  return v
}

// ─────────────────────────────────────────────────────────────────────────────
//  CONFIG
// ─────────────────────────────────────────────────────────────────────────────
const STATUS_CFG: Record<ClaimStatus, { label: string; color: string; bg: string; border: string; icon: React.ElementType }> = {
  pending:  { label: "Pending",  color: "#fbbf24", bg: "rgba(251,191,36,0.1)",  border: "rgba(251,191,36,0.25)",  icon: Clock        },
  approved: { label: "Approved", color: "#34d399", bg: "rgba(52,211,153,0.1)",  border: "rgba(52,211,153,0.25)",  icon: CheckCircle  },
  rejected: { label: "Rejected", color: "#f87171", bg: "rgba(248,113,113,0.1)", border: "rgba(248,113,113,0.25)", icon: XCircle      },
}

const FILTER_TABS: { value: "all" | ClaimStatus; label: string; color?: string }[] = [
  { value: "all",      label: "All Claims" },
  { value: "pending",  label: "Pending",   color: "#fbbf24" },
  { value: "approved", label: "Approved",  color: "#34d399" },
  { value: "rejected", label: "Rejected",  color: "#f87171" },
]

// ─────────────────────────────────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────────────────────────────────
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}
function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
}
function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1)  return "just now"
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

function Avatar({ name, size = 36 }: { name: string; size?: number }) {
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
  const hue = [...name].reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: `hsl(${hue},45%,22%)`,
      border: `1px solid hsl(${hue},40%,30%)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.36, fontWeight: 700, color: `hsl(${hue},60%,70%)`,
      fontFamily: "'Syne',sans-serif",
    }}>{initials}</div>
  )
}

function StatusPill({ status }: { status: ClaimStatus }) {
  const cfg = STATUS_CFG[status]
  const Icon = cfg.icon
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "3px 9px", borderRadius: 20,
      background: cfg.bg, border: `1px solid ${cfg.border}`,
      fontSize: 10, fontWeight: 700, color: cfg.color, letterSpacing: 0.4,
    }}>
      <Icon size={9} />{cfg.label}
    </span>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  CLAIM CARD
// ─────────────────────────────────────────────────────────────────────────────
function ClaimCard({
  claim, selected, onClick,
}: { claim: ClaimRequest; selected: boolean; onClick: () => void }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      whileHover={{ x: 2 }}
      onClick={onClick}
      style={{
        padding: "14px 16px",
        borderRadius: 14,
        border: selected
          ? "1px solid rgba(99,102,241,0.45)"
          : "1px solid rgba(255,255,255,0.07)",
        background: selected
          ? "rgba(99,102,241,0.08)"
          : "rgba(255,255,255,0.025)",
        cursor: "pointer",
        transition: "border-color 0.2s, background 0.2s",
        position: "relative",
      }}
    >
      {/* Selected indicator */}
      {selected && (
        <motion.div layoutId="claim-sel"
          style={{
            position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)",
            width: 3, height: "60%", borderRadius: "0 2px 2px 0",
            background: "linear-gradient(180deg,#6366f1,#8b5cf6)",
          }} />
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Avatar name={claim.claimant_info.name} size={38} />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3, flexWrap: "wrap" }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#e5e7eb", fontFamily: "'Syne',sans-serif" }}>
              {claim.claimant_info.name}
            </span>
            <StatusPill status={claim.status} />
          </div>
          <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {claim.report_summary.item_name}
          </div>
          <div style={{ fontSize: 10, color: "#374151" }}>
            {fmtDate(claim.date_submitted)} · {timeAgo(claim.date_submitted)}
          </div>
        </div>

        <ChevronRight size={14} color={selected ? "#818cf8" : "#374151"} style={{ flexShrink: 0 }} />
      </div>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  DETAIL PANEL
// ─────────────────────────────────────────────────────────────────────────────
function DetailPanel({
  claim, onClose, onDecision,
}: {
  claim: ClaimRequest
  onClose: () => void
  onDecision: (id: number, status: "approved" | "rejected", response: string) => Promise<void>
}) {
  const [response,    setResponse]    = useState(claim.admin_response ?? "")
  const [confirming,  setConfirming]  = useState<"approve" | "reject" | null>(null)
  const [loading,     setLoading]     = useState(false)
  const [localError,  setLocalError]  = useState("")

  // Reset when claim changes
  useEffect(() => {
    setResponse(claim.admin_response ?? "")
    setConfirming(null)
    setLocalError("")
  }, [claim.id])

  async function decide(action: "approved" | "rejected") {
    setLoading(true)
    setLocalError("")
    try {
      await onDecision(claim.id, action, response)
      setConfirming(null)
    } catch (e: any) {
      setLocalError(e.message ?? "Action failed.")
    } finally {
      setLoading(false)
    }
  }

  const isPending = claim.status === "pending"

  return (
    <motion.div
      key={claim.id}
      initial={{ opacity: 0, x: 18 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 18 }}
      transition={{ duration: 0.22 }}
      style={{
        display: "flex", flexDirection: "column", height: "100%",
        background: "#0e0e1a",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 20, overflow: "hidden",
      }}
    >
      {/* Header */}
      <div style={{
        padding: "18px 20px 16px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        background: "linear-gradient(135deg,rgba(99,102,241,0.07),rgba(139,92,246,0.04))",
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Avatar name={claim.claimant_info.name} size={42} />
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#fff", fontFamily: "'Syne',sans-serif", letterSpacing: "-0.3px" }}>
              {claim.claimant_info.name}
            </div>
            <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>
              @{claim.claimant_info.username} · {claim.claimant_info.email}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <StatusPill status={claim.status} />
          <motion.button whileHover={{ rotate: 90 }} whileTap={{ scale: 0.9 }}
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#4b5563", padding: 4 }}>
            <X size={15} />
          </motion.button>
        </div>
      </div>

      {/* Scrollable body */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Report info */}
          <Section label="Report" icon={Package}>
            <InfoRow label="Item">{claim.report_summary.item_name}</InfoRow>
            <InfoRow label="Type">
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 3,
                padding: "2px 7px", borderRadius: 10, fontSize: 10, fontWeight: 700,
                background: claim.report_summary.report_type === "found" ? "rgba(16,185,129,0.1)" : "rgba(99,102,241,0.1)",
                border: claim.report_summary.report_type === "found" ? "1px solid rgba(16,185,129,0.2)" : "1px solid rgba(99,102,241,0.2)",
                color: claim.report_summary.report_type === "found" ? "#34d399" : "#818cf8",
              }}>
                {claim.report_summary.report_type === "found" ? "FOUND" : "LOST"}
              </span>
            </InfoRow>
            <InfoRow label="Report ID">#{claim.report}</InfoRow>
            <motion.a
              href={`/admin/reports/${claim.report}`}
              whileHover={{ x: 2 }}
              style={{
                display: "inline-flex", alignItems: "center", gap: 5, marginTop: 8,
                fontSize: 12, fontWeight: 600, color: "#818cf8", textDecoration: "none",
              }}
            >
              <Eye size={11} />View full report
            </motion.a>
          </Section>

          {/* Claimant info */}
          <Section label="Claimant" icon={User}>
            <InfoRow label="Name">{claim.claimant_info.name}</InfoRow>
            <InfoRow label="Username">@{claim.claimant_info.username}</InfoRow>
            <InfoRow label="Email">{claim.claimant_info.email}</InfoRow>
            <InfoRow label="Submitted">{fmtDate(claim.date_submitted)} at {fmtTime(claim.date_submitted)}</InfoRow>
          </Section>

          {/* Proof of ownership */}
          <Section label="Proof of Ownership" icon={FileText}>
            <div style={{
              padding: "14px", borderRadius: 12,
              background: "rgba(99,102,241,0.05)",
              border: "1px solid rgba(99,102,241,0.15)",
              fontSize: 13, color: "#c4c9e2", lineHeight: 1.75,
              whiteSpace: "pre-wrap", wordBreak: "break-word",
            }}>
              {claim.proof_description}
            </div>
          </Section>

          {/* Admin response (if already decided) */}
          {!isPending && claim.admin_response && (
            <Section label="Admin Response" icon={MessageSquare}>
              <div style={{
                padding: "14px", borderRadius: 12,
                background: claim.status === "approved" ? "rgba(52,211,153,0.05)" : "rgba(239,68,68,0.05)",
                border: `1px solid ${claim.status === "approved" ? "rgba(52,211,153,0.2)" : "rgba(239,68,68,0.2)"}`,
                fontSize: 13, color: "#c4c9e2", lineHeight: 1.75,
              }}>
                {claim.admin_response}
              </div>
            </Section>
          )}

          {/* Admin response textarea + actions (pending only) */}
          {isPending && (
            <Section label="Admin Response" icon={MessageSquare}>
              <textarea
                value={response}
                onChange={e => setResponse(e.target.value)}
                disabled={loading}
                placeholder="Optional note to the claimant explaining your decision…"
                maxLength={500}
                style={{
                  width: "100%", boxSizing: "border-box",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 10, padding: "12px 14px",
                  fontSize: 13, color: "white",
                  fontFamily: "'DM Sans',sans-serif",
                  outline: "none", resize: "vertical", minHeight: 80,
                  lineHeight: 1.65, transition: "border-color 0.2s",
                }}
              />
              <div style={{ fontSize: 10, color: "#374151", textAlign: "right", marginTop: 4 }}>
                {response.length}/500
              </div>
            </Section>
          )}

          {/* Error */}
          <AnimatePresence>
            {localError && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                <div style={{ display: "flex", gap: 8, padding: "10px 13px", borderRadius: 10, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.22)" }}>
                  <AlertTriangle size={13} color="#f87171" style={{ flexShrink: 0, marginTop: 1 }} />
                  <span style={{ fontSize: 12, color: "#f87171" }}>{localError}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>

      {/* Footer actions */}
      {isPending && (
        <div style={{
          padding: "16px 20px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          background: "rgba(255,255,255,0.01)",
        }}>
          <AnimatePresence mode="wait">
            {confirming ? (
              <motion.div key="confirm"
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
                style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ fontSize: 12, color: "#9ca3af", textAlign: "center" }}>
                  {confirming === "approve"
                    ? "Approve this claim? The report will be marked as claimed."
                    : "Reject this claim? The claimant will be notified."}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <motion.button whileTap={{ scale: 0.97 }} onClick={() => setConfirming(null)}
                    style={{ flex: 1, padding: "9px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.5)", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => decide(confirming === "approve" ? "approved" : "rejected")}
                    disabled={loading}
                    style={{
                      flex: 2, padding: "9px", borderRadius: 10, border: "none",
                      background: confirming === "approve"
                        ? (loading ? "rgba(255,255,255,0.06)" : "linear-gradient(135deg,#10b981,#059669)")
                        : (loading ? "rgba(255,255,255,0.06)" : "linear-gradient(135deg,#ef4444,#dc2626)"),
                      fontSize: 12, fontWeight: 700,
                      color: loading ? "rgba(255,255,255,0.3)" : "#fff",
                      cursor: loading ? "not-allowed" : "pointer",
                      fontFamily: "'DM Sans',sans-serif",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    }}>
                    {loading
                      ? <><span style={{ display: "inline-block", width: 12, height: 12, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", animation: "ac-spin 0.7s linear infinite" }} />Processing…</>
                      : confirming === "approve"
                        ? <><Check size={13} />Confirm Approve</>
                        : <><Ban size={13} />Confirm Reject</>
                    }
                  </motion.button>
                </div>
              </motion.div>
            ) : (
              <motion.div key="actions"
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
                style={{ display: "flex", gap: 10 }}>
                <motion.button
                  whileHover={{ y: -1, boxShadow: "0 4px 16px rgba(239,68,68,0.25)" }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setConfirming("reject")}
                  style={{
                    flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                    padding: "11px", borderRadius: 11,
                    border: "1px solid rgba(239,68,68,0.3)",
                    background: "rgba(239,68,68,0.08)",
                    fontSize: 13, fontWeight: 700, color: "#f87171",
                    cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
                  }}>
                  <XCircle size={14} />Reject
                </motion.button>
                <motion.button
                  whileHover={{ y: -1, boxShadow: "0 4px 16px rgba(52,211,153,0.25)" }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setConfirming("approve")}
                  style={{
                    flex: 2, display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                    padding: "11px", borderRadius: 11, border: "none",
                    background: "linear-gradient(135deg,#10b981,#059669)",
                    fontSize: 13, fontWeight: 700, color: "#fff",
                    cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
                    boxShadow: "0 4px 12px rgba(16,185,129,0.2)",
                  }}>
                  <CheckCircle size={14} />Approve Claim
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  )
}

// tiny helpers used inside DetailPanel
function Section({ label, icon: Icon, children }: { label: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, overflow: "hidden" }}>
      <div style={{ padding: "10px 14px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", gap: 7, background: "rgba(255,255,255,0.01)" }}>
        <Icon size={11} color="#4b5563" />
        <span style={{ fontSize: 10, fontWeight: 700, color: "#4b5563", textTransform: "uppercase", letterSpacing: 1.2 }}>{label}</span>
      </div>
      <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
        {children}
      </div>
    </div>
  )
}
function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
      <span style={{ fontSize: 11, color: "#4b5563", minWidth: 80, flexShrink: 0, paddingTop: 1 }}>{label}</span>
      <span style={{ fontSize: 12, color: "#c4c9e2", wordBreak: "break-word" }}>{children}</span>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  MOBILE DRAWER WRAPPER
// ─────────────────────────────────────────────────────────────────────────────
function MobileDrawer({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div key="bg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }} />
          <motion.div key="drawer"
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            style={{
              position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 201,
              maxHeight: "90vh", overflowY: "auto",
              borderRadius: "20px 20px 0 0",
              background: "#0e0e1a",
            }}>
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  STAT CARD
// ─────────────────────────────────────────────────────────────────────────────
function StatCard({ label, value, color, icon: Icon }: { label: string; value: number; color: string; icon: React.ElementType }) {
  return (
    <div style={{
      padding: "14px 16px", borderRadius: 14,
      background: "rgba(255,255,255,0.02)",
      border: "1px solid rgba(255,255,255,0.07)",
      display: "flex", alignItems: "center", gap: 12,
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
        background: `${color}18`,
        border: `1px solid ${color}30`,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Icon size={15} color={color} />
      </div>
      <div>
        <div style={{ fontSize: 20, fontWeight: 800, color: "#fff", fontFamily: "'Syne',sans-serif", lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 11, color: "#4b5563", marginTop: 3 }}>{label}</div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function AdminClaims() {
  const isMobile = useIsMobile(768)

  const [claims,    setClaims]    = useState<ClaimRequest[]>([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState("")
  const [filter,    setFilter]    = useState<"all" | ClaimStatus>("pending")
  const [search,    setSearch]    = useState("")
  const [selected,  setSelected]  = useState<ClaimRequest | null>(null)

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const statusParam = filter === "all" ? undefined : filter
      const res = await adminGetClaims(statusParam)
      setClaims(res.results)
    } catch (e: any) {
      setError(e.message ?? "Failed to load claims.")
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => { load() }, [load])

  // ── Decision handler ───────────────────────────────────────────────────────
  async function handleDecision(id: number, status: "approved" | "rejected", response: string) {
    const result = await adminUpdateClaim(id, { status, admin_response: response })
    // Update in place
    setClaims(prev => prev.map(c => c.id === id ? result.claim : c))
    setSelected(result.claim)
  }

  // ── Filtered list ──────────────────────────────────────────────────────────
  const visible = claims.filter(c => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      c.claimant_info.name.toLowerCase().includes(q) ||
      c.claimant_info.username.toLowerCase().includes(q) ||
      c.report_summary.item_name.toLowerCase().includes(q)
    )
  })

  // Stats
  const stats = {
    pending:  claims.filter(c => c.status === "pending").length,
    approved: claims.filter(c => c.status === "approved").length,
    rejected: claims.filter(c => c.status === "rejected").length,
  }

  // ──────────────────────────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: "100vh", background: "#06060f", color: "white",
      fontFamily: "'DM Sans',sans-serif",
      padding: isMobile ? "0 0 40px" : "0 0 48px",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes ac-spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 2px; }
      `}</style>

      <div style={{ width: "100%" }}>

        {/* ── Page header ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 12, flexShrink: 0,
              background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 16px rgba(99,102,241,0.3)",
            }}>
              <ShieldCheck size={18} color="white" />
            </div>
            <div>
              <h1 style={{ fontSize: isMobile ? 18 : 22, fontWeight: 800, letterSpacing: "-0.5px", color: "#fff", margin: 0, fontFamily: "'Syne',sans-serif" }}>
                Claim Requests
              </h1>
              <p style={{ fontSize: 12, color: "#4b5563", margin: 0 }}>Review and verify ownership claims</p>
            </div>
          </div>
          <motion.button
            whileHover={{ rotate: 180 }} whileTap={{ scale: 0.95 }}
            onClick={load}
            style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 16px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.5)", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
            <RefreshCw size={13} />Refresh
          </motion.button>
        </div>

        {/* ── Stat cards ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 22 }}>
          <StatCard label="Pending"  value={stats.pending}  color="#fbbf24" icon={Clock}       />
          <StatCard label="Approved" value={stats.approved} color="#34d399" icon={CheckCircle} />
          <StatCard label="Rejected" value={stats.rejected} color="#f87171" icon={XCircle}     />
        </div>

        {/* ── Filter tabs + search ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 18 }}>
          {/* Tabs */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {FILTER_TABS.map(tab => {
              const active = filter === tab.value
              return (
                <motion.button key={tab.value} whileTap={{ scale: 0.96 }}
                  onClick={() => { setFilter(tab.value); setSelected(null) }}
                  style={{
                    padding: "6px 14px", borderRadius: 20, cursor: "pointer",
                    border: active
                      ? `1px solid ${tab.color ? tab.color + "50" : "rgba(99,102,241,0.5)"}`
                      : "1px solid rgba(255,255,255,0.08)",
                    background: active
                      ? tab.color ? `${tab.color}18` : "rgba(99,102,241,0.12)"
                      : "rgba(255,255,255,0.03)",
                    fontSize: 12, fontWeight: 600,
                    color: active ? (tab.color ?? "#a5b4fc") : "rgba(255,255,255,0.4)",
                    fontFamily: "'DM Sans',sans-serif", transition: "all 0.18s",
                  }}>
                  {tab.label}
                </motion.button>
              )
            })}
          </div>
          {/* Search */}
          <div style={{ position: "relative", maxWidth: 320 }}>
            <Search size={13} color="#374151" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search claimant or item…"
              style={{
                width: "100%", boxSizing: "border-box",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 10, padding: "9px 14px 9px 34px",
                fontSize: 12, color: "white",
                fontFamily: "'DM Sans',sans-serif", outline: "none",
              }}
            />
          </div>
        </div>

        {/* ── Main layout: list + detail ── */}
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 0", gap: 12, color: "#374151" }}>
            <div style={{ width: 18, height: 18, border: "2px solid rgba(255,255,255,0.08)", borderTopColor: "#6366f1", borderRadius: "50%", animation: "ac-spin 0.7s linear infinite" }} />
            <span style={{ fontSize: 13 }}>Loading claims…</span>
          </div>
        ) : error ? (
          <div style={{ padding: "36px 0", textAlign: "center" }}>
            <AlertTriangle size={22} color="#f87171" style={{ margin: "0 auto 10px" }} />
            <div style={{ fontSize: 13, color: "#f87171", marginBottom: 14 }}>{error}</div>
            <motion.button whileTap={{ scale: 0.97 }} onClick={load}
              style={{ padding: "9px 20px", borderRadius: 10, border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.08)", fontSize: 12, fontWeight: 600, color: "#f87171", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
              Try Again
            </motion.button>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : selected ? "1fr 1.6fr" : "1fr",
            gap: 16, alignItems: "start",
          }}>
            {/* List */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {visible.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  style={{ textAlign: "center", padding: "48px 24px" }}>
                  <Inbox size={32} color="#1f2937" style={{ margin: "0 auto 14px" }} />
                  <div style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.2)", marginBottom: 6 }}>No claims found</div>
                  <div style={{ fontSize: 12, color: "#374151" }}>
                    {search ? "Try a different search term" : `No ${filter === "all" ? "" : filter} claims yet`}
                  </div>
                </motion.div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {visible.map(c => (
                    <ClaimCard
                      key={c.id}
                      claim={c}
                      selected={selected?.id === c.id}
                      onClick={() => {
                        if (isMobile) {
                          setSelected(c)
                        } else {
                          setSelected(prev => prev?.id === c.id ? null : c)
                        }
                      }}
                    />
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Detail — desktop side panel */}
            {!isMobile && selected && (
              <div style={{ position: "sticky", top: 20, maxHeight: "calc(100vh - 80px)" }}>
                <AnimatePresence mode="wait">
                  <DetailPanel
                    key={selected.id}
                    claim={selected}
                    onClose={() => setSelected(null)}
                    onDecision={handleDecision}
                  />
                </AnimatePresence>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Detail — mobile bottom drawer */}
      {isMobile && (
        <MobileDrawer open={!!selected} onClose={() => setSelected(null)}>
          {selected && (
            <DetailPanel
              key={selected.id}
              claim={selected}
              onClose={() => setSelected(null)}
              onDecision={handleDecision}
            />
          )}
        </MobileDrawer>
      )}
    </div>
  )
}