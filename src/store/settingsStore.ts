import { create } from "zustand"
import {
  getProfile,
  updateProfile,
  changePassword,
  updateNotificationPrefs,
  deleteAccount,
} from "@/api/settingsApi"
import type {
  UserProfile,
  UpdateProfilePayload,
  ChangePasswordPayload,
  NotificationPrefsPayload,
  DeleteAccountPayload,
} from "@/types/settingsTypes"

interface SettingsState {
  profile: UserProfile | null
  loadingProfile: boolean
  savingProfile: boolean
  savingPassword: boolean
  savingNotifs: boolean
  deletingAccount: boolean
  profileError: string | null
  passwordError: string | null
  notifsError: string | null
  successMessage: string | null

  fetchProfile: () => Promise<void>
  saveProfile: (payload: UpdateProfilePayload) => Promise<void>
  savePassword: (payload: ChangePasswordPayload) => Promise<void>
  saveNotifPrefs: (payload: NotificationPrefsPayload) => Promise<void>
  removeAccount: (payload: DeleteAccountPayload) => Promise<void>
  clearMessages: () => void
}

export const useSettingsStore = create<SettingsState>((set) => ({
  profile:         null,
  loadingProfile:  false,
  savingProfile:   false,
  savingPassword:  false,
  savingNotifs:    false,
  deletingAccount: false,
  profileError:    null,
  passwordError:   null,
  notifsError:     null,
  successMessage:  null,

  fetchProfile: async () => {
    set({ loadingProfile: true, profileError: null })
    try {
      const profile = await getProfile()
      set({ profile, loadingProfile: false })
    } catch (err: any) {
      set({ loadingProfile: false, profileError: err.message ?? "Failed to load profile" })
    }
  },

  saveProfile: async (payload) => {
    set({ savingProfile: true, profileError: null, successMessage: null })
    try {
      const res = await updateProfile(payload)
      set({
        savingProfile:  false,
        // Use the full user object returned by the server — this includes
        // the new avatar URL if a file was uploaded
        profile:        res.user,
        successMessage: "Profile updated successfully",
      })
    } catch (err: any) {
      set({ savingProfile: false, profileError: err.message ?? "Failed to update profile" })
      throw err
    }
  },

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

  saveNotifPrefs: async (payload) => {
    set({ savingNotifs: true, notifsError: null, successMessage: null })
    try {
      await updateNotificationPrefs(payload)
      set((s) => ({
        savingNotifs:   false,
        successMessage: "Notification preferences saved",
        // Merge toggles into existing profile object
        profile: s.profile ? { ...s.profile, ...payload } : s.profile,
      }))
    } catch (err: any) {
      set({ savingNotifs: false, notifsError: err.message ?? "Failed to save preferences" })
      throw err
    }
  },

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

  clearMessages: () => set({
    successMessage: null,
    profileError:   null,
    passwordError:  null,
    notifsError:    null,
  }),
}))