import { create } from "zustand"
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "@/api/notificationApi"
import type { Notification } from "@/types/reportTypes"

// ─────────────────────────────────────────────────────────────────────────────
//  STATE SHAPE
// ─────────────────────────────────────────────────────────────────────────────
interface NotificationState {
  notifications:  Notification[]
  unreadCount:    number
  loading:        boolean
  error:          string

  // polling
  _pollTimer:     ReturnType<typeof setInterval> | null

  // actions
  fetchNotifications:   () => Promise<void>
  markRead:             (id: number) => Promise<void>
  markAllRead:          () => Promise<void>
  startPolling:         (intervalMs?: number) => void
  stopPolling:          () => void
  clearError:           () => void
}

// ─────────────────────────────────────────────────────────────────────────────
//  STORE
// ─────────────────────────────────────────────────────────────────────────────
export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount:   0,
  loading:       false,
  error:         "",
  _pollTimer:    null,

  fetchNotifications: async () => {
    // Silent fetch (no loading spinner) if we already have data — for polling
    const alreadyLoaded = get().notifications.length > 0
    if (!alreadyLoaded) set({ loading: true })
    try {
      const res = await getNotifications()
      set({
        notifications: res.results,
        unreadCount:   res.unread_count,
        loading:       false,
        error:         "",
      })
    } catch (e: any) {
      set({ loading: false, error: e.message ?? "Failed to load notifications." })
    }
  },

  markRead: async (id: number) => {
    // Optimistic update
    set(state => ({
      notifications: state.notifications.map(n =>
        n.id === id ? { ...n, is_read: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }))
    try {
      await markNotificationRead(id)
    } catch {
      // Revert on failure
      get().fetchNotifications()
    }
  },

  markAllRead: async () => {
    // Optimistic update
    set(state => ({
      notifications: state.notifications.map(n => ({ ...n, is_read: true })),
      unreadCount:   0,
    }))
    try {
      await markAllNotificationsRead()
    } catch {
      get().fetchNotifications()
    }
  },

  startPolling: (intervalMs = 30_000) => {
    const { stopPolling, fetchNotifications } = get()
    stopPolling()
    fetchNotifications()
    const timer = setInterval(fetchNotifications, intervalMs)
    set({ _pollTimer: timer })
  },

  stopPolling: () => {
    const { _pollTimer } = get()
    if (_pollTimer) {
      clearInterval(_pollTimer)
      set({ _pollTimer: null })
    }
  },

  clearError: () => set({ error: "" }),
}))