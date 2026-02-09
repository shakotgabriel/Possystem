import type React from "react"

import { Link, useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { LayoutGrid, ShoppingCart, Users, Package, BarChart, Settings, LogOut } from "lucide-react"
import { getStoredUser, getUserDisplayName, clearAuth } from "@/lib/auth-storage"
import { api } from "@/api"

interface POSLayoutProps {
  children: React.ReactNode
}

export function POSLayout({ children }: POSLayoutProps) {
  const navigate = useNavigate()
  const cashierName = getUserDisplayName(getStoredUser())

  const onLogout = async () => {
    try {
      await api.post('/auth/logout')
    } catch {
               
    } finally {
      clearAuth()
      navigate('/login', { replace: true })
    }
  }

  return (
    <div className="flex h-screen flex-col">
      
      <header className="bg-white border-b px-4 sm:px-6 lg:px-8 py-2 sm:py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center">
          <Link to="/" className="font-bold text-lg sm:text-xl lg:text-2xl text-green-600 flex items-center">
            <ShoppingCart className="mr-2 h-5 w-5 sm:h-6 sm:w-6" />
            SuperMarket POS
          </Link>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4">
          <Button variant="outline" size="sm" className="hidden sm:flex">
            <Users className="mr-2 h-4 w-4" />
            Cashier: {cashierName || ""}
          </Button>
          <Button variant="outline" size="sm" onClick={onLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </header>

      <main className="flex-1 overflow-hidden relative">
        <div className="h-full w-full overflow-y-auto">
          {children}
        </div>
      </main>

      <footer className="bg-white border-t px-4 sm:px-6 lg:px-8 py-2 sm:py-3 flex items-center justify-between sticky bottom-0 z-50">
        <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto pb-2 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 scrollbar-hide">
          <Link to="/dashboard">
            <Button variant="ghost" size="sm" className="flex items-center">
              <LayoutGrid className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Dashboard</span>
            </Button>
          </Link>
          <Link to="/pos">
            <Button variant="ghost" size="sm" className="flex items-center">
              <ShoppingCart className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">POS</span>
            </Button>
          </Link>
          <Link to="/inventory">
            <Button variant="ghost" size="sm" className="flex items-center">
              <Package className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Inventory</span>
            </Button>
          </Link>
          <Link to="/customers">
            <Button variant="ghost" size="sm" className="flex items-center">
              <Users className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Customers</span>
            </Button>
          </Link>
          <Link to="/reports">
            <Button variant="ghost" size="sm" className="flex items-center">
              <BarChart className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Reports</span>
            </Button>
          </Link>
          <Link to="/settings">
            <Button variant="ghost" size="sm" className="flex items-center">
              <Settings className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Settings</span>
            </Button>
          </Link>
        </div>

        <div className="hidden sm:block">
          <span className="text-sm text-gray-500">Version 1.0.0</span>
        </div>
      </footer>
    </div>
  )
}
