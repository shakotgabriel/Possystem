"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"
import { useEffect, useState } from "react"

interface InventoryFiltersProps {
  onSearchChange: (query: string) => void
  categoryFilter: string
  onCategoryChange: (category: string) => void
  stockFilter: string
  onStockChange: (filter: string) => void
  onApplyFilters: () => void
  onResetFilters: () => void
  categories: any[]
}

export function InventoryFilters({
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  stockFilter,
  onStockChange,
  onApplyFilters,
  onResetFilters,
  categories
}: InventoryFiltersProps) {
  const [searchQuery, setSearchQuery] = useState('')
  
                                            
  useEffect(() => {
    onSearchChange(searchQuery)
  }, [searchQuery, onSearchChange])

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="w-full relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 w-full"
        />
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap">
        <Select value={categoryFilter} onValueChange={(value) => {
          onCategoryChange(value)
          onApplyFilters()
        }}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(category => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={stockFilter} onValueChange={(value) => {
          onStockChange(value)
          onApplyFilters()
        }}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Stock Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="low">Low Stock</SelectItem>
            <SelectItem value="out">Out of Stock</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={onResetFilters}>
          Reset Filters
        </Button>
      </div>
    </div>
  )
}