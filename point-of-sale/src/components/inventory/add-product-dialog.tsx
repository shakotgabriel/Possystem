"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Product } from "@/types/models"
import { productsApi } from "@/api/products"
import { toast } from "sonner"
import { useInventory } from "@/hooks/useInventory"
import { useState } from "react"

export const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  price: z.coerce.number().min(0.01, "Price must be greater than 0"),
  costPrice: z.coerce.number().min(0, "Cost price must be positive"),
  stock: z.coerce.number().int().min(0, "Stock must be non-negative"),
  minStock: z.coerce
    .number()
    .int()
    .min(0, "Minimum stock must be non-negative"),
  categoryId: z.string().min(1, "Category is required"),
})

export type ProductSchema = z.input<typeof productSchema>

interface AddProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onProductAdded: (product: Product) => void
}

export function AddProductDialog({
  open,
  onOpenChange,
  onProductAdded,
}: AddProductDialogProps) {
  const { data: inventoryData, loading: inventoryLoading } = useInventory()
  const [form, setForm] = useState<ProductSchema>({
    name: "",
    price: 0,
    costPrice: 0,
    stock: 0,
    minStock: 5,
    categoryId: "",
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return

    try {
      setLoading(true)
      const validatedData = productSchema.parse(form)
      
      const response = await productsApi.createProduct(validatedData)
      onProductAdded(response.data)
      toast.success("Product added successfully")
      onOpenChange(false)
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to add product"
      toast.error(Array.isArray(message) ? message.join(', ') : String(message))
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof ProductSchema) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm(prev => ({
      ...prev,
      [field]: e.target.value
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Product</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Product Name</Label>
            <Input
              id="name"
              value={form.name}
              onChange={handleInputChange("name")}
              required
              disabled={loading || inventoryLoading}
            />
          </div>
          <div>
            <Label htmlFor="price">Price (SSP)</Label>
            <Input
              id="price"
              type="number"
              value={form.price}
              onChange={(e) => handleInputChange("price")(e)}
              required
              disabled={loading || inventoryLoading}
            />
          </div>
          <div>
            <Label htmlFor="costPrice">Cost Price (SSP)</Label>
            <Input
              id="costPrice"
              type="number"
              value={form.costPrice}
              onChange={(e) => handleInputChange("costPrice")(e)}
              required
              disabled={loading || inventoryLoading}
            />
          </div>
          <div>
            <Label htmlFor="stock">Stock</Label>
            <Input
              id="stock"
              type="number"
              value={form.stock}
              onChange={(e) => handleInputChange("stock")(e)}
              required
              disabled={loading || inventoryLoading}
            />
          </div>
          <div>
            <Label htmlFor="minStock">Minimum Stock</Label>
            <Input
              id="minStock"
              type="number"
              value={form.minStock}
              onChange={(e) => handleInputChange("minStock")(e)}
              required
              disabled={loading || inventoryLoading}
            />
          </div>
          <div>
            <Label htmlFor="categoryId">Category</Label>
            <select
              id="categoryId"
              value={form.categoryId}
              onChange={handleInputChange("categoryId")}
              required
              disabled={loading || inventoryLoading}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a category</option>
              {inventoryData?.categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={loading || inventoryLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? "Adding..." : "Add Product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}