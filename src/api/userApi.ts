import type { ApiUser, UserListResponse, UserStats } from "@/types/userTypes"


const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api"

function authHeaders(): HeadersInit {
  const token = localStorage.getItem("access") ?? ""
  return {
    Authorization:  `Bearer ${token}`,
    "Content-Type": "application/json",
  }
}


async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { headers: authHeaders() })
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  return res.json() as Promise<T>
}

async function apiPost(path: string, body?: object): Promise<Response> {
  return fetch(`${BASE}${path}`, {
    method:  "POST",
    headers: authHeaders(),
    body:    body ? JSON.stringify(body) : undefined,
  })
}

async function apiPatch(path: string, body: object): Promise<Response> {
  return fetch(`${BASE}${path}`, {
    method:  "PATCH",
    headers: authHeaders(),
    body:    JSON.stringify(body),
  })
}

async function apiDelete(path: string): Promise<Response> {
  return fetch(`${BASE}${path}`, {
    method:  "DELETE",
    headers: authHeaders(),
  })
}


export async function fetchAllUsers(): Promise<UserListResponse> {
  return apiFetch<UserListResponse>("/admin/users/")
}

export async function fetchUserStats(): Promise<UserStats> {
  return apiFetch<UserStats>("/admin/users/stats/")
}


export async function fetchUserById(id: number): Promise<ApiUser> {
  return apiFetch<ApiUser>(`/admin/users/${id}/`)
}


export async function updateUser(
  id: number,
  data: Partial<Pick<ApiUser, "role" | "status" | "first_name" | "last_name" | "email">>,
): Promise<Response> {
  return apiPatch(`/admin/users/${id}/`, data)
}

export async function banUser(id: number): Promise<Response> {
  return apiPost(`/admin/users/${id}/ban/`)
}

export async function unbanUser(id: number): Promise<Response> {
  return apiPost(`/admin/users/${id}/unban/`)
}


export async function deleteUser(id: number): Promise<Response> {
  return apiDelete(`/admin/users/${id}/`)
}