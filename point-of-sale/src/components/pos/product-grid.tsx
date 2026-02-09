"use client"

import { Card, CardContent } from "@/components/ui/card"
import { ShoppingCart } from "lucide-react"
import type { Product } from "@/lib/types"
import { useCurrency } from "@/lib/contexts/currency-context"

interface ProductGridProps {
  products: Product[]
  onProductClick: (product: Product) => void
}

export function ProductGrid({ products, onProductClick }: ProductGridProps) {
  const { convertToUSD, formatSSP, formatUSD } = useCurrency()

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4 p-8">
        <div className="text-gray-400">
          <ShoppingCart className="h-12 w-12" />
        </div>
        <p className="text-gray-500 text-center">No products found</p>
        <p className="text-sm text-gray-400 text-center">Try searching with a different category or keyword</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 p-4">
      {products.map((product) => (
        <Card
          key={product.id}
          onClick={() => onProductClick(product)}
          className="cursor-pointer hover:shadow-md transition-all duration-200 h-full flex flex-col group"
        >
          <CardContent className="p-3 flex flex-col flex-1">
            <div className="relative aspect-square w-full mb-3 overflow-hidden rounded-lg bg-gray-50">
              <img
                src={product.image ?? undefined}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
              />
            </div>
            <div className="space-y-1.5 flex-1 flex flex-col justify-between">
              <h3 className="font-medium text-sm line-clamp-2">{product.name}</h3>
              <div className="flex items-center justify-between mt-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-primary">{formatSSP(product.price)}</p>
                  <p className="text-xs text-muted-foreground">~ {formatUSD(convertToUSD(product.price))}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  product.stock > 0 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}