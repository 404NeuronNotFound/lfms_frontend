import type { RegisterPayload, RegisterResponse } from "@/types/registerTypes"

export async function registerUser(payload: RegisterPayload): Promise<RegisterResponse> {
  const response = await fetch("http://localhost:8000/api/register/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error?.detail || error?.message || "Registration failed")
  }

  return response.json()
}