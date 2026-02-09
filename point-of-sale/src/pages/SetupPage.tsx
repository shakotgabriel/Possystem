import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { api } from '@/api'
import { clearAuth } from '@/lib/auth-storage'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

type SetupStatus = {
  initialized: boolean
  hasAdmin: boolean
}

type InitializeResponse = {
  settings: unknown
  user: {
    id: string
    name: string
    username: string
    role: string
  }
  access_token: string
}

type ApiErrorBody = {
  message?: string | string[]
}

export default function SetupPage() {
  const navigate = useNavigate()

  const [checking, setChecking] = useState(true)
  const [setupRequired, setSetupRequired] = useState(true)

  const [name, setName] = useState('Admin User')
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('admin123')
  const [initialRate, setInitialRate] = useState('1')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let mounted = true

    ;(async () => {
      try {
        const res = await api.get<SetupStatus>('/setup/status')
        if (!mounted) return

        const required = !(res.data.initialized && res.data.hasAdmin)
        setSetupRequired(required)

        if (!required) {
          const token = localStorage.getItem('token')
          navigate(token ? '/dashboard' : '/login', { replace: true })
        }
      } catch { /* empty */ } finally {
        if (mounted) setChecking(false)
      }
    })()

    return () => {
      mounted = false
    }
  }, [navigate])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const rate = Number(initialRate)
    if (!Number.isFinite(rate) || rate <= 0) {
      toast.error('Initial rate must be greater than 0')
      return
    }

    try {
      setLoading(true)
      const res = await api.post<InitializeResponse>('/setup/initialize', {
        name,
        username,
        password,
        initialRate: rate,
      })

      clearAuth()
      toast.success('Setup completed')

     
      setSetupRequired(false)

      window.dispatchEvent(new Event('pos:setup-complete'))
     
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const data = err.response?.data as ApiErrorBody | undefined
        const msg = data?.message
        toast.error(
          Array.isArray(msg) ? msg.join(', ') : msg || 'Setup failed',
        )
      } else {
        toast.error('Setup failed')
      }
    } finally {
      setLoading(false)
    }
  }

  if (checking) return null
  if (!setupRequired) return null

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Initial Setup</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Admin name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Admin username</label>
              <Input value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Admin password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">USD → SSP initial rate</label>
              <Input
                inputMode="decimal"
                value={initialRate}
                onChange={(e) => setInitialRate(e.target.value)}
                placeholder="e.g. 1"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Setting up…' : 'Complete setup'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
