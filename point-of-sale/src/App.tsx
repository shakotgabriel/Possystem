import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom"
import { useCallback, useEffect, useState } from 'react'
import HomePage from "./pages/HomePage"
import POSPage from "./pages/POSPage"
import DashboardPage from "./pages/DashboardPage"
import InventoryPage from "./pages/InventoryPage"
import CustomersPage from "./pages/CustomersPage"
import ReportsPage from "./pages/ReportsPage"
import SettingsPage from "./pages/SettingsPage"
import LoginPage from "./pages/LoginPage"
import SetupPage from "./pages/SetupPage"
import AddProduct from "./components/inventory/add-product"
import EditProduct from "./components/inventory/edit-product"
import { ThemeProvider } from "./components/theme-provider"
import { CurrencyProvider } from "./lib/contexts/currency-context"
import { RequireAuth } from "./components/auth/RequireAuth"
import { api } from '@/api'

type SetupStatus = {
  initialized: boolean
  hasAdmin: boolean
}

function SetupGate({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const [status, setStatus] = useState<SetupStatus | null>(null)
  const [ready, setReady] = useState(false)

  const token = localStorage.getItem('token')

  const fetchStatus = useCallback(async () => {
    try {
      const res = await api.get<SetupStatus>('/setup/status')
      setStatus(res.data)
    } catch {
      setStatus(null)
    }
  }, [])

  useEffect(() => {
    let mounted = true

    ;(async () => {
      try {
        await fetchStatus()
      } catch {
                                                                 
        setStatus(null)
      } finally {
        if (mounted) setReady(true)
      }
    })()

    const onSetupComplete = () => {
      if (!mounted) return
      void fetchStatus()
    }

    window.addEventListener('pos:setup-complete', onSetupComplete)

    return () => {
      mounted = false
      window.removeEventListener('pos:setup-complete', onSetupComplete)
    }
  }, [fetchStatus])

  if (!ready) return null

  const needsSetup = status ? !(status.initialized && status.hasAdmin) : false
  const onSetupRoute = location.pathname === '/setup'

  if (needsSetup && !onSetupRoute) {
    return <Navigate to="/setup" replace />
  }

  if (!needsSetup && onSetupRoute) {
    return <Navigate to={token ? '/dashboard' : '/login'} replace />
  }

  return <>{children}</>
}

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="supermarket-pos-theme">
      <CurrencyProvider>
        <BrowserRouter>
          <SetupGate>
            <Routes>
              <Route path="/setup" element={<SetupPage />} />
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />

              <Route
                path="/pos"
                element={
                  <RequireAuth>
                    <POSPage />
                  </RequireAuth>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <RequireAuth>
                    <DashboardPage />
                  </RequireAuth>
                }
              />
              <Route
                path="/inventory"
                element={
                  <RequireAuth>
                    <InventoryPage />
                  </RequireAuth>
                }
              />
              <Route
                path="/inventory/add-product"
                element={
                  <RequireAuth>
                    <AddProduct />
                  </RequireAuth>
                }
              />
              <Route
                path="/inventory/edit-product/:id"
                element={
                  <RequireAuth>
                    <EditProduct />
                  </RequireAuth>
                }
              />
              <Route
                path="/customers"
                element={
                  <RequireAuth>
                    <CustomersPage />
                  </RequireAuth>
                }
              />
              <Route
                path="/reports"
                element={
                  <RequireAuth>
                    <ReportsPage />
                  </RequireAuth>
                }
              />
              <Route
                path="/settings"
                element={
                  <RequireAuth>
                    <SettingsPage />
                  </RequireAuth>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </SetupGate>
        </BrowserRouter>
      </CurrencyProvider>
    </ThemeProvider>
  )
}

export default App
