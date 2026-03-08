import React, { useState, useRef, useCallback, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  PackageSearch, ChevronRight, ChevronLeft, CheckCircle,
  MapPin, Calendar, Tag, FileText, Upload, X, AlertTriangle,
  Zap, Package, Hash, Flag, Layers, TrendingUp, Image,
  Clock, DollarSign, Phone, Info, Eye, Send, Sparkles,
} from "lucide-react"
import { useReportStore } from "@/store/reportStore"
import type { ReportCategory } from "@/types/reportTypes"

// ─────────────────────────────────────────────────────────────────────────────
// TYPES & CONFIG
// ─────────────────────────────────────────────────────────────────────────────
type Category = ReportCategory

// ─────────────────────────────────────────────────────────────────────────────
// RESPONSIVE HOOK
// ─────────────────────────────────────────────────────────────────────────────
function useIsMobile(bp = 600) {
  const [v, setV] = React.useState(() =>
    typeof window !== "undefined" ? window.innerWidth < bp : false
  )
  React.useEffect(() => {
    const handler = () => setV(window.innerWidth < bp)
    window.addEventListener("resize", handler)
    return () => window.removeEventListener("resize", handler)
  }, [bp])
  return v
}

interface FormData {
  // Step 1 — Item basics
  item_name:   string
  category:    Category | ""
  brand:       string
  color:       string
  // Step 2 — Where & when
  location:        string
  location_detail: string
  date_event:      string
  time_event:      string
  // Step 3 — Description & extras
  description:     string
  distinguishing:  string
  reward:          string
  contact_phone:   string
  urgent:          boolean
  // Step 4 — Images
  images: File[]
}

const INITIAL: FormData = {
  item_name: "", category: "", brand: "", color: "",
  location: "", location_detail: "", date_event: "", time_event: "",
  description: "", distinguishing: "", reward: "", contact_phone: "", urgent: false,
  images: [],
}

const CATEGORIES: { value: Category; icon: React.ElementType; desc: string }[] = [
  { value: "Electronics",    icon: Zap,        desc: "Phones, laptops, cameras" },
  { value: "Wallets & Bags", icon: Package,    desc: "Wallets, purses, backpacks" },
  { value: "Keys",           icon: Hash,       desc: "House, car, office keys" },
  { value: "Clothing",       icon: Layers,     desc: "Jackets, shoes, accessories" },
  { value: "Jewelry",        icon: Sparkles,   desc: "Rings, necklaces, watches" },
  { value: "Documents",      icon: FileText,   desc: "IDs, passports, papers" },
  { value: "Pets",           icon: Flag,       desc: "Dogs, cats, other pets" },
  { value: "Sports",         icon: TrendingUp, desc: "Equipment, gear, balls" },
  { value: "Other",          icon: Tag,        desc: "Anything else" },
]

const STEPS = [
  { id: 1, label: "Item Info",    icon: Tag      },
  { id: 2, label: "Location",     icon: MapPin   },
  { id: 3, label: "Details",      icon: FileText },
  { id: 4, label: "Photos",       icon: Image    },
]

const COLORS = ["Black","White","Gray","Red","Orange","Yellow","Green","Blue","Purple","Pink","Brown","Gold","Silver","Multicolor"]

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 700, color: "#4b5563", textTransform: "uppercase", letterSpacing: 1.4, marginBottom: 8, display: "flex", alignItems: "center", gap: 5 }}>
      {children}
      {required && <span style={{ color: "#f87171", fontSize: 10 }}>*</span>}
    </div>
  )
}

function FieldHint({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 11, color: "#374151", marginTop: 6, display: "flex", alignItems: "center", gap: 5 }}><Info size={10} color="#374151" />{children}</div>
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

