import { Navigate, Outlet } from "react-router-dom"

export default function GuestRoute() {
  const token = localStorage.getItem("access")
  const role = localStorage.getItem("role")

  if (token) {
    if (role === "ADMIN") {
      return <Navigate to="/admin-dashboard" replace />
    }

    if (role === "USER") {
      return <Navigate to="/user-dashboard" replace />
    }
  }

  return <Outlet />
}