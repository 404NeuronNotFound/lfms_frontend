import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ClipboardList, Search, Filter, Eye, CheckCircle, XCircle,
  Clock, MapPin, Tag, User, Calendar, AlertTriangle,
  Package, PackageSearch, X, Download,
  RefreshCw, TrendingUp, ArrowUpRight, MoreHorizontal,
  MessageSquare, Flag, Layers, Inbox, Check, Ban,
  Hash, Phone, Mail, FileText, Image, Zap,
} from "lucide-react"

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────
type ReportType   = "lost" | "found"
type ReportStatus = "open" | "under_review" | "matched" | "claimed" | "closed" | "rejected"
type Category     = "Electronics" | "Wallets & Bags" | "Keys" | "Clothing" | "Jewelry" | "Documents" | "Pets" | "Sports" | "Other"

interface ReportUser {
  id:       number
  name:     string
  username: string
  email:    string
  phone:    string | null
  avatar:   string | null
  reports:  number
  joined:   string
}

interface Report {
  id:          number
  type:        ReportType
  status:      ReportStatus
  title:       string
  description: string
  category:    Category
  location:    string
  date_lost_found: string
  date_reported:   string
  user:        ReportUser
  images:      number        // count of attached images
  views:       number
  matches:     number
  reward:      string | null
  urgent:      boolean
  notes:       string | null   // admin notes
}

