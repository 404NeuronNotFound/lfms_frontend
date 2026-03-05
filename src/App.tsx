import { Routes, Route } from "react-router-dom"
import LandingPage from "@/pages/LandingPage"
import LoginPage from "@/pages/Login"
import RegisterPage from "@/pages/RegisterPage"
import ProtectedRoute from "./routes/ProtectedRoutes"
import GuestRoute from "./routes/GuestRoute"
import AdminDashboard from "./pages/admin/Dashboard"
import AdminLayout from "./layouts/AdminLayout"

import UserDashboard from "./pages/user/Dashboard"



export default function App() {
  return (

      <Routes>
        <Route element={<GuestRoute />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRole="ADMIN" />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRole="USER" />}>
          <Route path="/user-dashboard" element={<UserDashboard />} />
        </Route>
      </Routes>

  )
}


