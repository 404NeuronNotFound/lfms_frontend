import { create } from "zustand"
import { registerUser } from "@/api/registerApi"
import type { RegisterPayload } from "@/types/registerTypes"

interface RegisterState {
  loading: boolean
  error: string | null
  success: boolean
  register: (payload: RegisterPayload) => Promise<void>
  reset: () => void
}

export const useRegisterStore = create<RegisterState>((set) => ({
  loading: false,
  error: null,
  success: false,

  register: async (payload) => {
    set({ loading: true, error: null, success: false })
    try {
      await registerUser(payload)
      set({ loading: false, success: true })
    } catch (err: any) {
      set({ loading: false, error: err.message ?? "Something went wrong" })
      throw err
    }
  },

  reset: () => set({ loading: false, error: null, success: false }),
}))