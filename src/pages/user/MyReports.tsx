import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ClipboardList, MapPin, Calendar, Clock,
  Tag, Eye, Zap, AlertTriangle,
  ChevronRight, X, Image, DollarSign, Phone, Hash,
  Layers, FileText, Flag, TrendingUp, Sparkles, Package,
  RefreshCw, Plus, Trash2, Edit3, ShieldCheck,
  Save, Upload, CheckCircle,
} from "lucide-react"
import { useReportStore } from "@/store/reportStore"
import type {
  ReportListItem, Report, ReportStatus,
  ReportCategory, ReportType, UpdateReportPayload,
} from "@/types/reportTypes"

// ─────────────────────────────────────────────────────────────────────────────
//  RESPONSIVE HOOK
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
const CATEGORIES: ReportCategory[] = [
  "Electronics","Wallets & Bags","Keys","Clothing",
  "Jewelry","Documents","Pets","Sports","Other",
]

const STATUS_CFG: Record<ReportStatus, { label: string; color: string; bg: string; border: string; dot: string }> = {
  open:         { label: "Open",         color: "#34d399", bg: "rgba(52,211,153,0.1)",  border: "rgba(52,211,153,0.25)",  dot: "#34d399" },
  under_review: { label: "Under Review", color: "#fbbf24", bg: "rgba(251,191,36,0.1)",  border: "rgba(251,191,36,0.25)",  dot: "#fbbf24" },
  matched:      { label: "Matched",      color: "#818cf8", bg: "rgba(129,140,248,0.1)", border: "rgba(129,140,248,0.25)", dot: "#818cf8" },
  claimed:      { label: "Claimed",      color: "#38bdf8", bg: "rgba(56,189,248,0.1)",  border: "rgba(56,189,248,0.25)",  dot: "#38bdf8" },
  closed:       { label: "Closed",       color: "#6b7280", bg: "rgba(107,114,128,0.1)", border: "rgba(107,114,128,0.25)", dot: "#6b7280" },
  rejected:     { label: "Rejected",     color: "#f87171", bg: "rgba(248,113,113,0.1)", border: "rgba(248,113,113,0.25)", dot: "#f87171" },
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

const STATUS_FILTERS: { value: "all" | ReportStatus; label: string }[] = [
  { value: "all",          label: "All" },
  { value: "open",         label: "Open" },
  { value: "under_review", label: "Under Review" },
  { value: "matched",      label: "Matched" },
  { value: "claimed",      label: "Claimed" },
  { value: "closed",       label: "Closed" },
  { value: "rejected",     label: "Rejected" },
]

const TYPE_FILTERS: { value: "all" | ReportType; label: string }[] = [
  { value: "all",   label: "All Types" },
  { value: "lost",  label: "Lost" },
  { value: "found", label: "Found" },
]

// ─────────────────────────────────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────────────────────────────────
function timeAgo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (diff < 1)     return "just now"
  if (diff < 60)    return `${diff}m ago`
  if (diff < 1440)  return `${Math.floor(diff / 60)}h ago`
  if (diff < 43200) return `${Math.floor(diff / 1440)}d ago`
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
}
function fmtTime(t: string | null) {
  if (!t) return null
  const [h, m] = t.split(":")
  const hr = parseInt(h)
  return `${hr % 12 || 12}:${m} ${hr >= 12 ? "PM" : "AM"}`
}
function toInputDate(s: string) { return s?.slice(0, 10) ?? "" }

