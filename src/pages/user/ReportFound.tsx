import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  PackageSearch, ChevronRight, ChevronLeft, CheckCircle,
  MapPin, Calendar, Tag, FileText, Upload, X, AlertTriangle,
  Zap, Package, Hash, Flag, Layers, TrendingUp, Image,
  Clock, Phone, Info, Eye, Send, Sparkles, Home, Star,
} from "lucide-react"
import { useReportStore } from "@/store/reportStore"
import type { ReportCategory } from "@/types/reportTypes"

// ─────────────────────────────────────────────────────────────────────────────
// TYPES & CONFIG
// ─────────────────────────────────────────────────────────────────────────────
type Category = ReportCategory

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
  // Step 2 — Where & when found
  location:        string
  location_detail: string
  date_found:      string
  time_found:      string
  found_stored_at: string   // where the item is being kept now
  // Step 3 — Description & extras
  description:     string
  distinguishing:  string
  contact_phone:   string
  // Step 4 — Images
  images: File[]
}

const INITIAL: FormData = {
  item_name: "", category: "", brand: "", color: "",
  location: "", location_detail: "", date_found: "", time_found: "", found_stored_at: "",
  description: "", distinguishing: "", contact_phone: "",
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
  { id: 1, label: "Item Info",  icon: Tag      },
  { id: 2, label: "Location",   icon: MapPin   },
  { id: 3, label: "Details",    icon: FileText },
  { id: 4, label: "Photos",     icon: Image    },
]

const COLORS = ["Black","White","Gray","Red","Orange","Yellow","Green","Blue","Purple","Pink","Brown","Gold","Silver","Multicolor"]

