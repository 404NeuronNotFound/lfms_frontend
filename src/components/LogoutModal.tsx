import { motion, AnimatePresence } from "framer-motion"
import { LogOut, X, ShieldCheck } from "lucide-react"

interface LogoutModalProps {
  open:      boolean
  onClose:   () => void
  onConfirm: () => void
}

export default function LogoutModal({ open, onClose, onConfirm }: LogoutModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{
              position: "fixed", inset: 0, zIndex: 2000,
              background: "rgba(0,0,0,0.72)",
              backdropFilter: "blur(10px)",
            }}
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.92, y: 18 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{   opacity: 0, scale: 0.95,  y: 10 }}
            transition={{ type: "spring", damping: 26, stiffness: 240 }}
            style={{
              position: "fixed", inset: 0, zIndex: 2001,
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: 20, pointerEvents: "none",
            }}
          >
            <div
              onClick={e => e.stopPropagation()}
              style={{
                pointerEvents: "auto",
                width: "100%", maxWidth: 380,
                background: "linear-gradient(160deg,#0d0d1f 0%,#0a0a18 100%)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 22, overflow: "hidden",
                boxShadow: "0 32px 80px rgba(0,0,0,0.65), inset 0 0 0 1px rgba(255,255,255,0.04)",
                fontFamily: "'DM Sans',sans-serif", color: "white",
              }}
            >
              {/* ── Header band ── */}
              <div style={{
                position: "relative", padding: "26px 24px 20px",
                background: "linear-gradient(135deg,rgba(239,68,68,0.08) 0%,rgba(99,102,241,0.06) 100%)",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                overflow: "hidden",
              }}>
                {/* ambient glow */}
                <div style={{
                  position: "absolute", top: -50, right: -50,
                  width: 160, height: 160, borderRadius: "50%",
                  background: "radial-gradient(circle,rgba(239,68,68,0.12) 0%,transparent 65%)",
                  pointerEvents: "none",
                }} />

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    {/* Icon */}
                    <div style={{
                      width: 46, height: 46, borderRadius: 13, flexShrink: 0,
                      background: "rgba(239,68,68,0.12)",
                      border: "1px solid rgba(239,68,68,0.25)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      boxShadow: "0 0 20px rgba(239,68,68,0.1)",
                    }}>
                      <LogOut size={20} color="#f87171" />
                    </div>
                    <div>
                      <div style={{
                        fontSize: 17, fontWeight: 800, letterSpacing: "-0.4px",
                        fontFamily: "'Syne',sans-serif", color: "#ffffff", marginBottom: 2,
                      }}>
                        Sign Out
                      </div>
                      <div style={{ fontSize: 12, color: "#6b7280" }}>
                        You'll need to log in again to continue
                      </div>
                    </div>
                  </div>

                  {/* Close */}
                  <motion.button
                    whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.93 }}
                    onClick={onClose}
                    style={{
                      width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: "pointer",
                    }}>
                    <X size={13} color="rgba(255,255,255,0.45)" />
                  </motion.button>
                </div>
              </div>

              {/* ── Body ── */}
              <div style={{ padding: "20px 24px 24px" }}>

                {/* Info row */}
                <div style={{
                  display: "flex", alignItems: "flex-start", gap: 10,
                  padding: "12px 14px", borderRadius: 12, marginBottom: 22,
                  background: "rgba(99,102,241,0.06)",
                  border: "1px solid rgba(99,102,241,0.16)",
                }}>
                  <ShieldCheck size={14} color="#818cf8" style={{ flexShrink: 0, marginTop: 1 }} />
                  <p style={{ fontSize: 12, color: "#8b92b8", lineHeight: 1.65, margin: 0 }}>
                    Your session will be ended and you'll be redirected to the login page.
                    Any unsaved changes will be lost.
                  </p>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: 10 }}>
                  {/* Cancel */}
                  <motion.button
                    whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
                    onClick={onClose}
                    style={{
                      flex: 1, padding: "11px 0", borderRadius: 12,
                      border: "1px solid rgba(255,255,255,0.1)",
                      background: "rgba(255,255,255,0.04)",
                      fontSize: 14, fontWeight: 500,
                      color: "rgba(255,255,255,0.55)",
                      cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
                      transition: "all 0.2s",
                    }}>
                    Stay
                  </motion.button>

                  {/* Confirm logout */}
                  <motion.button
                    whileHover={{ y: -1, boxShadow: "0 8px 24px rgba(239,68,68,0.28)" }}
                    whileTap={{ scale: 0.97 }}
                    onClick={onConfirm}
                    style={{
                      flex: 1, padding: "11px 0", borderRadius: 12,
                      border: "none",
                      background: "linear-gradient(135deg,#ef4444,#dc2626)",
                      fontSize: 14, fontWeight: 700,
                      color: "#ffffff",
                      cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                      transition: "all 0.25s",
                      boxShadow: "0 4px 16px rgba(239,68,68,0.2)",
                    }}>
                    <LogOut size={14} />
                    Sign Out
                  </motion.button>
                </div>
              </div>

              <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
              `}</style>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}