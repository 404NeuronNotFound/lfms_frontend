
export const BASE = "http://localhost:8000/api"

export async function loginUser(credentials: { username: string; password: string }) {
  const res = await fetch(`${BASE}/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.detail || err?.non_field_errors?.[0] || "Invalid credentials")
  }
  return res.json()
}

export async function refreshAccessToken(): Promise<string> {
  const refresh = localStorage.getItem("refresh")
  if (!refresh) throw new Error("No refresh token")

  let res: Response
  try {
    res = await fetch(`${BASE}/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    })
  } catch {
   
    throw new Error("Network error during token refresh")
  }

  if (res.status === 401 || res.status === 400) {
    
    throw new Error("Refresh token expired")
  }

  if (!res.ok) {
    throw new Error(`Token refresh failed (${res.status})`)
  }

  const data = await res.json()


  localStorage.setItem("access", data.access)
  if (data.refresh) localStorage.setItem("refresh", data.refresh)

  return data.access
}

export async function authFetch(
  input: RequestInfo,
  init: RequestInit = {}
): Promise<Response> {

  const token = localStorage.getItem("access")
  const headers = new Headers(init.headers)
  if (token) headers.set("Authorization", `Bearer ${token}`)

  const res = await fetch(input, { ...init, headers })

 
  if (res.status !== 401) return res


  try {
    const newToken = await refreshAccessToken()
    headers.set("Authorization", `Bearer ${newToken}`)

    return fetch(input, { ...init, headers })
  } catch {

    throw new Error("SESSION_EXPIRED")
  }
}