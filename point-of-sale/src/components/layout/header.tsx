"use client"

import { Button } from "@/components/ui/button"
import { Search, Menu, Bell, LogOut, Settings, User } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getStoredUser, getUserDisplayName, getUserInitials } from "@/lib/auth-storage"
import { clearAuth } from "@/lib/auth-storage"
import { api } from "@/api"
import { useNavigate } from "react-router-dom"

interface HeaderProps {
  onMenuClick: () => void
  notificationCount?: number
  userInitials?: string
  userName?: string
}

export function Header({ 
  onMenuClick, 
  notificationCount = 0,
  userInitials,
  userName,
}: HeaderProps) {
  const navigate = useNavigate()
  const storedUser = getStoredUser()
  const resolvedUserName = userName ?? getUserDisplayName(storedUser)
  const resolvedUserInitials = userInitials ?? getUserInitials(storedUser)

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
    <header className="h-14 sm:h-16 border-b bg-white flex items-center justify-between px-2 sm:px-4">
      <div className="flex items-center">
        <Button variant="ghost" size="icon" className="lg:hidden mr-1 sm:mr-2" onClick={onMenuClick}>
          <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
        <div className="relative w-full max-w-[200px] md:max-w-[256px] hidden md:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input type="search" placeholder="Search..." className="pl-8" />
        </div>
      </div>

      <div className="flex items-center space-x-1 sm:space-x-3">
        <div className="relative">
          <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10">
            <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] sm:text-xs rounded-full w-3.5 h-3.5 sm:w-4 sm:h-4 flex items-center justify-center">
                {notificationCount}
              </span>
            )}
          </Button>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center space-x-2 h-8 sm:h-10 px-1 sm:px-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-green-100 flex items-center justify-center">
                <span className="font-medium text-green-700 text-sm sm:text-base">{resolvedUserInitials}</span>
              </div>
              <span className="hidden md:inline-block font-medium text-sm sm:text-base">{resolvedUserName}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px]">
            <DropdownMenuItem className="py-2" onClick={() => navigate('/settings')}>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="py-2" onClick={() => navigate('/settings')}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem className="py-2" onClick={onLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