// ─────────────────────────────────────────────────────────────────────────────
//  SHARED SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────
function StatusPill({ status }: { status: ReportStatus }) {
  const c = STATUS_CFG[status]
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"3px 9px", borderRadius:20, background:c.bg, border:`1px solid ${c.border}`, fontSize:10, fontWeight:700, color:c.color, letterSpacing:0.4 }}>
      <span style={{ width:5, height:5, borderRadius:"50%", background:c.dot, flexShrink:0 }} />
      {c.label}
    </span>
  )
}
function CatBadge({ category }: { category: ReportCategory }) {
  const Icon = CATEGORY_ICONS[category] ?? Tag
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"3px 8px", borderRadius:7, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.09)", fontSize:10, fontWeight:600, color:"#6b7280" }}>
      <Icon size={10} color="#4b5563" />{category}
    </span>
  )
}
function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize:10, fontWeight:700, color:"#4b5563", textTransform:"uppercase", letterSpacing:1.4, marginBottom:10 }}>{children}</div>
}
function InfoRow({ icon: Icon, label, children }: { icon: React.ElementType; label: string; children: React.ReactNode }) {
  return (
    <div style={{ display:"flex", alignItems:"flex-start", gap:10, padding:"10px 14px", borderRadius:10, background:"rgba(255,255,255,0.025)", border:"1px solid rgba(255,255,255,0.06)" }}>
      <Icon size={13} color="#4b5563" style={{ marginTop:1, flexShrink:0 }} />
      <div>
        <div style={{ fontSize:9, fontWeight:700, color:"#374151", textTransform:"uppercase", letterSpacing:1, marginBottom:2 }}>{label}</div>
        <div style={{ fontSize:13, color:"#c4c9e2" }}>{children}</div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  EDIT MODAL
// ─────────────────────────────────────────────────────────────────────────────
function EditModal({
  report, onClose, isMobile,
}: { report: Report; onClose: (saved: boolean) => void; isMobile: boolean }) {
  const { editReport, editing, editError, resetEdit } = useReportStore()
  const fileRef = useRef<HTMLInputElement>(null)

  const isFound      = report.report_type === "found"
  const accent       = isFound ? "#10b981" : "#6366f1"
  const accentAlt    = isFound ? "#059669" : "#8b5cf6"
  const accentBg     = isFound ? "rgba(16,185,129,0.1)"  : "rgba(99,102,241,0.1)"
  const accentBorder = isFound ? "rgba(16,185,129,0.28)" : "rgba(99,102,241,0.28)"

  const [form, setForm] = useState<UpdateReportPayload>({
    item_name:               report.item_name,
    category:                report.category,
    location:                report.location,
    location_detail:         report.location_detail         ?? "",
    date_event:              toInputDate(report.date_event),
    time_event:              report.time_event              ?? "",
    brand:                   report.brand                  ?? "",
    color:                   report.color                  ?? "",
    description:             report.description,
    distinguishing_features: report.distinguishing_features ?? "",
    reward:                  report.reward                  ?? "",
    contact_phone:           report.contact_phone           ?? "",
    is_urgent:               report.is_urgent,
    found_stored_at:         report.found_stored_at         ?? "",
  })
  const [newImages,   setNewImages]   = useState<File[]>([])
  const [previews,    setPreviews]    = useState<string[]>([])
  const [savedToast,  setSavedToast]  = useState(false)

  // cleanup on unmount
  useEffect(() => () => { resetEdit() }, [])

  function field<K extends keyof UpdateReportPayload>(key: K, val: UpdateReportPayload[K]) {
    setForm(f => ({ ...f, [key]: val }))
  }

  function handleFiles(files: FileList | null) {
    if (!files) return
    Array.from(files).forEach(f => {
      setNewImages(p => [...p, f])
      const r = new FileReader()
      r.onload = e => setPreviews(p => [...p, e.target?.result as string])
      r.readAsDataURL(f)
    })
  }

  function removePreview(i: number) {
    setNewImages(p => p.filter((_, j) => j !== i))
    setPreviews(p  => p.filter((_, j) => j !== i))
  }

  async function handleSave() {
    const payload: UpdateReportPayload = { ...form }
    if (newImages.length > 0) payload.images = newImages
    const ok = await editReport(report.id, payload)
    if (ok) {
      setSavedToast(true)
      setTimeout(() => { setSavedToast(false); onClose(true) }, 1300)
    }
  }

  // shared input style
  const inp = (extra: React.CSSProperties = {}): React.CSSProperties => ({
    width: "100%", background: "#0c0c1e", border: "1px solid rgba(255,255,255,0.09)",
    borderRadius: 10, padding: "9px 12px", fontSize: 13, color: "#e2e8f0",
    outline: "none", fontFamily: "'DM Sans',sans-serif", boxSizing: "border-box",
    transition: "border-color .18s, box-shadow .18s", ...extra,
  })
  const focusHandlers = {
    onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      e.currentTarget.style.borderColor = `${accent}80`
      e.currentTarget.style.boxShadow   = `0 0 0 3px ${accentBg}`
    },
    onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)"
      e.currentTarget.style.boxShadow   = "none"
    },
  }
  const lbl: React.CSSProperties = {
    fontSize:10, fontWeight:700, color:"#4b5563",
    textTransform:"uppercase", letterSpacing:1.2,
    marginBottom:6, display:"block",
  }

  return (
    <motion.div
      initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      style={{ position:"fixed", inset:0, zIndex:500, background:"rgba(0,0,0,0.78)",
        backdropFilter:"blur(12px)", display:"flex",
        alignItems: isMobile ? "flex-end" : "center",
        justifyContent:"center", padding: isMobile ? 0 : 20 }}>

      <motion.div
        initial={isMobile ? { y:"100%" } : { scale:0.94, y:16 }}
        animate={isMobile ? { y:0 }      : { scale:1,    y:0  }}
        exit={isMobile    ? { y:"100%" } : { scale:0.94, y:16 }}
        transition={{ type:"spring", damping:28, stiffness:260 }}
        style={{
          background:"linear-gradient(160deg,#0f0f24,#0a0a15)",
          border:`1px solid ${accentBorder}`,
          borderRadius: isMobile ? "20px 20px 0 0" : 20,
          width:"100%", maxWidth: isMobile ? "100%" : 560,
          maxHeight: isMobile ? "92dvh" : "90vh",
          overflowY:"auto", fontFamily:"'DM Sans',sans-serif",
          boxShadow:"0 32px 80px rgba(0,0,0,0.6)",
        }}>

        {/* Mobile drag handle */}
        {isMobile && (
          <div style={{ display:"flex", justifyContent:"center", paddingTop:10 }}>
            <div style={{ width:36, height:4, borderRadius:2, background:"rgba(255,255,255,0.14)" }} />
          </div>
        )}

        {/* ── Sticky header ── */}
        <div style={{ padding:"20px 24px 16px", borderBottom:"1px solid rgba(255,255,255,0.07)",
          position:"sticky", top:0, background:"rgba(10,10,21,0.97)",
          backdropFilter:"blur(20px)", zIndex:2 }}>

          {/* success toast */}
          <AnimatePresence>
            {savedToast && (
              <motion.div
                initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
                style={{ display:"flex", alignItems:"center", gap:8, padding:"9px 14px",
                  borderRadius:10, background:"rgba(52,211,153,0.1)",
                  border:"1px solid rgba(52,211,153,0.28)", marginBottom:14,
                  fontSize:13, color:"#34d399", fontWeight:600 }}>
                <CheckCircle size={14} />Saved! Refreshing…
              </motion.div>
            )}
          </AnimatePresence>

          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ width:34, height:34, borderRadius:10, background:accentBg,
                border:`1px solid ${accentBorder}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <Edit3 size={15} color={accent} />
              </div>
              <div>
                <div style={{ fontSize:16, fontWeight:800, color:"#fff", fontFamily:"'Syne',sans-serif" }}>Edit Report</div>
                <div style={{ fontSize:11, color:"#4b5563", marginTop:1 }}>
                  {isFound ? "Found" : "Lost"} · #{report.id} · {report.item_name}
                </div>
              </div>
            </div>
            <motion.button whileTap={{ scale:0.93 }} onClick={() => onClose(false)}
              style={{ width:28, height:28, borderRadius:8, background:"rgba(255,255,255,0.06)",
                border:"1px solid rgba(255,255,255,0.1)", display:"flex",
                alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
              <X size={14} color="rgba(255,255,255,0.5)" />
            </motion.button>
          </div>
        </div>

        {/* ── Form body ── */}
        <div style={{ padding:"20px 24px 32px", display:"flex", flexDirection:"column", gap:16 }}>

          {/* error */}
          <AnimatePresence>
            {editError && (
              <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:"auto" }} exit={{ opacity:0, height:0 }}
                style={{ overflow:"hidden" }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 14px",
                  borderRadius:10, background:"rgba(239,68,68,0.09)",
                  border:"1px solid rgba(239,68,68,0.25)", fontSize:13, color:"#f87171" }}>
                  <AlertTriangle size={13} />{editError}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Item name */}
          <div>
            <label style={lbl}>Item Name <span style={{ color:"#f87171" }}>*</span></label>
            <input value={form.item_name ?? ""} onChange={e => field("item_name", e.target.value)}
              style={inp()} placeholder="e.g. Black iPhone 14 Pro" {...focusHandlers} />
          </div>

          {/* Category + Urgent */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr auto", gap:12, alignItems:"flex-end" }}>
            <div>
              <label style={lbl}>Category <span style={{ color:"#f87171" }}>*</span></label>
              <select value={form.category ?? ""} onChange={e => field("category", e.target.value as ReportCategory)}
                style={{ ...inp(), cursor:"pointer", colorScheme:"dark" }} {...focusHandlers}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Urgent</label>
              <motion.button whileTap={{ scale:0.96 }} onClick={() => field("is_urgent", !form.is_urgent)}
                style={{ display:"flex", alignItems:"center", gap:7, padding:"9px 14px",
                  borderRadius:10, cursor:"pointer", fontFamily:"'DM Sans',sans-serif",
                  fontWeight:600, fontSize:13, whiteSpace:"nowrap",
                  border: form.is_urgent ? "1px solid rgba(239,68,68,0.4)" : "1px solid rgba(255,255,255,0.09)",
                  background: form.is_urgent ? "rgba(239,68,68,0.12)" : "rgba(255,255,255,0.03)",
                  color: form.is_urgent ? "#f87171" : "#6b7280" }}>
                <Zap size={13} color={form.is_urgent ? "#f87171" : "#6b7280"} />
                {form.is_urgent ? "Urgent" : "Normal"}
              </motion.button>
            </div>
          </div>

          {/* Location */}
          <div>
            <label style={lbl}>Location <span style={{ color:"#f87171" }}>*</span></label>
            <input value={form.location ?? ""} onChange={e => field("location", e.target.value)}
              style={inp()} placeholder="Building, area, or address" {...focusHandlers} />
          </div>

          {/* Location detail */}
          <div>
            <label style={lbl}>Location Detail</label>
            <input value={form.location_detail ?? ""} onChange={e => field("location_detail", e.target.value)}
              style={inp()} placeholder="e.g. Near the main entrance" {...focusHandlers} />
          </div>

          {/* Date + Time */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <div>
              <label style={lbl}>{isFound ? "Date Found" : "Date Lost"} <span style={{ color:"#f87171" }}>*</span></label>
              <input type="date" value={form.date_event ?? ""} onChange={e => field("date_event", e.target.value)}
                style={{ ...inp(), colorScheme:"dark" }} {...focusHandlers} />
            </div>
            <div>
              <label style={lbl}>{isFound ? "Time Found" : "Time Lost"}</label>
              <input type="time" value={form.time_event ?? ""} onChange={e => field("time_event", e.target.value)}
                style={{ ...inp(), colorScheme:"dark" }} {...focusHandlers} />
            </div>
          </div>

          {/* Brand + Color */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <div>
              <label style={lbl}>Brand / Make</label>
              <input value={form.brand ?? ""} onChange={e => field("brand", e.target.value)}
                style={inp()} placeholder="e.g. Apple, Nike" {...focusHandlers} />
            </div>
            <div>
              <label style={lbl}>Color</label>
              <input value={form.color ?? ""} onChange={e => field("color", e.target.value)}
                style={inp()} placeholder="e.g. Black, Silver" {...focusHandlers} />
            </div>
          </div>

          {/* Description */}
          <div>
            <label style={lbl}>Description <span style={{ color:"#f87171" }}>*</span></label>
            <textarea value={form.description ?? ""} onChange={e => field("description", e.target.value)}
              rows={4} style={{ ...inp({ resize:"vertical", minHeight:90 }) }}
              placeholder="Describe the item in detail…" {...focusHandlers} />
          </div>

          {/* Distinguishing features */}
          <div>
            <label style={lbl}>Distinguishing Features</label>
            <textarea value={form.distinguishing_features ?? ""}
              onChange={e => field("distinguishing_features", e.target.value)}
              rows={2} style={{ ...inp({ resize:"vertical", minHeight:60 }) }}
              placeholder="Scratches, stickers, serial number…" {...focusHandlers} />
          </div>

          {/* Found: stored at */}
          {isFound && (
            <div>
              <label style={lbl}>Item Currently Stored At</label>
              <input value={form.found_stored_at ?? ""} onChange={e => field("found_stored_at", e.target.value)}
                style={inp()} placeholder="e.g. Security office, Room 201" {...focusHandlers} />
            </div>
          )}

          {/* Lost: reward + phone */}
          {!isFound && (
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <div>
                <label style={lbl}>Reward Offer</label>
                <input value={form.reward ?? ""} onChange={e => field("reward", e.target.value)}
                  style={inp()} placeholder="e.g. ₱500" {...focusHandlers} />
              </div>
              <div>
                <label style={lbl}>Contact Phone</label>
                <input value={form.contact_phone ?? ""} onChange={e => field("contact_phone", e.target.value)}
                  style={inp()} placeholder="+63 912 345 6789" {...focusHandlers} />
              </div>
            </div>
          )}

          {/* Photos */}
          <div>
            <label style={lbl}>Photos</label>
            {/* existing */}
            {report.images.length > 0 && (
              <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:10 }}>
                {report.images.map(img => (
                  <div key={img.id} style={{ position:"relative", width:56, height:56 }}>
                    <img src={img.image_url ?? ""} alt=""
                      style={{ width:56, height:56, borderRadius:8, objectFit:"cover",
                        border:"1px solid rgba(255,255,255,0.1)" }} />
                    {img.is_main && (
                      <div style={{ position:"absolute", bottom:2, left:2,
                        background:"rgba(99,102,241,0.85)", borderRadius:4,
                        padding:"1px 4px", fontSize:8, color:"#fff", fontWeight:700 }}>main</div>
                    )}
                  </div>
                ))}
              </div>
            )}
            {/* new previews */}
            {previews.length > 0 && (
              <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:10 }}>
                {previews.map((url, i) => (
                  <div key={i} style={{ position:"relative", width:56, height:56 }}>
                    <img src={url} alt=""
                      style={{ width:56, height:56, borderRadius:8, objectFit:"cover",
                        border:`1px solid ${accentBorder}` }} />
                    <button onClick={() => removePreview(i)}
                      style={{ position:"absolute", top:-4, right:-4, width:16, height:16,
                        borderRadius:"50%", background:"#ef4444", border:"none",
                        cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
                        padding:0 }}>
                      <X size={9} color="white" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/*" multiple
              style={{ display:"none" }} onChange={e => handleFiles(e.target.files)} />
            <motion.button whileTap={{ scale:0.97 }} onClick={() => fileRef.current?.click()}
              style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                padding:"10px 16px", borderRadius:10, width:"100%",
                border:"1px dashed rgba(255,255,255,0.14)", background:"rgba(255,255,255,0.02)",
                fontSize:13, color:"#6b7280", cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
              <Upload size={14} />Add more photos
            </motion.button>
          </div>

          {/* ── Action buttons ── */}
          <div style={{ display:"flex", gap:10, paddingTop:4 }}>
            <motion.button whileTap={{ scale:0.97 }} onClick={() => onClose(false)}
              style={{ flex:1, padding:"11px 0", borderRadius:12,
                border:"1px solid rgba(255,255,255,0.1)", background:"rgba(255,255,255,0.04)",
                fontSize:14, fontWeight:600, color:"rgba(255,255,255,0.45)",
                cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
              Cancel
            </motion.button>
            <motion.button whileTap={{ scale:0.97 }} onClick={handleSave} disabled={editing}
              style={{ flex:2, padding:"11px 0", borderRadius:12, border:"none",
                background: editing
                  ? "rgba(99,102,241,0.25)"
                  : `linear-gradient(135deg,${accent},${accentAlt})`,
                fontSize:14, fontWeight:700,
                color: editing ? "rgba(255,255,255,0.35)" : "#fff",
                cursor: editing ? "not-allowed" : "pointer",
                fontFamily:"'DM Sans',sans-serif",
                display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                boxShadow: editing ? "none" : `0 4px 20px ${accentBg}` }}>
              {editing
                ? <><RefreshCw size={14} style={{ animation:"mr-spin .8s linear infinite" }} />Saving…</>
                : <><Save size={14} />Save Changes</>}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  DELETE MODAL
// ─────────────────────────────────────────────────────────────────────────────
function DeleteModal({
  target, onConfirm, onCancel, loading,
}: {
  target: { id: number; name: string; type: ReportType }
  onConfirm: () => void; onCancel: () => void; loading: boolean
}) {
  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      style={{ position:"fixed", inset:0, zIndex:600, background:"rgba(0,0,0,0.78)",
        backdropFilter:"blur(12px)", display:"flex", alignItems:"center",
        justifyContent:"center", padding:20 }}>
      <motion.div initial={{ scale:0.92, y:14 }} animate={{ scale:1, y:0 }} exit={{ scale:0.92, y:14 }}
        onClick={e => e.stopPropagation()}
        style={{ background:"linear-gradient(160deg,#0f0f24,#0a0a15)",
          border:"1px solid rgba(239,68,68,0.28)", borderRadius:20,
          padding:"28px 28px 24px", maxWidth:400, width:"100%",
          fontFamily:"'DM Sans',sans-serif" }}>

        {/* icon */}
        <div style={{ width:52, height:52, borderRadius:14, background:"rgba(239,68,68,0.1)",
          border:"1px solid rgba(239,68,68,0.25)", display:"flex",
          alignItems:"center", justifyContent:"center", marginBottom:18 }}>
          <Trash2 size={22} color="#f87171" />
        </div>

        <div style={{ fontSize:18, fontWeight:800, color:"#fff",
          fontFamily:"'Syne',sans-serif", marginBottom:12 }}>Delete Report?</div>

        {/* report preview chip */}
        <div style={{ display:"flex", alignItems:"center", gap:10, padding:"11px 14px",
          borderRadius:12, background:"rgba(255,255,255,0.04)",
          border:"1px solid rgba(255,255,255,0.08)", marginBottom:16 }}>
          <div style={{ width:34, height:34, borderRadius:9, flexShrink:0, display:"flex",
            alignItems:"center", justifyContent:"center",
            background: target.type === "lost" ? "rgba(99,102,241,0.15)" : "rgba(16,185,129,0.15)",
            border: target.type === "lost" ? "1px solid rgba(99,102,241,0.3)" : "1px solid rgba(16,185,129,0.3)" }}>
            <ClipboardList size={15} color={target.type === "lost" ? "#818cf8" : "#34d399"} />
          </div>
          <div>
            <div style={{ fontSize:13, fontWeight:700, color:"#e2e8f0" }}>{target.name}</div>
            <div style={{ fontSize:11, color:"#4b5563", marginTop:1 }}>
              #{target.id} · {target.type === "lost" ? "Lost" : "Found"} report
            </div>
          </div>
        </div>

        <p style={{ fontSize:13, color:"#6b7280", lineHeight:1.7, marginBottom:24 }}>
          This will permanently delete the report and all attached photos.{" "}
          <span style={{ color:"#f87171", fontWeight:600 }}>This cannot be undone.</span>
        </p>

        <div style={{ display:"flex", gap:10 }}>
          <motion.button whileTap={{ scale:0.97 }} onClick={onCancel}
            style={{ flex:1, padding:"11px 0", borderRadius:12,
              border:"1px solid rgba(255,255,255,0.1)", background:"rgba(255,255,255,0.04)",
              fontSize:14, fontWeight:600, color:"rgba(255,255,255,0.5)",
              cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
            Cancel
          </motion.button>
          <motion.button whileTap={{ scale:0.97 }} onClick={onConfirm} disabled={loading}
            style={{ flex:1, padding:"11px 0", borderRadius:12, border:"none",
              background: loading ? "rgba(239,68,68,0.2)" : "linear-gradient(135deg,#ef4444,#dc2626)",
              fontSize:14, fontWeight:700,
              color: loading ? "rgba(255,255,255,0.3)" : "#fff",
              cursor: loading ? "not-allowed" : "pointer",
              fontFamily:"'DM Sans',sans-serif",
              display:"flex", alignItems:"center", justifyContent:"center", gap:7,
              boxShadow: loading ? "none" : "0 4px 16px rgba(239,68,68,0.28)" }}>
            {loading
              ? <><RefreshCw size={13} style={{ animation:"mr-spin .8s linear infinite" }} />Deleting…</>
              : <><Trash2 size={13} />Delete</>}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  DETAIL DRAWER
// ─────────────────────────────────────────────────────────────────────────────
function DetailDrawer({
  reportId, onClose, isMobile, onEditRequest, onDeleteRequest,
}: {
  reportId: number | null
  onClose: () => void
  isMobile: boolean
  onEditRequest:   (r: Report) => void
  onDeleteRequest: (id: number, name: string, type: ReportType) => void
}) {
  const { activeReport, loadingDetail, detailError, fetchReport } = useReportStore()
  const [imgIdx, setImgIdx] = useState(0)

  useEffect(() => { if (reportId !== null) fetchReport(reportId) }, [reportId])
  useEffect(() => { setImgIdx(0) }, [reportId])

  const r       = activeReport
  const isOpen  = reportId !== null
  const canEdit = r && (r.status === "open" || r.status === "under_review")
  const canDel  = r && r.status === "open"
  const CatIcon = r ? (CATEGORY_ICONS[r.category] ?? Tag) : Tag

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div key="bd" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            onClick={onClose}
            style={{ position:"fixed", inset:0, zIndex:300, background:"rgba(0,0,0,0.65)", backdropFilter:"blur(6px)" }} />

          <motion.div key="drawer"
            initial={isMobile ? { y:"100%" } : { x:"100%" }}
            animate={isMobile ? { y:0 }      : { x:0      }}
            exit={isMobile    ? { y:"100%" } : { x:"100%" }}
            transition={{ type:"spring", damping:28, stiffness:260 }}
            style={isMobile ? {
              position:"fixed", left:0, right:0, bottom:0, zIndex:301,
              maxHeight:"92dvh", borderRadius:"20px 20px 0 0", overflowY:"auto",
              background:"linear-gradient(160deg,#0d0d1f,#090910)",
              border:"1px solid rgba(255,255,255,0.08)",
              fontFamily:"'DM Sans',sans-serif", color:"white",
            } : {
              position:"fixed", top:0, right:0, bottom:0, zIndex:301,
              width:440, overflowY:"auto",
              background:"linear-gradient(160deg,#0d0d1f,#090910)",
              borderLeft:"1px solid rgba(255,255,255,0.08)",
              boxShadow:"-24px 0 80px rgba(0,0,0,0.6)",
              fontFamily:"'DM Sans',sans-serif", color:"white",
            }}>

            {isMobile && (
              <div style={{ display:"flex", justifyContent:"center", padding:"12px 0 4px" }}>
                <div style={{ width:36, height:4, borderRadius:2, background:"rgba(255,255,255,0.18)" }} />
              </div>
            )}

            {/* sticky header */}
            <div style={{ padding: isMobile ? "14px 18px 12px" : "22px 24px 16px",
              borderBottom:"1px solid rgba(255,255,255,0.07)",
              position:"sticky", top:0, background:"rgba(9,9,16,0.97)",
              backdropFilter:"blur(20px)", zIndex:2 }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:10 }}>
                <span style={{ fontSize:12, fontWeight:700, color:"#4b5563", textTransform:"uppercase", letterSpacing:1.2 }}>
                  Report Detail
                </span>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  {canEdit && (
                    <motion.button whileTap={{ scale:0.95 }} onClick={() => r && onEditRequest(r)}
                      style={{ display:"flex", alignItems:"center", gap:5, padding:"5px 11px",
                        borderRadius:8, background:"rgba(99,102,241,0.1)",
                        border:"1px solid rgba(99,102,241,0.25)", fontSize:11, fontWeight:600,
                        color:"#a5b4fc", cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                      <Edit3 size={11} />Edit
                    </motion.button>
                  )}
                  {canDel && (
                    <motion.button whileTap={{ scale:0.95 }}
                      onClick={() => r && onDeleteRequest(r.id, r.item_name, r.report_type)}
                      style={{ display:"flex", alignItems:"center", gap:5, padding:"5px 11px",
                        borderRadius:8, background:"rgba(239,68,68,0.08)",
                        border:"1px solid rgba(239,68,68,0.22)", fontSize:11, fontWeight:600,
                        color:"#f87171", cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                      <Trash2 size={11} />Delete
                    </motion.button>
                  )}
                  <motion.button whileTap={{ scale:0.93 }} onClick={onClose}
                    style={{ width:28, height:28, borderRadius:8, background:"rgba(255,255,255,0.06)",
                      border:"1px solid rgba(255,255,255,0.1)", display:"flex",
                      alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
                    <X size={13} color="rgba(255,255,255,0.5)" />
                  </motion.button>
                </div>
              </div>
            </div>

            {/* loading */}
            {loadingDetail && (
              <div style={{ padding:"60px 24px", display:"flex", flexDirection:"column", alignItems:"center", gap:14 }}>
                <motion.div animate={{ rotate:360 }} transition={{ duration:1, repeat:Infinity, ease:"linear" }}>
                  <RefreshCw size={22} color="#4b5563" />
                </motion.div>
                <span style={{ fontSize:13, color:"#374151" }}>Loading report…</span>
              </div>
            )}

            {/* error */}
            {detailError && !loadingDetail && (
              <div style={{ padding:"40px 24px", textAlign:"center" }}>
                <AlertTriangle size={28} color="#f87171" style={{ marginBottom:12 }} />
                <div style={{ fontSize:13, color:"#f87171" }}>{detailError}</div>
              </div>
            )}

            {/* content */}
            {r && !loadingDetail && (
              <div style={{ padding: isMobile ? "16px 18px 40px" : "20px 24px 40px",
                display:"flex", flexDirection:"column", gap:22 }}>

                {/* hero */}
                <div style={{ padding:18, borderRadius:16,
                  background: r.report_type === "found"
                    ? "linear-gradient(135deg,rgba(16,185,129,0.1),rgba(5,150,105,0.06))"
                    : "linear-gradient(135deg,rgba(99,102,241,0.1),rgba(139,92,246,0.06))",
                  border: r.report_type === "found"
                    ? "1px solid rgba(16,185,129,0.2)" : "1px solid rgba(99,102,241,0.2)" }}>
                  <div style={{ display:"flex", alignItems:"flex-start", gap:14 }}>
                    <div style={{ width:48, height:48, borderRadius:14,
                      background:"rgba(99,102,241,0.15)", border:"1px solid rgba(99,102,241,0.3)",
                      display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                      <CatIcon size={20} color={r.report_type === "found" ? "#34d399" : "#818cf8"} />
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:7, flexWrap:"wrap", marginBottom:6 }}>
                        <StatusPill status={r.status} />
                        {r.is_urgent && (
                          <span style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"3px 8px",
                            borderRadius:20, background:"rgba(239,68,68,0.1)",
                            border:"1px solid rgba(239,68,68,0.28)", fontSize:10, fontWeight:700, color:"#f87171" }}>
                            <Zap size={9} />URGENT
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize:16, fontWeight:800, color:"#fff",
                        fontFamily:"'Syne',sans-serif", letterSpacing:"-0.3px",
                        lineHeight:1.3, marginBottom:4 }}>{r.item_name}</div>
                      <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
                        <CatBadge category={r.category} />
                        {r.brand && <span style={{ fontSize:11, color:"#4b5563" }}>· {r.brand}</span>}
                        {r.color && <span style={{ fontSize:11, color:"#4b5563" }}>· {r.color}</span>}
                      </div>
                    </div>
                  </div>
                  {/* stat row */}
                  <div style={{ display:"flex", marginTop:14, borderTop:"1px solid rgba(255,255,255,0.06)", paddingTop:14 }}>
                    {[
                      { icon:Eye,      label:"Views",    value:r.views },
                      { icon:Image,    label:"Photos",   value:r.image_count },
                      { icon:Calendar, label:"Reported", value:timeAgo(r.date_reported) },
                    ].map((s, i) => (
                      <div key={i} style={{ flex:1, textAlign:"center",
                        borderRight: i < 2 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
                        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:5, marginBottom:2 }}>
                          <s.icon size={11} color="#4b5563" />
                          <span style={{ fontSize:9, color:"#374151", textTransform:"uppercase", letterSpacing:1, fontWeight:700 }}>{s.label}</span>
                        </div>
                        <div style={{ fontSize:14, fontWeight:800,
                          color: r.report_type === "found" ? "#34d399" : "#a5b4fc",
                          fontFamily:"'Syne',sans-serif" }}>{s.value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* images */}
                {r.images.length > 0 && (
                  <div>
                    <SectionLabel>Photos</SectionLabel>
                    <div style={{ borderRadius:12, overflow:"hidden", aspectRatio:"16/9",
                      background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)",
                      marginBottom:8, position:"relative" }}>
                      <AnimatePresence mode="wait">
                        <motion.img key={imgIdx} src={r.images[imgIdx]?.image_url ?? ""} alt={r.item_name}
                          initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                          transition={{ duration:0.2 }}
                          style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                      </AnimatePresence>
                      {r.images.length > 1 && (
                        <div style={{ position:"absolute", bottom:8, right:8,
                          background:"rgba(0,0,0,0.6)", backdropFilter:"blur(6px)",
                          borderRadius:8, padding:"3px 8px", fontSize:10,
                          color:"rgba(255,255,255,0.7)", fontWeight:600 }}>
                          {imgIdx + 1} / {r.images.length}
                        </div>
                      )}
                    </div>
                    {r.images.length > 1 && (
                      <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                        {r.images.map((img, i) => (
                          <motion.button key={img.id} whileTap={{ scale:0.95 }}
                            onClick={() => setImgIdx(i)}
                            style={{ width:52, height:52, borderRadius:8, overflow:"hidden",
                              border:`2px solid ${i === imgIdx ? "rgba(99,102,241,0.6)" : "rgba(255,255,255,0.08)"}`,
                              padding:0, cursor:"pointer", background:"none", flexShrink:0 }}>
                            <img src={img.image_url ?? ""} alt=""
                              style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                          </motion.button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* location & date */}
                <div>
                  <SectionLabel>{r.report_type === "found" ? "Where & When Found" : "Where & When Lost"}</SectionLabel>
                  <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                    <InfoRow icon={MapPin} label="Location">
                      {r.location}{r.location_detail ? ` — ${r.location_detail}` : ""}
                    </InfoRow>
                    <InfoRow icon={Calendar} label={r.report_type === "found" ? "Date Found" : "Date Lost"}>
                      {fmtDate(r.date_event)}
                    </InfoRow>
                    {r.time_event && (
                      <InfoRow icon={Clock} label={r.report_type === "found" ? "Time Found" : "Time Lost"}>
                        {fmtTime(r.time_event)}
                      </InfoRow>
                    )}
                    {r.report_type === "found" && r.found_stored_at && (
                      <InfoRow icon={MapPin} label="Item Currently At">{r.found_stored_at}</InfoRow>
                    )}
                  </div>
                </div>

                {/* description */}
                <div>
                  <SectionLabel>Description</SectionLabel>
                  <p style={{ fontSize:13, color:"#c4c9e2", lineHeight:1.75, margin:0,
                    padding:"14px 16px", borderRadius:12,
                    background:"rgba(255,255,255,0.025)", border:"1px solid rgba(255,255,255,0.07)" }}>
                    {r.description}
                  </p>
                </div>

                {/* distinguishing features */}
                {r.distinguishing_features && (
                  <div>
                    <SectionLabel>Distinguishing Features</SectionLabel>
                    <p style={{ fontSize:13, color:"#c4c9e2", lineHeight:1.75, margin:0,
                      padding:"14px 16px", borderRadius:12,
                      background:"rgba(251,191,36,0.05)", border:"1px solid rgba(251,191,36,0.15)" }}>
                      {r.distinguishing_features}
                    </p>
                  </div>
                )}

                {/* contact & reward */}
                {((r.report_type !== "found" && r.reward) || r.contact_phone) && (
                  <div>
                    <SectionLabel>Contact & Reward</SectionLabel>
                    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                      {r.report_type !== "found" && r.reward && (
                        <InfoRow icon={DollarSign} label="Reward Offer">{r.reward}</InfoRow>
                      )}
                      {r.contact_phone && (
                        <InfoRow icon={Phone} label="Contact Phone">{r.contact_phone}</InfoRow>
                      )}
                    </div>
                  </div>
                )}

                {/* admin notes */}
                <div>
                  <SectionLabel>Admin Notes</SectionLabel>
                  {r.admin_notes
                    ? <div style={{ fontSize:13, color:"#fbbf24", lineHeight:1.7,
                        padding:"14px 16px", borderRadius:12,
                        background:"rgba(251,191,36,0.07)", border:"1px solid rgba(251,191,36,0.2)" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:6 }}>
                          <ShieldCheck size={13} color="#fbbf24" />
                          <span style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:1 }}>
                            Message from Admin
                          </span>
                        </div>
                        {r.admin_notes}
                      </div>
                    : <div style={{ fontSize:12, color:"#374151", fontStyle:"italic",
                        padding:"12px 14px", borderRadius:10,
                        background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.05)" }}>
                        No admin notes yet. Your report is being reviewed.
                      </div>
                  }
                </div>

                {/* meta */}
                <div style={{ padding:"14px 16px", borderRadius:12,
                  background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                    {[
                      { label:"Report ID",     value:`#${r.id}` },
                      { label:"Status",        value:STATUS_CFG[r.status].label },
                      { label:"Date Reported", value:fmtDate(r.date_reported) },
                      { label:"Last Updated",  value:timeAgo(r.date_updated) },
                    ].map((m, i) => (
                      <div key={i}>
                        <div style={{ fontSize:9, fontWeight:700, color:"#374151",
                          textTransform:"uppercase", letterSpacing:1.2, marginBottom:3 }}>{m.label}</div>
                        <div style={{ fontSize:12, color:"#6b7280", fontWeight:500 }}>{m.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  SKELETON + EMPTY + CARD  (unchanged from original)
// ─────────────────────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div style={{ borderRadius:16, border:"1px solid rgba(255,255,255,0.06)",
      background:"rgba(255,255,255,0.02)", padding:"18px 20px",
      display:"flex", gap:14, alignItems:"flex-start" }}>
      <div style={{ width:44, height:44, borderRadius:12, background:"rgba(255,255,255,0.05)", flexShrink:0 }} className="mr-skeleton" />
      <div style={{ flex:1, display:"flex", flexDirection:"column", gap:8 }}>
        <div style={{ height:14, borderRadius:6, background:"rgba(255,255,255,0.05)", width:"60%" }} className="mr-skeleton" />
        <div style={{ height:11, borderRadius:6, background:"rgba(255,255,255,0.04)", width:"40%" }} className="mr-skeleton" />
        <div style={{ display:"flex", gap:6, marginTop:4 }}>
          <div style={{ height:20, borderRadius:20, background:"rgba(255,255,255,0.04)", width:70 }} className="mr-skeleton" />
          <div style={{ height:20, borderRadius:20, background:"rgba(255,255,255,0.04)", width:55 }} className="mr-skeleton" />
        </div>
      </div>
    </div>
  )
}

