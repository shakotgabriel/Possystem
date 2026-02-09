"use client"

import { Button } from "@/components/ui/button"
import { SkipBackIcon as Backspace } from "lucide-react"
import { ShoppingCart } from "lucide-react"

interface NumPadProps {
  onNumberClick: (value: string) => void
  onClear: () => void
  barcode: string
}

export function NumPad({ onNumberClick, onClear, barcode }: NumPadProps) {
  const buttons = ["7", "8", "9", "4", "5", "6", "1", "2", "3", "0", "00", "."]

  return (
    <div className="p-2 sm:p-3 md:p-4">
      <div className="mb-3 sm:mb-4">
        <div className="flex items-center bg-gray-50 rounded-lg">
          <div className="flex-1 px-3 sm:px-4 py-2 sm:py-3 text-right text-base sm:text-lg font-mono bg-white border-r rounded-l-lg">
            {barcode || "Enter barcode..."}
          </div>
          <Button 
            variant="outline" 
            className="rounded-l-none rounded-r-lg h-full px-3 sm:px-4"
            onClick={onClear}
          >
            <Backspace className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {buttons.map((btn) => (
          <Button 
            key={btn} 
            variant="outline" 
            className="h-14 sm:h-16 text-lg sm:text-xl"
            onClick={() => onNumberClick(btn)}
          >
            {btn}
          </Button>
        ))}
      </div>

      <Button
        className="w-full mt-3 sm:mt-4 h-14 sm:h-16 bg-green-600 hover:bg-green-700 text-white font-semibold text-lg sm:text-xl"
        onClick={() => {  }}
      >
        <ShoppingCart className="mr-2 h-5 w-5 sm:h-6 sm:w-6" />
        Enter
      </Button>
    </div>
  )
}
