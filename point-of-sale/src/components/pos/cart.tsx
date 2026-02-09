"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Trash, Plus, Minus, X, ShoppingCart } from "lucide-react"
import type { CartItem } from "@/lib/types"
import { CashCheckout } from "./cash-checkout"
import { useCurrency } from "@/lib/contexts/currency-context"
import { post } from "@/api"
import { toast } from "sonner"

interface CartProps {
  items: CartItem[]
  updateQuantity: (id: string, quantity: number) => void
  removeItem: (id: string) => void
  clearCart: () => void
  total: number
}

export function Cart({ items, updateQuantity, removeItem, clearCart, total }: CartProps) {
  const [showCashCheckout, setShowCashCheckout] = useState(false)
  const { convertToUSD, formatSSP, formatUSD } = useCurrency()

  const handleCompleteSale = async (payment: { paidAmount: number; change: number }) => {
    const saleItems = items.map((item) => ({
      productId: item.id,
      quantity: item.quantity,
      unitPrice: item.price,
      totalPrice: item.price * item.quantity,
    }))

    try {
      await post('/api/sales', {
        items: saleItems,
        totalAmount: total,
        paidAmount: payment.paidAmount,
        change: payment.change,
      })

      toast.success('Sale completed')
      clearCart()
    } catch (err) {
      toast.error('Failed to complete sale')
      throw err
    }
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm">
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="font-bold text-lg">Current Sale</h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={clearCart} 
          disabled={items.length === 0}
          className="text-red-500 hover:text-red-600 hover:bg-red-50"
        >
          <Trash className="h-4 w-4 mr-1" /> Clear
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {items.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500 py-8">
            <div className="text-center">
              <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Cart is empty</h3>
              <p className="mt-1 text-sm text-gray-500">Add items to get started</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3 p-4">
            {items.map((item) => (
              <div 
                key={item.id} 
                className="flex flex-col gap-2 p-3 rounded-lg hover:bg-gray-50 transition-colors sm:flex-row sm:items-center sm:gap-3"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium truncate">{item.name}</h3>
                  <p className="text-sm text-gray-500">
                    {formatSSP(item.price)}
                    <span className="ml-2 text-xs text-muted-foreground">(~ {formatUSD(convertToUSD(item.price))})</span>
                  </p>
                </div>
                <div className="flex items-center justify-between gap-2 sm:justify-end">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() => removeItem(item.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t bg-white p-4">
        <div className="flex flex-col space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Subtotal</span>
            <span className="text-sm font-medium">
              {formatSSP(total)}
              <span className="ml-2 text-xs text-muted-foreground">(~ {formatUSD(convertToUSD(total))})</span>
            </span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t">
            <span className="text-base font-semibold">Total</span>
            <span className="text-base font-semibold">
              {formatSSP(total)}
              <span className="ml-2 text-xs text-muted-foreground">(~ {formatUSD(convertToUSD(total))})</span>
            </span>
          </div>
          <Button
            className="w-full bg-primary hover:bg-primary/90 text-white h-11 text-sm sm:text-base"
            onClick={() => setShowCashCheckout(true)}
            disabled={items.length === 0}
          >
            Checkout ({formatSSP(total)})
          </Button>
        </div>
      </div>

      <CashCheckout
        open={showCashCheckout}
        onOpenChange={setShowCashCheckout}
        total={total}
        onComplete={handleCompleteSale}
      />
    </div>
  )
}
