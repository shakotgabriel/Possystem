"use client"

import { Tabs, TabsList, TabsTrigger } from "../ui/tabs"

interface ReportsTabsProps {
  activeTab: string
  onTabChange: (value: string) => void
}

export function ReportsTabs({ activeTab, onTabChange }: ReportsTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-2 md:grid-cols-3">
        <TabsTrigger value="sales">Sales</TabsTrigger>
        <TabsTrigger value="inventory">Inventory</TabsTrigger>
        <TabsTrigger value="customers">Customers</TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