// Teal/green accent for found flow
const ACCENT   = "#10b981"
const ACCENT2  = "#059669"
const ACCENT_L = "rgba(16,185,129,"

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
// STEP 1 — Item Info
// ─────────────────────────────────────────────────────────────────────────────
function StepItemInfo({ data, set, errors, isMobile }: {
  data: FormData; set: (k: keyof FormData, v: any) => void
  errors: Partial<Record<keyof FormData, string>>; isMobile: boolean
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      {/* Item name */}
      <div>
        <FieldLabel required>What did you find?</FieldLabel>
        <div style={{ position: "relative" }}>
          <PackageSearch size={14} color="#4b5563" style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
          <input
            className={`rf-input${errors.item_name ? " rf-error" : ""}`}
            style={{ paddingLeft: 38 }}
            placeholder="e.g. iPhone 15 Pro Max, Brown Leather Wallet"
            value={data.item_name}
            onChange={e => set("item_name", e.target.value)}
            maxLength={100}
          />
        </div>
        {errors.item_name && <div className="rf-err-msg"><AlertTriangle size={11} />{errors.item_name}</div>}
        <FieldHint>Be specific — mention brand/model if visible</FieldHint>
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
                style={{ padding: "11px 10px", borderRadius: 12, border: `1px solid ${selected ? `${ACCENT_L}0.5)` : "rgba(255,255,255,0.07)"}`, background: selected ? `${ACCENT_L}0.1)` : "rgba(255,255,255,0.02)", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, transition: "all 0.18s", boxShadow: selected ? `0 0 12px ${ACCENT_L}0.18)` : "none" }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: selected ? `${ACCENT_L}0.2)` : "rgba(255,255,255,0.05)", border: `1px solid ${selected ? `${ACCENT_L}0.4)` : "rgba(255,255,255,0.08)"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <c.icon size={15} color={selected ? ACCENT : "#4b5563"} />
                </div>
                <span style={{ fontSize: 11, fontWeight: selected ? 700 : 500, color: selected ? "#fff" : "#6b7280", whiteSpace: "nowrap" }}>{c.value}</span>
                {!isMobile && <span style={{ fontSize: 10, color: selected ? `${ACCENT_L}0.8)` : "#374151" }}>{c.desc}</span>}
              </motion.button>
            )
          })}
        </div>
        {errors.category && <div className="rf-err-msg"><AlertTriangle size={11} />{errors.category}</div>}
      </div>

      {/* Brand + Color row */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 14 }}>
        <div>
          <FieldLabel>Brand / Make</FieldLabel>
          <input className="rf-input" placeholder="e.g. Apple, Samsung, Nike"
            value={data.brand} onChange={e => set("brand", e.target.value)} maxLength={80} />
          <FieldHint>Optional — leave blank if unknown</FieldHint>
        </div>
        <div>
          <FieldLabel>Color</FieldLabel>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {COLORS.map(c => (
              <motion.button key={c} type="button" whileTap={{ scale: 0.93 }}
                onClick={() => set("color", data.color === c ? "" : c)}
                style={{ padding: "5px 12px", borderRadius: 20, fontSize: 11, fontWeight: 500, border: `1px solid ${data.color === c ? `${ACCENT_L}0.5)` : "rgba(255,255,255,0.1)"}`, background: data.color === c ? `${ACCENT_L}0.12)` : "rgba(255,255,255,0.03)", color: data.color === c ? "#fff" : "#6b7280", cursor: "pointer", transition: "all 0.15s" }}>
                {c}
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 2 — Where & When Found
// ─────────────────────────────────────────────────────────────────────────────
function StepLocation({ data, set, errors, isMobile }: {
  data: FormData; set: (k: keyof FormData, v: any) => void
  errors: Partial<Record<keyof FormData, string>>; isMobile: boolean
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Where found */}
      <div>
        <FieldLabel required>Where did you find it?</FieldLabel>
        <div style={{ position: "relative" }}>
          <MapPin size={14} color="#4b5563" style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
          <input className={`rf-input${errors.location ? " rf-error" : ""}`}
            style={{ paddingLeft: 38 }}
            placeholder="e.g. SM City Davao, Parking Level 2"
            value={data.location}
            onChange={e => set("location", e.target.value)}
            maxLength={200}
          />
        </div>
        {errors.location && <div className="rf-err-msg"><AlertTriangle size={11} />{errors.location}</div>}
        <FieldHint>General area or landmark — helps the owner recognize the spot</FieldHint>
      </div>

      {/* Specific spot */}
      <div>
        <FieldLabel>Specific Spot</FieldLabel>
        <input className="rf-input"
          placeholder="e.g. Near fountain, bench by entrance, left on table"
          value={data.location_detail}
          onChange={e => set("location_detail", e.target.value)}
          maxLength={200}
        />
        <FieldHint>Optional — a more precise location if you remember</FieldHint>
      </div>

      {/* Date + time */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 14 }}>
        <div>
          <FieldLabel required>Date Found</FieldLabel>
          <div style={{ position: "relative" }}>
            <Calendar size={14} color="#4b5563" style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
            <input type="date" className={`rf-input${errors.date_found ? " rf-error" : ""}`}
              style={{ paddingLeft: 38 }}
              max={new Date().toISOString().split("T")[0]}
              value={data.date_found}
              onChange={e => set("date_found", e.target.value)}
            />
          </div>
          {errors.date_found && <div className="rf-err-msg"><AlertTriangle size={11} />{errors.date_found}</div>}
        </div>
        <div>
          <FieldLabel>Approximate Time</FieldLabel>
          <div style={{ position: "relative" }}>
            <Clock size={14} color="#4b5563" style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
            <input type="time" className="rf-input"
              style={{ paddingLeft: 38 }}
              value={data.time_found}
              onChange={e => set("time_found", e.target.value)}
            />
          </div>
          <FieldHint>Optional — your best estimate</FieldHint>
        </div>
      </div>

      {/* Where stored now */}
      <div>
        <FieldLabel required>Where is the item now?</FieldLabel>
        <div style={{ position: "relative" }}>
          <Home size={14} color="#4b5563" style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
          <input className={`rf-input${errors.found_stored_at ? " rf-error" : ""}`}
            style={{ paddingLeft: 38 }}
            placeholder="e.g. Kept at home, Turned in to security desk, With me"
            value={data.found_stored_at}
            onChange={e => set("found_stored_at", e.target.value)}
            maxLength={200}
          />
        </div>
        {errors.found_stored_at && <div className="rf-err-msg"><AlertTriangle size={11} />{errors.found_stored_at}</div>}
        <FieldHint>Important — helps the owner know how to retrieve their item</FieldHint>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 3 — Description & Contact
// ─────────────────────────────────────────────────────────────────────────────
function StepDetails({ data, set, errors, isMobile: _isMobile }: {
  data: FormData; set: (k: keyof FormData, v: any) => void
  errors: Partial<Record<keyof FormData, string>>; isMobile: boolean
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Description */}
      <div>
        <FieldLabel required>Description</FieldLabel>
        <div style={{ position: "relative" }}>
          <textarea className={`rf-input${errors.description ? " rf-error" : ""}`}
            rows={4}
            placeholder="Describe the item in detail — condition, contents, any visible damage or wear…"
            value={data.description}
            onChange={e => set("description", e.target.value)}
          />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
          {errors.description
            ? <div className="rf-err-msg"><AlertTriangle size={11} />{errors.description}</div>
            : <FieldHint>Minimum 20 characters — be as detailed as possible</FieldHint>}
          <span style={{ fontSize: 11, color: data.description.length < 20 ? "#f87171" : "#374151" }}>
            {data.description.length}/20
          </span>
        </div>
      </div>

      {/* Distinguishing features */}
      <div>
        <FieldLabel>Distinguishing Features</FieldLabel>
        <div style={{ padding: "10px 13px", marginBottom: 8, borderRadius: 10, background: `${ACCENT_L}0.06)`, border: `1px solid ${ACCENT_L}0.15)`, display: "flex", alignItems: "flex-start", gap: 8 }}>
          <Star size={13} color={ACCENT} style={{ flexShrink: 0, marginTop: 1 }} />
          <span style={{ fontSize: 12, color: `${ACCENT_L}0.85)`, lineHeight: 1.5 }}>
            Unique marks help verify the owner's identity — stickers, engravings, scratches, initials, serial numbers.
          </span>
        </div>
        <textarea className="rf-input" rows={3}
          placeholder="e.g. Cracked screen protector, sticker on back, initials 'JM' engraved…"
          value={data.distinguishing}
          onChange={e => set("distinguishing", e.target.value)}
        />
      </div>

      {/* Contact */}
      <div>
        <FieldLabel>Your Contact Number</FieldLabel>
        <div style={{ position: "relative" }}>
          <Phone size={14} color="#4b5563" style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
          <input className="rf-input" style={{ paddingLeft: 38 }}
            placeholder="e.g. +63 912 345 6789"
            value={data.contact_phone}
            onChange={e => set("contact_phone", e.target.value)}
            maxLength={30}
          />
        </div>
        <FieldHint>Optional — admin or owner may need to reach you directly</FieldHint>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 4 — Images
// ─────────────────────────────────────────────────────────────────────────────
function StepImages({ data, set }: { data: FormData; set: (k: keyof FormData, v: any) => void }) {
  const inputRef = React.useRef<HTMLInputElement>(null)

  function addFiles(files: FileList | null) {
    if (!files) return
    const next = [...data.images, ...Array.from(files)].slice(0, 5)
    set("images", next)
  }

  function removeFile(i: number) {
    set("images", data.images.filter((_, idx) => idx !== i))
  }

  const previews = data.images.map(f => URL.createObjectURL(f))

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {/* Upload banner */}
      <div style={{ padding: "12px 14px", borderRadius: 12, background: `${ACCENT_L}0.06)`, border: `1px solid ${ACCENT_L}0.15)`, display: "flex", alignItems: "flex-start", gap: 10 }}>
        <Image size={15} color={ACCENT} style={{ flexShrink: 0, marginTop: 1 }} />
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", marginBottom: 3 }}>Photos help verify ownership</div>
          <div style={{ fontSize: 12, color: "#4b5563", lineHeight: 1.5 }}>Upload up to 5 photos — clear images of the item from different angles. The first photo will be used as the main thumbnail.</div>
        </div>
      </div>

      {/* Drop zone */}
      <motion.div whileHover={{ borderColor: `${ACCENT_L}0.4)`, background: `${ACCENT_L}0.04)` }}
        onClick={() => inputRef.current?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); addFiles(e.dataTransfer.files) }}
        style={{ border: `2px dashed ${ACCENT_L}0.2)`, borderRadius: 14, padding: "28px 20px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, cursor: "pointer", transition: "all 0.2s", background: "rgba(255,255,255,0.01)" }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: `${ACCENT_L}0.1)`, border: `1px solid ${ACCENT_L}0.2)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Upload size={20} color={ACCENT} />
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", marginBottom: 3 }}>Click to upload or drag & drop</div>
          <div style={{ fontSize: 11, color: "#4b5563" }}>PNG, JPG, HEIC — max 5 photos</div>
        </div>
        <input ref={inputRef} type="file" multiple accept="image/*" style={{ display: "none" }}
          onChange={e => addFiles(e.target.files)} />
      </motion.div>

      {/* Thumbnails */}
      {data.images.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 8 }}>
          {previews.map((src, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
              style={{ position: "relative", aspectRatio: "1", borderRadius: 10, overflow: "hidden", border: i === 0 ? `2px solid ${ACCENT}` : "1px solid rgba(255,255,255,0.1)" }}>
              <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              {i === 0 && (
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: `${ACCENT_L}0.85)`, padding: "3px 0", textAlign: "center", fontSize: 9, fontWeight: 700, color: "#fff", letterSpacing: 0.5 }}>MAIN</div>
              )}
              <button onClick={e => { e.stopPropagation(); removeFile(i) }}
                style={{ position: "absolute", top: 4, right: 4, width: 20, height: 20, borderRadius: "50%", background: "rgba(0,0,0,0.7)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <X size={10} color="white" />
              </button>
            </motion.div>
          ))}
          {data.images.length < 5 && (
            <motion.div whileHover={{ borderColor: `${ACCENT_L}0.4)` }}
              onClick={() => inputRef.current?.click()}
              style={{ borderRadius: 10, border: "2px dashed rgba(255,255,255,0.08)", aspectRatio: "1", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, cursor: "pointer", transition: "all 0.2s" }}>
              <Upload size={14} color="#374151" />
              <span style={{ fontSize: 9, color: "#374151", fontWeight: 600 }}>ADD</span>
            </motion.div>
          )}
        </div>
      )}

      {data.images.length === 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "center" }}>
          <Eye size={12} color="#374151" />
          <span style={{ fontSize: 11, color: "#374151" }}>No photos yet — you can still submit without them</span>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// REVIEW STEP
