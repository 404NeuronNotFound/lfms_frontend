import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Link2, X, Search, MapPin, Calendar, Tag, Package,
  Zap, Hash, Layers, FileText, Flag, TrendingUp, Sparkles,
  CheckCircle, AlertTriangle, RefreshCw, ArrowRight,
} from "lucide-react"
import { adminGetReportsByType, adminManualMatch } from "@/api/adminReportApi"
import type { AdminReportListItem } from "@/types/reportTypes"

// ─────────────────────────────────────────────────────────────────────────────
//  CONFIG
// ─────────────────────────────────────────────────────────────────────────────
const CAT_ICONS: Record<string, React.ElementType> = {
  "Electronics":    Zap,
  "Wallets & Bags": Package,
  "Keys":           Hash,
  "Clothing":       Layers,
  "Documents":      FileText,
  "Jewelry":        Sparkles,
  "Pets":           Flag,
  "Sports":         TrendingUp,
  "Other":          Tag,
}

function timeAgo(iso: string) {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (m < 60)   return `${m}m ago`
  if (m < 1440) return `${Math.floor(m / 60)}h ago`
  return `${Math.floor(m / 1440)}d ago`
}

// ─────────────────────────────────────────────────────────────────────────────
//  REPORT PICKER — searchable list of lost or found reports
// ─────────────────────────────────────────────────────────────────────────────
interface PickerProps {
  type:     "lost" | "found"
  selected: AdminReportListItem | null
  onSelect: (r: AdminReportListItem) => void
}