// ─────────────────────────────────────────────────────────────────────────────
// DUMMY DATA  — 24 reports, mix of types / statuses
// ─────────────────────────────────────────────────────────────────────────────
const DUMMY_REPORTS: Report[] = [
  {
    id: 1001, type: "lost", status: "open",
    title: "iPhone 15 Pro Max — Space Black",
    description: "Lost my iPhone 15 Pro Max near the food court at SM City. It has a cracked screen protector and a gray MagSafe case. Lock screen shows a golden retriever.",
    category: "Electronics", location: "SM City Davao, Food Court", date_lost_found: "2025-03-01", date_reported: "2025-03-01",
    user: { id: 12, name: "Marco Reyes", username: "marcoreyes", email: "marco.r@email.com", phone: "+63 917 123 4567", avatar: null, reports: 3, joined: "2024-06-15" },
    images: 3, views: 241, matches: 2, reward: "₱2,000", urgent: true, notes: null,
  },
  {
    id: 1002, type: "found", status: "under_review",
    title: "Found: Set of 5 Keys with Toyota Keychain",
    description: "Found a set of keys with a Toyota logo keychain and a small blue lanyard near the parking lot entrance. Turned in to security but posting here too.",
    category: "Keys", location: "Abreeza Mall Parking Lot, Level B1", date_lost_found: "2025-03-02", date_reported: "2025-03-02",
    user: { id: 34, name: "Sofia Lim", username: "soflim", email: "sofia.lim@email.com", phone: "+63 919 234 5678", avatar: null, reports: 7, joined: "2023-11-02" },
    images: 2, views: 88, matches: 1, reward: null, urgent: false, notes: "Admin: Verifying with Abreeza security desk.",
  },
  {
    id: 1003, type: "lost", status: "matched",
    title: "Brown Leather Bifold Wallet",
    description: "Lost my brown leather bifold wallet containing ID, 2 credit cards, and approximately ₱1,500 cash. Has initials 'JDV' embossed on the inside.",
    category: "Wallets & Bags", location: "Gaisano Mall Davao, 2nd Floor", date_lost_found: "2025-02-28", date_reported: "2025-02-28",
    user: { id: 7, name: "Juan dela Vega", username: "jdelvega", email: "juan.dv@email.com", phone: "+63 920 345 6789", avatar: null, reports: 1, joined: "2024-12-01" },
    images: 1, views: 173, matches: 1, reward: "₱500", urgent: false, notes: "Admin: Matched with report #1019. Pending handoff.",
  },
  {
    id: 1004, type: "found", status: "claimed",
    title: "Found: Small Brown Dog (Aspin Mix)",
    description: "Found a small brown dog wandering near Roxas Avenue. Has a red collar but no tag. Very friendly, currently staying with me temporarily.",
    category: "Pets", location: "Roxas Avenue, near Jollibee", date_lost_found: "2025-02-25", date_reported: "2025-02-25",
    user: { id: 55, name: "Ana Santos", username: "anasantos55", email: "ana.s@email.com", phone: "+63 912 456 7890", avatar: null, reports: 12, joined: "2022-08-20" },
    images: 4, views: 520, matches: 3, reward: null, urgent: false, notes: "Admin: Owner confirmed and reunited 03/02.",
  },
  {
    id: 1005, type: "lost", status: "open",
    title: "MacBook Pro 14\" M3 — Silver",
    description: "Left my MacBook Pro on the table at Bo's Coffee. Has a rainbow sticker on the lid and 'PROPERTY OF RCM' written on masking tape under the keyboard.",
    category: "Electronics", location: "Bo's Coffee, Damosa Gateway", date_lost_found: "2025-03-03", date_reported: "2025-03-03",
    user: { id: 8, name: "Rhea Mendoza", username: "rheam", email: "rhea.m@email.com", phone: "+63 998 567 8901", avatar: null, reports: 2, joined: "2024-04-10" },
    images: 2, views: 388, matches: 0, reward: "₱5,000", urgent: true, notes: null,
  },
  {
    id: 1006, type: "found", status: "open",
    title: "Found: Black Jansport Backpack",
    description: "Found a black Jansport backpack near the benches in People's Park. Contains what looks like school books and a pencil case. Handed to park security.",
    category: "Wallets & Bags", location: "People's Park, Davao City", date_lost_found: "2025-03-04", date_reported: "2025-03-04",
    user: { id: 19, name: "Carlo Bueno", username: "carlobueno", email: "carlo.b@email.com", phone: null, avatar: null, reports: 5, joined: "2023-07-18" },
    images: 3, views: 112, matches: 1, reward: null, urgent: false, notes: null,
  },
  {
    id: 1007, type: "lost", status: "rejected",
    title: "Airpods Pro 2nd Gen",
    description: "Lost AirPods Pro somewhere in downtown Davao. White case with a small red dot sticker. Serial number available.",
    category: "Electronics", location: "Downtown Davao, exact unknown", date_lost_found: "2025-02-15", date_reported: "2025-02-20",
    user: { id: 22, name: "Trish Ocampo", username: "trisho", email: "trish.o@email.com", phone: "+63 917 678 9012", avatar: null, reports: 4, joined: "2024-02-28" },
    images: 1, views: 65, matches: 0, reward: "₱1,000", urgent: false, notes: "Admin: Rejected — report filed 5 days after incident, insufficient location info.",
  },
  {
    id: 1008, type: "found", status: "under_review",
    title: "Found: Philippine Passport",
    description: "Found a Philippine passport on the floor near immigration lane 3 at FIDA. Owner name visible on bio page. Submitted to NAIA Lost & Found.",
    category: "Documents", location: "Francisco Bangoy Int'l Airport, Immigration Area", date_lost_found: "2025-03-05", date_reported: "2025-03-05",
    user: { id: 41, name: "Ben Castillo", username: "bcastillo", email: "ben.c@email.com", phone: "+63 926 789 0123", avatar: null, reports: 8, joined: "2023-05-14" },
    images: 0, views: 203, matches: 0, reward: null, urgent: true, notes: "Admin: Sensitive document — reviewing identity protocol before publishing.",
  },
  {
    id: 1009, type: "lost", status: "open",
    title: "Gold Necklace with Heart Pendant",
    description: "Lost my 18k gold necklace with a small heart pendant and my name 'CLAIRE' engraved on the back. Last worn at Matina Town Square on Saturday night.",
    category: "Jewelry", location: "Matina Town Square, Davao", date_lost_found: "2025-03-01", date_reported: "2025-03-02",
    user: { id: 13, name: "Claire Navarro", username: "clairenav", email: "claire.n@email.com", phone: "+63 945 890 1234", avatar: null, reports: 1, joined: "2025-01-09" },
    images: 2, views: 199, matches: 0, reward: "₱3,500", urgent: true, notes: null,
  },
  {
    id: 1010, type: "found", status: "claimed",
    title: "Found: Prescription Eyeglasses",
    description: "Found a pair of prescription glasses in a black hard case at Victoria Plaza. Lenses appear to be fairly strong prescription. Case has a small flower sticker.",
    category: "Other", location: "Victoria Plaza, Davao City", date_lost_found: "2025-02-20", date_reported: "2025-02-20",
    user: { id: 60, name: "Demi Torres", username: "demitores", email: "demi.t@email.com", phone: "+63 933 901 2345", avatar: null, reports: 10, joined: "2022-12-01" },
    images: 2, views: 91, matches: 1, reward: null, urgent: false, notes: "Admin: Claimed verified 02/24.",
  },
  {
    id: 1011, type: "lost", status: "open",
    title: "Nike Air Max 90 — Size 9 US",
    description: "Left a pair of Nike Air Max 90 (white/black, size 9 US) in a bag at the gym locker room at Gold's Gym Davao. Bag is a red Adidas duffel.",
    category: "Sports", location: "Gold's Gym Davao, Locker Room", date_lost_found: "2025-03-04", date_reported: "2025-03-04",
    user: { id: 27, name: "Diego Cruz", username: "diegocruz", email: "diego.c@email.com", phone: "+63 956 012 3456", avatar: null, reports: 2, joined: "2024-07-22" },
    images: 2, views: 74, matches: 0, reward: null, urgent: false, notes: null,
  },
  {
    id: 1012, type: "found", status: "open",
    title: "Found: Samsung Galaxy A54 — White",
    description: "Found a Samsung Galaxy A54 in white near the fountain area at NCCC Mall. Screen is cracked. Phone is locked. Brought home for safekeeping.",
    category: "Electronics", location: "NCCC Mall, Fountain Area", date_lost_found: "2025-03-05", date_reported: "2025-03-05",
    user: { id: 48, name: "Lea Bautista", username: "leab", email: "lea.b@email.com", phone: "+63 960 123 4567", avatar: null, reports: 6, joined: "2023-09-30" },
    images: 3, views: 145, matches: 2, reward: null, urgent: false, notes: null,
  },
  {
    id: 1013, type: "lost", status: "closed",
    title: "University ID — USEP Student",
    description: "Lost my USEP student ID somewhere in Ecoland. Beige card with my photo. Name: Janine Flores, Course: BSCS 3rd year.",
    category: "Documents", location: "Ecoland, Davao City", date_lost_found: "2025-02-10", date_reported: "2025-02-10",
    user: { id: 5, name: "Janine Flores", username: "janinef", email: "janine.f@email.com", phone: null, avatar: null, reports: 1, joined: "2025-01-15" },
    images: 1, views: 57, matches: 0, reward: null, urgent: false, notes: "Admin: Closed by reporter — card was found personally.",
  },
  {
    id: 1014, type: "found", status: "under_review",
    title: "Found: Child's Pink Bicycle",
    description: "Found a small pink bicycle with training wheels abandoned near the gate of Rizal Memorial Park. Has a white basket with flower decorations.",
    category: "Other", location: "Rizal Memorial Park Gate", date_lost_found: "2025-03-03", date_reported: "2025-03-03",
    user: { id: 35, name: "Noel Padilla", username: "noelpad", email: "noel.p@email.com", phone: "+63 977 234 5678", avatar: null, reports: 3, joined: "2024-03-18" },
    images: 4, views: 267, matches: 0, reward: null, urgent: false, notes: "Admin: Verifying item ownership protocol for minors' items.",
  },
  {
    id: 1015, type: "lost", status: "open",
    title: "Canon EOS R50 Camera Body",
    description: "Lost Canon EOS R50 mirrorless camera body (no lens). Black. Has a small scratch on the top dial. Strap was attached — black and white woven strap.",
    category: "Electronics", location: "Davao City near Quirino Ave", date_lost_found: "2025-03-05", date_reported: "2025-03-05",
    user: { id: 9, name: "Migs Villanueva", username: "migsv", email: "migs.v@email.com", phone: "+63 917 345 6789", avatar: null, reports: 1, joined: "2024-10-12" },
    images: 2, views: 322, matches: 0, reward: "₱8,000", urgent: true, notes: null,
  },
  {
    id: 1016, type: "found", status: "matched",
    title: "Found: Stethoscope — Littmann Classic",
    description: "Found a Littmann Classic III stethoscope in a ziplock bag near the hospital cafeteria. Navy blue tubing. Name tag inside bag says 'Dr. A. Santos'.",
    category: "Other", location: "Davao Medical Center, Cafeteria", date_lost_found: "2025-02-27", date_reported: "2025-02-27",
    user: { id: 62, name: "Nurse Romy Dela Cruz", username: "romydc", email: "romy.dc@email.com", phone: "+63 928 456 7890", avatar: null, reports: 14, joined: "2022-05-03" },
    images: 1, views: 188, matches: 1, reward: null, urgent: false, notes: "Admin: Matched with user Dr. A. Santos — arranging hospital handoff.",
  },
  {
    id: 1017, type: "lost", status: "open",
    title: "Hydro Flask 32oz — Olive Green",
    description: "Lost my Hydro Flask 32oz water bottle at the Davao City Hall area. Olive green with a lot of stickers — 'VSCO' sticker, band sticker, and a cat sticker on the bottom.",
    category: "Other", location: "Davao City Hall Area", date_lost_found: "2025-03-04", date_reported: "2025-03-04",
    user: { id: 31, name: "Kylie Tan", username: "kyliet", email: "kylie.t@email.com", phone: null, avatar: null, reports: 2, joined: "2024-08-07" },
    images: 1, views: 49, matches: 0, reward: null, urgent: false, notes: null,
  },
  {
    id: 1018, type: "found", status: "open",
    title: "Found: Men's Black Jacket — L/XL",
    description: "Found a men's black zip-up jacket (L or XL size) left on a seat at Gaisano Grand Mall cinema. Inside pocket has a folded receipt.",
    category: "Clothing", location: "Gaisano Grand Mall Cinema, Hall 3", date_lost_found: "2025-03-02", date_reported: "2025-03-02",
    user: { id: 50, name: "Rex Macaraeg", username: "rexm", email: "rex.m@email.com", phone: "+63 939 567 8901", avatar: null, reports: 4, joined: "2023-10-25" },
    images: 2, views: 66, matches: 1, reward: null, urgent: false, notes: null,
  },
  {
    id: 1019, type: "found", status: "matched",
    title: "Found: Brown Leather Bifold Wallet",
    description: "Found a brown leather bifold wallet near the elevator at Gaisano 2nd floor. Has initials inside. Contains cards and cash — all intact.",
    category: "Wallets & Bags", location: "Gaisano Mall Davao, Near Elevator", date_lost_found: "2025-02-28", date_reported: "2025-02-28",
    user: { id: 44, name: "Pat Cruz", username: "patcruz44", email: "pat.c@email.com", phone: "+63 947 678 9012", avatar: null, reports: 9, joined: "2023-02-14" },
    images: 2, views: 144, matches: 1, reward: null, urgent: false, notes: "Admin: Matched with lost report #1003. Coordinating handoff.",
  },
  {
    id: 1020, type: "lost", status: "open",
    title: "Blue Razer Gaming Headset",
    description: "Lost a Razer Kraken blue gaming headset at the gaming café on Pichon St. May have been left under the desk. Has tape on the left ear cup.",
    category: "Electronics", location: "Pichon St Gaming Cafe, Davao", date_lost_found: "2025-03-05", date_reported: "2025-03-06",
    user: { id: 17, name: "Nico Espinoza", username: "nicoespin", email: "nico.e@email.com", phone: "+63 906 789 0123", avatar: null, reports: 3, joined: "2024-05-19" },
    images: 1, views: 83, matches: 0, reward: "₱500", urgent: false, notes: null,
  },
  {
    id: 1021, type: "found", status: "claimed",
    title: "Found: Baby Blue Umbrella",
    description: "Found a baby blue umbrella with polka dots at The Annex food park. Has a small keychain charm hanging from the handle.",
    category: "Other", location: "The Annex Food Park, Davao", date_lost_found: "2025-02-22", date_reported: "2025-02-22",
    user: { id: 37, name: "Jia Mendez", username: "jiamendez", email: "jia.m@email.com", phone: null, avatar: null, reports: 6, joined: "2023-06-08" },
    images: 1, views: 38, matches: 1, reward: null, urgent: false, notes: "Admin: Claimed 02/25.",
  },
  {
    id: 1022, type: "lost", status: "under_review",
    title: "Vivo V30 5G — Gold",
    description: "Lost Vivo V30 5G in gold color somewhere in or around Ateneo de Davao University campus. Has a transparent case with a sunflower dried inside.",
    category: "Electronics", location: "Ateneo de Davao University", date_lost_found: "2025-03-03", date_reported: "2025-03-04",
    user: { id: 25, name: "Gab Reyes", username: "gabreyes", email: "gab.r@email.com", phone: "+63 951 890 1234", avatar: null, reports: 1, joined: "2025-02-01" },
    images: 2, views: 176, matches: 1, reward: "₱1,500", urgent: true, notes: "Admin: Possible match with report #1012 being reviewed.",
  },
  {
    id: 1023, type: "found", status: "open",
    title: "Found: Red Tarsier Souvenir Stuffed Toy",
    description: "Found a red stuffed tarsier souvenir toy inside a mall paper bag at Aldevinco Shopping Center. Bag also contains a receipt.",
    category: "Other", location: "Aldevinco Shopping Center", date_lost_found: "2025-03-06", date_reported: "2025-03-06",
    user: { id: 58, name: "Mila Gomez", username: "milagomez", email: "mila.g@email.com", phone: "+63 962 901 2345", avatar: null, reports: 11, joined: "2022-03-17" },
    images: 2, views: 41, matches: 0, reward: null, urgent: false, notes: null,
  },
  {
    id: 1024, type: "lost", status: "open",
    title: "Longines Analog Watch — Stainless Steel",
    description: "Lost a Longines stainless steel analog watch at the buffet restaurant at Marco Polo Hotel. Has a beige dial and a small date window. Sentimental value — inherited from grandfather.",
    category: "Jewelry", location: "Marco Polo Hotel Davao, Restaurant", date_lost_found: "2025-03-05", date_reported: "2025-03-05",
    user: { id: 3, name: "Eric Aguirre", username: "ericaguirre", email: "eric.a@email.com", phone: "+63 918 012 3456", avatar: null, reports: 2, joined: "2024-09-01" },
    images: 3, views: 448, matches: 0, reward: "₱10,000", urgent: true, notes: null,
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
function useIsMobile(bp = 768) {
  const [v, setV] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < bp : false
  )
  return v
}

function timeAgo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (diff < 60)   return `${diff}m ago`
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`
  return `${Math.floor(diff / 1440)}d ago`
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

// ─────────────────────────────────────────────────────────────────────────────
// CONFIG MAPS
// ─────────────────────────────────────────────────────────────────────────────
const STATUS_CFG: Record<ReportStatus, { label: string; color: string; bg: string; border: string; dot: string }> = {
  open:          { label: "Open",          color: "#34d399", bg: "rgba(52,211,153,0.1)",  border: "rgba(52,211,153,0.25)",  dot: "#34d399" },
  under_review:  { label: "Under Review",  color: "#fbbf24", bg: "rgba(251,191,36,0.1)",  border: "rgba(251,191,36,0.25)",  dot: "#fbbf24" },
  matched:       { label: "Matched",       color: "#818cf8", bg: "rgba(129,140,248,0.1)", border: "rgba(129,140,248,0.25)", dot: "#818cf8" },
  claimed:       { label: "Claimed",       color: "#6ee7b7", bg: "rgba(110,231,183,0.1)", border: "rgba(110,231,183,0.25)", dot: "#6ee7b7" },
  closed:        { label: "Closed",        color: "#6b7280", bg: "rgba(107,114,128,0.1)", border: "rgba(107,114,128,0.2)",  dot: "#6b7280" },
  rejected:      { label: "Rejected",      color: "#f87171", bg: "rgba(248,113,113,0.1)", border: "rgba(248,113,113,0.25)", dot: "#f87171" },
}

const TYPE_CFG: Record<ReportType, { label: string; color: string; bg: string; border: string }> = {
  lost:  { label: "Lost",  color: "#fb923c", bg: "rgba(251,146,60,0.1)",  border: "rgba(251,146,60,0.25)"  },
  found: { label: "Found", color: "#38bdf8", bg: "rgba(56,189,248,0.1)",  border: "rgba(56,189,248,0.25)"  },
}

const CATEGORY_ICONS: Record<Category, React.ElementType> = {
  "Electronics":    Zap,
  "Wallets & Bags": Package,
  "Keys":           Hash,
  "Clothing":       FileText,
  "Jewelry":        Tag,
  "Documents":      FileText,
  "Pets":           Flag,
  "Sports":         TrendingUp,
  "Other":          Layers,
}

const CATEGORIES: Category[] = ["Electronics","Wallets & Bags","Keys","Clothing","Jewelry","Documents","Pets","Sports","Other"]
const STATUSES: ReportStatus[] = ["open","under_review","matched","claimed","closed","rejected"]

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────
function UserAvatar({ name, id, size = 32 }: { name: string; id: number; size?: number }) {
  const GRADS = [
    "135deg,#6366f1,#8b5cf6","135deg,#0ea5e9,#6366f1","135deg,#8b5cf6,#ec4899",
    "135deg,#10b981,#0ea5e9","135deg,#f59e0b,#ef4444","135deg,#06b6d4,#8b5cf6",
  ]
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: `linear-gradient(${GRADS[id % GRADS.length]})`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: Math.round(size * 0.3), fontWeight: 700, color: "white",
      letterSpacing: "-0.5px",
    }}>
      {initials}
    </div>
  )
}

function Badge({ type }: { type: ReportType }) {
  const c = TYPE_CFG[type]
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 9px", borderRadius: 20,
      background: c.bg, border: `1px solid ${c.border}`,
      fontSize: 11, fontWeight: 700, color: c.color, letterSpacing: 0.3,
    }}>
      {type === "lost" ? <PackageSearch size={10} /> : <Package size={10} />}
      {c.label}
    </span>
  )
}

function StatusPill({ status }: { status: ReportStatus }) {
  const c = STATUS_CFG[status]
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "3px 10px", borderRadius: 20,
      background: c.bg, border: `1px solid ${c.border}`,
      fontSize: 11, fontWeight: 600, color: c.color,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: c.dot, boxShadow: `0 0 5px ${c.dot}` }} />
      {c.label}
    </span>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// REPORT DETAIL DRAWER
// ─────────────────────────────────────────────────────────────────────────────
function ReportDrawer({ report, onClose, isMobile }: { report: Report | null; onClose: () => void; isMobile: boolean }) {
  if (!report) return null
  const tc = TYPE_CFG[report.type]
  const sc = STATUS_CFG[report.status]
  const CatIcon = CATEGORY_ICONS[report.category]

  return (
    <AnimatePresence>
      {report && (
        <>
          <motion.div key="bd" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" }}
          />
          <motion.div
            key="drawer"
            initial={isMobile ? { y: "100%" } : { x: "100%" }}
            animate={isMobile ? { y: 0 }      : { x: 0 }}
            exit={isMobile   ? { y: "100%" }  : { x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
            style={isMobile ? {
              position: "fixed", left: 0, right: 0, bottom: 0,
              zIndex: 201, maxHeight: "92dvh", borderRadius: "20px 20px 0 0",
              overflowY: "auto",
              background: "linear-gradient(160deg,#0d0d1f,#090910)",
              border: "1px solid rgba(255,255,255,0.08)",
              fontFamily: "'DM Sans',sans-serif", color: "white",
            } : {
              position: "fixed", top: 0, right: 0, bottom: 0,
              zIndex: 201, width: 420,
              overflowY: "auto",
              background: "linear-gradient(160deg,#0d0d1f,#090910)",
              borderLeft: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "-24px 0 80px rgba(0,0,0,0.5)",
              fontFamily: "'DM Sans',sans-serif", color: "white",
            }}
          >
            {/* Handle on mobile */}
            {isMobile && <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 2px" }}><div style={{ width: 36, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.18)" }} /></div>}

            {/* Header */}
            <div style={{ padding: isMobile ? "16px 20px 14px" : "24px 24px 18px", borderBottom: "1px solid rgba(255,255,255,0.07)", position: "sticky", top: 0, background: "rgba(13,13,31,0.96)", backdropFilter: "blur(20px)", zIndex: 1 }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                    <Badge type={report.type} />
                    <StatusPill status={report.status} />
                    {report.urgent && (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 8px", borderRadius: 20, background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.28)", fontSize: 10, fontWeight: 700, color: "#f87171" }}>
                        <Zap size={9} />URGENT
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", lineHeight: 1.35, fontFamily: "'Syne',sans-serif" }}>
                    {report.title}
                  </div>
                  <div style={{ fontSize: 11, color: "#4b5563", marginTop: 4 }}>Report #{report.id} · {timeAgo(report.date_reported)}</div>
                </div>
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.93 }} onClick={onClose}
                  style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                  <X size={13} color="rgba(255,255,255,0.5)" />
                </motion.button>
              </div>
            </div>

            <div style={{ padding: isMobile ? "16px 20px 32px" : "20px 24px 32px", display: "flex", flexDirection: "column", gap: 20 }}>

              {/* Description */}
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#4b5563", textTransform: "uppercase", letterSpacing: 1.4, marginBottom: 8 }}>Description</div>
                <p style={{ fontSize: 13, color: "#c4c9e2", lineHeight: 1.7, margin: 0, padding: "12px 14px", borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  {report.description}
                </p>
              </div>

              {/* Details grid */}
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#4b5563", textTransform: "uppercase", letterSpacing: 1.4, marginBottom: 10 }}>Item Details</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {[
                    { icon: Tag,      label: "Category",    value: report.category },
                    { icon: MapPin,   label: "Location",    value: report.location },
                    { icon: Calendar, label: report.type === "lost" ? "Date Lost" : "Date Found", value: fmtDate(report.date_lost_found) },
                    { icon: Calendar, label: "Reported",    value: fmtDate(report.date_reported) },
                    { icon: Eye,      label: "Views",       value: report.views.toString() },
                    { icon: Layers,   label: "Matches",     value: report.matches.toString() },
                    { icon: Image,    label: "Images",      value: `${report.images} attached` },
                    { icon: Flag,     label: "Reward",      value: report.reward ?? "None" },
                  ].map((d, i) => (
                    <div key={i} style={{ padding: "10px 12px", borderRadius: 10, background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                        <d.icon size={11} color="#4b5563" />
                        <span style={{ fontSize: 10, color: "#4b5563", textTransform: "uppercase", letterSpacing: 1, fontWeight: 600 }}>{d.label}</span>
                      </div>
                      <div style={{ fontSize: 12, color: "#e2e8f0", fontWeight: 500, wordBreak: "break-word" }}>{d.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reporter */}
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#4b5563", textTransform: "uppercase", letterSpacing: 1.4, marginBottom: 10 }}>Reporter</div>
                <div style={{ padding: "14px", borderRadius: 12, background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.16)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                    <UserAvatar name={report.user.name} id={report.user.id} size={40} />
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{report.user.name}</div>
                      <div style={{ fontSize: 12, color: "#6366f1" }}>@{report.user.username}</div>
                    </div>
                    <div style={{ marginLeft: "auto", textAlign: "right" }}>
                      <div style={{ fontSize: 10, color: "#4b5563" }}>Total Reports</div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: "#818cf8" }}>{report.user.reports}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Mail size={12} color="#4b5563" />
                      <span style={{ fontSize: 12, color: "#8b92b8" }}>{report.user.email}</span>
                    </div>
                    {report.user.phone && (
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Phone size={12} color="#4b5563" />
                        <span style={{ fontSize: 12, color: "#8b92b8" }}>{report.user.phone}</span>
                      </div>
                    )}
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Calendar size={12} color="#4b5563" />
                      <span style={{ fontSize: 12, color: "#8b92b8" }}>Joined {fmtDate(report.user.joined)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Admin Notes */}
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#4b5563", textTransform: "uppercase", letterSpacing: 1.4, marginBottom: 8 }}>Admin Notes</div>
                {report.notes
                  ? <div style={{ fontSize: 13, color: "#fbbf24", lineHeight: 1.65, padding: "12px 14px", borderRadius: 10, background: "rgba(251,191,36,0.07)", border: "1px solid rgba(251,191,36,0.2)" }}>
                      {report.notes}
                    </div>
                  : <div style={{ fontSize: 12, color: "#374151", fontStyle: "italic", padding: "12px 14px", borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                      No admin notes yet.
                    </div>
                }
              </div>

              {/* Admin Actions */}
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#4b5563", textTransform: "uppercase", letterSpacing: 1.4, marginBottom: 10 }}>Admin Actions</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {[
                    { icon: CheckCircle, label: "Mark Claimed",  color: "#34d399", bg: "rgba(52,211,153,0.08)",  border: "rgba(52,211,153,0.2)"  },
                    { icon: Layers,      label: "Mark Matched",  color: "#818cf8", bg: "rgba(129,140,248,0.08)", border: "rgba(129,140,248,0.2)"  },
                    { icon: MessageSquare,label:"Send Message",  color: "#38bdf8", bg: "rgba(56,189,248,0.08)",  border: "rgba(56,189,248,0.2)"   },
                    { icon: Ban,         label: "Reject Report", color: "#f87171", bg: "rgba(248,113,113,0.08)", border: "rgba(248,113,113,0.2)"  },
                  ].map((a, i) => (
                    <motion.button key={i} whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
                      style={{
                        padding: "10px 0", borderRadius: 10, border: `1px solid ${a.border}`,
                        background: a.bg, fontSize: 12, fontWeight: 600, color: a.color,
                        cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                        transition: "all 0.2s",
                      }}>
                      <a.icon size={12} />
                      {a.label}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function AllReports() {
  const isMobile = useIsMobile()

  const [search,    setSearch]    = useState("")
  const [typeFilter,  setTypeFilter]  = useState<"all" | ReportType>("all")
  const [statusFilter, setStatusFilter] = useState<"all" | ReportStatus>("all")
  const [catFilter, setCatFilter] = useState<"all" | Category>("all")
  const [sortBy,    setSortBy]    = useState<"date" | "views" | "matches">("date")
  const [page,      setPage]      = useState(1)
  const [selected,  setSelected]  = useState<Report | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  const activeFilterCount =
    (typeFilter   !== "all" ? 1 : 0) +
    (statusFilter !== "all" ? 1 : 0) +
    (catFilter    !== "all" ? 1 : 0)
  const PER_PAGE = isMobile ? 8 : 10

  // ── Stats ──────────────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:        DUMMY_REPORTS.length,
    open:         DUMMY_REPORTS.filter(r => r.status === "open").length,
    under_review: DUMMY_REPORTS.filter(r => r.status === "under_review").length,
    matched:      DUMMY_REPORTS.filter(r => r.status === "matched").length,
    claimed:      DUMMY_REPORTS.filter(r => r.status === "claimed").length,
    urgent:       DUMMY_REPORTS.filter(r => r.urgent).length,
    lost:         DUMMY_REPORTS.filter(r => r.type === "lost").length,
    found:        DUMMY_REPORTS.filter(r => r.type === "found").length,
  }), [])

  // ── Filtered + sorted ─────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let d = [...DUMMY_REPORTS]
    if (search)       d = d.filter(r =>
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.user.name.toLowerCase().includes(search.toLowerCase()) ||
      r.location.toLowerCase().includes(search.toLowerCase()) ||
      r.category.toLowerCase().includes(search.toLowerCase())
    )
    if (typeFilter !== "all")   d = d.filter(r => r.type === typeFilter)
    if (statusFilter !== "all") d = d.filter(r => r.status === statusFilter)
    if (catFilter !== "all")    d = d.filter(r => r.category === catFilter)
    d.sort((a, b) => {
      if (sortBy === "views")   return b.views   - a.views
      if (sortBy === "matches") return b.matches - a.matches
      return new Date(b.date_reported).getTime() - new Date(a.date_reported).getTime()
    })
    return d
  }, [search, typeFilter, statusFilter, catFilter, sortBy])

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: "#06060f", color: "white", fontFamily: "'DM Sans',sans-serif", padding: isMobile ? "16px" : "32px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
        .syne { font-family: 'Syne', sans-serif; }
        .rpt-input {
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px; padding: 9px 12px 9px 36px;
          color: white; font-size: 13px; font-family: 'DM Sans',sans-serif;
          outline: none; width: 100%; box-sizing: border-box; transition: all 0.2s;
        }
        .rpt-input::placeholder { color: rgba(255,255,255,0.25); }
        .rpt-input:focus { border-color: rgba(99,102,241,0.5); background: rgba(255,255,255,0.07); box-shadow: 0 0 0 3px rgba(99,102,241,0.12); }
        .row-hover:hover { background: rgba(255,255,255,0.035) !important; }
        .pg-btn { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: rgba(255,255,255,0.5); font-size: 12px; font-family:'DM Sans',sans-serif; transition: all 0.2s; }
        .pg-btn:hover { background: rgba(99,102,241,0.15); border-color: rgba(99,102,241,0.35); color: #818cf8; }
        .pg-btn.active { background: rgba(99,102,241,0.2); border-color: rgba(99,102,241,0.5); color: #a5b4fc; font-weight: 700; }
      `}</style>

      {/* Drawer */}
      <ReportDrawer report={selected} onClose={() => setSelected(null)} isMobile={isMobile} />

      {/* ── Page header ── */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 6 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 16px rgba(99,102,241,0.35)" }}>
            <ClipboardList size={18} color="white" />
          </div>
          <div>
            <h1 className="syne" style={{ fontSize: isMobile ? 20 : 24, fontWeight: 800, letterSpacing: "-0.5px", color: "#fff", margin: 0 }}>All Reports</h1>
            <p style={{ fontSize: 13, color: "#4b5563", margin: 0 }}>Review, manage, and act on all lost & found reports</p>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 10, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.5)", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
              <RefreshCw size={12} />
              {!isMobile && "Refresh"}
            </motion.button>
            {!isMobile && (
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 10, background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.25)", fontSize: 12, fontWeight: 600, color: "#818cf8", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
                <Download size={12} />Export CSV
              </motion.button>
            )}
          </div>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(4,1fr)", gap: isMobile ? 10 : 14, marginBottom: 24 }}>
        {[
          { label: "Total Reports", value: stats.total,        icon: ClipboardList, color: "#818cf8", glow: "rgba(99,102,241,0.25)"  },
          { label: "Open",          value: stats.open,         icon: Inbox,         color: "#34d399", glow: "rgba(52,211,153,0.2)"   },
          { label: "Under Review",  value: stats.under_review, icon: Clock,         color: "#fbbf24", glow: "rgba(251,191,36,0.2)"   },
          { label: "Urgent",        value: stats.urgent,       icon: AlertTriangle, color: "#f87171", glow: "rgba(248,113,113,0.2)"  },
        ].map((s, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            style={{ padding: isMobile ? "14px" : "18px", borderRadius: 14, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -20, right: -20, width: 80, height: 80, borderRadius: "50%", background: `radial-gradient(circle,${s.glow} 0%,transparent 70%)`, pointerEvents: "none" }} />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <div style={{ fontSize: 11, color: "#4b5563", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>{s.label}</div>
              <s.icon size={14} color={s.color} />
            </div>
            <div style={{ fontSize: isMobile ? 22 : 28, fontWeight: 800, color: s.color, fontFamily: "'Syne',sans-serif", letterSpacing: "-1px" }}>{s.value}</div>
            {!isMobile && i < 2 && (
              <div style={{ fontSize: 11, color: "#374151", marginTop: 4 }}>
                {i === 0 ? `${stats.lost} lost · ${stats.found} found` : `${stats.matched + stats.claimed} resolved total`}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* ── Toolbar ── */}
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "14px 16px", marginBottom: 16 }}>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Search */}
          <div style={{ position: "relative", flex: 1 }}>
            <Search size={14} color="rgba(255,255,255,0.3)" style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
            <input className="rpt-input" placeholder={isMobile ? "Search…" : "Search title, user, location, category…"} value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
            {search && (
              <button onClick={() => { setSearch(""); setPage(1) }}
                style={{ position: "absolute", right: 9, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", display: "flex", padding: 0 }}>
                <X size={12} color="#6b7280" />
              </button>
            )}
          </div>

          {/* Filters toggle button — same as AllUsers */}
          <motion.button whileTap={{ scale: 0.96 }} onClick={() => setShowFilters(v => !v)}
            style={{
              display: "flex", alignItems: "center", gap: 5, padding: "8px 12px", borderRadius: 9, flexShrink: 0,
              border:     showFilters ? "1px solid rgba(99,102,241,0.4)" : "1px solid rgba(255,255,255,0.1)",
              background: showFilters ? "rgba(99,102,241,0.12)"          : "rgba(255,255,255,0.04)",
              fontSize: 12, fontWeight: 500, color: showFilters ? "#a5b4fc" : "rgba(255,255,255,0.55)",
              cursor: "pointer", fontFamily: "'DM Sans',sans-serif", transition: "all 0.2s",
            }}>
            <Filter size={12} />
            {!isMobile && "Filters"}
            {activeFilterCount > 0 && (
              <span style={{ width: 14, height: 14, borderRadius: "50%", background: "#6366f1", fontSize: 8, fontWeight: 700, color: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {activeFilterCount}
              </span>
            )}
          </motion.button>

          {/* Count */}
          <div style={{ fontSize: 11, color: "#4b5563", whiteSpace: "nowrap", flexShrink: 0 }}>
            {filtered.length}/{DUMMY_REPORTS.length}
          </div>
        </div>

        {/* Expandable filter pills — same pattern as AllUsers */}
        <AnimatePresence>
          {showFilters && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.18 }} style={{ overflow: "hidden" }}>
              <div style={{ paddingTop: 12, marginTop: 12, borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-end" }}>

                {/* Type */}
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#4b5563", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 7 }}>Type</div>
                  <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                    {(["all","lost","found"] as ("all"|ReportType)[]).map(t => (
                      <button key={t} onClick={() => { setTypeFilter(t); setPage(1) }}
                        style={{ padding: "4px 11px", borderRadius: 7, border: typeFilter === t ? "1px solid rgba(99,102,241,0.4)" : "1px solid rgba(255,255,255,0.1)", background: typeFilter === t ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.04)", fontSize: 11, fontWeight: 500, color: typeFilter === t ? "#a5b4fc" : "rgba(255,255,255,0.5)", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", textTransform: "capitalize" }}>
                        {t === "all" ? "All" : t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Status */}
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#4b5563", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 7 }}>Status</div>
                  <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                    {(["all", ...STATUSES] as ("all"|ReportStatus)[]).map(s => (
                      <button key={s} onClick={() => { setStatusFilter(s); setPage(1) }}
                        style={{ padding: "4px 11px", borderRadius: 7, border: statusFilter === s ? "1px solid rgba(99,102,241,0.4)" : "1px solid rgba(255,255,255,0.1)", background: statusFilter === s ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.04)", fontSize: 11, fontWeight: 500, color: statusFilter === s ? "#a5b4fc" : "rgba(255,255,255,0.5)", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
                        {s === "all" ? "All" : STATUS_CFG[s].label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category */}
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#4b5563", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 7 }}>Category</div>
                  <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                    {(["all", ...CATEGORIES] as ("all"|Category)[]).map(c => (
                      <button key={c} onClick={() => { setCatFilter(c); setPage(1) }}
                        style={{ padding: "4px 11px", borderRadius: 7, border: catFilter === c ? "1px solid rgba(99,102,241,0.4)" : "1px solid rgba(255,255,255,0.1)", background: catFilter === c ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.04)", fontSize: 11, fontWeight: 500, color: catFilter === c ? "#a5b4fc" : "rgba(255,255,255,0.5)", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
                        {c === "all" ? "All" : c}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sort */}
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#4b5563", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 7 }}>Sort By</div>
                  <div style={{ display: "flex", gap: 5 }}>
                    {([["date","Newest"],["views","Most Viewed"],["matches","Most Matched"]] as [string,string][]).map(([v,l]) => (
                      <button key={v} onClick={() => setSortBy(v as any)}
                        style={{ padding: "4px 11px", borderRadius: 7, border: sortBy === v ? "1px solid rgba(99,102,241,0.4)" : "1px solid rgba(255,255,255,0.1)", background: sortBy === v ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.04)", fontSize: 11, fontWeight: 500, color: sortBy === v ? "#a5b4fc" : "rgba(255,255,255,0.5)", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
                        {l}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Clear */}
                {activeFilterCount > 0 && (
                  <button onClick={() => { setTypeFilter("all"); setStatusFilter("all"); setCatFilter("all"); setPage(1) }}
                    style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 7, border: "1px solid rgba(239,68,68,0.25)", background: "rgba(239,68,68,0.07)", fontSize: 11, color: "#f87171", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
                    <X size={9} /> Clear
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── Results count ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ fontSize: 12, color: "#4b5563" }}>
          Showing <span style={{ color: "#9ca3af", fontWeight: 600 }}>{filtered.length}</span> reports
          {search && <> for "<span style={{ color: "#818cf8" }}>{search}</span>"</>}
        </div>
      </div>

      {/* ── Table (desktop) / Cards (mobile) ── */}
      {!isMobile ? (
        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, overflow: "hidden", marginBottom: 20 }}>
          {/* Table header */}
          <div style={{ display: "grid", gridTemplateColumns: "52px 1fr 110px 120px 130px 90px 80px 60px", padding: "10px 16px", borderBottom: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}>
            {["#","Title & Reporter","Type","Category","Location","Status","Date",""].map((h, i) => (
              <div key={i} style={{ fontSize: 10, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: 1.2 }}>{h}</div>
            ))}
          </div>

          {/* Table rows */}
          {paginated.length === 0 ? (
            <div style={{ padding: "60px 20px", textAlign: "center", color: "#374151" }}>
              <PackageSearch size={32} style={{ margin: "0 auto 12px", opacity: 0.4 }} />
              <div style={{ fontSize: 14 }}>No reports match your filters</div>
            </div>
          ) : paginated.map((r, i) => {
            const CatIcon = CATEGORY_ICONS[r.category]
            return (
              <motion.div key={r.id}
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className="row-hover"
                style={{ display: "grid", gridTemplateColumns: "52px 1fr 110px 120px 130px 90px 80px 60px", padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.04)", alignItems: "center", transition: "background 0.15s", cursor: "pointer" }}
                onClick={() => setSelected(r)}
              >
                {/* ID */}
                <div style={{ fontSize: 11, color: "#374151", fontWeight: 600 }}>#{r.id}</div>

                {/* Title + user */}
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 3 }}>
                    {r.urgent && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#f87171", boxShadow: "0 0 6px #f87171", flexShrink: 0 }} />}
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.title}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <UserAvatar name={r.user.name} id={r.user.id} size={16} />
                    <span style={{ fontSize: 11, color: "#4b5563" }}>{r.user.name}</span>
                    {r.reward && <span style={{ fontSize: 10, color: "#fbbf24", background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.2)", padding: "1px 6px", borderRadius: 20 }}>{r.reward}</span>}
                  </div>
                </div>

                {/* Type */}
                <div><Badge type={r.type} /></div>

                {/* Category */}
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <CatIcon size={12} color="#4b5563" />
                  <span style={{ fontSize: 11, color: "#6b7280" }}>{r.category}</span>
                </div>

                {/* Location */}
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <MapPin size={11} color="#4b5563" style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: "#6b7280", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.location.split(",")[0]}</span>
                </div>

                {/* Status */}
                <div><StatusPill status={r.status} /></div>

                {/* Date */}
                <div style={{ fontSize: 11, color: "#4b5563" }}>{timeAgo(r.date_reported)}</div>

                {/* View btn */}
                <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.94 }}
                  onClick={e => { e.stopPropagation(); setSelected(r) }}
                  style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                  <Eye size={12} color="#818cf8" />
                </motion.button>
              </motion.div>
            )
          })}
        </div>
      ) : (
        /* ── Mobile cards ── */
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
          {paginated.length === 0 ? (
            <div style={{ padding: "48px 20px", textAlign: "center", color: "#374151", borderRadius: 14, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <PackageSearch size={28} style={{ margin: "0 auto 10px", opacity: 0.4 }} />
              <div style={{ fontSize: 13 }}>No reports match your filters</div>
            </div>
          ) : paginated.map((r, i) => {
            const CatIcon = CATEGORY_ICONS[r.category]
            return (
              <motion.div key={r.id}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                onClick={() => setSelected(r)}
                style={{ padding: "14px", borderRadius: 14, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", cursor: "pointer", transition: "border-color 0.2s" }}
              >
                {/* Top row */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 8 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4, flexWrap: "wrap" }}>
                      <Badge type={r.type} />
                      <StatusPill status={r.status} />
                      {r.urgent && <span style={{ fontSize: 9, fontWeight: 700, color: "#f87171", background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.25)", padding: "2px 7px", borderRadius: 20 }}>URGENT</span>}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0", lineHeight: 1.35 }}>{r.title}</div>
                  </div>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Eye size={12} color="#818cf8" />
                  </div>
                </div>

                {/* Meta row */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <UserAvatar name={r.user.name} id={r.user.id} size={16} />
                    <span style={{ fontSize: 11, color: "#6b7280" }}>{r.user.name}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <MapPin size={10} color="#4b5563" />
                    <span style={{ fontSize: 11, color: "#4b5563" }}>{r.location.split(",")[0]}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <CatIcon size={10} color="#4b5563" />
                    <span style={{ fontSize: 11, color: "#4b5563" }}>{r.category}</span>
                  </div>
                  <span style={{ fontSize: 11, color: "#374151", marginLeft: "auto" }}>{timeAgo(r.date_reported)}</span>
                </div>

                {r.reward && (
                  <div style={{ marginTop: 8, display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, color: "#fbbf24", background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)", padding: "3px 9px", borderRadius: 20 }}>
                    <Flag size={10} />Reward: {r.reward}
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      )}

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, flexWrap: "wrap" }}>
          <button className="pg-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>‹</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
            .reduce<(number | "…")[]>((acc, p, i, arr) => {
              if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push("…")
              acc.push(p)
              return acc
            }, [])
            .map((p, i) =>
              p === "…"
                ? <span key={`e${i}`} style={{ fontSize: 12, color: "#374151", padding: "0 4px" }}>…</span>
                : <button key={p} className={`pg-btn${p === page ? " active" : ""}`} onClick={() => setPage(p as number)}>{p}</button>
            )
          }
          <button className="pg-btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>›</button>
        </div>
      )}
    </div>
  )
}