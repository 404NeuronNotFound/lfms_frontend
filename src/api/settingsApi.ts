import { authFetch } from "@/api/authApi"
import type {
  UserProfile,
  UpdateProfilePayload,
  UpdateProfileResponse,
  ChangePasswordPayload,
  ChangePasswordResponse,
  NotificationPrefsPayload,
  DeleteAccountPayload,
} from "@/types/settingsTypes"

const BASE = "http://localhost:8000/api"

const JSON_HEADERS = { "Content-Type": "application/json" }


async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    const firstField = Object.values(err)?.[0]
    const fieldMsg   = Array.isArray(firstField) ? firstField[0] : null
    throw new Error(fieldMsg || err?.detail || err?.message || `Request failed (${res.status})`)
  }
  return res.json()
}


export async function getProfile(): Promise<UserProfile> {
  const res = await authFetch(`${BASE}/profile/`)
  return handleResponse<UserProfile>(res)
}


export async function updateProfile(payload: UpdateProfilePayload): Promise<UpdateProfileResponse> {
  const fd = new FormData()

  if (payload.first_name !== undefined) fd.append("first_name", payload.first_name)
  if (payload.last_name  !== undefined) fd.append("last_name",  payload.last_name)
  if (payload.email      !== undefined) fd.append("email",      payload.email)

  if (payload.profile?.phone_number !== undefined)
    fd.append("profile[phone_number]", payload.profile.phone_number ?? "")
  if (payload.profile?.address !== undefined)
    fd.append("profile[address]", payload.profile.address ?? "")
  if (payload.profile?.bio !== undefined)
    fd.append("profile[bio]", payload.profile.bio ?? "")


  if (payload.profile?.avatar instanceof File)
    fd.append("profile[avatar]", payload.profile.avatar)


  const res = await authFetch(`${BASE}/profile/`, { method: "PATCH", body: fd })
  return handleResponse<UpdateProfileResponse>(res)
}


export async function changePassword(payload: ChangePasswordPayload): Promise<ChangePasswordResponse> {
  const res = await authFetch(`${BASE}/change-password/`, {
    method:  "POST",
    headers: JSON_HEADERS,
    body:    JSON.stringify(payload),
  })
  return handleResponse<ChangePasswordResponse>(res)
}


export async function updateNotificationPrefs(payload: NotificationPrefsPayload): Promise<{ message: string }> {
  const res = await authFetch(`${BASE}/notification-preferences/`, {
    method:  "PATCH",
    headers: JSON_HEADERS,
    body:    JSON.stringify(payload),
  })
  return handleResponse<{ message: string }>(res)
}

export async function deleteAccount(payload: DeleteAccountPayload): Promise<{ message: string }> {
  const res = await authFetch(`${BASE}/delete-account/`, {
    method:  "DELETE",
    headers: JSON_HEADERS,
    body:    JSON.stringify(payload),
  })
  return handleResponse<{ message: string }>(res)
}