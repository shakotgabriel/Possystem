import { Navigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { api } from '@/api'
import { getStoredUser, setStoredUser } from '@/lib/auth-storage'

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const token = localStorage.getItem('token')
  const [ready, setReady] = useState(false)

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  useEffect(() => {
    let mounted = true
    const existing = getStoredUser()

    if (existing) {
      setReady(true)
      return
    }

    ;(async () => {
      try {
        const res = await api.get('/auth/me')
        if (!mounted) return
        setStoredUser(res.data)
      } catch {
                                                                       
      } finally {
        if (mounted) setReady(true)
      }
    })()

    return () => {
      mounted = false
    }
  }, [])

  if (!ready) return null

  return <>{children}</>
}
