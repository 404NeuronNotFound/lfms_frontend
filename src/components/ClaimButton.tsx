import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ShieldCheck, X, AlertTriangle, CheckCircle,
  FileText, Send, Loader, Info,
} from "lucide-react"
import { submitClaim } from "@/api/claimApi"
import type { ClaimRequest } from "@/types/reportTypes"

// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  reportId:   number
  reportName: string
  /** Called after a successful submit so parent can refresh */
  onSuccess?: (claim: ClaimRequest) => void
}

type Phase = "idle" | "open" | "submitting" | "success" | "error"

export default function ClaimButton({ reportId, reportName, onSuccess }: Props) {
  const [phase,  setPhase]  = useState<Phase>("idle")
  const [proof,  setProof]  = useState("")
  const [error,  setError]  = useState("")
  const [proofErr, setProofErr] = useState("")

  function open()  { setPhase("open"); setProof(""); setError(""); setProofErr("") }
  function close() { if (phase !== "submitting") setPhase("idle") }

  async function handleSubmit() {
    if (proof.trim().length < 20) {
      setProofErr("Please provide at least 20 characters describing your proof of ownership.")
      return
    }
    setProofErr("")
    setPhase("submitting")
    try {
      const claim = await submitClaim(reportId, { proof_description: proof.trim() })
      setPhase("success")
      onSuccess?.(claim)
    } catch (e: any) {
      const msg = e.message ?? ""
      setError(
        msg === "SESSION_EXPIRED"
          ? "Your session has expired. Please log in again and retry."
          : msg || "Something went wrong. Please try again."
      )
      setPhase("error")
    }
  }

  return (
    <>
      {/* ── Trigger button ── */}
      <motion.button
        whileHover={{ y: -1, boxShadow: "0 6px 20px rgba(99,102,241,0.35)" }}
        whileTap={{ scale: 0.97 }}
        onClick={open}
        style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "10px 20px", borderRadius: 12, border: "none",
          background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
          fontSize: 13, fontWeight: 700, color: "#fff", cursor: "pointer",
          fontFamily: "'DM Sans',sans-serif",
          boxShadow: "0 4px 14px rgba(99,102,241,0.25)",
        }}
      >
        <ShieldCheck size={15} />
        Claim This Item
      </motion.button>

      {/* ── Modal overlay ── */}
      <AnimatePresence>
        {phase !== "idle" && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            style={{
              position: "fixed", inset: 0, zIndex: 9000,
              background: "rgba(0,0,0,0.72)",
              backdropFilter: "blur(6px)",
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: "16px",
            }}
          >
            <motion.div
              key="panel"
              initial={{ opacity: 0, scale: 0.93, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 16 }}
              transition={{ type: "spring", damping: 22, stiffness: 260 }}
              onClick={e => e.stopPropagation()}
              style={{
                width: "100%", maxWidth: 480,
                background: "#0e0e1a",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 20,
                overflow: "hidden",
                boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
              }}
            >

              {/* ── Header ── */}
              <div style={{
                padding: "20px 22px 18px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                background: "linear-gradient(135deg,rgba(99,102,241,0.08),rgba(139,92,246,0.05))",
                display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                    background: "rgba(99,102,241,0.15)",
                    border: "1px solid rgba(99,102,241,0.3)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <ShieldCheck size={18} color="#818cf8" />
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: "#fff", fontFamily: "'Syne',sans-serif", letterSpacing: "-0.3px" }}>
                      Claim Ownership
                    </div>
                    <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>
                      {reportName}
                    </div>
                  </div>
                </div>
                {phase !== "submitting" && (
                  <motion.button whileHover={{ rotate: 90 }} whileTap={{ scale: 0.9 }}
                    onClick={close}
                    style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "#4b5563", flexShrink: 0 }}>
                    <X size={16} />
                  </motion.button>
                )}
              </div>

              {/* ── Body ── */}
              <div style={{ padding: "22px" }}>

                {/* Success state */}
                {phase === "success" && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    style={{ textAlign: "center", padding: "12px 0 8px" }}>
                    <motion.div
                      initial={{ scale: 0.5 }} animate={{ scale: 1 }}
                      transition={{ type: "spring", damping: 12, stiffness: 200 }}
                      style={{
                        width: 64, height: 64, borderRadius: "50%", margin: "0 auto 18px",
                        background: "rgba(99,102,241,0.1)",
                        border: "1px solid rgba(99,102,241,0.3)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                      <CheckCircle size={28} color="#818cf8" />
                    </motion.div>
                    <div style={{ fontSize: 17, fontWeight: 800, color: "#fff", fontFamily: "'Syne',sans-serif", marginBottom: 8 }}>
                      Claim Submitted!
                    </div>
                    <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.7, maxWidth: 320, margin: "0 auto 22px" }}>
                      Your claim is now pending admin review. You'll receive a notification once a decision is made.
                    </p>
                    <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }} onClick={close}
                      style={{
                        padding: "10px 28px", borderRadius: 12, border: "1px solid rgba(99,102,241,0.3)",
                        background: "rgba(99,102,241,0.1)", fontSize: 13, fontWeight: 600,
                        color: "#a5b4fc", cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
                      }}>
                      Done
                    </motion.button>
                  </motion.div>
                )}

                {/* Form / error state */}
                {(phase === "open" || phase === "submitting" || phase === "error") && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

                    {/* Info callout */}
                    <div style={{
                      display: "flex", gap: 10, padding: "12px 14px", borderRadius: 12,
                      background: "rgba(99,102,241,0.07)",
                      border: "1px solid rgba(99,102,241,0.18)",
                    }}>
                      <Info size={13} color="#818cf8" style={{ flexShrink: 0, marginTop: 1 }} />
                      <p style={{ fontSize: 12, color: "#8b92b8", lineHeight: 1.65, margin: 0 }}>
                        Describe how you can prove this item is yours — serial numbers, receipts, photos, unique markings, or anything only the real owner would know.
                      </p>
                    </div>

                    {/* Proof textarea */}
                    <div>
                      <div style={{
                        fontSize: 11, fontWeight: 700, color: "#4b5563",
                        textTransform: "uppercase", letterSpacing: 1.3, marginBottom: 8,
                        display: "flex", alignItems: "center", gap: 5,
                      }}>
                        <FileText size={10} />
                        Proof of Ownership
                        <span style={{ color: "#f87171" }}>*</span>
                      </div>
                      <div style={{ position: "relative" }}>
                        <textarea
                          value={proof}
                          onChange={e => { setProof(e.target.value); if (proofErr) setProofErr("") }}
                          disabled={phase === "submitting"}
                          placeholder="e.g. The phone has a cracked screen on the bottom-left corner, serial number IM123456, and a sticker of a dog on the back case…"
                          maxLength={1000}
                          style={{
                            width: "100%", boxSizing: "border-box",
                            background: proofErr ? "rgba(239,68,68,0.04)" : "rgba(255,255,255,0.04)",
                            border: `1px solid ${proofErr ? "rgba(239,68,68,0.4)" : "rgba(255,255,255,0.1)"}`,
                            borderRadius: 10, padding: "12px 14px",
                            paddingBottom: 28,
                            fontSize: 13, color: "white",
                            fontFamily: "'DM Sans',sans-serif",
                            outline: "none", resize: "vertical", minHeight: 120,
                            lineHeight: 1.65, transition: "border-color 0.2s",
                          }}
                        />
                        <div style={{
                          position: "absolute", bottom: 8, right: 12,
                          fontSize: 10, color: proof.length > 850 ? "#fbbf24" : "#374151",
                        }}>
                          {proof.length}/1000
                        </div>
                      </div>
                      {proofErr && (
                        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#f87171", marginTop: 6 }}>
                          <AlertTriangle size={11} />{proofErr}
                        </div>
                      )}
                    </div>

                    {/* API error banner */}
                    <AnimatePresence>
                      {phase === "error" && error && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                          style={{ overflow: "hidden" }}>
                          <div style={{
                            display: "flex", gap: 10, padding: "11px 14px", borderRadius: 10,
                            background: "rgba(239,68,68,0.08)",
                            border: "1px solid rgba(239,68,68,0.25)",
                          }}>
                            <AlertTriangle size={14} color="#f87171" style={{ flexShrink: 0, marginTop: 1 }} />
                            <span style={{ fontSize: 12, color: "#f87171", lineHeight: 1.5 }}>{error}</span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Actions */}
                    <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                      <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
                        onClick={close}
                        disabled={phase === "submitting"}
                        style={{
                          padding: "10px 18px", borderRadius: 10,
                          border: "1px solid rgba(255,255,255,0.1)",
                          background: "rgba(255,255,255,0.04)",
                          fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.5)",
                          cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
                        }}>
                        Cancel
                      </motion.button>
                      <motion.button
                        whileHover={phase !== "submitting" ? { y: -1, boxShadow: "0 6px 20px rgba(99,102,241,0.3)" } : {}}
                        whileTap={phase !== "submitting" ? { scale: 0.97 } : {}}
                        onClick={phase === "error" ? handleSubmit : handleSubmit}
                        disabled={phase === "submitting"}
                        style={{
                          display: "flex", alignItems: "center", gap: 7,
                          padding: "10px 22px", borderRadius: 10, border: "none",
                          background: phase === "submitting" ? "rgba(255,255,255,0.08)" : "linear-gradient(135deg,#6366f1,#8b5cf6)",
                          fontSize: 13, fontWeight: 700,
                          color: phase === "submitting" ? "rgba(255,255,255,0.3)" : "#fff",
                          cursor: phase === "submitting" ? "not-allowed" : "pointer",
                          fontFamily: "'DM Sans',sans-serif",
                          transition: "all 0.2s",
                        }}>
                        {phase === "submitting"
                          ? <><Loader size={13} style={{ animation: "cb-spin 0.8s linear infinite" }} />Submitting…</>
                          : <><Send size={13} />{phase === "error" ? "Try Again" : "Submit Claim"}</>
                        }
                      </motion.button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`@keyframes cb-spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </>
  )
}