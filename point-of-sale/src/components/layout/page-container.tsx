"use client"

import * as React from "react"
import { Header } from "../layout/header"
import { Footer } from "../layout/footer"
import { cn } from "../../lib/utils"

interface PageContainerProps {
  children: React.ReactNode
  title?: string
  userInitials?: string
  userName?: string
}

export function PageContainer({
  children,
  title,
  userInitials,
  userName,
}: PageContainerProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header 
        onMenuClick={() => {}}
        notificationCount={0}
        userInitials={userInitials}
        userName={userName}
      />

      <main className="flex-1 flex flex-col overflow-hidden">
        <div className={cn(
          "container mx-auto px-4 py-6 max-w-7xl",
          "flex flex-col flex-1",
          "min-h-0"                                                   
        )}>
          {title && (
            <div className="mb-6">
              <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            </div>
          )}
          <div className={cn(
            "flex-1 flex flex-col min-h-0",                                     
            "pb-20"                                                                                
          )}>
            {children}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
} 