// ── Step 1: Item Info ────────────────────────────────────────────────────────
function StepItemInfo({ data, set, errors, isMobile }: { data: FormData; set: (k: keyof FormData, v: any) => void; errors: Partial<Record<keyof FormData, string>>; isMobile: boolean }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      {/* Item name */}
      <div>
        <FieldLabel required>Item Name</FieldLabel>
        <div style={{ position: "relative" }}>
          <PackageSearch size={14} color="#4b5563" style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
          <input
            className={`rl-input${errors.item_name ? " rl-error" : ""}`}
            style={{ paddingLeft: 38 }}
            placeholder="e.g. iPhone 15 Pro Max, Brown Leather Wallet"
            value={data.item_name}
            onChange={e => set("item_name", e.target.value)}
            maxLength={100}
          />
        </div>
        {errors.item_name && <div className="rl-err-msg"><AlertTriangle size={11} />{errors.item_name}</div>}
        <FieldHint>Be specific — mention brand/model if applicable</FieldHint>
      </div>

      {/* Category grid */}
      <div>
        <FieldLabel required>Category</FieldLabel>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(3,1fr)", gap: 8 }}>
          {CATEGORIES.map(c => {
            const selected = data.category === c.value
            return (
              <motion.button key={c.value} type="button" whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
                onClick={() => set("category", c.value)}
                style={{
                  padding: "10px 8px", borderRadius: 12, cursor: "pointer",
                  border: selected ? "1px solid rgba(99,102,241,0.5)" : "1px solid rgba(255,255,255,0.07)",
                  background: selected ? "rgba(99,102,241,0.14)" : "rgba(255,255,255,0.03)",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                  transition: "all 0.2s", fontFamily: "'DM Sans',sans-serif",
                }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: selected ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.05)", border: `1px solid ${selected ? "rgba(99,102,241,0.4)" : "rgba(255,255,255,0.08)"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <c.icon size={14} color={selected ? "#818cf8" : "#4b5563"} />
                </div>
                <div style={{ fontSize: 11, fontWeight: 600, color: selected ? "#a5b4fc" : "rgba(255,255,255,0.5)", textAlign: "center", lineHeight: 1.2 }}>{c.value}</div>
              </motion.button>
            )
          })}
        </div>
        {errors.category && <div className="rl-err-msg" style={{ marginTop: 6 }}><AlertTriangle size={11} />{errors.category}</div>}
      </div>

      {/* Brand + Color */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 14 }}>
        <div>
          <FieldLabel>Brand / Make</FieldLabel>
          <input className="rl-input" placeholder="e.g. Apple, Samsung" value={data.brand} onChange={e => set("brand", e.target.value)} maxLength={50} />
        </div>
        <div>
          <FieldLabel>Primary Color</FieldLabel>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
            {COLORS.map(c => (
              <motion.button key={c} type="button" whileTap={{ scale: 0.93 }}
                onClick={() => set("color", data.color === c ? "" : c)}
                style={{
                  padding: "3px 9px", borderRadius: 7, cursor: "pointer",
                  border: data.color === c ? "1px solid rgba(99,102,241,0.45)" : "1px solid rgba(255,255,255,0.08)",
                  background: data.color === c ? "rgba(99,102,241,0.14)" : "rgba(255,255,255,0.03)",
                  fontSize: 11, fontWeight: 500,
                  color: data.color === c ? "#a5b4fc" : "rgba(255,255,255,0.4)",
                  fontFamily: "'DM Sans',sans-serif", transition: "all 0.15s",
                }}>{c}
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Step 2: Location & Date ──────────────────────────────────────────────────
function StepLocation({ data, set, errors, isMobile }: { data: FormData; set: (k: keyof FormData, v: any) => void; errors: Partial<Record<keyof FormData, string>>; isMobile: boolean }) {
  const today = new Date().toISOString().split("T")[0]
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      {/* Location */}
      <div>
        <FieldLabel required>Where was it lost?</FieldLabel>
        <div style={{ position: "relative" }}>
          <MapPin size={14} color="#4b5563" style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
          <input
            className={`rl-input${errors.location ? " rl-error" : ""}`}
            style={{ paddingLeft: 38 }}
            placeholder="e.g. SM City Davao, Food Court Area"
            value={data.location}
            onChange={e => set("location", e.target.value)}
          />
        </div>
        {errors.location && <div className="rl-err-msg"><AlertTriangle size={11} />{errors.location}</div>}
      </div>

      {/* Location detail */}
      <div>
        <FieldLabel>Specific Location Detail</FieldLabel>
        <input className="rl-input" placeholder="e.g. Near the escalator, 2nd floor restroom, parking level B"
          value={data.location_detail} onChange={e => set("location_detail", e.target.value)} />
        <FieldHint>More detail = better chance of someone finding it</FieldHint>
      </div>

      {/* Date + Time */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 14 }}>
        <div>
          <FieldLabel required>Date Lost</FieldLabel>
          <div style={{ position: "relative" }}>
            <Calendar size={14} color="#4b5563" style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
            <input
              type="date"
              className={`rl-input${errors.date_event ? " rl-error" : ""}`}
              style={{ paddingLeft: 38 }}
              max={today}
              value={data.date_event}
              onChange={e => set("date_event", e.target.value)}
            />
          </div>
          {errors.date_event && <div className="rl-err-msg"><AlertTriangle size={11} />{errors.date_event}</div>}
        </div>
        <div>
          <FieldLabel>Approximate Time</FieldLabel>
          <div style={{ position: "relative" }}>
            <Clock size={14} color="#4b5563" style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
            <input
              type="time"
              className="rl-input"
              style={{ paddingLeft: 38 }}
              value={data.time_event}
              onChange={e => set("time_event", e.target.value)}
            />
          </div>
          <FieldHint>Optional but helpful</FieldHint>
        </div>
      </div>

      {/* Urgent toggle */}
      <motion.label whileTap={{ scale: 0.99 }}
        style={{
          display: "flex", alignItems: "center", gap: 14, cursor: "pointer",
          padding: "14px 16px", borderRadius: 12,
          background: data.urgent ? "rgba(239,68,68,0.07)" : "rgba(255,255,255,0.02)",
          border: `1px solid ${data.urgent ? "rgba(239,68,68,0.28)" : "rgba(255,255,255,0.07)"}`,
          transition: "all 0.2s",
        }}>
        {/* Toggle */}
        <div onClick={() => set("urgent", !data.urgent)}
          style={{
            width: 42, height: 24, borderRadius: 12, flexShrink: 0, position: "relative",
            background: data.urgent ? "rgba(239,68,68,0.8)" : "rgba(255,255,255,0.1)",
            border: `1px solid ${data.urgent ? "rgba(239,68,68,0.9)" : "rgba(255,255,255,0.15)"}`,
            transition: "all 0.25s",
          }}>
          <motion.div animate={{ left: data.urgent ? "calc(100% - 19px)" : "3px" }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            style={{ position: "absolute", top: 3, width: 16, height: 16, borderRadius: "50%", background: "white", boxShadow: "0 1px 4px rgba(0,0,0,0.3)" }} />
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: data.urgent ? "#f87171" : "rgba(255,255,255,0.55)", display: "flex", alignItems: "center", gap: 6 }}>
            <Zap size={13} color={data.urgent ? "#f87171" : "#4b5563"} />
            Mark as Urgent
          </div>
          <div style={{ fontSize: 11, color: "#374151", marginTop: 1 }}>Urgent reports are highlighted and prioritized in searches</div>
        </div>
      </motion.label>
    </div>
  )
}

