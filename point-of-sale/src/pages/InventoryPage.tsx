"use client"

import { useState } from "react"
import { PageContainer } from "@/components/layout/page-container"
import { InventoryTable } from "../components/inventory/inventory-table"
import { InventoryFilters } from "../components/inventory/inventory-filters"
import { Button } from "../components/ui/button"
import { Plus } from "lucide-react"
import { CategoryDialog } from "../components/inventory/category-dialog"
import { Link } from 'react-router-dom'
import { useInventory } from "@/hooks/useInventory"

export default function InventoryPage() {
  const { data } = useInventory()
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [stockFilter, setStockFilter] = useState("all")

  const applyFilters = () => {
    let filtered = [...(data?.products || [])]

    if (searchQuery) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter((product) => product.categoryId === categoryFilter)
    }

    if (stockFilter === "low") {
      filtered = filtered.filter((product) => product.stock < 10)
    } else if (stockFilter === "out") {
      filtered = filtered.filter((product) => product.stock === 0)
    }

    return filtered
  }

  const filteredProducts = applyFilters()

  return (
    <PageContainer title="Inventory Management">
      <div className="flex flex-col space-y-4 min-h-0">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <p className="text-sm text-gray-500 sm:hidden">
            {filteredProducts.length} items found
          </p>
          <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-2">
            <CategoryDialog />
            <Link to="/inventory/add-product" className="w-full sm:w-auto">
              <Button className="w-full bg-primary hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" /> 
                Add Product
              </Button>
            </Link>
          </div>
        </div>

        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white rounded-lg p-3 md:p-4 shadow-sm border">
            <p className="text-sm text-gray-500">Total Products</p>
            <p className="text-xl md:text-2xl font-semibold mt-1">{data?.products?.length || 0}</p>
          </div>
          <div className="bg-white rounded-lg p-3 md:p-4 shadow-sm border">
            <p className="text-sm text-gray-500">Low Stock</p>
            <p className="text-xl md:text-2xl font-semibold mt-1 text-yellow-600">
              {data?.products?.filter(p => p.stock < 10).length || 0}
            </p>
          </div>
          <div className="bg-white rounded-lg p-3 md:p-4 shadow-sm border">
            <p className="text-sm text-gray-500">Out of Stock</p>
            <p className="text-xl md:text-2xl font-semibold mt-1 text-red-600">
              {data?.products?.filter(p => p.stock === 0).length || 0}
            </p>
          </div>
          <div className="bg-white rounded-lg p-3 md:p-4 shadow-sm border">
            <p className="text-sm text-gray-500">Categories</p>
            <p className="text-xl md:text-2xl font-semibold mt-1">
              {data?.categories?.length || 0}
            </p>
          </div>
        </div>

        
        <div className="flex-1 flex flex-col min-h-0 bg-white rounded-lg shadow-sm">
          
          <div className="border-b">
            <InventoryFilters
              onSearchChange={setSearchQuery}
              categoryFilter={categoryFilter}
              onCategoryChange={setCategoryFilter}
              stockFilter={stockFilter}
              onStockChange={setStockFilter}
              onApplyFilters={applyFilters}
              onResetFilters={() => {
                setSearchQuery("")
                setCategoryFilter("all")
                setStockFilter("all")
              }}
              categories={data?.categories || []}
            />
          </div>

          
          <div className="flex-1 flex flex-col min-h-0">
            <div className="p-3 md:p-4 border-b">
              <p className="text-sm text-gray-500">
                Showing <span className="font-medium">{filteredProducts.length}</span> of{" "}
                <span className="font-medium">{data?.products?.length || 0}</span> products
              </p>
            </div>
            <div className="flex-1 overflow-y-auto">
              <InventoryTable products={filteredProducts} />
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}