import { Routes, Route, BrowserRouter } from "react-router-dom"
import LandingPage from "@/pages/LandingPage"
import LoginPage from "@/pages/Login"
import ProtectedRoute from "./routes/ProtectedRoutes"
import AdminDashboard from "./pages/admin/Dashboard"
import UserDashboard from "./pages/user/Dashboard"


export default function App() {
  return (

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute allowedRole="ADMIN" />}>
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
        </Route>

        <Route element={<ProtectedRoute allowedRole="USER" />}>
          <Route path="/user-dashboard" element={<UserDashboard />} />
        </Route>
      </Routes>

  )
}


