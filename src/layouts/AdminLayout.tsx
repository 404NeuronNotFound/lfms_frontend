import { Outlet } from "react-router-dom"
import { Sidebar } from "@/components/Sidebar"

export default function AdminLayout() {
  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Sidebar />
      <main style={{ flex: 1, padding: "20px", backgroundColor: "#f5f5f5" }}>
        <Outlet />
      </main>
    </div>
  )
}