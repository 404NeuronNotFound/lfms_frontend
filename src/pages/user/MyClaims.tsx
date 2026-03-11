import React, { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ClipboardCheck, Clock, CheckCircle2, XCircle, AlertTriangle,
  ChevronRight, X, Tag, Zap, Package, Hash, Layers, FileText,
  Flag, TrendingUp, Sparkles, RefreshCw, MessageSquare,
  Calendar, ShieldCheck, Inbox, Info, ChevronDown, Download,
} from "lucide-react"
import { useClaimStore } from "@/store/claimStore"
import type { ClaimRequest, ClaimStatus, ReportCategory } from "@/types/reportTypes"

// ─────────────────────────────────────────────────────────────────────────────
//  HOOKS
// ─────────────────────────────────────────────────────────────────────────────
function useIsMobile(bp = 640) {
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
const CLAIM_STATUS_CFG: Record<"all" | ClaimStatus, {
  label: string; color: string; bg: string; border: string; icon: React.ElementType
}> = {
  all:      { label: "All Claims",  color: "#a5b4fc", bg: "rgba(165,180,252,0.08)", border: "rgba(165,180,252,0.2)", icon: ClipboardCheck },
  pending:  { label: "Pending",     color: "#fbbf24", bg: "rgba(251,191,36,0.08)",  border: "rgba(251,191,36,0.2)",  icon: Clock          },
  approved: { label: "Approved",    color: "#34d399", bg: "rgba(52,211,153,0.08)",  border: "rgba(52,211,153,0.2)",  icon: CheckCircle2   },
  rejected: { label: "Rejected",    color: "#f87171", bg: "rgba(248,113,113,0.08)", border: "rgba(248,113,113,0.2)", icon: XCircle        },
}

const CATEGORY_ICONS: Record<ReportCategory, React.ElementType> = {
  "Electronics":    Zap,
  "Wallets & Bags": Package,
  "Keys":           Hash,
  "Clothing":       Layers,
  "Jewelry":        Sparkles,
  "Documents":      FileText,
  "Pets":           Flag,
  "Sports":         TrendingUp,
  "Other":          Tag,
}

const FILTER_TABS: { value: "all" | ClaimStatus }[] = [
  { value: "all"      },
  { value: "pending"  },
  { value: "approved" },
  { value: "rejected" },
]

// ─────────────────────────────────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────────────────────────────────
function timeAgo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (diff < 1)    return "just now"
  if (diff < 60)   return `${diff}m ago`
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`
  const d = Math.floor(diff / 1440)
  return d === 1 ? "yesterday" : `${d}d ago`
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  })
}

// ─────────────────────────────────────────────────────────────────────────────
//  STATUS PILL
// ─────────────────────────────────────────────────────────────────────────────
function StatusPill({ status }: { status: ClaimStatus }) {
  const cfg = CLAIM_STATUS_CFG[status]
  const Icon = cfg.icon
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "4px 10px", borderRadius: 20,
      background: cfg.bg, border: `1px solid ${cfg.border}`,
      fontSize: 11, fontWeight: 700, color: cfg.color,
      letterSpacing: 0.3, whiteSpace: "nowrap",
    }}>
      <Icon size={10} />
      {cfg.label}
    </span>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  SKELETON ROW
// ─────────────────────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div style={{
      borderRadius: 16, border: "1px solid rgba(255,255,255,0.06)",
      background: "rgba(255,255,255,0.02)", padding: "18px 20px",
      display: "flex", flexDirection: "column", gap: 12,
    }}>
      {[80, 55, 40].map((w, i) => (
        <div key={i} style={{
          height: i === 0 ? 14 : 11, width: `${w}%`, borderRadius: 6,
          background: "rgba(255,255,255,0.06)",
          animation: "mc-pulse 1.6s ease-in-out infinite",
          animationDelay: `${i * 0.15}s`,
        }} />
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  CLAIM DETAIL DRAWER
// ─────────────────────────────────────────────────────────────────────────────
function ClaimDrawer({
  claim, onClose, isMobile,
}: {
  claim: ClaimRequest | null
  onClose: () => void
  isMobile: boolean
}) {
  const isOpen = claim !== null

  const drawerStyle: React.CSSProperties = isMobile
    ? {
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100,
        background: "#0c0c18", borderTop: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "20px 20px 0 0", maxHeight: "90vh", overflowY: "auto",
        boxShadow: "0 -20px 60px rgba(0,0,0,0.6)",
      }
    : {
        position: "fixed", top: 0, right: 0, bottom: 0, width: 420, zIndex: 100,
        background: "#0c0c18", borderLeft: "1px solid rgba(255,255,255,0.07)",
        overflowY: "auto", boxShadow: "-20px 0 60px rgba(0,0,0,0.5)",
      }

  return (
    <AnimatePresence>
      {isOpen && claim && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 99, backdropFilter: "blur(4px)" }}
          />

          {/* Drawer */}
          <motion.div
            key="drawer"
            initial={isMobile ? { y: "100%" } : { x: "100%" }}
            animate={isMobile ? { y: 0 } : { x: 0 }}
            exit={isMobile ? { y: "100%" } : { x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
            style={drawerStyle}
          >
            {/* Header */}
            <div style={{
              position: "sticky", top: 0, zIndex: 10,
              background: "rgba(12,12,24,0.95)", backdropFilter: "blur(12px)",
              borderBottom: "1px solid rgba(255,255,255,0.07)",
              padding: "16px 20px", display: "flex", alignItems: "center", gap: 12,
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: "linear-gradient(135deg,rgba(99,102,241,0.2),rgba(139,92,246,0.1))",
                border: "1px solid rgba(99,102,241,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <ClipboardCheck size={16} color="#818cf8" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0", fontFamily: "'Syne',sans-serif" }}>
                  Claim #{claim.id}
                </div>
                <div style={{ fontSize: 11, color: "#4b5563" }}>{fmtDate(claim.date_submitted)}</div>
              </div>
              <motion.button whileTap={{ scale: 0.9 }} onClick={onClose} style={{
                width: 32, height: 32, borderRadius: 9, border: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(255,255,255,0.04)", display: "flex", alignItems: "center",
                justifyContent: "center", cursor: "pointer",
              }}>
                <X size={14} color="#6b7280" />
              </motion.button>
            </div>

            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Status banner */}
              {(() => {
                const cfg = CLAIM_STATUS_CFG[claim.status]
                const Icon = cfg.icon
                return (
                  <div style={{
                    padding: "14px 16px", borderRadius: 14,
                    background: `linear-gradient(135deg,${cfg.bg},transparent)`,
                    border: `1px solid ${cfg.border}`,
                    display: "flex", alignItems: "center", gap: 12,
                  }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: 10,
                      background: cfg.bg, border: `1px solid ${cfg.border}`,
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>
                      <Icon size={18} color={cfg.color} />
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: cfg.color }}>{cfg.label}</div>
                      <div style={{ fontSize: 11, color: "#4b5563", marginTop: 2 }}>
                        {claim.status === "pending"  && "Your claim is being reviewed by our team."}
                        {claim.status === "approved" && "Your claim has been approved. We'll be in touch."}
                        {claim.status === "rejected" && "Your claim was not approved this time."}
                      </div>
                    </div>
                  </div>
                )
              })()}

              {/* Item info */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: 1.2 }}>
                  Item
                </div>
                <div style={{
                  padding: "14px 16px", borderRadius: 13,
                  background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)",
                  display: "flex", alignItems: "center", gap: 12,
                }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 10,
                    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>
                    <Tag size={14} color="#4b5563" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0", fontFamily: "'Syne',sans-serif" }}>
                      {claim.report_summary.item_name}
                    </div>
                    <div style={{ fontSize: 11, color: "#4b5563", marginTop: 3 }}>
                      Report #{claim.report}
                      <span style={{
                        marginLeft: 8, padding: "1px 7px", borderRadius: 5,
                        background: claim.report_summary.report_type === "found"
                          ? "rgba(16,185,129,0.1)" : "rgba(99,102,241,0.1)",
                        border: claim.report_summary.report_type === "found"
                          ? "1px solid rgba(16,185,129,0.2)" : "1px solid rgba(99,102,241,0.2)",
                        color: claim.report_summary.report_type === "found" ? "#34d399" : "#818cf8",
                        fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.4,
                      }}>
                        {claim.report_summary.report_type}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Proof description */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: 1.2 }}>
                  Your Proof
                </div>
                <div style={{
                  padding: "14px 16px", borderRadius: 13,
                  background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)",
                }}>
                  <div style={{ display: "flex", gap: 10 }}>
                    <MessageSquare size={14} color="#4b5563" style={{ flexShrink: 0, marginTop: 2 }} />
                    <p style={{ fontSize: 13, color: "#9ca3af", lineHeight: 1.65, margin: 0 }}>
                      {claim.proof_description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Admin response — only show if present */}
              {claim.admin_response && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: 1.2 }}>
                    Admin Response
                  </div>
                  <div style={{
                    padding: "14px 16px", borderRadius: 13,
                    background: claim.status === "approved"
                      ? "rgba(52,211,153,0.05)" : "rgba(248,113,113,0.05)",
                    border: claim.status === "approved"
                      ? "1px solid rgba(52,211,153,0.2)" : "1px solid rgba(248,113,113,0.2)",
                  }}>
                    <div style={{ display: "flex", gap: 10 }}>
                      <ShieldCheck size={14}
                        color={claim.status === "approved" ? "#34d399" : "#f87171"}
                        style={{ flexShrink: 0, marginTop: 2 }}
                      />
                      <p style={{ fontSize: 13, color: "#9ca3af", lineHeight: 1.65, margin: 0 }}>
                        {claim.admin_response}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div style={{
                padding: "12px 16px", borderRadius: 12,
                background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
                display: "flex", flexDirection: "column", gap: 8,
              }}>
                {[
                  { icon: Calendar, label: "Submitted", value: fmtDate(claim.date_submitted) },
                  { icon: Clock,    label: "Last updated", value: timeAgo(claim.date_updated) },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Icon size={12} color="#374151" style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: 11, color: "#4b5563", flex: 1 }}>{label}</span>
                    <span style={{ fontSize: 11, color: "#6b7280", fontWeight: 600 }}>{value}</span>
                  </div>
                ))}
              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  CLAIM CARD (mobile + desktop)
// ─────────────────────────────────────────────────────────────────────────────
function ClaimCard({ claim, onClick, index }: {
  claim: ClaimRequest; onClick: () => void; index: number
}) {
  const cfg = CLAIM_STATUS_CFG[claim.status]

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      onClick={onClick}
      whileHover={{ y: -2, boxShadow: `0 8px 32px rgba(0,0,0,0.35), 0 0 0 1px ${cfg.border}` }}
      style={{
        borderRadius: 16, border: "1px solid rgba(255,255,255,0.07)",
        background: "rgba(255,255,255,0.02)", padding: "16px 18px",
        cursor: "pointer", transition: "all 0.2s",
        display: "flex", flexDirection: "column", gap: 12,
      }}
    >
      {/* Top row */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
          {/* Status indicator stripe */}
          <div style={{
            width: 3, height: 36, borderRadius: 3,
            background: `linear-gradient(to bottom, ${cfg.color}, ${cfg.color}44)`,
            flexShrink: 0,
          }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 14, fontWeight: 700, color: "#e2e8f0",
              fontFamily: "'Syne',sans-serif",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {claim.report_summary.item_name}
            </div>
            <div style={{ fontSize: 11, color: "#4b5563", marginTop: 3 }}>
              Claim #{claim.id} · {timeAgo(claim.date_submitted)}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <StatusPill status={claim.status} />
          <ChevronRight size={14} color="#374151" />
        </div>
      </div>

      {/* Proof snippet */}
      <div style={{
        padding: "10px 12px", borderRadius: 10,
        background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
      }}>
        <p style={{
          fontSize: 12, color: "#4b5563", margin: 0, lineHeight: 1.55,
          overflow: "hidden", display: "-webkit-box",
          WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
        }}>
          <MessageSquare size={10} color="#374151" style={{ marginRight: 6, verticalAlign: "middle" }} />
          {claim.proof_description}
        </p>
      </div>

      {/* Admin response badge — only if present */}
      {claim.admin_response && (
        <div style={{
          display: "flex", alignItems: "center", gap: 7,
          padding: "7px 12px", borderRadius: 9,
          background: claim.status === "approved"
            ? "rgba(52,211,153,0.06)" : "rgba(248,113,113,0.06)",
          border: claim.status === "approved"
            ? "1px solid rgba(52,211,153,0.18)" : "1px solid rgba(248,113,113,0.18)",
        }}>
          <ShieldCheck size={11}
            color={claim.status === "approved" ? "#34d399" : "#f87171"}
            style={{ flexShrink: 0 }}
          />
          <span style={{
            fontSize: 11, lineHeight: 1.4,
            color: claim.status === "approved" ? "#34d399" : "#f87171",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {claim.admin_response}
          </span>
        </div>
      )}
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  STATS MINI CARDS
// ─────────────────────────────────────────────────────────────────────────────
function StatBar({ claims }: { claims: ClaimRequest[] }) {
  const counts = {
    total:    claims.length,
    pending:  claims.filter(c => c.status === "pending").length,
    approved: claims.filter(c => c.status === "approved").length,
    rejected: claims.filter(c => c.status === "rejected").length,
  }

  const items = [
    { label: "Total",    value: counts.total,    color: "#a5b4fc" },
    { label: "Pending",  value: counts.pending,  color: "#fbbf24" },
    { label: "Approved", value: counts.approved, color: "#34d399" },
    { label: "Rejected", value: counts.rejected, color: "#f87171" },
  ]

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
      {items.map(({ label, value, color }, i) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06 }}
          style={{
            padding: "14px 16px", borderRadius: 14,
            border: `1px solid ${color}22`,
            background: `${color}0a`,
            textAlign: "center",
          }}
        >
          <div style={{
            fontSize: 28, fontWeight: 800, color,
            fontFamily: "'Syne',sans-serif", lineHeight: 1,
          }}>
            {value}
          </div>
          <div style={{ fontSize: 10, color: "#374151", marginTop: 5, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8 }}>
            {label}
          </div>
        </motion.div>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function MyClaims() {
  const isMobile = useIsMobile(640)
  const { claims, total, loading, error, filter, openId, fetchClaims, setFilter, setOpenId, clearError } = useClaimStore()

  useEffect(() => { fetchClaims() }, [])

  const openClaim = claims.find(c => c.id === openId) ?? null

  // Filtered list
  const filtered = filter === "all" ? claims : claims.filter(c => c.status === filter)

  return (
    <>
      {/* ── Global styles ── */}
      <style>{`
        @keyframes mc-pulse {
          0%, 100% { opacity: 0.4 }
          50%       { opacity: 0.8 }
        }
        .mc-tab:hover { background: rgba(255,255,255,0.05) !important; }
      `}</style>

      <div style={{
        minHeight: "100vh",
        background: "#06060f",
        padding: isMobile ? "20px 16px 40px" : "32px 32px 48px",
        fontFamily: "'DM Sans', sans-serif",
      }}>

        {/* ── Page header ── */}
        <div style={{ marginBottom: 28, display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12,
                background: "linear-gradient(135deg,rgba(99,102,241,0.25),rgba(139,92,246,0.12))",
                border: "1px solid rgba(99,102,241,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <ClipboardCheck size={18} color="#818cf8" />
              </div>
              <h1 style={{
                fontSize: isMobile ? 22 : 26, fontWeight: 800,
                fontFamily: "'Syne',sans-serif", color: "#e2e8f0",
                margin: 0, letterSpacing: "-0.5px",
              }}>
                My Claims
              </h1>
            </div>
            <p style={{ fontSize: 13, color: "#4b5563", margin: 0 }}>
              Track the status of all your submitted claims
            </p>
          </div>

        {/* Buttons */}
          <div style={{ display: "flex", gap: 8 }}>
            {!isMobile && (
              <motion.button
                whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
                onClick={() => {
                  if (!claims.length) return
                  const rows = [
                    ["Claim ID", "Item", "Report ID", "Status", "Proof Description", "Admin Response", "Submitted", "Updated"],
                    ...claims.map(c => [
                      c.id,
                      c.report_summary.item_name,
                      c.report,
                      c.status,
                      `"${c.proof_description.replace(/"/g, '""')}"`,
                      `"${(c.admin_response ?? "").replace(/"/g, '""')}"`,
                      fmtDate(c.date_submitted),
                      fmtDate(c.date_updated),
                    ])
                  ]
                  const csv = rows.map(r => r.join(",")).join("\n")
                  const blob = new Blob([csv], { type: "text/csv" })
                  const url  = URL.createObjectURL(blob)
                  const a    = document.createElement("a")
                  a.href     = url
                  a.download = `my-claims-${new Date().toISOString().slice(0,10)}.csv`
                  a.click()
                  URL.revokeObjectURL(url)
                }}
                style={{
                  display: "flex", alignItems: "center", gap: 7,
                  padding: "9px 16px", borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "rgba(255,255,255,0.04)",
                  fontSize: 13, fontWeight: 500,
                  color: "rgba(255,255,255,0.55)",
                  cursor: claims.length ? "pointer" : "not-allowed",
                  fontFamily: "'DM Sans',sans-serif",
                  opacity: claims.length ? 1 : 0.4,
                }}
              >
                <Download size={13} />Export
              </motion.button>
            )}
            <motion.button
              whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
              onClick={fetchClaims}
              disabled={loading}
              style={{
                display: "flex", alignItems: "center", gap: 7,
                padding: "9px 16px", borderRadius: 10, border: "none",
                background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                fontSize: 13, fontWeight: 600,
                color: loading ? "rgba(255,255,255,0.4)" : "#fff",
                cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "'DM Sans',sans-serif",
                boxShadow: "0 4px 16px rgba(99,102,241,0.3)",
                opacity: loading ? 0.7 : 1,
              }}
            >
              <motion.div
                animate={loading ? { rotate: 360 } : {}}
                transition={{ duration: 1, repeat: loading ? Infinity : 0, ease: "linear" }}
                style={{ display: "flex" }}
              >
                <RefreshCw size={13} />
              </motion.div>
              {!isMobile && "Refresh"}
            </motion.button>
          </div>
        </div>

        {/* ── Error ── */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{
                marginBottom: 20, padding: "12px 16px", borderRadius: 12,
                background: "rgba(248,113,113,0.07)", border: "1px solid rgba(248,113,113,0.2)",
                display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
              }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <AlertTriangle size={14} color="#f87171" />
                <span style={{ fontSize: 13, color: "#f87171" }}>{error}</span>
              </div>
              <button onClick={clearError} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                <X size={14} color="#f87171" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Stats bar (only when loaded and has claims) ── */}
        {!loading && claims.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginBottom: 24 }}>
            <StatBar claims={claims} />
          </motion.div>
        )}

        {/* ── Filter tabs ── */}
        {!loading && claims.length > 0 && (
          <div style={{
            display: "flex", gap: 6, marginBottom: 20,
            padding: "4px", borderRadius: 12,
            background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
            width: "fit-content",
          }}>
            {FILTER_TABS.map(({ value }) => {
              const cfg = CLAIM_STATUS_CFG[value]
              const Icon = cfg.icon
              const active = filter === value
              const count = value === "all" ? claims.length : claims.filter(c => c.status === value).length
              return (
                <motion.button
                  key={value}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setFilter(value)}
                  className="mc-tab"
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "7px 14px", borderRadius: 9, border: "none",
                    background: active ? cfg.bg : "transparent",
                    boxShadow: active ? `inset 0 0 0 1px ${cfg.border}` : "none",
                    cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
                    fontSize: 12, fontWeight: active ? 700 : 500,
                    color: active ? cfg.color : "#4b5563",
                    transition: "all 0.18s",
                  }}
                >
                  <Icon size={11} />
                  {cfg.label}
                  {count > 0 && (
                    <span style={{
                      padding: "1px 6px", borderRadius: 20,
                      background: active ? `${cfg.color}22` : "rgba(255,255,255,0.06)",
                      fontSize: 10, fontWeight: 700,
                      color: active ? cfg.color : "#374151",
                    }}>
                      {count}
                    </span>
                  )}
                </motion.button>
              )
            })}
          </div>
        )}

        {/* ── Content ── */}
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : claims.length === 0 ? (
          /* Empty state */
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            style={{
              textAlign: "center", padding: "64px 24px",
              borderRadius: 20, border: "1px solid rgba(255,255,255,0.06)",
              background: "rgba(255,255,255,0.01)",
            }}
          >
            <div style={{
              width: 64, height: 64, borderRadius: 18, margin: "0 auto 20px",
              background: "rgba(99,102,241,0.07)", border: "1px solid rgba(99,102,241,0.15)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Inbox size={26} color="#374151" />
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#374151", fontFamily: "'Syne',sans-serif", marginBottom: 8 }}>
              No claims yet
            </div>
            <div style={{ fontSize: 13, color: "#1f2937", maxWidth: 300, margin: "0 auto", lineHeight: 1.6 }}>
              Once you submit a claim on a matched item, it will appear here so you can track its progress.
            </div>
          </motion.div>
        ) : filtered.length === 0 ? (
          /* Filter empty state */
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{
              textAlign: "center", padding: "48px 24px",
              borderRadius: 16, border: "1px solid rgba(255,255,255,0.06)",
              background: "rgba(255,255,255,0.01)",
            }}
          >
            <Info size={22} color="#374151" style={{ marginBottom: 12 }} />
            <div style={{ fontSize: 14, color: "#374151", fontFamily: "'Syne',sans-serif" }}>
              No {CLAIM_STATUS_CFG[filter].label.toLowerCase()} claims
            </div>
          </motion.div>
        ) : (
          /* Claims list */
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ display: "flex", flexDirection: "column", gap: 10 }}
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((claim, i) => (
                <ClaimCard
                  key={claim.id}
                  claim={claim}
                  index={i}
                  onClick={() => setOpenId(claim.id)}
                />
              ))}
            </AnimatePresence>

            {total > claims.length && (
              <div style={{ textAlign: "center", fontSize: 12, color: "#374151", marginTop: 8 }}>
                Showing {claims.length} of {total} claims
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* ── Detail drawer ── */}
      <ClaimDrawer
        claim={openClaim}
        onClose={() => setOpenId(null)}
        isMobile={isMobile}
      />
    </>
  )
}