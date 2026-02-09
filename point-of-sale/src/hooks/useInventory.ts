import { useState, useEffect } from 'react'
import { get } from '@/api'
import type { Product, Category } from '@/types/models'

interface InventoryData {
  products: Product[]
  categories: Category[]
}

export function useInventory() {
  const [data, setData] = useState<InventoryData>({
    products: [],
    categories: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchInventoryData()
  }, [])

  const fetchInventoryData = async () => {
    try {
      setLoading(true)
      setError(null)

                       
      const productsResponse = await get('/api/products')
      const products = productsResponse.data

                         
      const categoriesResponse = await get('/api/categories')
      const categories = categoriesResponse.data

      setData({ products, categories })
    } catch (err: any) {
      console.error('Error fetching inventory data:', err)
      setError('Failed to fetch inventory data')
    } finally {
      setLoading(false)
    }
  }

  const filterProducts = (products: Product[], 
                          searchQuery: string, 
                          categoryFilter: string, 
                          stockFilter: string) => {
    let filtered = [...products]

                          
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(query)
      )
    }

                            
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(product => 
        product.categoryId === categoryFilter
      )
    }

                         
    if (stockFilter !== 'all') {
      if (stockFilter === 'low') {
        filtered = filtered.filter(product => product.stock <= (product.minStock ?? 0))
      } else if (stockFilter === 'out') {
        filtered = filtered.filter(product => product.stock === 0)
      }
    }

    return filtered
  }

  return {
    data,
    loading,
    error,
    fetchInventoryData,
    filterProducts
  }
}