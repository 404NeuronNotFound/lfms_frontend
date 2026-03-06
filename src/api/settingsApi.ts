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

function authHeaders() {
  const token = localStorage.getItem("access")
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.detail || err?.message || `Request failed (${res.status})`)
  }
  return res.json()
}


export async function getProfile(): Promise<UserProfile> {
  const res = await fetch(`${BASE}/profile/`, { headers: authHeaders() })
  return handleResponse<UserProfile>(res)
}


export async function updateProfile(payload: UpdateProfilePayload): Promise<UpdateProfileResponse> {
  const res = await fetch(`${BASE}/profile/`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  })
  return handleResponse<UpdateProfileResponse>(res)
}

export async function changePassword(payload: ChangePasswordPayload): Promise<ChangePasswordResponse> {
  const res = await fetch(`${BASE}/change-password`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  })
  return handleResponse<ChangePasswordResponse>(res)
}


export async function updateNotificationPrefs(payload: NotificationPrefsPayload): Promise<{ message: string }> {
  const res = await fetch(`${BASE}/notification-preferences`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  })
  return handleResponse<{ message: string }>(res)
}

export async function deleteAccount(payload: DeleteAccountPayload): Promise<{ message: string }> {
  const res = await fetch(`${BASE}/delete-account`, {
    method: "DELETE",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  })
  return handleResponse<{ message: string }>(res)
}