// ── Step 3: Description & Extras ─────────────────────────────────────────────
function StepDetails({ data, set, errors, isMobile }: { data: FormData; set: (k: keyof FormData, v: any) => void; errors: Partial<Record<keyof FormData, string>>; isMobile: boolean }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      {/* Description */}
      <div>
        <FieldLabel required>Description</FieldLabel>
        <div style={{ position: "relative" }}>
          <textarea
            className={`rl-input${errors.description ? " rl-error" : ""}`}
            style={{ paddingLeft: 14, paddingTop: 12, resize: "vertical", minHeight: 100 }}
            placeholder="Describe the item in detail — what it looks like, any damages, contents if applicable…"
            value={data.description}
            onChange={e => set("description", e.target.value)}
            maxLength={800}
          />
          <div style={{ position: "absolute", bottom: 10, right: 12, fontSize: 10, color: data.description.length > 700 ? "#fbbf24" : "#374151" }}>
            {data.description.length}/800
          </div>
        </div>
        {errors.description && <div className="rl-err-msg"><AlertTriangle size={11} />{errors.description}</div>}
      </div>

      {/* Distinguishing features */}
      <div>
        <FieldLabel>Distinguishing Features</FieldLabel>
        <textarea
          className="rl-input"
          style={{ paddingLeft: 14, paddingTop: 12, resize: "vertical", minHeight: 72 }}
          placeholder="Stickers, engravings, scratches, unique markings, serial number, initials, etc."
          value={data.distinguishing}
          onChange={e => set("distinguishing", e.target.value)}
          maxLength={400}
        />
        <FieldHint>This helps verify ownership during claim</FieldHint>
      </div>

      {/* Reward + Phone */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 14 }}>
        <div>
          <FieldLabel>Reward Offer</FieldLabel>
          <div style={{ position: "relative" }}>
            <DollarSign size={14} color="#4b5563" style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
            <input className="rl-input" style={{ paddingLeft: 38 }} placeholder="e.g. ₱500, ₱2,000"
              value={data.reward} onChange={e => set("reward", e.target.value)} maxLength={30} />
          </div>
          <FieldHint>Optional — can increase responses</FieldHint>
        </div>
        <div>
          <FieldLabel>Contact Phone</FieldLabel>
          <div style={{ position: "relative" }}>
            <Phone size={14} color="#4b5563" style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
            <input className="rl-input" style={{ paddingLeft: 38 }} placeholder="+63 9XX XXX XXXX"
              value={data.contact_phone} onChange={e => set("contact_phone", e.target.value)} maxLength={20} />
          </div>
          <FieldHint>Shown to verified reporters only</FieldHint>
        </div>
      </div>
    </div>
  )
}

