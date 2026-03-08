import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search, MapPin, Calendar, Tag, Package, Zap, Hash,
  Layers, FileText, Flag, TrendingUp, Sparkles, X,
  Eye, Clock, Filter, RefreshCw, CheckCircle,
  AlertTriangle, Inbox, Image as ImageIcon, Phone, Info,
} from "lucide-react"
import { useBrowseStore } from "@/store/browseStore"
import ClaimButton from "@/components/ClaimButton"
import type { FoundItemListItem, FoundItemDetail } from "@/types/browseTypes"
import type { ReportCategory } from "@/types/reportTypes"

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

function useDebounce<T>(val: T, ms = 400) {
  const [dv, setDv] = useState(val)
  useEffect(() => {
    const t = setTimeout(() => setDv(val), ms)
    return () => clearTimeout(t)
  }, [val, ms])
  return dv
}

// ─────────────────────────────────────────────────────────────────────────────
//  CONFIG
// ─────────────────────────────────────────────────────────────────────────────
const CATEGORIES: { value: ReportCategory; icon: React.ElementType }[] = [
  { value: "Electronics",    icon: Zap        },
  { value: "Wallets & Bags", icon: Package    },
  { value: "Keys",           icon: Hash       },
  { value: "Clothing",       icon: Layers     },
  { value: "Jewelry",        icon: Sparkles   },
  { value: "Documents",      icon: FileText   },
  { value: "Pets",           icon: Flag       },
  { value: "Sports",         icon: TrendingUp },
  { value: "Other",          icon: Tag        },
]

const CAT_ICON: Record<string, React.ElementType> = Object.fromEntries(
  CATEGORIES.map(c => [c.value, c.icon])
)

// ─────────────────────────────────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────────────────────────────────
function timeAgo(iso: string) {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (m < 1)    return "just now"
  if (m < 60)   return `${m}m ago`
  if (m < 1440) return `${Math.floor(m / 60)}h ago`
  return `${Math.floor(m / 1440)}d ago`
}
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
}
function fmtTime(t: string) {
  const [h, m] = t.split(":")
  const hr = parseInt(h)
  return `${hr % 12 || 12}:${m} ${hr >= 12 ? "PM" : "AM"}`
}

// ─────────────────────────────────────────────────────────────────────────────
//  CLAIM STATUS BADGE
// ─────────────────────────────────────────────────────────────────────────────
function ClaimBadge({ status }: { status: "pending" | "approved" }) {
  const cfg = status === "approved"
    ? { color: "#34d399", bg: "rgba(52,211,153,0.1)",  border: "rgba(52,211,153,0.25)", label: "Claim Approved", icon: CheckCircle }
    : { color: "#fbbf24", bg: "rgba(251,191,36,0.1)",  border: "rgba(251,191,36,0.25)", label: "Claim Pending",  icon: Clock }
  const Icon = cfg.icon
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 20, background: cfg.bg, border: `1px solid ${cfg.border}`, fontSize: 11, fontWeight: 700, color: cfg.color }}>
      <Icon size={10} />{cfg.label}
    </span>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  ITEM CARD
