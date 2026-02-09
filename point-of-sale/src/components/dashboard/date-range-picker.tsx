"use client"

import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"

interface DateRangePickerProps {
  dateRange: { from: Date | null; to: Date | null }
  onChange: (range: { from: Date | null; to: Date | null }) => void
  className?: string
  label?: string
}

export function DateRangePicker({
  dateRange,
  onChange,
  className,
  label = "Select date range"
}: DateRangePickerProps) {
  const formatDateInput = (value: Date | null | undefined) => {
    if (!value) return ""
    const year = value.getFullYear()
    const month = String(value.getMonth() + 1).padStart(2, '0')
    const day = String(value.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const handleFromChange = (value: string) => {
    const from = value ? new Date(value) : null
    onChange({ from, to: dateRange.to ?? null })
  }

  const handleToChange = (value: string) => {
    const to = value ? new Date(value) : null
    onChange({ from: dateRange.from ?? null, to })
  }

  return (
    <div className={cn("relative w-full", className)}>
      <div className="space-y-2">
        <div className="text-sm font-medium">{label}</div>
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="date"
            value={formatDateInput(dateRange.from)}
            onChange={(e) => handleFromChange(e.target.value)}
          />
          <Input
            type="date"
            value={formatDateInput(dateRange.to)}
            onChange={(e) => handleToChange(e.target.value)}
          />
        </div>
      </div>
    </div>
  )
}
