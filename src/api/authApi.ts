import api from "./axios"
import type { LoginPayload, LoginResponse } from "../types/authTypes"

export const loginUser = async (
  payload: LoginPayload
): Promise<LoginResponse> => {
  const response = await api.post("/login/", payload)
  return response.data
}