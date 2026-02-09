"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { ProductGrid } from "@/components/pos/product-grid"
import { Cart } from "@/components/pos/cart"
import { SearchBar } from "@/components/pos/search-bar"
import { CategoryFilter } from "@/components/pos/category-filter"
import type { Product, CartItem } from "@/lib/types"
import { PageContainer } from "@/components/layout/page-container"
import { get } from "@/api"
import type { Category } from "@/types/models"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function POSPage() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [total, setTotal] = useState(0)
  const [isMobileView, setIsMobileView] = useState(false)
  const [activeTab, setActiveTab] = useState<'products' | 'cart'>('products')

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [productsRes, categoriesRes] = await Promise.all([
          get('/api/products'),
          get('/api/categories'),
        ])
        setProducts(productsRes.data ?? [])
        setCategories(categoriesRes.data ?? [])
      } catch (e) {
        toast.error('Failed to load products')
        setProducts([])
        setCategories([])
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

                                          
  useEffect(() => {
    const newTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
    setTotal(newTotal)
  }, [cart])

  const filteredProducts = useMemo(() => {
    let filtered = [...products]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.id.toLowerCase().includes(query)
      )
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((product) => product.categoryId === selectedCategory)
    }

    return filtered
  }, [products, searchQuery, selectedCategory])

                                            
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobileView(window.innerWidth < 1024)
    }
    
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  const addToCart = useCallback((product: Product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id)
      if (existingItem) {
        return prevCart.map((item) => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      } else {
        return [...prevCart, { ...product, quantity: 1 }]
      }
    })
  }, [])

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity <= 0) {
      setCart((prevCart) => prevCart.filter((item) => item.id !== id))
    } else {
      setCart((prevCart) => 
        prevCart.map((item) => (item.id === id ? { ...item, quantity } : item))
      )
    }
  }, [])

  const removeItem = useCallback((id: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id))
  }, [])

  const clearCart = useCallback(() => {
    setCart([])
  }, [])

  const toggleTab = (tab: 'products' | 'cart') => {
    setActiveTab(tab)
  }

  return (
    <PageContainer title="Point of Sale">
      {loading ? (
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <>
          {isMobileView && (
            <div className="sticky top-14 z-10 grid grid-cols-2 bg-white border-b shadow-sm">
              <button
                onClick={() => toggleTab('products')}
                className={`py-3 text-center font-medium transition-colors ${
                  activeTab === 'products'
                    ? 'bg-primary/5 text-primary border-b-2 border-primary'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
                aria-selected={activeTab === 'products'}
              >
                Products
              </button>
              <button
                onClick={() => toggleTab('cart')}
                className={`py-3 text-center font-medium transition-colors relative ${
                  activeTab === 'cart'
                    ? 'bg-primary/5 text-primary border-b-2 border-primary'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
                aria-selected={activeTab === 'cart'}
              >
                Cart
                {cart.length > 0 && (
                  <span className="absolute top-1 right-4 bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    {cart.length}
                  </span>
                )}
              </button>
            </div>
          )}

          <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div
              className={`lg:col-span-2 flex flex-col h-[calc(100vh-12rem)] ${
                isMobileView && activeTab !== 'products' ? 'hidden' : ''
              }`}
            >
              <div className="space-y-4 mb-4 sticky top-0 bg-white z-10 pt-4">
                <SearchBar
                  value={searchQuery}
                  onChange={setSearchQuery}
                  onClear={() => setSearchQuery("")}
                  placeholder="Search products by name or ID"
                />
                <CategoryFilter
                  selectedCategory={selectedCategory}
                  onSelectCategory={setSelectedCategory}
                  categories={categories}
                />
              </div>
              <div className="flex-1 overflow-y-auto pb-4">
                <ProductGrid products={filteredProducts} onProductClick={addToCart} />
              </div>
            </div>

            <div
              className={`flex flex-col h-[calc(100vh-12rem)] ${
                isMobileView && activeTab !== 'cart' ? 'hidden' : ''
              }`}
            >
              <Cart
                items={cart}
                updateQuantity={updateQuantity}
                removeItem={removeItem}
                clearCart={clearCart}
                total={total}
              />
            </div>
          </div>
        </>
      )}
    </PageContainer>
  )
}