"use client"

import { Link, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { LayoutGrid, ShoppingCart, Users, Package, BarChart, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  { name: 'Dashboard', icon: LayoutGrid, href: '/dashboard' },
  { name: 'POS', icon: ShoppingCart, href: '/pos' },
  { name: 'Inventory', icon: Package, href: '/inventory' },
  { name: 'Customers', icon: Users, href: '/customers' },
  { name: 'Reports', icon: BarChart, href: '/reports' },
  { name: 'Settings', icon: Settings, href: '/settings' },
]

export function Footer() {
  const location = useLocation()

  return (
    <nav className={cn(
      "fixed bottom-0 left-0 right-0 z-50",
      "w-full h-16",
      "bg-white border-t",
      "px-2 py-2",
      "shadow-sm"
    )}>
      <div className={cn(
        "flex h-full",
        "gap-1",
        "justify-around items-center"
      )}>
        {navigation.map((item) => {
          const isActive = location.pathname === item.href
          const Icon = item.icon

          return (
            <Link key={item.name} to={item.href} className="w-full">
              <Button
                variant="ghost"
                className={cn(
                  "w-full h-full",
                  "flex flex-col items-center justify-center",
                  "px-1 py-1.5",
                  "text-[11px]",
                  "relative",
                  isActive && "bg-gray-100/80"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="mt-1">{item.name}</span>
                {isActive && (
                  <span className={cn(
                    "absolute bottom-0",
                    "h-1 w-full",
                    "bg-primary rounded-t-full"
                  )} />
                )}
              </Button>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
