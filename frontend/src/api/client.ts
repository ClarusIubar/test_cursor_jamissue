export type ApiErrorPayload = {
  error_code?: string
  message?: string
  hint?: string
  detail?: unknown
}

export class ApiError extends Error {
  status: number
  payload?: ApiErrorPayload

  constructor(status: number, message: string, payload?: ApiErrorPayload) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.payload = payload
  }
}

const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
  'http://127.0.0.1:8000/api/v1'

export function getAccessToken(): string | null {
  return localStorage.getItem('jamissyu_access_token')
}

export function setAccessToken(token: string | null) {
  if (!token) localStorage.removeItem('jamissyu_access_token')
  else localStorage.setItem('jamissyu_access_token', token)
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit & { auth?: boolean } = { auth: false },
): Promise<T> {
  const url = `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`

  const headers = new Headers(init.headers)
  if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json')

  if (init.auth) {
    const token = getAccessToken()
    if (token) headers.set('Authorization', `Bearer ${token}`)
  }

  const res = await fetch(url, { ...init, headers })

  const contentType = res.headers.get('content-type') ?? ''
  const isJson = contentType.includes('application/json')
  const payload = isJson ? ((await res.json()) as ApiErrorPayload) : undefined

  if (!res.ok) {
    const msg =
      payload?.message ??
      (typeof payload?.detail === 'string' ? payload.detail : undefined) ??
      res.statusText
    throw new ApiError(res.status, msg, payload)
  }

  if (!isJson) return (undefined as T)
  return (payload as unknown) as T
}

