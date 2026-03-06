import { Navigate, Outlet } from "react-router-dom"

interface Props {
  allowedRole:  string | string[]
}

export default function ProtectedRoute({ allowedRole }: Props) {
  const role = localStorage.getItem("role")

  if (!role) {
    return <Navigate to="/login" replace />
  }

  if (role !== allowedRole) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}