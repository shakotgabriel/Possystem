"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { X, ShoppingCart } from "lucide-react"
import { Header } from "./header"
import { Footer } from "./footer"
import { cn } from "@/lib/utils"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024)

  useEffect(() => {
    const handleResize = () => {
      const isNowMobile = window.innerWidth < 1024
      setIsMobile(isNowMobile)
      if (!isNowMobile) setSidebarOpen(false)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  
  const handleBackdropClick = () => {
    if (isMobile) setSidebarOpen(false)
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
     
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden transition-opacity duration-200"
          onClick={handleBackdropClick}
          aria-hidden="true"
        />
      )}

   
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50",
          "w-64 bg-white border-r",
          "transform transition-transform duration-200 ease-in-out",
          "lg:relative lg:translate-x-0",
          !sidebarOpen && "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
     
          <div className="h-14 sm:h-16 flex items-center justify-between px-4 border-b">
            <Link 
              to="/" 
              className="font-bold text-lg sm:text-xl text-primary flex items-center gap-2 hover:opacity-90 transition-opacity"
            >
              <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6" />
              <span>SuperMarket</span>
            </Link>
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <Footer />
          </div>
        </div>
      </aside>

      
      <div className="flex flex-1 flex-col min-w-0">
        <Header 
          onMenuClick={() => setSidebarOpen(true)}
          notificationCount={3}
        />
        <main className={cn(
          "flex-1 overflow-y-auto",
          "p-4 sm:p-6",
          "transition-all duration-200"
        )}>
          {children}
        </main>
      </div>
    </div>
  )
}
