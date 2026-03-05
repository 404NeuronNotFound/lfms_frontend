import { Outlet } from "react-router-dom"
import { Sidebar } from "@/components/Sidebar"
import { useState } from "react"

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#06060f" }}>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <main style={{
        flex: 1,
        marginLeft: collapsed ? 64 : 240,
        transition: "margin-left 0.3s ease",
        padding: "32px",
        minHeight: "100vh",
        color: "white",
      }}>
        <Outlet />
      </main>
    </div>
  )
}