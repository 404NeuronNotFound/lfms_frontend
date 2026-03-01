export interface LoginPayload {
  username: string
  password: string
}

export interface LoginResponse {
  refresh: string
  access: string
  role: string
  username: string
}