export interface RegisterPayload {
  username: string
  password: string
  first_name: string
  last_name: string
  email: string
}

export interface RegisterResponse {
  id: number
  username: string
  email: string
  message?: string
}