import { useState, useEffect, useCallback } from 'react'
import { get } from '@/api'
import { subDays } from 'date-fns'
import type { Product as BaseProduct, Sale, SaleItem } from '@/types/models'

export type Product = BaseProduct & {
  category?: { id: string; name: string } | null
  saleItems?: Array<{
    id: string
    quantity: number
    unitPrice: number
    totalPrice: number
    saleId?: string
    productId?: string
  }>
}

type DashboardStats = {
  totalSales: number
  totalRevenue: number
  totalCustomers: number
  totalProducts: number
  lowStockProducts: Product[]
}

type DashboardData = {
  stats: DashboardStats
  sales: Sale[]
  topProducts: Product[]
}

export function useDashboard() {
  const [data, setData] = useState<DashboardData>({
    stats: {
      totalSales: 0,
      totalRevenue: 0,
      totalCustomers: 0,
      totalProducts: 0,
      lowStockProducts: []
    },
    sales: [],
    topProducts: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

                                
      const endDate = new Date()
      const startDate = subDays(endDate, 30)
      
      const dateParams = new URLSearchParams({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      })

      const [statsRes, salesRes, productsRes] = await Promise.all([
        get('/api/dashboard/stats'),
        get(`/api/dashboard/sales?${dateParams}`),
        get('/api/dashboard/top-products?limit=5')
      ])

      setData({
        stats: statsRes.data,
        sales: salesRes.data || [],
        topProducts: productsRes.data || []
      })
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err)
      setError('Failed to fetch dashboard data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  // Helper function to calculate derived values
  const derivedStats = {
    ...data.stats,
    // You can add any derived values here if needed
    // For example:
    // averageOrderValue: data.stats.totalSales > 0 
    //   ? data.stats.totalRevenue / data.stats.totalSales 
    //   : 0
  }

  return {
    data: {
      ...data,
      stats: derivedStats
    },
    loading,
    error,
    refetch: fetchDashboardData
  }
}

export type { Sale, SaleItem }