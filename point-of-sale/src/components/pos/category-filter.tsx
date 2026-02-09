"use client"

import { Button } from "@/components/ui/button"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import type { Category } from "@/types/models"

interface CategoryFilterProps {
  selectedCategory: string
  onSelectCategory: (category: string) => void
  categories: Category[]
}

export function CategoryFilter({ selectedCategory, onSelectCategory, categories }: CategoryFilterProps) {
  const all = [{ id: 'all', name: 'All Products' }]
  const items = [...all, ...(categories ?? [])]

  return (
    <div className="p-2 bg-white">
      <ScrollArea className="w-full h-[60px]">
        <div className="flex gap-2">
          {items.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              className={`
                ${selectedCategory === category.id ? "bg-primary hover:bg-primary/90" : "hover:bg-gray-50"}
                flex items-center justify-center
                px-3 py-2
                text-sm
                whitespace-nowrap
                min-w-[100px]
                transition-colors
                flex-shrink-0
              `}
              onClick={() => onSelectCategory(category.id)}
            >
              {category.name}
            </Button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  )
}
