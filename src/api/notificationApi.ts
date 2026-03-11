import { authFetch } from "@/api/authApi"
import type { Notification, NotificationListResponse } from "@/types/reportTypes"

const BASE = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000/api"

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.detail ?? `Request failed (${res.status})`)
  }
  return res.json() as Promise<T>
}

/** GET /api/notifications/ — current user's notifications (newest first, max 50) */
export async function getNotifications(): Promise<NotificationListResponse> {
  const res = await authFetch(`${BASE}/notifications/`)
  return handleResponse<NotificationListResponse>(res)
}

/** POST /api/notifications/<id>/read/ — mark one as read */
export async function markNotificationRead(id: number): Promise<{ message: string }> {
  const res = await authFetch(`${BASE}/notifications/${id}/read/`, { method: "POST" })
  return handleResponse(res)
}

/** POST /api/notifications/read-all/ — mark all as read */
export async function markAllNotificationsRead(): Promise<{ message: string }> {
  const res = await authFetch(`${BASE}/notifications/read-all/`, { method: "POST" })
  return handleResponse(res)
}