"use client"

import { ScrollArea } from "@/components/ui/scroll-area"

interface SettingsTabsProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function SettingsTabs({ activeTab, onTabChange }: SettingsTabsProps) {
  const tabs = [
    { id: "store", label: "Store" },
    { id: "users", label: "Users" },
    { id: "receipt", label: "Receipt" },
    { id: "system", label: "System" },
  ]

  return (
    <div className="border-b sticky top-0 bg-white z-10">
      <ScrollArea className="w-full">
        <div className="flex p-1 sm:p-2 min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                px-3 sm:px-4 py-2 text-sm font-medium rounded-lg
                transition-colors whitespace-nowrap
                mx-1 first:ml-0 last:mr-0
                ${
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