// ── Step 4: Images ────────────────────────────────────────────────────────────
function StepImages({ data, set }: { data: FormData; set: (k: keyof FormData, v: any) => void }) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  const addFiles = useCallback((files: FileList | null) => {
    if (!files) return
    const valid = Array.from(files).filter(f => f.type.startsWith("image/")).slice(0, 5 - data.images.length)
    set("images", [...data.images, ...valid])
  }, [data.images, set])

  const remove = (i: number) => set("images", data.images.filter((_, idx) => idx !== i))

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Drop zone */}
      <motion.div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files) }}
        animate={{ borderColor: dragging ? "rgba(99,102,241,0.6)" : "rgba(255,255,255,0.1)", background: dragging ? "rgba(99,102,241,0.07)" : "rgba(255,255,255,0.02)" }}
        onClick={() => fileRef.current?.click()}
        style={{
          border: "2px dashed rgba(255,255,255,0.1)", borderRadius: 16,
          padding: "36px 24px", textAlign: "center", cursor: "pointer",
          transition: "all 0.2s",
        }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
          <Upload size={20} color="#818cf8" />
        </div>
        <div style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.7)", marginBottom: 4 }}>
          {dragging ? "Drop images here" : "Click or drag to upload photos"}
        </div>
        <div style={{ fontSize: 12, color: "#4b5563" }}>Up to 5 images · JPG, PNG, WEBP · Max 10MB each</div>
        <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={e => addFiles(e.target.files)} />
      </motion.div>

      {/* Preview grid */}
      <AnimatePresence>
        {data.images.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(100px,1fr))", gap: 10 }}>
            {data.images.map((file, i) => {
              const url = URL.createObjectURL(file)
              return (
                <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.85 }}
                  style={{ position: "relative", borderRadius: 10, overflow: "hidden", aspectRatio: "1", border: "1px solid rgba(255,255,255,0.1)" }}>
                  <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  {/* Remove */}
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                    onClick={() => remove(i)}
                    style={{ position: "absolute", top: 5, right: 5, width: 22, height: 22, borderRadius: "50%", background: "rgba(0,0,0,0.7)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                    <X size={11} color="white" />
                  </motion.button>
                  {i === 0 && <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, fontSize: 9, fontWeight: 700, color: "white", background: "rgba(99,102,241,0.8)", textAlign: "center", padding: "2px 0", letterSpacing: 0.5 }}>MAIN</div>}
                </motion.div>
              )
            })}
            {/* Add more slot */}
            {data.images.length < 5 && (
              <motion.div whileHover={{ borderColor: "rgba(99,102,241,0.4)", background: "rgba(99,102,241,0.05)" }}
                onClick={() => fileRef.current?.click()}
                style={{ borderRadius: 10, border: "2px dashed rgba(255,255,255,0.08)", aspectRatio: "1", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, cursor: "pointer", transition: "all 0.2s" }}>
                <Upload size={16} color="#374151" />
                <span style={{ fontSize: 10, color: "#374151" }}>Add more</span>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tip */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "12px 14px", borderRadius: 12, background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.16)" }}>
        <Info size={13} color="#818cf8" style={{ flexShrink: 0, marginTop: 1 }} />
        <p style={{ fontSize: 12, color: "#8b92b8", lineHeight: 1.65, margin: 0 }}>
          Clear photos from multiple angles significantly increase your chances of recovery. Include any distinguishing marks visible in the photos.
        </p>
      </div>
    </div>
  )
}

