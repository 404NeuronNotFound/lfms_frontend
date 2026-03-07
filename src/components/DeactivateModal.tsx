import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  X, ShieldOff, AlertTriangle, EyeOff, Clock,
  Bell, MessageSquare, CheckCircle, LogOut,
} from "lucide-react"
import { useSettingsStore } from "@/store/settingsStore"

interface DeactivateModalProps {
  open:    boolean
  onClose: () => void
}

const CONSEQUENCES = [
  { icon: EyeOff,        text: "Your profile will be hidden from all users"           },
  { icon: Bell,          text: "All notifications will be paused"                     },
  { icon: MessageSquare, text: "You won't receive new messages or match alerts"       },
  { icon: Clock,         text: "Your reports remain saved and resume when you return" },
]

function useIsMobile(bp = 520) {
  const [v, setV] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < bp : false
  )
  useEffect(() => {
    const h = () => setV(window.innerWidth < bp)
    window.addEventListener("resize", h)
    return () => window.removeEventListener("resize", h)
  }, [bp])
  return v
}

export default function DeactivateModal({ open, onClose }: DeactivateModalProps) {
  const { deactivate, togglingStatus, statusError, clearMessages } = useSettingsStore()
  const isMobile = useIsMobile()

  const [step,      setStep]      = useState<"confirm" | "done">("confirm")
  const [confirmed, setConfirmed] = useState(false)

  function handleClose() {
    if (togglingStatus) return
    setStep("confirm")
    setConfirmed(false)
    clearMessages()
    onClose()
  }

  async function handleDeactivate() {
    try {
      await deactivate({ logoutAfter: false })
      setStep("done")
      setTimeout(() => {
        localStorage.removeItem("access")
        localStorage.removeItem("refresh")
        localStorage.removeItem("role")
        localStorage.removeItem("user")
        window.location.href = "/login"
      }, 2800)
    } catch {
      // error in store.statusError
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* ── Backdrop ── */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={handleClose}
            style={{
              position: "fixed", inset: 0, zIndex: 1000,
              background: "rgba(0,0,0,0.75)",
              backdropFilter: "blur(10px)",
            }}
          />

          {/* ── Panel — bottom sheet on mobile, centered modal on desktop ── */}
          <motion.div
            key="panel"
            initial={isMobile ? { y: "100%" } : { opacity: 0, scale: 0.93, y: 20 }}
            animate={isMobile ? { y: 0 }       : { opacity: 1, scale: 1,    y: 0  }}
            exit={  isMobile ? { y: "100%" }   : { opacity: 0, scale: 0.95, y: 12 }}
            transition={{ type: "spring", damping: 28, stiffness: 240 }}
            style={isMobile ? {
              // bottom sheet
              position: "fixed", left: 0, right: 0, bottom: 0,
              zIndex: 1001,
            } : {
              // centered modal
              position: "fixed", inset: 0, zIndex: 1001,
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: 20, pointerEvents: "none",
            }}
          >
            <div
              onClick={e => e.stopPropagation()}
              style={{
                pointerEvents: "auto",
                width: "100%",
                ...(isMobile ? {
                  borderRadius: "20px 20px 0 0",
                  maxHeight: "92dvh",
                  overflowY: "auto",
                } : {
                  maxWidth: 460,
                  borderRadius: 22,
                  maxHeight: "90vh",
                  overflowY: "auto",
                }),
                background: "linear-gradient(160deg,#0d0d1f 0%,#0a0a1a 100%)",
                border: "1px solid rgba(255,255,255,0.09)",
                boxShadow: "0 32px 80px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(255,255,255,0.04)",
                fontFamily: "'DM Sans',sans-serif",
                color: "white",
              }}
            >
              {/* Drag handle — mobile only */}
              {isMobile && step === "confirm" && (
                <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 2px" }}>
                  <div style={{ width: 36, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.18)" }} />
                </div>
              )}

              {/* ══════════════ CONFIRM STEP ══════════════ */}
              {step === "confirm" && (
                <>
                  {/* Header band */}
                  <div style={{
                    position: "relative",
                    padding: isMobile ? "18px 18px 14px" : "28px 28px 22px",
                    background: "linear-gradient(135deg,rgba(245,158,11,0.09) 0%,rgba(239,68,68,0.07) 100%)",
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                    overflow: "hidden",
                  }}>
                    <div style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, borderRadius: "50%", background: "radial-gradient(circle,rgba(245,158,11,0.14) 0%,transparent 65%)", pointerEvents: "none" }} />

                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 10 : 14 }}>
                        {/* Icon */}
                        <div style={{
                          width: isMobile ? 40 : 48, height: isMobile ? 40 : 48,
                          borderRadius: isMobile ? 12 : 14, flexShrink: 0,
                          background: "rgba(245,158,11,0.13)",
                          border: "1px solid rgba(245,158,11,0.28)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          boxShadow: "0 0 20px rgba(245,158,11,0.12)",
                        }}>
                          <ShieldOff size={isMobile ? 18 : 22} color="#fbbf24" />
                        </div>
                        <div>
                          <div style={{
                            fontSize: isMobile ? 16 : 18, fontWeight: 800,
                            letterSpacing: "-0.4px", fontFamily: "'Syne',sans-serif",
                            color: "#ffffff", marginBottom: 2,
                          }}>
                            Deactivate Account
                          </div>
                          <div style={{ fontSize: 12, color: "#9ca3af" }}>
                            Your account will be temporarily paused
                          </div>
                        </div>
                      </div>

                      {/* Close button */}
                      <motion.button
                        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.94 }}
                        onClick={handleClose}
                        style={{
                          width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                          background: "rgba(255,255,255,0.06)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          cursor: "pointer",
                        }}>
                        <X size={13} color="rgba(255,255,255,0.5)" />
                      </motion.button>
                    </div>
                  </div>

                  {/* Body */}
                  <div style={{ padding: isMobile ? "16px 18px 28px" : "22px 28px 28px" }}>

                    {/* Consequences list */}
                    <div style={{ marginBottom: isMobile ? 14 : 20 }}>
                      <div style={{
                        fontSize: 10, fontWeight: 700, color: "#4b5563",
                        textTransform: "uppercase", letterSpacing: 1.5,
                        marginBottom: isMobile ? 8 : 12,
                      }}>
                        What happens when you deactivate
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 6 : 8 }}>
                        {CONSEQUENCES.map((c, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 + 0.1 }}
                            style={{
                              display: "flex", alignItems: "center", gap: isMobile ? 10 : 12,
                              padding: isMobile ? "8px 12px" : "10px 14px",
                              borderRadius: 11,
                              background: "rgba(255,255,255,0.025)",
                              border: "1px solid rgba(255,255,255,0.06)",
                            }}
                          >
                            <div style={{
                              width: isMobile ? 28 : 30, height: isMobile ? 28 : 30,
                              borderRadius: 8, flexShrink: 0,
                              background: "rgba(245,158,11,0.1)",
                              border: "1px solid rgba(245,158,11,0.2)",
                              display: "flex", alignItems: "center", justifyContent: "center",
                            }}>
                              <c.icon size={isMobile ? 11 : 13} color="#fbbf24" />
                            </div>
                            <span style={{ fontSize: isMobile ? 12 : 13, color: "#c4c9e2", lineHeight: 1.4 }}>
                              {c.text}
                            </span>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Re-activation note */}
                    <div style={{
                      display: "flex", alignItems: "flex-start", gap: 10,
                      padding: isMobile ? "10px 12px" : "12px 14px",
                      borderRadius: 12,
                      marginBottom: isMobile ? 14 : 22,
                      background: "rgba(99,102,241,0.07)",
                      border: "1px solid rgba(99,102,241,0.2)",
                    }}>
                      <LogOut size={13} color="#818cf8" style={{ flexShrink: 0, marginTop: 1 }} />
                      <p style={{ fontSize: 12, color: "#a5b4fc", lineHeight: 1.6, margin: 0 }}>
                        <strong style={{ fontWeight: 600 }}>To reactivate</strong>, simply log back in —
                        your account will be restored automatically.
                      </p>
                    </div>

                    {/* Checkbox */}
                    <label style={{
                      display: "flex", alignItems: "flex-start", gap: 12,
                      cursor: "pointer",
                      marginBottom: isMobile ? 14 : 22,
                      padding: isMobile ? "10px 12px" : "12px 14px",
                      borderRadius: 12,
                      background: confirmed ? "rgba(245,158,11,0.06)" : "rgba(255,255,255,0.02)",
                      border: `1px solid ${confirmed ? "rgba(245,158,11,0.25)" : "rgba(255,255,255,0.07)"}`,
                      transition: "all 0.2s",
                    }}>
                      <div
                        onClick={() => setConfirmed(v => !v)}
                        style={{
                          width: 18, height: 18, borderRadius: 5,
                          flexShrink: 0, marginTop: 1,
                          border: `2px solid ${confirmed ? "#fbbf24" : "rgba(255,255,255,0.25)"}`,
                          background: confirmed ? "rgba(245,158,11,0.2)" : "transparent",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          transition: "all 0.18s",
                        }}
                      >
                        {confirmed && (
                          <motion.svg initial={{ scale: 0 }} animate={{ scale: 1 }} width="10" height="10" viewBox="0 0 12 12" fill="none">
                            <path d="M2 6l3 3 5-5" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </motion.svg>
                        )}
                      </div>
                      <span style={{ fontSize: isMobile ? 12 : 13, color: "#9ca3af", lineHeight: 1.55, userSelect: "none" }}>
                        I understand my account will be deactivated and I'll be logged out immediately
                      </span>
                    </label>

                    {/* Error */}
                    <AnimatePresence>
                      {statusError && (
                        <motion.div
                          initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                          style={{
                            display: "flex", alignItems: "center", gap: 8,
                            padding: "10px 12px", borderRadius: 10, marginBottom: 12,
                            background: "rgba(239,68,68,0.09)",
                            border: "1px solid rgba(239,68,68,0.25)",
                            fontSize: 12, color: "#f87171",
                          }}>
                          <AlertTriangle size={12} style={{ flexShrink: 0 }} />
                          {statusError}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Actions — stacked on mobile, side-by-side on desktop */}
                    <div style={{
                      display: "flex",
                      flexDirection: isMobile ? "column-reverse" : "row",
                      gap: 10,
                    }}>
                      <motion.button
                        whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
                        onClick={handleClose}
                        style={{
                          flex: 1, padding: isMobile ? "14px 0" : "11px 0",
                          borderRadius: 12,
                          border: "1px solid rgba(255,255,255,0.1)",
                          background: "rgba(255,255,255,0.04)",
                          fontSize: 14, fontWeight: 500,
                          color: "rgba(255,255,255,0.55)",
                          cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
                          transition: "all 0.2s",
                        }}>
                        Cancel
                      </motion.button>

                      <motion.button
                        whileHover={confirmed && !togglingStatus ? { y: -1, boxShadow: "0 8px 24px rgba(245,158,11,0.25)" } : {}}
                        whileTap={confirmed && !togglingStatus ? { scale: 0.97 } : {}}
                        onClick={handleDeactivate}
                        disabled={!confirmed || togglingStatus}
                        style={{
                          flex: 1, padding: isMobile ? "14px 0" : "11px 0",
                          borderRadius: 12, border: "none",
                          background: confirmed
                            ? "linear-gradient(135deg,#f59e0b,#d97706)"
                            : "rgba(255,255,255,0.06)",
                          fontSize: 14, fontWeight: 700,
                          color: confirmed ? "#ffffff" : "rgba(255,255,255,0.2)",
                          cursor: !confirmed || togglingStatus ? "not-allowed" : "pointer",
                          fontFamily: "'DM Sans',sans-serif",
                          opacity: togglingStatus ? 0.7 : 1,
                          transition: "all 0.25s",
                          display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                        }}>
                        {togglingStatus ? (
                          <>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"
                              style={{ animation: "deact-spin 0.8s linear infinite" }}>
                              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                            </svg>
                            Deactivating…
                          </>
                        ) : (
                          <><ShieldOff size={14} />Deactivate Account</>
                        )}
                      </motion.button>
                    </div>
                  </div>
                </>
              )}

              {/* ══════════════ DONE STEP ══════════════ */}
              {step === "done" && (
                <div style={{
                  padding: isMobile ? "44px 24px 52px" : "48px 32px",
                  textAlign: "center",
                }}>
                  <div style={{ display: "flex", justifyContent: "center", marginBottom: 22 }}>
                    <div style={{ position: "relative" }}>
                      <motion.div
                        initial={{ scale: 0.6, opacity: 0 }}
                        animate={{ scale: 1,   opacity: 1 }}
                        transition={{ type: "spring", damping: 14, stiffness: 180 }}
                        style={{
                          width: 68, height: 68, borderRadius: "50%",
                          background: "rgba(52,211,153,0.12)",
                          border: "1px solid rgba(52,211,153,0.3)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}
                      >
                        <CheckCircle size={30} color="#34d399" />
                      </motion.div>
                      <motion.div
                        initial={{ scale: 1, opacity: 0.4 }}
                        animate={{ scale: 1.9, opacity: 0 }}
                        transition={{ duration: 1.1, repeat: Infinity, ease: "easeOut" }}
                        style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "1px solid rgba(52,211,153,0.4)" }}
                      />
                    </div>
                  </div>

                  <div style={{
                    fontSize: isMobile ? 18 : 20, fontWeight: 800,
                    letterSpacing: "-0.4px", fontFamily: "'Syne',sans-serif",
                    color: "#ffffff", marginBottom: 8,
                  }}>
                    Account Deactivated
                  </div>
                  <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.7, maxWidth: 300, margin: "0 auto 20px" }}>
                    Your account has been paused. You'll be logged out in a moment.
                    Log back in anytime to reactivate.
                  </p>

                  <div style={{ height: 3, borderRadius: 2, background: "rgba(255,255,255,0.07)", overflow: "hidden", margin: "0 auto", maxWidth: 180 }}>
                    <motion.div
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 2.8, ease: "linear" }}
                      style={{ height: "100%", borderRadius: 2, background: "linear-gradient(90deg,#34d399,#6ee7b7)" }}
                    />
                  </div>
                  <div style={{ fontSize: 11, color: "#4b5563", marginTop: 8 }}>Redirecting to login…</div>
                </div>
              )}

              <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
                @keyframes deact-spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
              `}</style>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}