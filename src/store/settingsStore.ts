import { create } from "zustand"
import {
  getProfile,
  updateProfile,
  changePassword,
  updateNotificationPrefs,
  deleteAccount,
  deactivateAccount,
  reactivateAccount,
} from "@/api/settingsApi"
import type {
  UserProfile,
  UpdateProfilePayload,
  ChangePasswordPayload,
  NotificationPrefsPayload,
  DeleteAccountPayload,
  DeactivateAccountPayload,
} from "@/types/settingsTypes"

interface SettingsState {
  profile:         UserProfile | null
  loadingProfile:  boolean
  savingProfile:   boolean
  savingPassword:  boolean
  savingNotifs:    boolean
  deletingAccount: boolean
  togglingStatus:  boolean          // covers both deactivate + reactivate
  profileError:    string | null
  passwordError:   string | null
  notifsError:     string | null
  statusError:     string | null
  successMessage:  string | null

  fetchProfile:     () => Promise<void>
  saveProfile:      (payload: UpdateProfilePayload)      => Promise<void>
  savePassword:     (payload: ChangePasswordPayload)     => Promise<void>
  saveNotifPrefs:   (payload: NotificationPrefsPayload)  => Promise<void>
  removeAccount:    (payload: DeleteAccountPayload)      => Promise<void>

  /**
   * Deactivate the logged-in user's own account (sets status → "inactive").
   * Pass `logoutAfter: true` (default) to clear tokens and redirect to /login.
   */
  deactivate: (opts?: { logoutAfter?: boolean; payload?: DeactivateAccountPayload }) => Promise<void>

  /**
   * Reactivate the logged-in user's own account (sets status → "active").
   * Only works while the JWT session is still valid.
   */
  reactivate: () => Promise<void>

  clearMessages: () => void
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  profile:         null,
  loadingProfile:  false,
  savingProfile:   false,
  savingPassword:  false,
  savingNotifs:    false,
  deletingAccount: false,
  togglingStatus:  false,
  profileError:    null,
  passwordError:   null,
  notifsError:     null,
  statusError:     null,
  successMessage:  null,

  // ── Load profile ────────────────────────────────────────────────────────
  fetchProfile: async () => {
    set({ loadingProfile: true, profileError: null })
    try {
      const profile = await getProfile()
      set({ profile, loadingProfile: false })
    } catch (err: any) {
      set({ loadingProfile: false, profileError: err.message ?? "Failed to load profile" })
    }
  },

  // ── Save profile ────────────────────────────────────────────────────────
  saveProfile: async (payload) => {
    set({ savingProfile: true, profileError: null, successMessage: null })
    try {
      const res = await updateProfile(payload)
      set({
        savingProfile:  false,
        profile:        res.user,
        successMessage: "Profile updated successfully",
      })
    } catch (err: any) {
      set({ savingProfile: false, profileError: err.message ?? "Failed to update profile" })
      throw err
    }
  },

  // ── Change password ─────────────────────────────────────────────────────
  savePassword: async (payload) => {
    set({ savingPassword: true, passwordError: null, successMessage: null })
    try {
      const res = await changePassword(payload)
      set({ savingPassword: false, successMessage: res.message || "Password changed successfully" })
    } catch (err: any) {
      set({ savingPassword: false, passwordError: err.message ?? "Failed to change password" })
      throw err
    }
  },

  // ── Notification preferences ────────────────────────────────────────────
  saveNotifPrefs: async (payload) => {
    set({ savingNotifs: true, notifsError: null, successMessage: null })
    try {
      await updateNotificationPrefs(payload)
      set((s) => ({
        savingNotifs:   false,
        successMessage: "Notification preferences saved",
        profile: s.profile ? { ...s.profile, ...payload } : s.profile,
      }))
    } catch (err: any) {
      set({ savingNotifs: false, notifsError: err.message ?? "Failed to save preferences" })
      throw err
    }
  },

  // ── Delete account ──────────────────────────────────────────────────────
  removeAccount: async (payload) => {
    set({ deletingAccount: true })
    try {
      await deleteAccount(payload)
      localStorage.clear()
      window.location.href = "/login"
    } catch (err: any) {
      set({ deletingAccount: false })
      throw err
    }
  },

  // ── Deactivate account ──────────────────────────────────────────────────
  deactivate: async ({ logoutAfter = true, payload } = {}) => {
    set({ togglingStatus: true, statusError: null, successMessage: null })
    try {
      const res = await deactivateAccount(payload)
      set((s) => ({
        togglingStatus: false,
        successMessage: res.message || "Account deactivated",
        // Reflect the status change locally so the UI updates immediately
        profile: s.profile ? { ...s.profile, status: "inactive" as const } : s.profile,
      }))
      if (logoutAfter) {
        // Give the success toast a moment to show, then log out
        setTimeout(() => {
          localStorage.removeItem("access")
          localStorage.removeItem("refresh")
          localStorage.removeItem("role")
          localStorage.removeItem("user")
          window.location.href = "/login"
        }, 1200)
      }
    } catch (err: any) {
      set({ togglingStatus: false, statusError: err.message ?? "Failed to deactivate account" })
      throw err
    }
  },

  // ── Reactivate account ──────────────────────────────────────────────────
  reactivate: async () => {
    set({ togglingStatus: true, statusError: null, successMessage: null })
    try {
      const res = await reactivateAccount()
      set((s) => ({
        togglingStatus: false,
        successMessage: res.message || "Account reactivated",
        profile: s.profile ? { ...s.profile, status: "active" as const } : s.profile,
      }))
    } catch (err: any) {
      set({ togglingStatus: false, statusError: err.message ?? "Failed to reactivate account" })
      throw err
    }
  },


  clearMessages: () => set({
    successMessage: null,
    profileError:   null,
    passwordError:  null,
    notifsError:    null,
    statusError:    null,
  }),
}))