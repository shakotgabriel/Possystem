"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DollarSign } from "lucide-react"
import { useCurrency } from "@/lib/contexts/currency-context"

interface CashCheckoutProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  total: number
  onComplete: (payment: { paidAmount: number; change: number }) => Promise<void> | void
}

export function CashCheckout({ open, onOpenChange, total, onComplete }: CashCheckoutProps) {
  const [cashReceived, setCashReceived] = useState("")
  const [change, setChange] = useState(0)
  const [error, setError] = useState("")
  const { convertToUSD, formatSSP, formatUSD } = useCurrency()

  const cashAmount = Number.parseFloat(cashReceived)
  const canComplete = Number.isFinite(cashAmount) && cashAmount >= total

  useEffect(() => {
    if (open) {
      setCashReceived("")
      setChange(0)
      setError("")
    }
  }, [open])

  const handleCashInput = (value: string) => {
                                      
    if (!/^\d*\.?\d{0,2}$/.test(value)) return
    setCashReceived(value)
    setError("")

    const cashAmount = parseFloat(value) || 0
    if (cashAmount >= total) {
      setChange(cashAmount - total)
    } else {
      setChange(0)
    }
  }

  const handleComplete = async () => {
    const amount = Number.parseFloat(cashReceived)
    if (!Number.isFinite(amount) || amount < total) {
      setError("Insufficient cash received")
      return
    }
    try {
      await onComplete({
        paidAmount: amount,
        change: amount - total,
      })
      onOpenChange(false)
    } catch (e) {
      setError("Failed to complete sale")
    }
  }

  const quickAmounts = Array.from(
    new Set([
      total,
      Math.ceil(total / 5) * 5,
      Math.ceil(total / 10) * 10,
      Math.ceil(total / 20) * 20,
    ]),
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cash Payment</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div>
            <div className="text-lg font-semibold mb-2">Total Amount Due:</div>
            <div className="text-2xl font-bold text-primary">{formatSSP(total)}</div>
            <div className="text-sm text-muted-foreground">~ {formatUSD(convertToUSD(total))}</div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Cash Received</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                inputMode="decimal"
                value={cashReceived}
                onChange={(e) => handleCashInput(e.target.value)}
                className="pl-10"
                placeholder="0"
              />
            </div>
            {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
          </div>

          <div className="grid grid-cols-2 gap-2">
            {quickAmounts.map((amount) => (
              <Button
                key={amount}
                variant="outline"
                onClick={() => handleCashInput(amount.toFixed(2))}
                className="text-xs sm:text-sm"
              >
                {formatSSP(amount)}
              </Button>
            ))}
          </div>

          {change > 0 && (
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-green-800 mb-1">Change Due:</div>
              <div className="text-2xl font-bold text-green-700">{formatSSP(change)}</div>
              <div className="text-sm text-muted-foreground">~ {formatUSD(convertToUSD(change))}</div>
            </div>
          )}

          <Button
            className="w-full"
            disabled={!canComplete}
            onClick={handleComplete}
          >
            Complete Sale
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 