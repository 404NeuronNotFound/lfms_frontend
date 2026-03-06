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

// ── Auth-only headers (no Content-Type — let browser set for FormData) ────
function authToken(): Record<string, string> {
  const token = localStorage.getItem("access")
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// ── JSON headers (for non-file endpoints) ────────────────────────────────
function jsonHeaders(): Record<string, string> {
  return { "Content-Type": "application/json", ...authToken() }
}

// ── Error parser — surfaces Django field errors like {email:["taken"]} ───
async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    const firstField = Object.values(err)?.[0]
    const fieldMsg   = Array.isArray(firstField) ? firstField[0] : null
    throw new Error(fieldMsg || err?.detail || err?.message || `Request failed (${res.status})`)
  }
  return res.json()
}

// ── GET /api/profile/ ─────────────────────────────────────────────────────
export async function getProfile(): Promise<UserProfile> {
  const res = await fetch(`${BASE}/profile/`, { headers: jsonHeaders() })
  return handleResponse<UserProfile>(res)
}

// ── PATCH /api/profile/ — always multipart/form-data ─────────────────────
//
// Django REST Framework with nested serializers requires flat field names
// for nested objects using dot or bracket notation, e.g.:
//   profile.phone_number   OR   profile[phone_number]
//
// We also attach the avatar File directly so Django's ImageField can parse it.
//
export async function updateProfile(payload: UpdateProfilePayload): Promise<UpdateProfileResponse> {
  const fd = new FormData()

  // Top-level User fields
  if (payload.first_name !== undefined) fd.append("first_name", payload.first_name)
  if (payload.last_name  !== undefined) fd.append("last_name",  payload.last_name)
  if (payload.email      !== undefined) fd.append("email",      payload.email)

  // Nested profile fields — bracket notation matches what ProfileView.patch() reads
  if (payload.profile?.phone_number !== undefined)
    fd.append("profile[phone_number]", payload.profile.phone_number ?? "")
  if (payload.profile?.address !== undefined)
    fd.append("profile[address]", payload.profile.address ?? "")
  if (payload.profile?.bio !== undefined)
    fd.append("profile[bio]", payload.profile.bio ?? "")

  // Avatar — only append if it's a real File object (not undefined/null)
  if (payload.profile?.avatar instanceof File)
    fd.append("profile[avatar]", payload.profile.avatar)

  const res = await fetch(`${BASE}/profile/`, {
    method:  "PATCH",
    headers: authToken(),   // NO Content-Type — browser sets multipart boundary
    body:    fd,
  })
  return handleResponse<UpdateProfileResponse>(res)
}

// ── POST /api/change-password/ ────────────────────────────────────────────
export async function changePassword(payload: ChangePasswordPayload): Promise<ChangePasswordResponse> {
  const res = await fetch(`${BASE}/change-password/`, {
    method:  "POST",
    headers: jsonHeaders(),
    body:    JSON.stringify(payload),
  })
  return handleResponse<ChangePasswordResponse>(res)
}

// ── PATCH /api/notification-preferences/ ─────────────────────────────────
export async function updateNotificationPrefs(payload: NotificationPrefsPayload): Promise<{ message: string }> {
  const res = await fetch(`${BASE}/notification-preferences/`, {
    method:  "PATCH",
    headers: jsonHeaders(),
    body:    JSON.stringify(payload),
  })
  return handleResponse<{ message: string }>(res)
}

// ── DELETE /api/delete-account/ ───────────────────────────────────────────
export async function deleteAccount(payload: DeleteAccountPayload): Promise<{ message: string }> {
  const res = await fetch(`${BASE}/delete-account/`, {
    method:  "DELETE",
    headers: jsonHeaders(),
    body:    JSON.stringify(payload),
  })
  return handleResponse<{ message: string }>(res)
}