function ReportPicker({ type, selected, onSelect }: PickerProps) {
  const [reports, setReports] = useState<AdminReportListItem[]>([])
  const [loading, setLoading] = useState(false)
  const [search,  setSearch]  = useState("")
  const [searched, setSearched] = useState(false)

  const color  = type === "lost" ? "#818cf8" : "#34d399"
  const border = type === "lost" ? "rgba(99,102,241,0.3)" : "rgba(16,185,129,0.3)"
  const bg     = type === "lost" ? "rgba(99,102,241,0.08)" : "rgba(16,185,129,0.08)"
  const label  = type === "lost" ? "Lost Report" : "Found Report"

  // Only fetch when user types something
  useEffect(() => {
    if (!search.trim()) {
      setReports([])
      setSearched(false)
      return
    }
    const t = setTimeout(() => {
      setLoading(true)
      setSearched(true)
      adminGetReportsByType(type, "open", search.trim())
        .then(r => setReports(r.results))
        .catch(() => setReports([]))
        .finally(() => setLoading(false))
    }, 350)
    return () => clearTimeout(t)
  }, [type, search])

  return (
    <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 10 }}>
      {/* Label */}
      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
        <span style={{ fontSize: 11, fontWeight: 700, color, textTransform: "uppercase", letterSpacing: 1.2 }}>
          {label}
        </span>
      </div>

      {/* Selected preview */}
      {selected && (
        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
          style={{ padding: "10px 12px", borderRadius: 10, background: bg, border: `1px solid ${border}`, position: "relative" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#fff", marginBottom: 3 }}>{selected.item_name}</div>
          <div style={{ fontSize: 10, color: "#6b7280" }}>{selected.category} · {selected.location}</div>
          <div style={{ fontSize: 9, color, marginTop: 3 }}>#{selected.id} · {timeAgo(selected.date_reported)}</div>
          <button onClick={() => { onSelect(null as any); setSearch("") }}
            style={{ position: "absolute", top: 8, right: 8, background: "none", border: "none", cursor: "pointer", padding: 2 }}>
            <X size={11} color="#4b5563" />
          </button>
        </motion.div>
      )}

      {/* Search */}
      <div style={{ position: "relative" }}>
        <Search size={11} color="#4b5563" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={`Type to search ${type} reports…`}
          style={{ width: "100%", boxSizing: "border-box", background: "#0c0c18", border: `1px solid ${search ? border : "rgba(255,255,255,0.08)"}`, borderRadius: 8, padding: "7px 10px 7px 28px", fontSize: 12, color: "#fff", outline: "none", fontFamily: "'DM Sans',sans-serif", transition: "border-color 0.2s" }}
        />
        {search && (
          <button onClick={() => setSearch("")}
            style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 2 }}>
            <X size={10} color="#4b5563" />
          </button>
        )}
      </div>

      {/* List — only visible after user has typed */}
      <div style={{ minHeight: 48 }}>
        {!search.trim() ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "16px 0", gap: 8 }}>
            <Search size={12} color="#1f2937" />
            <span style={{ fontSize: 11, color: "#1f2937" }}>Search to find {type} reports</span>
          </div>
        ) : loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "16px 0", gap: 8 }}>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
              <RefreshCw size={13} color="#4b5563" />
            </motion.div>
            <span style={{ fontSize: 12, color: "#374151" }}>Searching…</span>
          </div>
        ) : searched && reports.length === 0 ? (
          <div style={{ textAlign: "center", padding: "16px 0", fontSize: 12, color: "#374151" }}>
            No {type} reports found
          </div>
        ) : (
          <div style={{ maxHeight: 200, overflowY: "auto", display: "flex", flexDirection: "column", gap: 5 }}>
            <AnimatePresence>
              {reports.map((r, idx) => {
                const CatIcon = CAT_ICONS[r.category] ?? Tag
                const isSelected = selected?.id === r.id
                return (
                  <motion.button key={r.id}
                    initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onSelect(r)}
                    style={{
                      display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 12px", borderRadius: 9, width: "100%", textAlign: "left", cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
                      background: isSelected ? bg : "rgba(255,255,255,0.02)",
                      border: `1px solid ${isSelected ? border : "rgba(255,255,255,0.06)"}`,
                      transition: "all 0.15s",
                    }}>
                    <CatIcon size={13} color={isSelected ? color : "#4b5563"} style={{ marginTop: 2, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: isSelected ? "#fff" : "#c4c9e2", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 2 }}>
                        {r.item_name}
                      </div>
                      <div style={{ fontSize: 10, color: "#4b5563", display: "flex", gap: 6, flexWrap: "wrap" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                          <MapPin size={8} />{r.location}
                        </span>
                        <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                          <Calendar size={8} />{timeAgo(r.date_reported)}
                        </span>
                      </div>
                    </div>
                    {isSelected && <CheckCircle size={13} color={color} style={{ flexShrink: 0, marginTop: 2 }} />}
                  </motion.button>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  PROPS
// ─────────────────────────────────────────────────────────────────────────────
interface Props {
  /** If provided, pre-selects this report and locks its side */
  preselectedReport?: AdminReportListItem | null
  onClose:    () => void
  onMatched:  () => void  // called after successful match to trigger list refresh
}

// ─────────────────────────────────────────────────────────────────────────────
//  MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function MatchManager({ preselectedReport, onClose, onMatched }: Props) {
  const [lostReport,  setLostReport]  = useState<AdminReportListItem | null>(
    preselectedReport?.report_type === "lost" ? preselectedReport : null
  )
  const [foundReport, setFoundReport] = useState<AdminReportListItem | null>(
    preselectedReport?.report_type === "found" ? preselectedReport : null
  )
  const [phase,   setPhase]   = useState<"idle" | "matching" | "success" | "error">("idle")
  const [error,   setError]   = useState("")

  const canMatch = !!lostReport && !!foundReport && phase === "idle"

  async function handleMatch() {
    if (!lostReport || !foundReport) return
    setPhase("matching"); setError("")
    try {
      await adminManualMatch(lostReport.id, foundReport.id)
      setPhase("success")
      onMatched()
    } catch (e: any) {
      setError(e.message ?? "Failed to create match.")
      setPhase("error")
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      style={{ position: "fixed", inset: 0, zIndex: 9000, background: "rgba(0,0,0,0.72)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>

      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 16 }}
        transition={{ type: "spring", damping: 24, stiffness: 260 }}
        onClick={e => e.stopPropagation()}
        style={{ width: "100%", maxWidth: 760, background: "#0d0d1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, overflow: "hidden", boxShadow: "0 32px 80px rgba(0,0,0,0.7)", fontFamily: "'DM Sans',sans-serif", color: "white" }}>

        {/* Header */}
        <div style={{ padding: "20px 24px 18px", borderBottom: "1px solid rgba(255,255,255,0.07)", background: "linear-gradient(135deg,rgba(99,102,241,0.08),rgba(139,92,246,0.05))", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Link2 size={18} color="#818cf8" />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#fff", fontFamily: "'Syne',sans-serif", letterSpacing: "-0.3px" }}>Match Reports</div>
              <div style={{ fontSize: 11, color: "#4b5563", marginTop: 1 }}>Manually link a lost item with a found item</div>
            </div>
          </div>
          <motion.button whileHover={{ rotate: 90 }} whileTap={{ scale: 0.9 }} onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "#4b5563" }}>
            <X size={16} />
          </motion.button>
        </div>

        {/* Success state */}
        {phase === "success" ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            style={{ padding: "40px 24px", textAlign: "center" }}>
            <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 12, stiffness: 200 }}
              style={{ width: 64, height: 64, borderRadius: "50%", margin: "0 auto 18px", background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CheckCircle size={28} color="#818cf8" />
            </motion.div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", fontFamily: "'Syne',sans-serif", marginBottom: 8 }}>Match Confirmed!</div>
            <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.7, maxWidth: 360, margin: "0 auto 24px" }}>
              Both reports are now set to <strong style={{ color: "#818cf8" }}>Matched</strong>. The lost item owner has been notified and can now submit a claim.
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
              {/* Show matched pair */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", borderRadius: 12, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 10, color: "#818cf8", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>LOST</div>
                  <div style={{ fontSize: 12, color: "#fff", fontWeight: 600 }}>{lostReport?.item_name}</div>
                </div>
                <Link2 size={16} color="#4b5563" />
                <div>
                  <div style={{ fontSize: 10, color: "#34d399", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>FOUND</div>
                  <div style={{ fontSize: 12, color: "#fff", fontWeight: 600 }}>{foundReport?.item_name}</div>
                </div>
              </div>
            </div>
            <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }} onClick={onClose}
              style={{ marginTop: 24, padding: "10px 28px", borderRadius: 12, border: "1px solid rgba(99,102,241,0.3)", background: "rgba(99,102,241,0.1)", fontSize: 13, fontWeight: 600, color: "#a5b4fc", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
              Done
            </motion.button>
          </motion.div>
        ) : (
          <div style={{ padding: "20px 24px 24px", display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Two pickers side by side */}
            <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
              <ReportPicker type="lost"  selected={lostReport}  onSelect={setLostReport} />

              {/* Arrow divider */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", paddingTop: 28, gap: 4, flexShrink: 0 }}>
                <div style={{ width: 1, height: 32, background: "rgba(255,255,255,0.06)" }} />
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Link2 size={12} color="#818cf8" />
                </div>
                <div style={{ width: 1, height: 32, background: "rgba(255,255,255,0.06)" }} />
              </div>

              <ReportPicker type="found" selected={foundReport} onSelect={setFoundReport} />
            </div>

            {/* Match preview bar */}
            {lostReport && foundReport && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                style={{ padding: "12px 16px", borderRadius: 12, background: "rgba(99,102,241,0.07)", border: "1px solid rgba(99,102,241,0.2)", display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: 11, color: "#818cf8", fontWeight: 700 }}>{lostReport.item_name}</span>
                  <span style={{ fontSize: 11, color: "#4b5563", margin: "0 8px" }}>will be matched with</span>
                  <span style={{ fontSize: 11, color: "#34d399", fontWeight: 700 }}>{foundReport.item_name}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: "#4b5563", flexShrink: 0 }}>
                  <ArrowRight size={10} />both set to Matched
                </div>
              </motion.div>
            )}

            {/* Error */}
            {phase === "error" && error && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 14px", borderRadius: 10, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)" }}>
                <AlertTriangle size={13} color="#f87171" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: "#f87171" }}>{error}</span>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }} onClick={onClose}
                style={{ padding: "10px 18px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.5)", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
                Cancel
              </motion.button>
              <motion.button
                whileHover={canMatch ? { y: -1, boxShadow: "0 6px 20px rgba(99,102,241,0.35)" } : {}}
                whileTap={canMatch ? { scale: 0.97 } : {}}
                onClick={handleMatch}
                disabled={!canMatch}
                style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 22px", borderRadius: 10, border: "none", background: canMatch ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "rgba(255,255,255,0.06)", fontSize: 13, fontWeight: 700, color: canMatch ? "#fff" : "rgba(255,255,255,0.2)", cursor: canMatch ? "pointer" : "not-allowed", fontFamily: "'DM Sans',sans-serif", transition: "all 0.2s" }}>
                {phase === "matching"
                  ? <><motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}><RefreshCw size={13} /></motion.div>Matching…</>
                  : <><Link2 size={13} />Confirm Match</>
                }
              </motion.button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}