// ─────────────────────────────────────────────────────────────────────────────
function StepReview({ data, isMobile }: { data: FormData; isMobile: boolean }) {
  const catObj = CATEGORIES.find(c => c.value === data.category)
  const CatIcon = catObj?.icon ?? Tag

  const rows: { label: string; value: string | null; accent?: boolean }[] = [
    { label: "Item",          value: data.item_name },
    { label: "Category",      value: data.category || null },
    { label: "Brand",         value: data.brand    || null },
    { label: "Color",         value: data.color    || null },
    { label: "Found At",      value: data.location },
    { label: "Specific Spot", value: data.location_detail || null },
    { label: "Date Found",    value: data.date_found    || null },
    { label: "Time Found",    value: data.time_found    || null },
    { label: "Stored At",     value: data.found_stored_at },
    { label: "Contact",       value: data.contact_phone || null },
    { label: "Photos",        value: data.images.length > 0 ? `${data.images.length} photo(s) attached` : "No photos" },
  ]

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {/* Identity card */}
      <div style={{ padding: "16px 18px", borderRadius: 14, background: `${ACCENT_L}0.06)`, border: `1px solid ${ACCENT_L}0.2)` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: `${ACCENT_L}0.15)`, border: `1px solid ${ACCENT_L}0.3)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <CatIcon size={20} color={ACCENT} />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>{data.item_name || "—"}</div>
            <div style={{ fontSize: 12, color: `${ACCENT_L}0.8)`, marginTop: 2 }}>{data.category || "No category"}</div>
          </div>
        </div>
      </div>

      {/* Field summary */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {rows.map(r => r.value && (
          <div key={r.label} style={{ display: "flex", gap: 12, padding: "8px 12px", borderRadius: 9, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#4b5563", textTransform: "uppercase", letterSpacing: 1, minWidth: isMobile ? 72 : 96, flexShrink: 0 }}>{r.label}</span>
            <span style={{ fontSize: 12, color: "#9ca3af", flex: 1 }}>{r.value}</span>
          </div>
        ))}
      </div>

      {/* Description preview */}
      {data.description && (
        <div style={{ padding: "12px 14px", borderRadius: 12, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#4b5563", textTransform: "uppercase", letterSpacing: 1.3, marginBottom: 6 }}>Description</div>
          <p style={{ fontSize: 12, color: "#9ca3af", lineHeight: 1.7, margin: 0 }}>{data.description}</p>
        </div>
      )}

      {/* Distinguishing */}
      {data.distinguishing && (
        <div style={{ padding: "12px 14px", borderRadius: 12, background: `${ACCENT_L}0.04)`, border: `1px solid ${ACCENT_L}0.15)` }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: `${ACCENT_L}0.7)`, textTransform: "uppercase", letterSpacing: 1.3, marginBottom: 6 }}>Distinguishing Features</div>
          <p style={{ fontSize: 12, color: "#9ca3af", lineHeight: 1.7, margin: 0 }}>{data.distinguishing}</p>
        </div>
      )}

      {/* Stored at callout */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "12px 14px", borderRadius: 12, background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.18)" }}>
        <Home size={14} color="#34d399" style={{ flexShrink: 0, marginTop: 1 }} />
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#34d399", marginBottom: 2 }}>Item currently at:</div>
          <div style={{ fontSize: 12, color: "#9ca3af" }}>{data.found_stored_at || "Not specified"}</div>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SUCCESS SCREEN
// ─────────────────────────────────────────────────────────────────────────────
function SuccessScreen({ onNew, isMobile }: { onNew: () => void; isMobile: boolean }) {
  return (
    <div style={{ textAlign: "center", padding: isMobile ? "10px 0 4px" : "20px 0 10px", display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", damping: 14, stiffness: 200, delay: 0.1 }}
        style={{ width: 80, height: 80, borderRadius: "50%", background: `${ACCENT_L}0.1)`, border: `1px solid ${ACCENT_L}0.3)`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 22 }}>
        <CheckCircle size={36} color={ACCENT} />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}>
        <h2 className="syne" style={{ fontSize: isMobile ? 20 : 24, fontWeight: 800, color: "#fff", margin: "0 0 8px", letterSpacing: "-0.5px" }}>
          Found Report Submitted!
        </h2>
        <p style={{ fontSize: 13, color: "#6b7280", maxWidth: 380, margin: "0 auto 28px", lineHeight: 1.7 }}>
          Thank you for being a good samaritan! Our team will review your report and try to find the owner. You'll be notified once there's a match.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.34 }}
        style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: 10, width: isMobile ? "100%" : "auto", alignItems: "center" }}>
        <a href="/user-my-reports"
          style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "11px 20px", borderRadius: 12, background: `${ACCENT_L}0.12)`, border: `1px solid ${ACCENT_L}0.28)`, fontSize: 13, fontWeight: 600, color: "#6ee7b7", textDecoration: "none", cursor: "pointer", width: isMobile ? "100%" : "auto" }}>
          <Eye size={14} />View My Reports
        </a>
        <button onClick={onNew}
          style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "11px 20px", borderRadius: 12, background: `linear-gradient(135deg,${ACCENT},${ACCENT2})`, border: "none", fontSize: 13, fontWeight: 600, color: "#fff", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", width: isMobile ? "100%" : "auto" }}>
          <PackageSearch size={14} />Report Another Found Item
        </button>
      </motion.div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function ReportFound() {
  const { submitting, submitError, submitSuccess, submitReport, resetSubmit } = useReportStore()

  const isMobile = useIsMobile(600)

  const [step,   setStep]   = useState(1)
  const [data,   setData]   = useState<FormData>(INITIAL)
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({}
  )
  const [dir,    setDir]    = useState(1)

  const TOTAL_STEPS = 5

  const done = submitSuccess

  useEffect(() => {
    resetSubmit()
    return () => { resetSubmit() }
  }, [])

  function set(k: keyof FormData, v: any) {
    setData(p => ({ ...p, [k]: v }))
    if (errors[k]) setErrors(p => { const n = { ...p }; delete n[k]; return n })
  }

  function validate(s: number): boolean {
    const e: Partial<Record<keyof FormData, string>> = {}
    if (s === 1) {
      if (!data.item_name.trim()) e.item_name = "Item name is required"
      if (!data.category)         e.category  = "Please select a category"
    }
    if (s === 2) {
      if (!data.location.trim())       e.location       = "Location is required"
      if (!data.date_found)            e.date_found     = "Date found is required"
      if (!data.found_stored_at.trim()) e.found_stored_at = "Please tell us where the item is now"
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
      report_type:             "found",
      item_name:               data.item_name,
      category:                data.category as Category,
      location:                data.location,
      date_event:              data.date_found,
      description:             data.description,
      location_detail:         data.location_detail    || undefined,
      time_event:              data.time_found          || undefined,
      brand:                   data.brand               || undefined,
      color:                   data.color               || undefined,
      distinguishing_features: data.distinguishing      || undefined,
      contact_phone:           data.contact_phone       || undefined,
      found_stored_at:         data.found_stored_at     || undefined,
      is_urgent:               false,
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
    <StepItemInfo key={1} data={data} set={set} errors={errors} isMobile={isMobile} />,
    <StepLocation key={2} data={data} set={set} errors={errors} isMobile={isMobile} />,
    <StepDetails  key={3} data={data} set={set} errors={errors} isMobile={isMobile} />,
    <StepImages   key={4} data={data} set={set} />,
    <StepReview   key={5} data={data} isMobile={isMobile} />,
  ]

  const stepTitles = [
    "What did you find?",
    "Where & when?",
    "Describe the item",
    "Add photos",
    "Review & submit",
  ]
  const stepSubs = [
    "Tell us about the item you found",
    "Location and date help match the owner",
    "More details = easier for the owner to verify",
    "Photos make verification much faster",
    "Double-check everything before submitting",
  ]

  return (
    <div style={{ minHeight: "100vh", background: "#06060f", color: "white", fontFamily: "'DM Sans',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        .syne { font-family: 'Syne', sans-serif; }
        .rf-input {
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
        .rf-input::placeholder { color: rgba(255,255,255,0.22); -webkit-text-fill-color: rgba(255,255,255,0.22); }
        .rf-input:focus { border-color: rgba(16,185,129,0.6); background: rgba(255,255,255,0.06); box-shadow: 0 0 0 3px rgba(16,185,129,0.12); }
        .rf-input.rf-error { border-color: rgba(239,68,68,0.5) !important; box-shadow: 0 0 0 3px rgba(239,68,68,0.09) !important; }
        .rf-input:-webkit-autofill { -webkit-box-shadow: 0 0 0 40px rgba(255,255,255,0.04) inset !important; -webkit-text-fill-color: white !important; }
        textarea.rf-input { resize: vertical; min-height: 80px; line-height: 1.6; }
        input[type="date"].rf-input, input[type="time"].rf-input { color-scheme: dark; }
        .rf-err-msg { display: flex; align-items: center; gap: 6px; font-size: 11px; color: #f87171; margin-top: 6px; }
        @keyframes rf-spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      `}</style>

      <div style={{ width: "100%" }}>

        {/* Page header */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: `linear-gradient(135deg,${ACCENT},${ACCENT2})`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 16px ${ACCENT_L}0.3)`, flexShrink: 0 }}>
            <PackageSearch size={18} color="white" />
          </div>
          <div>
            <h1 className="syne" style={{ fontSize: isMobile ? 18 : 22, fontWeight: 800, letterSpacing: "-0.5px", color: "#fff", margin: 0 }}>Report Found Item</h1>
            <p style={{ fontSize: 12, color: "#4b5563", margin: 0 }}>Help us reunite this item with its owner</p>
          </div>
        </div>

        {/* Stepper */}
        {!done && (
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
              {STEPS.map((s, i) => {
                const done_s = step > s.id
                const active = step === s.id || (step === 5 && s.id === 4)
                return (
                  <div key={s.id} style={{ display: "flex", alignItems: "center", flex: i < STEPS.length - 1 ? 1 : "none" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                      <motion.div
                        animate={{
                          background: done_s ? `linear-gradient(135deg,${ACCENT},${ACCENT2})` : active ? `linear-gradient(135deg,${ACCENT},${ACCENT2})` : "rgba(255,255,255,0.06)",
                          borderColor: done_s ? `${ACCENT_L}0.5)` : active ? `${ACCENT_L}0.6)` : "rgba(255,255,255,0.1)",
                          boxShadow: active ? `0 0 16px ${ACCENT_L}0.35)` : "none",
                        }}
                        style={{ width: isMobile ? 28 : 32, height: isMobile ? 28 : 32, borderRadius: "50%", border: "1px solid", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.3s" }}>
                        {done_s
                          ? <CheckCircle size={14} color="white" />
                          : <s.icon size={13} color={active ? "white" : "#374151"} />}
                      </motion.div>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div style={{ flex: 1, height: 2, margin: "0 4px", borderRadius: 1, background: done_s ? `linear-gradient(90deg,${ACCENT},${ACCENT_L}0.3))` : "rgba(255,255,255,0.07)", transition: "all 0.4s" }} />
                    )}
                  </div>
                )
              })}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              {STEPS.map(s => (
                <div key={s.id} style={{ fontSize: 9, fontWeight: 600, color: step === s.id ? "#6ee7b7" : step > s.id ? ACCENT : "#374151", textTransform: "uppercase", letterSpacing: 0.8, textAlign: "center", flex: 1 }}>
                  {s.label}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Form card */}
        <motion.div layout style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, overflow: "hidden" }}>

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

                {/* Progress bar — teal for found */}
                <div style={{ marginTop: 14, height: 3, borderRadius: 2, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                  <motion.div
                    animate={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
                    transition={{ type: "spring", damping: 22, stiffness: 180 }}
                    style={{ height: "100%", borderRadius: 2, background: `linear-gradient(90deg,${ACCENT},#6ee7b7)` }}
                  />
                </div>
              </div>

              {/* Step content */}
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
                  {step > 1 ? (
                    <motion.button whileHover={{ x: -2 }} whileTap={{ scale: 0.97 }} onClick={goBack}
                      style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 16px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.55)", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
                      <ChevronLeft size={14} />{!isMobile && "Back"}
                    </motion.button>
                  ) : <div />}

                  {step < TOTAL_STEPS ? (
                    <motion.button
                      whileHover={{ y: -1, boxShadow: `0 8px 24px ${ACCENT_L}0.3)` }}
                      whileTap={{ scale: 0.97 }}
                      onClick={goNext}
                      style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 22px", borderRadius: 10, border: "none", background: `linear-gradient(135deg,${ACCENT},${ACCENT2})`, fontSize: 13, fontWeight: 700, color: "#fff", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", boxShadow: `0 4px 16px ${ACCENT_L}0.2)` }}>
                      {step === 4 ? (isMobile ? "Review" : "Review Report") : "Continue"}
                      <ChevronRight size={14} />
                    </motion.button>
                  ) : (
                    <motion.button
                      whileHover={!submitting ? { y: -1, boxShadow: `0 8px 24px ${ACCENT_L}0.3)` } : {}}
                      whileTap={!submitting ? { scale: 0.97 } : {}}
                      onClick={handleSubmit}
                      disabled={submitting}
                      style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "10px 24px", borderRadius: 10, border: "none", background: submitting ? "rgba(255,255,255,0.08)" : `linear-gradient(135deg,${ACCENT},${ACCENT2})`, fontSize: 13, fontWeight: 700, color: submitting ? "rgba(255,255,255,0.3)" : "#fff", cursor: submitting ? "not-allowed" : "pointer", fontFamily: "'DM Sans',sans-serif", transition: "all 0.25s", boxShadow: `0 4px 16px ${ACCENT_L}0.2)`, flex: isMobile ? 1 : "none" }}>
                      {submitting ? (
                        <>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: "rf-spin 0.8s linear infinite" }}>
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

        {/* Footer note */}
        {!done && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 14 }}>
            <CheckCircle size={11} color="#374151" />
            <span style={{ fontSize: 11, color: "#374151" }}>Your contact info is only shared with admins during verification</span>
          </div>
        )}
      </div>
    </div>
  )
}