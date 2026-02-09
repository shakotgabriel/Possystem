export type StoredUser = {
  id: string
  name?: string
  username?: string
  role?: string
}

const USER_KEY = 'user'
const TOKEN_KEY = 'token'

function safeJsonParse<T>(raw: string): T | null {
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

function decodeJwtPayload(token: string): any | null {
  const parts = token.split('.')
  if (parts.length < 2) return null

  const payload = parts[1]
  if (!payload) return null

                        
  const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')

  try {
    const json = atob(padded)
    return safeJsonParse<any>(json)
  } catch {
    return null
  }
}

export function getStoredUser(): StoredUser | null {
  if (typeof window === 'undefined') return null

  const raw = localStorage.getItem(USER_KEY)
  if (raw) {
    const parsed = safeJsonParse<StoredUser>(raw)
    if (parsed?.id) return parsed
  }

  const token = localStorage.getItem('token')
  if (!token) return null

  const payload = decodeJwtPayload(token)
  const id = payload?.sub
  const username = payload?.username
  const role = payload?.role
  if (!id) return null

  return { id, username, role }
}

export function setStoredUser(user: StoredUser | null) {
  if (typeof window === 'undefined') return

  if (!user) {
    localStorage.removeItem(USER_KEY)
    return
  }

  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearAuth() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export function getUserDisplayName(user: StoredUser | null) {
  const name = user?.name?.trim()
  if (name) return name

  const username = user?.username?.trim()
  if (username) return username

  return ''
}

export function getUserInitials(user: StoredUser | null) {
  const name = getUserDisplayName(user)
  if (!name) return ''

  const parts = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)

  return parts
    .map((p) => p[0]?.toUpperCase())
    .join('')
}