function EmptyState({ filtered, typeFilter }: { filtered: boolean; typeFilter: "all" | ReportType }) {
  return (
    <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
      style={{ textAlign:"center", padding:"56px 24px" }}>
      <div style={{ width:64, height:64, borderRadius:18, background:"rgba(99,102,241,0.08)",
        border:"1px solid rgba(99,102,241,0.16)", display:"flex", alignItems:"center",
        justifyContent:"center", margin:"0 auto 20px" }}>
        <ClipboardList size={26} color="#4b5563" />
      </div>
      <div style={{ fontSize:16, fontWeight:700, color:"rgba(255,255,255,0.5)",
        fontFamily:"'Syne',sans-serif", marginBottom:8 }}>
        {filtered ? "No reports match this filter" : "No reports yet"}
      </div>
      <p style={{ fontSize:13, color:"#374151", lineHeight:1.65, maxWidth:260, margin:"0 auto 24px" }}>
        {filtered
          ? "Try a different filter to see your reports."
          : typeFilter === "found"
            ? "You haven't reported any found items yet."
            : "Once you file a report, it will appear here."}
      </p>
      {!filtered && (
        <div style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap" }}>
          {typeFilter !== "found" && (
            <motion.a href="/user-report-lost" whileHover={{ y:-1 }} whileTap={{ scale:0.97 }}
              style={{ display:"inline-flex", alignItems:"center", gap:7, padding:"10px 20px",
                borderRadius:12, background:"linear-gradient(135deg,#6366f1,#8b5cf6)",
                fontSize:13, fontWeight:700, color:"#fff", textDecoration:"none" }}>
              <Plus size={14} />Report Lost Item
            </motion.a>
          )}
          {typeFilter !== "lost" && (
            <motion.a href="/user-report-found" whileHover={{ y:-1 }} whileTap={{ scale:0.97 }}
              style={{ display:"inline-flex", alignItems:"center", gap:7, padding:"10px 20px",
                borderRadius:12, background:"linear-gradient(135deg,#10b981,#059669)",
                fontSize:13, fontWeight:700, color:"#fff", textDecoration:"none" }}>
              <Plus size={14} />Report Found Item
            </motion.a>
          )}
        </div>
      )}
    </motion.div>
  )
}

