import { authFetch } from "@/api/authApi"
import type { UserDashboardData } from "@/types/userDashboardTypes"

const BASE = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000/api"

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.detail ?? err?.message ?? `Request failed (${res.status})`)
  }
  return res.json() as Promise<T>
}

/** GET /api/user-dashboard/ */
export async function fetchUserDashboard(): Promise<UserDashboardData> {
  const res = await authFetch(`${BASE}/user-dashboard/`)
  return handleResponse<UserDashboardData>(res)
}