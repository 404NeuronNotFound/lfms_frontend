import { create } from "zustand"
import type { ApiUser, UserStats } from "@/types/userTypes"
import {
  fetchAllUsers,
  fetchUserStats,
  banUser,
  unbanUser,
  deleteUser,
} from "@/api/userApi"

interface UserStoreState {
    
  users:        ApiUser[]
  stats:        UserStats | null

  loading:      boolean
  statsLoading: boolean

  error:        string | null

  loadUsers:  () => Promise<void>
  loadStats:  () => Promise<void>
  refresh:    () => Promise<void>   


  patchLocal: (updated: ApiUser) => void

  ban:    (user: ApiUser) => Promise<{ ok: boolean; message: string }>

  unban:  (user: ApiUser) => Promise<{ ok: boolean; message: string }>

  remove: (user: ApiUser) => Promise<{ ok: boolean; message: string }>

  clearError: () => void
}

export const useUserStore = create<UserStoreState>((set, get) => ({
  users:        [],
  stats:        null,
  loading:      false,
  statsLoading: false,
  error:        null,


  loadUsers: async () => {
    set({ loading: true, error: null })
    try {
      const data = await fetchAllUsers()
      set({ users: data.users })
    } catch (e: any) {
      set({ error: e.message ?? "Failed to load users." })
    } finally {
      set({ loading: false })
    }
  },

  loadStats: async () => {
    set({ statsLoading: true })
    try {
      const data = await fetchUserStats()
      set({ stats: data })
    } catch {

    } finally {
      set({ statsLoading: false })
    }
  },

  refresh: async () => {
    await Promise.all([get().loadUsers(), get().loadStats()])
  },


  patchLocal: (updated) => {
    set(state => ({
      users: state.users.map(u => u.id === updated.id ? updated : u),
    }))
  },

  clearError: () => set({ error: null }),


  ban: async (user) => {
    try {
      const res = await banUser(user.id)
      if (res.ok) {
        const updated = { ...user, status: "banned" as const }
        get().patchLocal(updated)
        get().loadStats()
        return { ok: true, message: `${user.username} has been banned.` }
      }
      const err = await res.json()
      return { ok: false, message: err.detail ?? "Failed to ban user." }
    } catch {
      return { ok: false, message: "Network error. Please try again." }
    }
  },

  unban: async (user) => {
    try {
      const res = await unbanUser(user.id)
      if (res.ok) {
        const updated = { ...user, status: "active" as const }
        get().patchLocal(updated)
        get().loadStats()
        return { ok: true, message: `${user.username} has been unbanned.` }
      }
      const err = await res.json()
      return { ok: false, message: err.detail ?? "Failed to unban user." }
    } catch {
      return { ok: false, message: "Network error. Please try again." }
    }
  },

  remove: async (user) => {
    try {
      const res = await deleteUser(user.id)
      if (res.ok) {
        set(state => ({ users: state.users.filter(u => u.id !== user.id) }))
        get().loadStats()
        return { ok: true, message: `${user.username} has been deleted.` }
      }
      const err = await res.json()
      return { ok: false, message: err.detail ?? "Failed to delete user." }
    } catch {
      return { ok: false, message: "Network error. Please try again." }
    }
  },
}))