function ReportCard({ report, onClick, index }: { report: ReportListItem; onClick: () => void; index: number }) {
  const CatIcon = CATEGORY_ICONS[report.category] ?? Tag
  const hasImg  = !!report.main_image
  return (
    <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
      transition={{ delay:index * 0.04, duration:0.25 }}
      onClick={onClick} className="mr-card"
      style={{ borderRadius:16, border:"1px solid rgba(255,255,255,0.07)",
        background:"rgba(255,255,255,0.02)", cursor:"pointer",
        overflow:"hidden", transition:"all 0.2s" }}>
      <div style={{ display:"flex" }}>
        {hasImg && (
          <div style={{ width:88, flexShrink:0, overflow:"hidden" }}>
            <img src={report.main_image!} alt=""
              style={{ width:"100%", height:"100%", objectFit:"cover" }} />
          </div>
        )}
        <div style={{ flex:1, padding:"16px 18px 14px", minWidth:0 }}>
          <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:10, marginBottom:8 }}>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap", marginBottom:6 }}>
                <StatusPill status={report.status} />
                <span style={{ display:"inline-flex", alignItems:"center", gap:3, padding:"2px 7px",
                  borderRadius:20, fontSize:9, fontWeight:700, letterSpacing:0.4,
                  background: report.report_type === "found" ? "rgba(16,185,129,0.1)"  : "rgba(99,102,241,0.1)",
                  border:     report.report_type === "found" ? "1px solid rgba(16,185,129,0.22)" : "1px solid rgba(99,102,241,0.22)",
                  color:      report.report_type === "found" ? "#34d399" : "#818cf8" }}>
                  {report.report_type === "found" ? "FOUND" : "LOST"}
                </span>
                {report.is_urgent && (
                  <span style={{ display:"inline-flex", alignItems:"center", gap:3, padding:"2px 7px",
                    borderRadius:20, background:"rgba(239,68,68,0.1)",
                    border:"1px solid rgba(239,68,68,0.22)", fontSize:9, fontWeight:700, color:"#f87171" }}>
                    <Zap size={8} />URGENT
                  </span>
                )}
              </div>
              <div style={{ fontSize:14, fontWeight:700, color:"#fff", fontFamily:"'Syne',sans-serif",
                letterSpacing:"-0.2px", lineHeight:1.3, marginBottom:5,
                overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                {report.item_name}
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                <span style={{ display:"flex", alignItems:"center", gap:4, fontSize:11, color:"#4b5563" }}>
                  <CatIcon size={10} color="#374151" />{report.category}
                </span>
                <span style={{ display:"flex", alignItems:"center", gap:4, fontSize:11, color:"#4b5563" }}>
                  <MapPin size={10} color="#374151" />
                  {report.location.length > 28 ? report.location.slice(0, 28) + "…" : report.location}
                </span>
              </div>
            </div>
            <ChevronRight size={15} color="#374151" style={{ flexShrink:0, marginTop:2 }} />
          </div>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
            paddingTop:10, borderTop:"1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <span style={{ display:"flex", alignItems:"center", gap:4, fontSize:11, color:"#374151" }}>
                <Eye size={10} color="#374151" />{report.views}
              </span>
              {report.image_count > 0 && (
                <span style={{ display:"flex", alignItems:"center", gap:4, fontSize:11, color:"#374151" }}>
                  <Image size={10} color="#374151" />{report.image_count}
                </span>
              )}
              {report.reward && (
                <span style={{ display:"flex", alignItems:"center", gap:4, fontSize:11, color:"#fbbf24" }}>
                  <DollarSign size={10} color="#fbbf24" />{report.reward}
                </span>
              )}
            </div>
            <span style={{ fontSize:11, color:"#374151" }}>{timeAgo(report.date_reported)}</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function MyReport() {
  const isMobile = useIsMobile(640)
  const {
    reports, reportCount, loadingList, listError,
    fetchMyReports, removeReport, deleting, deleteError, clearErrors,
  } = useReportStore()

  const [typeFilter,   setTypeFilter]   = useState<"all" | ReportType>("all")
  const [statusFilter, setStatusFilter] = useState<"all" | ReportStatus>("all")
  const [openId,       setOpenId]       = useState<number | null>(null)
  const [editTarget,   setEditTarget]   = useState<Report | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string; type: ReportType } | null>(null)

  useEffect(() => {
    fetchMyReports({
      status: statusFilter === "all" ? undefined : statusFilter,
      type:   typeFilter   === "all" ? undefined : typeFilter,
    })
  }, [statusFilter, typeFilter])

  const statCounts = {
    total:        reportCount,
    open:         reports.filter(r => r.status === "open").length,
    under_review: reports.filter(r => r.status === "under_review").length,
    matched:      reports.filter(r => r.status === "matched" || r.status === "claimed").length,
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    const ok = await removeReport(deleteTarget.id)
    if (ok) {
      setDeleteTarget(null)
      if (openId === deleteTarget.id) setOpenId(null)
    }
  }

  function handleEditClose(saved: boolean) {
    setEditTarget(null)
    if (saved && openId !== null) {
      useReportStore.getState().fetchReport(openId)
    }
  }

  return (
    <div style={{ minHeight:"100vh", background:"#06060f", color:"white",
      fontFamily:"'DM Sans',sans-serif", padding: isMobile ? "0 0 48px" : "0 0 60px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        .syne { font-family:'Syne',sans-serif; }
        .mr-card:hover { border-color:rgba(99,102,241,0.3) !important; background:rgba(99,102,241,0.04) !important; transform:translateY(-1px); box-shadow:0 8px 32px rgba(0,0,0,0.25); }
        .mr-skeleton { animation:mr-pulse 1.6s ease-in-out infinite; }
        @keyframes mr-pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes mr-spin   { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        .mr-pill-active { background:rgba(99,102,241,0.15) !important; border-color:rgba(99,102,241,0.4) !important; color:#a5b4fc !important; }
        select option { background:#13131f; }
        textarea { resize:vertical; }
      `}</style>

      <div style={{ width:"100%" }}>

        {/* ── Header ── */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom: isMobile ? 20 : 28 }}>
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <div style={{ width:42, height:42, borderRadius:12,
              background:"linear-gradient(135deg,#6366f1,#8b5cf6)",
              display:"flex", alignItems:"center", justifyContent:"center",
              boxShadow:"0 4px 18px rgba(99,102,241,0.35)", flexShrink:0 }}>
              <ClipboardList size={18} color="white" />
            </div>
            <div>
              <h1 className="syne" style={{ fontSize: isMobile ? 18 : 22, fontWeight:800,
                letterSpacing:"-0.5px", color:"#fff", margin:0, lineHeight:1.2 }}>My Reports</h1>
              <p style={{ fontSize:12, color:"#4b5563", margin:0 }}>
                {loadingList ? "Loading…" : `${reportCount} report${reportCount !== 1 ? "s" : ""} total`}
              </p>
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <motion.button whileTap={{ scale:0.95 }}
              onClick={() => fetchMyReports({ status: statusFilter === "all" ? undefined : statusFilter, type: typeFilter === "all" ? undefined : typeFilter })}
              style={{ width:36, height:36, borderRadius:10, background:"rgba(255,255,255,0.04)",
                border:"1px solid rgba(255,255,255,0.09)", display:"flex",
                alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
              <motion.div animate={loadingList ? { rotate:360 } : {}}
                transition={{ duration:1, repeat: loadingList ? Infinity : 0, ease:"linear" }}>
                <RefreshCw size={14} color="#4b5563" />
              </motion.div>
            </motion.button>
            {typeFilter !== "found" && (
              <motion.a href="/user-report-lost" whileHover={{ y:-1 }} whileTap={{ scale:0.97 }}
                style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"8px 14px",
                  borderRadius:10, background:"linear-gradient(135deg,#6366f1,#8b5cf6)",
                  fontSize:12, fontWeight:700, color:"#fff", textDecoration:"none",
                  boxShadow:"0 4px 14px rgba(99,102,241,0.25)" }}>
                <Plus size={13} />{!isMobile && "Lost"}
              </motion.a>
            )}
            {typeFilter !== "lost" && (
              <motion.a href="/user-report-found" whileHover={{ y:-1 }} whileTap={{ scale:0.97 }}
                style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"8px 14px",
                  borderRadius:10, background:"linear-gradient(135deg,#10b981,#059669)",
                  fontSize:12, fontWeight:700, color:"#fff", textDecoration:"none",
                  boxShadow:"0 4px 14px rgba(16,185,129,0.25)" }}>
                <Plus size={13} />{!isMobile && "Found"}
              </motion.a>
            )}
          </div>
        </div>

        {/* ── Stat cards ── */}
        {!loadingList && reportCount > 0 && (
          <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.05 }}
            style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:20 }}>
            {[
              { label:"Total",     value:statCounts.total,        color:"#818cf8", glow:"rgba(129,140,248,0.2)" },
              { label:"Open",      value:statCounts.open,         color:"#34d399", glow:"rgba(52,211,153,0.2)"  },
              { label:"In Review", value:statCounts.under_review, color:"#fbbf24", glow:"rgba(251,191,36,0.2)"  },
              { label:"Found",     value:statCounts.matched,      color:"#38bdf8", glow:"rgba(56,189,248,0.2)"  },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
                transition={{ delay:0.05 + i * 0.04 }}
                style={{ borderRadius:14, background:"rgba(255,255,255,0.02)",
                  border:"1px solid rgba(255,255,255,0.07)",
                  padding: isMobile ? "12px 10px" : "14px 16px",
                  textAlign:"center", position:"relative", overflow:"hidden" }}>
                <div style={{ position:"absolute", top:-12, left:"50%", transform:"translateX(-50%)",
                  width:40, height:40, borderRadius:"50%", background:s.glow,
                  filter:"blur(14px)", pointerEvents:"none" }} />
                <div style={{ fontSize: isMobile ? 18 : 22, fontWeight:800, color:s.color,
                  fontFamily:"'Syne',sans-serif", lineHeight:1 }}>{s.value}</div>
                <div style={{ fontSize: isMobile ? 9 : 10, color:"#374151",
                  textTransform:"uppercase", letterSpacing:0.8,
                  fontWeight:600, marginTop:4 }}>{s.label}</div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* ── Type filters ── */}
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.08 }}
          style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:10 }}>
          {TYPE_FILTERS.map(f => (
            <motion.button key={f.value} whileTap={{ scale:0.96 }}
              onClick={() => setTypeFilter(f.value)}
              className={typeFilter === f.value ? "mr-pill-active" : ""}
              style={{ padding:"5px 12px", borderRadius:20, border:"1px solid rgba(255,255,255,0.1)",
                background:"rgba(255,255,255,0.03)", fontSize:12, fontWeight:500,
                color:"rgba(255,255,255,0.45)", cursor:"pointer",
                fontFamily:"'DM Sans',sans-serif", transition:"all 0.15s" }}>
              {f.label}
            </motion.button>
          ))}
        </motion.div>

        {/* ── Status filters ── */}
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.1 }}
          style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:18 }}>
          {STATUS_FILTERS.map(f => (
            <motion.button key={f.value} whileTap={{ scale:0.96 }}
              onClick={() => setStatusFilter(f.value)}
              className={statusFilter === f.value ? "mr-pill-active" : ""}
              style={{ padding:"5px 12px", borderRadius:20, border:"1px solid rgba(255,255,255,0.1)",
                background:"rgba(255,255,255,0.03)", fontSize:12, fontWeight:500,
                color:"rgba(255,255,255,0.45)", cursor:"pointer",
                fontFamily:"'DM Sans',sans-serif", transition:"all 0.15s" }}>
              {f.label}
            </motion.button>
          ))}
        </motion.div>

        {/* ── Error banner ── */}
        <AnimatePresence>
          {(listError || deleteError) && (
            <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:"auto" }}
              exit={{ opacity:0, height:0 }} style={{ overflow:"hidden", marginBottom:14 }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
                gap:10, padding:"11px 14px", borderRadius:12,
                background:"rgba(239,68,68,0.07)", border:"1px solid rgba(239,68,68,0.22)" }}>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <AlertTriangle size={13} color="#f87171" />
                  <span style={{ fontSize:12, color:"#f87171" }}>{listError ?? deleteError}</span>
                </div>
                <button onClick={clearErrors}
                  style={{ background:"none", border:"none", cursor:"pointer", display:"flex", padding:0 }}>
                  <X size={13} color="#f87171" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── List ── */}
        {loadingList ? (
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {Array.from({ length:4 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : reports.length === 0 ? (
          <EmptyState filtered={statusFilter !== "all"} typeFilter={typeFilter} />
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {reports.map((r, i) => (
              <ReportCard key={r.id} report={r} index={i} onClick={() => setOpenId(r.id)} />
            ))}
          </div>
        )}

        {!loadingList && reports.length > 0 && (
          <div style={{ textAlign:"center", marginTop:20, fontSize:11, color:"#374151" }}>
            Showing {reports.length} of {reportCount} report{reportCount !== 1 ? "s" : ""}
          </div>
        )}
      </div>

      {/* ── Detail drawer ── */}
      <DetailDrawer
        reportId={openId}
        onClose={() => setOpenId(null)}
        isMobile={isMobile}
        onEditRequest={r   => setEditTarget(r)}
        onDeleteRequest={(id, name, type) => setDeleteTarget({ id, name, type })}
      />

      {/* ── Edit modal ── */}
      <AnimatePresence>
        {editTarget && (
          <EditModal key="edit-modal" report={editTarget}
            onClose={handleEditClose} isMobile={isMobile} />
        )}
      </AnimatePresence>

      {/* ── Delete modal ── */}
      <AnimatePresence>
        {deleteTarget && (
          <DeleteModal key="del-modal" target={deleteTarget}
            onConfirm={confirmDelete} onCancel={() => setDeleteTarget(null)}
            loading={deleting} />
        )}
      </AnimatePresence>
    </div>
  )
}