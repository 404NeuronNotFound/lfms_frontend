import { create } from "zustand"
import { loginUser, refreshAccessToken } from "@/api/authApi"

interface AuthState {
  user:    string | null
  role:    string | null
  access:  string | null
  loading: boolean

  login:          (username: string, password: string) => Promise<void>
  logout:         () => void
  silentRefresh:  () => Promise<string | null>
  startRefreshTimer: () => void
  stopRefreshTimer:  () => void
}


let _refreshTimer: ReturnType<typeof setTimeout> | null = null

const ACCESS_LIFETIME_MS   = 30 * 60 * 1000   
const REFRESH_BEFORE_MS    = 60 * 1000         
const REFRESH_INTERVAL_MS  = ACCESS_LIFETIME_MS - REFRESH_BEFORE_MS  

export const useAuthStore = create<AuthState>((set, get) => ({
  user:    localStorage.getItem("user"),
  role:    localStorage.getItem("role"),
  access:  localStorage.getItem("access"),
  loading: false,


  silentRefresh: async () => {
    const refresh = localStorage.getItem("refresh")

    if (!refresh) return null

    try {
      const newAccess = await refreshAccessToken()
      set({ access: newAccess })
      return newAccess
    } catch (err: any) {
      const msg = err?.message ?? ""


      if (msg === "Refresh token expired" || msg === "No refresh token") {
        get().logout()
      }

      return null
    }
  },


  startRefreshTimer: () => {
 
    if (_refreshTimer) clearInterval(_refreshTimer)
    _refreshTimer = setInterval(() => {
      get().silentRefresh()
    }, REFRESH_INTERVAL_MS)
  },

  stopRefreshTimer: () => {
    if (_refreshTimer) {
      clearInterval(_refreshTimer)
      _refreshTimer = null
    }
  },


  login: async (username, password) => {
    set({ loading: true })
    try {
      const data = await loginUser({ username, password })

      localStorage.setItem("access",  data.access)
      localStorage.setItem("refresh", data.refresh)
      localStorage.setItem("role",    data.role)
      localStorage.setItem("user",    data.username)

      set({
        user:    data.username,
        role:    data.role,
        access:  data.access,
        loading: false,
      })

      get().startRefreshTimer()

      window.location.href = data.role === "ADMIN" ? "/admin-dashboard" : "/user-dashboard"

    } catch (error) {
      set({ loading: false })
      throw error
    }
  },

  logout: () => {
    get().stopRefreshTimer()

    const refresh = localStorage.getItem("refresh")


    if (refresh) {
      const access = localStorage.getItem("access")
      fetch("http://localhost:8000/api/logout/", {
        method:  "POST",
        headers: {
          "Content-Type":  "application/json",
          ...(access ? { Authorization: `Bearer ${access}` } : {}),
        },
        body: JSON.stringify({ refresh }),
      }).catch(() => {

      })
    }

    localStorage.removeItem("access")
    localStorage.removeItem("refresh")
    localStorage.removeItem("role")
    localStorage.removeItem("user")

    set({ user: null, role: null, access: null })

    window.location.href = "/login"
  },
}))


;(function bootstrapRefreshTimer() {
  const refresh = localStorage.getItem("refresh")
  const access  = localStorage.getItem("access")


  if (!refresh || !access) return

  const authPages = ["/login", "/register", "/"]
  const path = typeof window !== "undefined" ? window.location.pathname : ""
  if (authPages.some(p => path === p || path.startsWith(p + "?"))) return


  const store = useAuthStore.getState()
  store.silentRefresh().then(newToken => {

    if (newToken) store.startRefreshTimer()
  })
})()