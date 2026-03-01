import { create } from "zustand"
import { loginUser } from "@/api/authApi"

interface AuthState {
  user: string | null
  role: string | null
  access: string | null
  loading: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  role: null,
  access: null,
  loading: false,

  login: async (username, password) => {
    try {
      set({ loading: true })

      const data = await loginUser({ username, password })

      localStorage.setItem("access", data.access)
      localStorage.setItem("refresh", data.refresh)
      localStorage.setItem("role", data.role)

      set({
        user: data.username,
        role: data.role,
        access: data.access,
        loading: false,
      })
      if (data.role === "ADMIN") {
        window.location.href = "/admin-dashboard"
      } else {
        window.location.href = "/user-dashboard"
      }

    } catch (error) {
      set({ loading: false })
      throw error
    }
  },

  logout: () => {
    localStorage.removeItem("access")
    localStorage.removeItem("refresh")

    set({
      user: null,
      role: null,
      access: null,
    })

    window.location.href = "/login"
  },
}))