"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useNavigate } from "react-router-dom"
import { useInventory } from "@/hooks/useInventory"
import type { Product } from '@/types/models'
import { productsApi, type CreateProductRequest, type UpdateProductRequest } from "@/api/products"

interface ProductFormProps {
  initialData?: Product
  onSubmit: (product: Product) => Promise<void> | void
}

export function ProductForm({ initialData, onSubmit }: ProductFormProps) {
  const { data, loading: inventoryLoading } = useInventory()
  const navigate = useNavigate()
  const [name, setName] = useState(initialData?.name || "")
  const [price, setPrice] = useState(initialData?.price || 0)
  const [costPrice, setCostPrice] = useState(initialData?.costPrice || 0)
  const [stock, setStock] = useState(initialData?.stock || 0)
  const [minStock, setMinStock] = useState(initialData?.minStock || 5)
  const [categoryId, setCategoryId] = useState<string>(initialData?.categoryId || "")
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setFormLoading(true)
      setFormError(null)

      const trimmedName = name.trim()
      if (!trimmedName) {
        setFormError('Product name is required')
        return
      }

      if (!categoryId) {
        setFormError('Category is required')
        return
      }

      const numericPrice = Number(price)
      const numericCostPrice = Number(costPrice)
      const numericStock = Number(stock)
      const numericMinStock = Number(minStock)

      if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
        setFormError('Price must be greater than 0')
        return
      }

      if (!Number.isFinite(numericCostPrice) || numericCostPrice < 0) {
        setFormError('Cost price cannot be negative')
        return
      }

      if (!Number.isFinite(numericStock) || numericStock < 0) {
        setFormError('Stock cannot be negative')
        return
      }

      if (!Number.isFinite(numericMinStock) || numericMinStock < 0) {
        setFormError('Minimum stock cannot be negative')
        return
      }

      const payload: CreateProductRequest = {
        name: trimmedName,
        price: numericPrice,
        costPrice: numericCostPrice,
        stock: Math.trunc(numericStock),
        minStock: Math.trunc(numericMinStock),
        categoryId,
      }

      const response = initialData?.id
        ? await productsApi.updateProduct(initialData.id, payload as UpdateProductRequest)
        : await productsApi.createProduct(payload)

      const savedProduct = response.data
      await onSubmit(savedProduct)
    } catch (error: any) {
      console.error('Error saving product:', error)
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to save product. Please try again.'
      setFormError(Array.isArray(message) ? message.join(', ') : String(message))
    } finally {
      setFormLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-sm border">
      {formError && (
        <div className="text-red-500 mb-4">
          {formError}
        </div>
      )}
      <div>
        <Label htmlFor="name">Product Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={formLoading || inventoryLoading}
        />
      </div>
      <div>
        <Label htmlFor="price">Price (SSP)</Label>
        <Input
          id="price"
          type="number"
          value={price}
          onChange={(e) => setPrice(parseFloat(e.target.value))}
          required
          disabled={formLoading || inventoryLoading}
        />
      </div>
      <div>
        <Label htmlFor="costPrice">Cost Price (SSP)</Label>
        <Input
          id="costPrice"
          type="number"
          value={costPrice}
          onChange={(e) => setCostPrice(parseFloat(e.target.value))}
          required
          disabled={formLoading || inventoryLoading}
        />
      </div>
      <div>
        <Label htmlFor="stock">Stock</Label>
        <Input
          id="stock"
          type="number"
          value={stock}
          onChange={(e) => setStock(parseInt(e.target.value))}
          required
          disabled={formLoading || inventoryLoading}
        />
      </div>
      <div>
        <Label htmlFor="minStock">Minimum Stock</Label>
        <Input
          id="minStock"
          type="number"
          value={minStock}
          onChange={(e) => setMinStock(parseInt(e.target.value))}
          required
          disabled={formLoading || inventoryLoading}
        />
      </div>
      <div>
        <Label htmlFor="categoryId">Category</Label>
        <select
          id="categoryId"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          disabled={formLoading || inventoryLoading}
          className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select a category</option>
          {data.categories.map(category => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex justify-end space-x-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => navigate("/inventory")}
          disabled={formLoading || inventoryLoading}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={formLoading || inventoryLoading}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {formLoading ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </form>
  )
}