import { authFetch } from "@/api/authApi"
import type { AdminDashboardData } from "@/types/dashboardTypes"

const BASE = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000/api"

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.detail ?? err?.message ?? `Request failed (${res.status})`)
  }
  return res.json() as Promise<T>
}

/** GET /api/admin-dashboard/ */
export async function fetchAdminDashboard(): Promise<AdminDashboardData> {
  const res = await authFetch(`${BASE}/admin-dashboard/`)
  return handleResponse<AdminDashboardData>(res)
}