// ── Review step ───────────────────────────────────────────────────────────────
function StepReview({ data, isMobile }: { data: FormData; isMobile: boolean }) {
  const cat = CATEGORIES.find(c => c.value === data.category)
  const CatIcon = cat?.icon ?? Tag
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Summary header */}
      <div style={{ padding: "18px", borderRadius: 14, background: "linear-gradient(135deg,rgba(99,102,241,0.1),rgba(139,92,246,0.07))", border: "1px solid rgba(99,102,241,0.2)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <CatIcon size={20} color="#818cf8" />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#fff", fontFamily: "'Syne',sans-serif", letterSpacing: "-0.3px" }}>{data.item_name || "—"}</div>
            <div style={{ fontSize: 12, color: "#6366f1", marginTop: 2 }}>{data.category || "No category"} {data.brand ? `· ${data.brand}` : ""} {data.color ? `· ${data.color}` : ""}</div>
          </div>
          {data.urgent && (
            <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 5, fontSize: 10, fontWeight: 700, color: "#f87171", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", padding: "3px 9px", borderRadius: 20 }}>
              <Zap size={9} />URGENT
            </span>
          )}
        </div>
      </div>

      {/* Fields review */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 10 }}>
        {[
          { icon: MapPin,   label: "Location",    value: [data.location, data.location_detail].filter(Boolean).join(", ") || "—" },
          { icon: Calendar, label: "Date Lost",   value: data.date_event ? new Date(data.date_event).toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"}) : "—" },
          { icon: Clock,    label: "Time",        value: data.time_event || "Not specified" },
          { icon: Image,    label: "Photos",      value: `${data.images.length} image${data.images.length !== 1 ? "s" : ""} attached` },
          { icon: DollarSign,label:"Reward",      value: data.reward || "None" },
          { icon: Phone,    label: "Contact",     value: data.contact_phone || "Not provided" },
        ].map((r, i) => (
          <div key={i} style={{ padding: "10px 12px", borderRadius: 10, background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
              <r.icon size={11} color="#4b5563" />
              <span style={{ fontSize: 10, color: "#4b5563", textTransform: "uppercase", letterSpacing: 1, fontWeight: 600 }}>{r.label}</span>
            </div>
            <div style={{ fontSize: 12, color: "#c4c9e2", wordBreak: "break-word" }}>{r.value}</div>
          </div>
        ))}
      </div>

      {/* Description preview */}
      {data.description && (
        <div style={{ padding: "12px 14px", borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ fontSize: 10, color: "#4b5563", textTransform: "uppercase", letterSpacing: 1.2, fontWeight: 700, marginBottom: 6 }}>Description</div>
          <p style={{ fontSize: 13, color: "#8b92b8", lineHeight: 1.65, margin: 0 }}>{data.description}</p>
        </div>
      )}

      {/* Consent */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "12px 14px", borderRadius: 12, background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.2)" }}>
        <CheckCircle size={14} color="#818cf8" style={{ flexShrink: 0, marginTop: 1 }} />
        <p style={{ fontSize: 12, color: "#a5b4fc", lineHeight: 1.65, margin: 0 }}>
          By submitting, you confirm all information is accurate and agree to Findify's terms. Your report will be reviewed and published within 24 hours.
        </p>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SUCCESS SCREEN
// ─────────────────────────────────────────────────────────────────────────────
function SuccessScreen({ onNew, isMobile }: { onNew: () => void; isMobile: boolean }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      style={{ textAlign: "center", padding: isMobile ? "10px 0 4px" : "20px 0 10px", display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
      {/* Animated ring */}
      <div style={{ position: "relative", marginBottom: 28 }}>
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 12, stiffness: 160 }}
          style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <CheckCircle size={36} color="#818cf8" />
        </motion.div>
        {[0,1,2].map(i => (
          <motion.div key={i}
            initial={{ scale: 1, opacity: 0.3 - i * 0.08 }} animate={{ scale: 1.7 + i * 0.45, opacity: 0 }}
            transition={{ duration: 1.4, delay: i * 0.3, repeat: Infinity, ease: "easeOut" }}
            style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "1px solid rgba(99,102,241,0.35)" }} />
        ))}
      </div>

      <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.5px", fontFamily: "'Syne',sans-serif", color: "#fff", marginBottom: 10 }}>
        Report Submitted!
      </div>
      <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.7, maxWidth: 320, margin: "0 auto 28px" }}>
        Your lost item report is now under review. We'll notify you once it's published and if a match is found.
      </p>

      {/* CTA buttons */}
      <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: 10, width: isMobile ? "100%" : "auto", alignItems: "center" }}>
        <motion.a href="/user-reports" whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
          style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "11px 20px", borderRadius: 12, background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.28)", fontSize: 13, fontWeight: 600, color: "#a5b4fc", textDecoration: "none", cursor: "pointer", width: isMobile ? "100%" : "auto" }}>
          <Eye size={14} />View My Reports
        </motion.a>
        <motion.button onClick={onNew} whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
          style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "11px 20px", borderRadius: 12, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", border: "none", fontSize: 13, fontWeight: 600, color: "#fff", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", width: isMobile ? "100%" : "auto" }}>
          <Send size={14} />Report Another Item
        </motion.button>
      </div>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function ReportLost() {
  // ── Store ──────────────────────────────────────────────────────────────────
  const { submitting, submitError, submitSuccess, submitReport, resetSubmit } = useReportStore()

  // ── Responsive ────────────────────────────────────────────────────────────
  const isMobile = useIsMobile(600)

  // ── Local UI state ─────────────────────────────────────────────────────────
  const [step,   setStep]   = useState(1)
  const [data,   setData]   = useState<FormData>(INITIAL)
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})
  const [dir,    setDir]    = useState(1)   // slide animation direction

  const TOTAL_STEPS = 5  // 4 form steps + review

  // Watch store success → switch to done screen
  const done = submitSuccess

  // Reset store state when component unmounts so re-visiting the page starts fresh
  useEffect(() => {
    resetSubmit()
    return () => { resetSubmit() }
  }, [])

  function set(k: keyof FormData, v: any) {
    setData(p => ({ ...p, [k]: v }))
    if (errors[k]) setErrors(p => { const n = { ...p }; delete n[k]; return n })
  }

  // ── Validation per step ────────────────────────────────────────────────────
  function validate(s: number): boolean {
    const e: Partial<Record<keyof FormData, string>> = {}
    if (s === 1) {
      if (!data.item_name.trim()) e.item_name = "Item name is required"
      if (!data.category)         e.category  = "Please select a category"
    }
    if (s === 2) {
      if (!data.location.trim()) e.location = "Location is required"
      if (!data.date_event)      e.date_event = "Date is required"
    }
    if (s === 3) {
      if (!data.description.trim() || data.description.trim().length < 20)
        e.description = "Please provide at least 20 characters"
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function goNext() {
    if (!validate(step)) return
    setDir(1)
    setStep(s => s + 1)
  }

  function goBack() {
    setDir(-1)
    setStep(s => s - 1)
  }

  async function handleSubmit() {
    await submitReport({
      item_name:               data.item_name,
      category:                data.category as Category,
      location:                data.location,
      report_type:             "lost",
      date_event:              data.date_event,
      description:             data.description,
      location_detail:         data.location_detail   || undefined,
      time_event:              data.time_event         || undefined,
      brand:                   data.brand             || undefined,
      color:                   data.color             || undefined,
      distinguishing_features: data.distinguishing    || undefined,
      reward:                  data.reward            || undefined,
      contact_phone:           data.contact_phone     || undefined,
      is_urgent:               data.urgent,
      images:                  data.images.length > 0 ? data.images : undefined,
    })
  }

  function reset() {
    setData(INITIAL)
    setErrors({})
    setStep(1)
    setDir(1)
    resetSubmit()
  }

  const stepContent = [
    <StepItemInfo  key={1} data={data} set={set} errors={errors} isMobile={isMobile} />,
    <StepLocation  key={2} data={data} set={set} errors={errors} isMobile={isMobile} />,
    <StepDetails   key={3} data={data} set={set} errors={errors} isMobile={isMobile} />,
    <StepImages    key={4} data={data} set={set} />,
    <StepReview    key={5} data={data} isMobile={isMobile} />,
  ]

  const stepTitles = [
    "What did you lose?",
    "Where & when?",
    "Describe the item",
    "Add photos",
    "Review & submit",
  ]
  const stepSubs = [
    "Tell us about the item so we can help find it",
    "Location and time help narrow down the search",
    "More details = better matches",
    "Photos dramatically improve recovery chances",
    "Double-check everything before submitting",
  ]

  return (
    <div style={{ minHeight: "100vh", background: "#06060f", color: "white", fontFamily: "'DM Sans',sans-serif", padding: isMobile ? "0 0 40px" : "0 0 48px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        .syne { font-family: 'Syne', sans-serif; }
        .rl-input {
          width: 100%; box-sizing: border-box;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          padding: 11px 14px;
          font-size: 13px; color: white;
          font-family: 'DM Sans', sans-serif;
          outline: none; transition: all 0.2s;
          -webkit-text-fill-color: white;
        }
        .rl-input::placeholder { color: rgba(255,255,255,0.22); -webkit-text-fill-color: rgba(255,255,255,0.22); }
        .rl-input:focus { border-color: rgba(99,102,241,0.6); background: rgba(255,255,255,0.06); box-shadow: 0 0 0 3px rgba(99,102,241,0.12); }
        .rl-input.rl-error { border-color: rgba(239,68,68,0.5) !important; box-shadow: 0 0 0 3px rgba(239,68,68,0.09) !important; }
        .rl-input:-webkit-autofill { -webkit-box-shadow: 0 0 0 40px rgba(255,255,255,0.04) inset !important; -webkit-text-fill-color: white !important; }
        textarea.rl-input { resize: vertical; min-height: 80px; line-height: 1.6; }
        input[type="date"].rl-input, input[type="time"].rl-input { color-scheme: dark; }
        .rl-err-msg { display: flex; align-items: center; gap: 6px; font-size: 11px; color: #f87171; margin-top: 6px; }
      `}</style>

      <div style={{ width: "100%" }}>

        {/* ── Page header ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 16px rgba(99,102,241,0.3)", flexShrink: 0 }}>
            <PackageSearch size={18} color="white" />
          </div>
          <div>
            <h1 className="syne" style={{ fontSize: isMobile ? 18 : 22, fontWeight: 800, letterSpacing: "-0.5px", color: "#fff", margin: 0 }}>Report Lost Item</h1>
            <p style={{ fontSize: 12, color: "#4b5563", margin: 0 }}>Help us help you find what you've lost</p>
          </div>
        </div>

        {/* ── Step progress bar ── */}
        {!done && (
          <div style={{ marginBottom: 28 }}>
            {/* Step dots + line */}
            <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
              {STEPS.map((s, i) => {
                const done_s = step > s.id
                const active = step === s.id || (step === 5 && s.id === 4)
                return (
                  <div key={s.id} style={{ display: "flex", alignItems: "center", flex: i < STEPS.length - 1 ? 1 : "none" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                      <motion.div
                        animate={{
                          background: done_s ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : active ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "rgba(255,255,255,0.06)",
                          borderColor: done_s ? "rgba(99,102,241,0.5)" : active ? "rgba(99,102,241,0.6)" : "rgba(255,255,255,0.1)",
                          boxShadow: active ? "0 0 16px rgba(99,102,241,0.35)" : "none",
                        }}
                        style={{ width: isMobile ? 28 : 32, height: isMobile ? 28 : 32, borderRadius: "50%", border: "1px solid", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.3s" }}>
                        {done_s
                          ? <CheckCircle size={14} color="white" />
                          : <s.icon size={13} color={active ? "white" : "#374151"} />}
                      </motion.div>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div style={{ flex: 1, height: 2, margin: "0 4px", borderRadius: 1, background: done_s ? "linear-gradient(90deg,#6366f1,rgba(99,102,241,0.3))" : "rgba(255,255,255,0.07)", transition: "all 0.4s" }} />
                    )}
                  </div>
                )
              })}
            </div>
            {/* Step labels */}
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              {STEPS.map(s => (
                <div key={s.id} style={{ fontSize: 9, fontWeight: 600, color: step === s.id ? "#a5b4fc" : step > s.id ? "#818cf8" : "#374151", textTransform: "uppercase", letterSpacing: 0.8, textAlign: "center", flex: 1 }}>
                  {s.label}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Form card ── */}
        <motion.div
          layout
          style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, overflow: "hidden" }}>

          {done ? (
            <div style={{ padding: isMobile ? "24px 18px" : "36px 28px" }}>
              <SuccessScreen onNew={reset} isMobile={isMobile} />
            </div>
          ) : (
            <>
              {/* Card header */}
              <div style={{ padding: isMobile ? "16px 18px 14px" : "22px 26px 18px", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.01)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontSize: isMobile ? 14 : 18, fontWeight: 800, color: "#fff", fontFamily: "'Syne',sans-serif", letterSpacing: "-0.3px", marginBottom: 2 }}>
                      {stepTitles[step - 1]}
                    </div>
                    <div style={{ fontSize: 12, color: "#4b5563" }}>{stepSubs[step - 1]}</div>
                  </div>
                  <div style={{ fontSize: 11, color: "#374151", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "4px 10px", flexShrink: 0 }}>
                    {step} / {TOTAL_STEPS}
                  </div>
                </div>

                {/* Progress fill bar */}
                <div style={{ marginTop: 14, height: 3, borderRadius: 2, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                  <motion.div
                    animate={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
                    transition={{ type: "spring", damping: 22, stiffness: 180 }}
                    style={{ height: "100%", borderRadius: 2, background: "linear-gradient(90deg,#6366f1,#8b5cf6)" }}
                  />
                </div>
              </div>

              {/* Step content — animated */}
              <div style={{ padding: isMobile ? "18px 16px" : "24px 26px", minHeight: 300, overflow: "hidden" }}>
                <AnimatePresence mode="wait" custom={dir}>
                  <motion.div
                    key={step}
                    custom={dir}
                    initial={{ opacity: 0, x: dir * 28 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: dir * -28 }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                  >
                    {stepContent[step - 1]}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Footer navigation */}
              <div style={{ padding: isMobile ? "14px 16px 18px" : "16px 26px 22px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                {/* Submit error banner — only on review step */}
                <AnimatePresence>
                  {step === TOTAL_STEPS && submitError && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                      animate={{ opacity: 1, height: "auto", marginBottom: 12 }}
                      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                      style={{ overflow: "hidden" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "11px 14px", borderRadius: 10, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)" }}>
                        <AlertTriangle size={14} color="#f87171" style={{ flexShrink: 0, marginTop: 1 }} />
                        <span style={{ fontSize: 12, color: "#f87171", lineHeight: 1.5 }}>{submitError}</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                {/* Back */}
                {step > 1 ? (
                  <motion.button whileHover={{ x: -2 }} whileTap={{ scale: 0.97 }} onClick={goBack}
                    style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 16px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.55)", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
                    <ChevronLeft size={14} />{!isMobile && "Back"}
                  </motion.button>
                ) : (
                  <div />
                )}

                {/* Next / Submit */}
                {step < TOTAL_STEPS ? (
                  <motion.button whileHover={{ y: -1, boxShadow: "0 8px 24px rgba(99,102,241,0.3)" }} whileTap={{ scale: 0.97 }} onClick={goNext}
                    style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 22px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", fontSize: 13, fontWeight: 700, color: "#fff", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", boxShadow: "0 4px 16px rgba(99,102,241,0.2)" }}>
                    {step === 4 ? (isMobile ? "Review" : "Review Report") : "Continue"}
                    <ChevronRight size={14} />
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={!submitting ? { y: -1, boxShadow: "0 8px 24px rgba(99,102,241,0.35)" } : {}}
                    whileTap={!submitting ? { scale: 0.97 } : {}}
                    onClick={handleSubmit}
                    disabled={submitting}
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "10px 24px", borderRadius: 10, border: "none", background: submitting ? "rgba(255,255,255,0.08)" : "linear-gradient(135deg,#6366f1,#8b5cf6)", fontSize: 13, fontWeight: 700, color: submitting ? "rgba(255,255,255,0.3)" : "#fff", cursor: submitting ? "not-allowed" : "pointer", fontFamily: "'DM Sans',sans-serif", transition: "all 0.25s", boxShadow: "0 4px 16px rgba(99,102,241,0.2)", flex: isMobile ? 1 : "none" }}>
                    {submitting ? (
                      <>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: "rl-spin 0.8s linear infinite" }}>
                          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                        </svg>
                        Submitting…
                      </>
                    ) : (
                      <><Send size={14} />Submit Report</>
                    )}
                  </motion.button>
                )}
                </div>
              </div>
            </>
          )}
        </motion.div>

        {/* Safe-to-submit note */}
        {!done && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 14 }}>
            <CheckCircle size={11} color="#374151" />
            <span style={{ fontSize: 11, color: "#374151" }}>Your data is kept private and only shared with admins</span>
          </div>
        )}
      </div>

      <style>{`@keyframes rl-spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </div>
  )
}