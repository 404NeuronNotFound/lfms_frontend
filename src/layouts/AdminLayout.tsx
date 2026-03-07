import { Outlet } from "react-router-dom"
import { Sidebar } from "@/components/Sidebar"
import { useState, useEffect } from "react"

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [isMobile, setIsMobile]   = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#06060f" }}>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <main style={{
        flex: 1,
        marginLeft: isMobile ? 0 : (collapsed ? 64 : 240),
        transition: "margin-left 0.3s ease",
        padding: isMobile ? "72px 16px 24px" : "32px",
        minHeight: "100vh",
        color: "white",
        display: "flex",
        flexDirection: "column",
        alignItems: isMobile ? "center" : "stretch",
      }}>
        <div style={{ width: "100%", maxWidth: isMobile ? 480 : "100%" }}>
          <Outlet />
        </div>
      </main>
    </div>
  )
}