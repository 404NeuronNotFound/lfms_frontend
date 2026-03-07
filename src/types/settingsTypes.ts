// ── Profile (as returned by the server) ──────────────────────────────────
export interface UserProfile {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  profile: {
    phone_number?: string
    address?: string
    bio?: string
    avatar?: string        // URL string from server
  }
  role: string
  status: "active" | "inactive" | "banned"
  date_joined: string
  notifications_email: boolean
  notifications_push: boolean
  notifications_sms: boolean
  two_factor_enabled: boolean
}

// ── Update profile (sent to server) ──────────────────────────────────────
export interface UpdateProfilePayload {
  first_name?: string
  last_name?: string
  email?: string
  profile?: {
    phone_number?: string
    address?: string
    bio?: string
    avatar?: File          // File object → sent as multipart
  }
}

export interface UpdateProfileResponse {
  message: string
  user: UserProfile
}

// ── Change password ───────────────────────────────────────────────────────
export interface ChangePasswordPayload {
  current_password: string
  new_password: string
  confirm_new_password: string
}

export interface ChangePasswordResponse {
  message: string
}

// ── Notification preferences ──────────────────────────────────────────────
export interface NotificationPrefsPayload {
  notifications_email: boolean
  notifications_push: boolean
  notifications_sms: boolean
}

// ── Delete account ────────────────────────────────────────────────────────
export interface DeleteAccountPayload {
  password: string
}

// ── Deactivate / Reactivate account ──────────────────────────────────────
export interface DeactivateAccountPayload {
  refresh?: string       // optional: blacklists current refresh token server-side
}

export interface DeactivateAccountResponse {
  message: string
}

export interface ReactivateAccountResponse {
  message: string
}