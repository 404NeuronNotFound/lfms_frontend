import { Routes, Route } from "react-router-dom"
import LandingPage from "@/pages/LandingPage"
import LoginPage from "@/pages/Login"
import RegisterPage from "@/pages/RegisterPage"
import ProtectedRoute from "./routes/ProtectedRoutes"
import GuestRoute from "./routes/GuestRoute"

import AdminDashboard from "./pages/admin/Dashboard"
import AdminLayout from "./layouts/AdminLayout"
import AdminAllUser from "./pages/admin/AllUser"
import AdminAllReports from "./pages/admin/AllReports"
import AdminClaims from "./pages/admin/AdminClaims"
import AdminNotifications from "./pages/Notifications"
import AdminLogs from "./pages/admin/AuditLogs"

import UserDashboard from "./pages/user/Dashboard"
import UserLayout from "./layouts/UserLayout"
import UserReportLost from "./pages/user/ReportLost"
import UserMyReports from "./pages/user/MyReports"
import UserReportFound from "./pages/user/ReportFound"
import UserBrowseItems from "./pages/user/BrowseItems"
import UserMyClaims from "./pages/user/MyClaims"
import UserNotifications from "./pages/Notifications"


import Settings from "./pages/Settings"



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
            <Route path="/admin-settings" element={<Settings />} />
            <Route path="/admin-all-users" element={<AdminAllUser />} />
            <Route path="/admin-all-reports" element={<AdminAllReports />} />
            <Route path="/admin-claims" element={<AdminClaims />} />
            <Route path="/admin-notifications" element={<AdminNotifications />} />
            <Route path="/admin-audit-logs" element={<AdminLogs />} />

          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRole="USER" />}>
          <Route element={<UserLayout />}>
            <Route path="/user-dashboard" element={<UserDashboard />} />
            <Route path="/user-settings" element={<Settings />} />
            <Route path="/user-report-lost" element={<UserReportLost />} />
            <Route path="/user-my-reports" element={<UserMyReports />} />
            <Route path="/user-report-found" element={<UserReportFound />} />
            <Route path="/user-browse-items" element={<UserBrowseItems />} /> 
            <Route path="/user-my-claims" element={<UserMyClaims />} />
            <Route path="/user-notifications" element={<UserNotifications />} />
          </Route>
        </Route>        
      </Routes>

  )
}