// ─────────────────────────────────────────────────────────────────────────────
function ItemCard({ item, onClick, index }: { item: FoundItemListItem; onClick: () => void; index: number }) {
  const CatIcon = CAT_ICON[item.category] ?? Tag
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      whileHover={{ y: -2, borderColor: "rgba(16,185,129,0.35)" }}
      onClick={onClick}
      style={{
        borderRadius: 16, cursor: "pointer",
        border: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(255,255,255,0.025)",
        overflow: "hidden",
        transition: "border-color 0.2s",
      }}
    >
      {/* Image */}
      <div style={{ position: "relative", aspectRatio: "4/3", background: "rgba(255,255,255,0.03)", overflow: "hidden" }}>
        {item.main_image ? (
          <img src={item.main_image} alt={item.item_name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <CatIcon size={28} color="rgba(255,255,255,0.1)" />
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.15)" }}>No photo</span>
          </div>
        )}

        {/* Badges */}
        <div style={{ position: "absolute", top: 10, left: 10, display: "flex", gap: 5 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 3, padding: "3px 8px", borderRadius: 20, background: "rgba(16,185,129,0.85)", backdropFilter: "blur(8px)", fontSize: 9, fontWeight: 700, color: "#fff", letterSpacing: 0.5 }}>
            <CheckCircle size={8} />FOUND
          </span>
          {item.is_urgent && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 3, padding: "3px 8px", borderRadius: 20, background: "rgba(239,68,68,0.85)", backdropFilter: "blur(8px)", fontSize: 9, fontWeight: 700, color: "#fff" }}>
              <Zap size={8} />URGENT
            </span>
          )}
        </div>

        {/* Image count */}
        {item.image_count > 1 && (
          <div style={{ position: "absolute", bottom: 8, right: 8, display: "flex", alignItems: "center", gap: 4, padding: "2px 7px", borderRadius: 8, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)", fontSize: 10, color: "rgba(255,255,255,0.7)" }}>
            <ImageIcon size={9} />{item.image_count}
          </div>
        )}

        {/* Claimed overlay */}
        {item.my_claim_status && (
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(2px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ClaimBadge status={item.my_claim_status} />
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: 14 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#fff", fontFamily: "'Syne',sans-serif", letterSpacing: "-0.2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 2 }}>
              {item.item_name}
            </div>
            <div style={{ fontSize: 11, color: "#6b7280", display: "flex", alignItems: "center", gap: 4 }}>
              <CatIcon size={10} color="#4b5563" />{item.category}
            </div>
          </div>
          {item.reward && (
            <span style={{ fontSize: 10, fontWeight: 700, color: "#fbbf24", background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.2)", padding: "2px 7px", borderRadius: 8, flexShrink: 0 }}>
              {item.reward}
            </span>
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#6b7280" }}>
            <MapPin size={10} color="#4b5563" />
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.location}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 10, color: "#374151", display: "flex", alignItems: "center", gap: 4 }}>
              <Calendar size={9} />{timeAgo(item.date_reported)}
            </span>
            <span style={{ fontSize: 10, color: "#374151", display: "flex", alignItems: "center", gap: 3 }}>
              <Eye size={9} />{item.views}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  SKELETON CARD
// ─────────────────────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div style={{ borderRadius: 16, border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)", overflow: "hidden" }}>
      <div className="bi-skeleton" style={{ aspectRatio: "4/3", background: "rgba(255,255,255,0.05)" }} />
      <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
        <div className="bi-skeleton" style={{ height: 14, borderRadius: 6, width: "70%", background: "rgba(255,255,255,0.06)" }} />
        <div className="bi-skeleton" style={{ height: 10, borderRadius: 6, width: "40%", background: "rgba(255,255,255,0.04)" }} />
        <div className="bi-skeleton" style={{ height: 10, borderRadius: 6, width: "55%", background: "rgba(255,255,255,0.04)" }} />
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  DETAIL DRAWER — reads from store
// ─────────────────────────────────────────────────────────────────────────────
function DetailDrawer({ isMobile }: { isMobile: boolean }) {
  const { openId, detail, loadingDetail, detailError, closeDetail, markClaimed } = useBrowseStore()
  const [imgIdx, setImgIdx] = useState(0)

  useEffect(() => { setImgIdx(0) }, [openId])

  const item = detail
  const CatIcon = item ? (CAT_ICON[item.category] ?? Tag) : Tag

  return (
    <AnimatePresence>
      {openId !== null && (
        <>
          <motion.div key="bd" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={closeDetail}
            style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)" }} />

          <motion.div
            key="drawer"
            initial={isMobile ? { y: "100%" } : { x: "100%" }}
            animate={isMobile ? { y: 0 } : { x: 0 }}
            exit={isMobile ? { y: "100%" } : { x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
            style={isMobile ? {
              position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 301,
              maxHeight: "94dvh", borderRadius: "20px 20px 0 0", overflowY: "auto",
              background: "linear-gradient(160deg,#0d0d1f,#090910)",
              border: "1px solid rgba(255,255,255,0.08)",
              fontFamily: "'DM Sans',sans-serif", color: "white",
            } : {
              position: "fixed", top: 0, right: 0, bottom: 0, zIndex: 301,
              width: 480, overflowY: "auto",
              background: "linear-gradient(160deg,#0d0d1f,#090910)",
              borderLeft: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "-24px 0 80px rgba(0,0,0,0.6)",
              fontFamily: "'DM Sans',sans-serif", color: "white",
            }}>

            {isMobile && (
              <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 4px" }}>
                <div style={{ width: 36, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.18)" }} />
              </div>
            )}

            {/* Header */}
            <div style={{ padding: isMobile ? "14px 18px 12px" : "20px 24px 16px", borderBottom: "1px solid rgba(255,255,255,0.07)", position: "sticky", top: 0, zIndex: 2, background: "rgba(9,9,16,0.97)", backdropFilter: "blur(20px)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#4b5563", textTransform: "uppercase", letterSpacing: 1.2 }}>Found Item</div>
                {item && <div style={{ fontSize: 11, color: "#374151", marginTop: 1 }}>#{item.id} · {timeAgo(item.date_reported)}</div>}
              </div>
              <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.93 }} onClick={closeDetail}
                style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <X size={13} color="rgba(255,255,255,0.5)" />
              </motion.button>
            </div>

            {/* Loading */}
            {loadingDetail && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 24px", gap: 14 }}>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                  <RefreshCw size={22} color="#4b5563" />
                </motion.div>
                <span style={{ fontSize: 13, color: "#374151" }}>Loading item…</span>
              </div>
            )}

            {/* Error */}
            {detailError && !loadingDetail && (
              <div style={{ padding: "40px 24px", textAlign: "center" }}>
                <AlertTriangle size={24} color="#f87171" style={{ margin: "0 auto 10px" }} />
                <div style={{ fontSize: 13, color: "#f87171" }}>{detailError}</div>
              </div>
            )}

            {/* Content */}
            {item && !loadingDetail && (
              <div style={{ padding: isMobile ? "16px 18px 120px" : "20px 24px 40px", display: "flex", flexDirection: "column", gap: 20 }}>

                {/* Identity card */}
                <div style={{ padding: 18, borderRadius: 16, background: "linear-gradient(135deg,rgba(16,185,129,0.1),rgba(5,150,105,0.06))", border: "1px solid rgba(16,185,129,0.2)" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <CatIcon size={20} color="#34d399" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap", marginBottom: 6 }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 9px", borderRadius: 20, background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.28)", fontSize: 10, fontWeight: 700, color: "#34d399", letterSpacing: 0.4 }}>
                          <CheckCircle size={9} />FOUND
                        </span>
                        {item.is_urgent && (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 8px", borderRadius: 20, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.28)", fontSize: 10, fontWeight: 700, color: "#f87171" }}>
                            <Zap size={9} />URGENT
                          </span>
                        )}
                        {item.my_claim_status && <ClaimBadge status={item.my_claim_status} />}
                      </div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: "#fff", fontFamily: "'Syne',sans-serif", letterSpacing: "-0.3px", marginBottom: 4 }}>{item.item_name}</div>
                      <div style={{ fontSize: 11, color: "#4b5563" }}>
                        {item.category}{item.brand ? ` · ${item.brand}` : ""}{item.color ? ` · ${item.color}` : ""}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", marginTop: 14, borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 14 }}>
                    {[
                      { icon: Eye,       label: "Views",  value: item.views },
                      { icon: ImageIcon, label: "Photos", value: item.images?.length ?? 0 },
                      { icon: Calendar,  label: "Posted", value: timeAgo(item.date_reported) },
                    ].map((s, i) => (
                      <div key={i} style={{ flex: 1, textAlign: "center", borderRight: i < 2 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, marginBottom: 2 }}>
                          <s.icon size={10} color="#4b5563" />
                          <span style={{ fontSize: 9, color: "#374151", textTransform: "uppercase", letterSpacing: 1, fontWeight: 700 }}>{s.label}</span>
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 800, color: "#34d399", fontFamily: "'Syne',sans-serif" }}>{s.value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Photos */}
                {item.images && item.images.length > 0 && (
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "#4b5563", textTransform: "uppercase", letterSpacing: 1.4, marginBottom: 10 }}>Photos</div>
                    <div style={{ borderRadius: 12, overflow: "hidden", aspectRatio: "16/9", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", marginBottom: 8 }}>
                      <AnimatePresence mode="wait">
                        <motion.img key={imgIdx} src={item.images[imgIdx]?.image_url ?? ""} alt={item.item_name}
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </AnimatePresence>
                    </div>
                    {item.images.length > 1 && (
                      <div style={{ display: "flex", gap: 6 }}>
                        {item.images.map((img, i) => (
                          <motion.button key={img.id} whileTap={{ scale: 0.95 }} onClick={() => setImgIdx(i)}
                            style={{ width: 52, height: 52, borderRadius: 8, overflow: "hidden", border: `2px solid ${i === imgIdx ? "rgba(16,185,129,0.6)" : "rgba(255,255,255,0.08)"}`, padding: 0, cursor: "pointer", background: "none", flexShrink: 0 }}>
                            <img src={img.image_url ?? ""} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          </motion.button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Where & When Found */}
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#4b5563", textTransform: "uppercase", letterSpacing: 1.4, marginBottom: 10 }}>Where & When Found</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {[
                      { icon: MapPin,   label: "Location",       value: [item.location, item.location_detail].filter(Boolean).join(" — ") },
                      { icon: Calendar, label: "Date Found",     value: fmtDate(item.date_event) },
                      ...(item.time_event    ? [{ icon: Clock,  label: "Time Found",       value: fmtTime(item.time_event) }]    : []),
                      ...(item.found_stored_at ? [{ icon: MapPin, label: "Item Currently At", value: item.found_stored_at }]    : []),
                    ].map((r, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 14px", borderRadius: 10, background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}>
                        <r.icon size={13} color="#4b5563" style={{ marginTop: 1, flexShrink: 0 }} />
                        <div>
                          <div style={{ fontSize: 9, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: 1, marginBottom: 2 }}>{r.label}</div>
                          <div style={{ fontSize: 13, color: "#c4c9e2" }}>{r.value}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#4b5563", textTransform: "uppercase", letterSpacing: 1.4, marginBottom: 10 }}>Description</div>
                  <p style={{ fontSize: 13, color: "#c4c9e2", lineHeight: 1.75, margin: 0, padding: "14px 16px", borderRadius: 12, background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}>
                    {item.description}
                  </p>
                </div>

                {/* Contact */}
                {item.contact_phone && (
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "12px 14px", borderRadius: 12, background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}>
                    <Phone size={13} color="#4b5563" style={{ marginTop: 1, flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: 9, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: 1, marginBottom: 2 }}>Contact</div>
                      <div style={{ fontSize: 13, color: "#c4c9e2" }}>{item.contact_phone}</div>
                    </div>
                  </div>
                )}

                {/* Info callout */}
                <div style={{ display: "flex", gap: 10, padding: "12px 14px", borderRadius: 12, background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.18)" }}>
                  <Info size={13} color="#34d399" style={{ flexShrink: 0, marginTop: 1 }} />
                  <p style={{ fontSize: 12, color: "#6ee7b7", lineHeight: 1.65, margin: 0 }}>
                    If this item belongs to you, click <strong>Claim This Item</strong> below and describe how you can prove ownership. An admin will verify your claim.
                  </p>
                </div>

                {/* Claim / status area */}
                {item.my_claim_status ? (
                  <ClaimBadge status={item.my_claim_status} />
                ) : item.status === "matched" ? (
                  <ClaimButton
                    reportId={item.id}
                    reportName={item.item_name}
                    onSuccess={() => markClaimed(item.id)}
                  />
                ) : item.status === "under_review" ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 14px", borderRadius: 12, background: "rgba(251,191,36,0.07)", border: "1px solid rgba(251,191,36,0.2)" }}>
                    <Clock size={13} color="#fbbf24" style={{ flexShrink: 0 }} />
                    <p style={{ fontSize: 12, color: "#fde68a", margin: 0, lineHeight: 1.5 }}>
                      This item is <strong>under admin review</strong>. Claiming will be enabled once a match is confirmed.
                    </p>
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 14px", borderRadius: 12, background: "rgba(99,102,241,0.07)", border: "1px solid rgba(99,102,241,0.2)" }}>
                    <Clock size={13} color="#818cf8" style={{ flexShrink: 0 }} />
                    <p style={{ fontSize: 12, color: "#a5b4fc", margin: 0, lineHeight: 1.5 }}>
                      This item is <strong>open</strong>. Once an admin verifies a match, you'll be able to submit a claim.
                    </p>
                  </div>
                )}

              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function BrowseItems() {
  const isMobile = useIsMobile(640)

  const {
    items, total, loadingList, listError,
    search, category, ordering,
    setSearch, setCategory, setOrdering, resetFilters,
    fetchItems, openDetail,
  } = useBrowseStore()

  // Local UI state only
  const [searchRaw,   setSearchRaw]   = useState(search)
  const [showFilters, setShowFilters] = useState(false)

  const debouncedSearch = useDebounce(searchRaw, 400)

  // Sync debounced input → store
  useEffect(() => { setSearch(debouncedSearch) }, [debouncedSearch, setSearch])

  // Fetch on filter changes
  useEffect(() => { fetchItems() }, [search, category, ordering, fetchItems])

  const activeFilters = (category !== "all" ? 1 : 0) + (ordering !== "-date_reported" ? 1 : 0)

  return (
    <div style={{ minHeight: "100vh", background: "#06060f", color: "white", fontFamily: "'DM Sans',sans-serif", padding: isMobile ? "0 0 40px" : "0 0 48px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        .bi-skeleton { animation: bi-pulse 1.6s ease-in-out infinite; }
        @keyframes bi-pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 6 }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: "linear-gradient(135deg,#10b981,#059669)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 16px rgba(16,185,129,0.3)", flexShrink: 0 }}>
            <Search size={18} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: isMobile ? 18 : 22, fontWeight: 800, letterSpacing: "-0.5px", color: "#fff", margin: 0, fontFamily: "'Syne',sans-serif" }}>Browse Found Items</h1>
            <p style={{ fontSize: 12, color: "#4b5563", margin: 0 }}>
              {loadingList ? "Loading…" : `${total} found item${total !== 1 ? "s" : ""} available`}
            </p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "12px 14px", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ position: "relative", flex: 1, minWidth: 0 }}>
            <Search size={13} color="#6b7280" style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
            <input
              value={searchRaw}
              onChange={e => setSearchRaw(e.target.value)}
              placeholder={isMobile ? "Search…" : "Search by item name, location, description…"}
              style={{ width: "100%", background: "#10101e", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 9, padding: "8px 32px 8px 32px", fontSize: 13, color: "#fff", outline: "none", fontFamily: "'DM Sans',sans-serif", boxSizing: "border-box", transition: "border-color 0.2s, box-shadow 0.2s" }}
              onFocus={e => { e.currentTarget.style.borderColor = "rgba(16,185,129,0.5)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(16,185,129,0.1)" }}
              onBlur={e  => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)"; e.currentTarget.style.boxShadow = "none" }}
            />
            {searchRaw && (
              <button onClick={() => { setSearchRaw(""); setSearch("") }}
                style={{ position: "absolute", right: 9, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                <X size={12} color="#6b7280" />
              </button>
            )}
          </div>

          <motion.button whileTap={{ scale: 0.96 }} onClick={() => setShowFilters(p => !p)}
            style={{
              display: "flex", alignItems: "center", gap: 5, padding: "8px 12px", borderRadius: 9, flexShrink: 0,
              border:     showFilters ? "1px solid rgba(16,185,129,0.45)" : "1px solid rgba(255,255,255,0.1)",
              background: showFilters ? "rgba(16,185,129,0.1)"           : "rgba(255,255,255,0.04)",
              fontSize: 12, fontWeight: 500, color: showFilters ? "#34d399" : "rgba(255,255,255,0.55)",
              cursor: "pointer", fontFamily: "'DM Sans',sans-serif", transition: "all 0.2s",
            }}>
            <Filter size={12} />
            {!isMobile && "Filters"}
            {activeFilters > 0 && (
              <span style={{ width: 14, height: 14, borderRadius: "50%", background: "#10b981", fontSize: 8, fontWeight: 700, color: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {activeFilters}
              </span>
            )}
          </motion.button>

          <div style={{ fontSize: 11, color: "#4b5563", whiteSpace: "nowrap", flexShrink: 0 }}>
            {loadingList ? "…" : `${items.length}/${total}`}
          </div>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.18 }} style={{ overflow: "hidden" }}>
              <div style={{ paddingTop: 12, marginTop: 12, borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-end" }}>

                {/* Category */}
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#4b5563", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 7 }}>Category</div>
                  <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                    {[{ value: "all", label: "All" }, ...CATEGORIES.map(c => ({ value: c.value, label: c.value }))].map(c => (
                      <button key={c.value} onClick={() => setCategory(c.value as any)}
                        style={{ padding: "4px 11px", borderRadius: 7, border: category === c.value ? "1px solid rgba(16,185,129,0.4)" : "1px solid rgba(255,255,255,0.1)", background: category === c.value ? "rgba(16,185,129,0.12)" : "rgba(255,255,255,0.04)", fontSize: 11, fontWeight: 500, color: category === c.value ? "#34d399" : "rgba(255,255,255,0.5)", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sort */}
                <div style={{ flex: "0 0 160px" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#4b5563", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 7 }}>Sort By</div>
                  <select value={ordering} onChange={e => setOrdering(e.target.value as any)}
                    style={{ width: "100%", padding: "6px 10px", borderRadius: 7, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "#c4c9e2", fontSize: 11, fontFamily: "'DM Sans',sans-serif", outline: "none", cursor: "pointer" }}>
                    <option value="-date_reported">Newest First</option>
                    <option value="date_reported">Oldest First</option>
                    <option value="-views">Most Viewed</option>
                    <option value="item_name">A–Z by Name</option>
                  </select>
                </div>

                {activeFilters > 0 && (
                  <button onClick={() => { resetFilters(); setSearchRaw("") }}
                    style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 7, border: "1px solid rgba(239,68,68,0.25)", background: "rgba(239,68,68,0.07)", fontSize: 11, color: "#f87171", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
                    <X size={10} />Reset
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Error */}
      <AnimatePresence>
        {listError && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} style={{ marginBottom: 16, overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "11px 14px", borderRadius: 12, background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.22)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <AlertTriangle size={13} color="#f87171" />
                <span style={{ fontSize: 12, color: "#f87171" }}>{listError}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid */}
      {loadingList ? (
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(3,1fr)", gap: 14 }}>
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : items.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ textAlign: "center", padding: "56px 24px", borderRadius: 20, border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.01)" }}>
          <Inbox size={32} color="#1f2937" style={{ margin: "0 auto 14px" }} />
          <div style={{ fontSize: 15, fontWeight: 700, color: "rgba(255,255,255,0.2)", fontFamily: "'Syne',sans-serif", marginBottom: 6 }}>No found items yet</div>
          <div style={{ fontSize: 12, color: "#374151" }}>
            {search || category !== "all" ? "Try adjusting your search or filters" : "Check back later — found items appear here once verified by an admin"}
          </div>
        </motion.div>
      ) : (
        <motion.div layout style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(3,1fr)", gap: 14 }}>
          <AnimatePresence mode="popLayout">
            {items.map((item, i) => (
              <ItemCard key={item.id} item={item} index={i} onClick={() => openDetail(item.id)} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {!loadingList && items.length > 0 && (
        <div style={{ textAlign: "center", marginTop: 18, fontSize: 11, color: "#374151" }}>
          Showing {items.length} of {total} found item{total !== 1 ? "s" : ""}
        </div>
      )}

      <DetailDrawer isMobile={isMobile} />
    </div>
  )
}