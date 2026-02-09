import { useCallback, useEffect, useMemo, useState } from 'react'
import { get } from '@/api'

export type SalesReportItem = {
  id: string
  productId: string
  productName: string
  categoryId: string | null
  categoryName: string | null
  quantity: number
  unitPrice: number
  totalPrice: number
  profit: number
}

export type SalesReportSale = {
  id: string
  date: string
  cashierId: string
  cashierName: string
  customerName: string
  totalAmount: number
  profit: number
  items: SalesReportItem[]
}

export type SalesReportTrendPoint = {
  date: string
  total: number
}

export type ProfitTrendPoint = {
  date: string
  profit: number
}

export type SalesReportResponse = {
  totalSales: number
  totalProfit: number
  totalItems: number
  sales: SalesReportSale[]
  salesTrend: SalesReportTrendPoint[]
  profitTrend: ProfitTrendPoint[]
}

export function useSalesReport(dateRange: { from: Date; to: Date } | null) {
  const [data, setData] = useState<SalesReportResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const startDate = dateRange?.from?.toISOString()
  const endDate = dateRange?.to?.toISOString()

  const fetchReport = useCallback(async () => {
    if (!startDate || !endDate) return

    try {
      setLoading(true)
      setError(null)
      const res = await get('/api/sales/report', {
        params: { startDate, endDate },
      })
      setData(res.data)
    } catch (err: any) {
      console.error('Error fetching sales report:', err)
      setError('Failed to fetch sales report')
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [startDate, endDate])

  useEffect(() => {
    void fetchReport()
  }, [fetchReport])

  const derived = useMemo(() => {
    if (!data) return null

    const byCategory = new Map<string, { name: string; total: number }>()
    const byCashier = new Map<string, { name: string; total: number; tx: number }>()

    for (const sale of data.sales) {
      const cashierKey = sale.cashierId
      const cashier = byCashier.get(cashierKey) ?? { name: sale.cashierName, total: 0, tx: 0 }
      cashier.total += sale.totalAmount || 0
      cashier.tx += 1
      cashier.name = sale.cashierName
      byCashier.set(cashierKey, cashier)

      for (const item of sale.items ?? []) {
        const catKey = item.categoryId ?? 'uncategorized'
        const catName = item.categoryName ?? 'Uncategorized'
        const cat = byCategory.get(catKey) ?? { name: catName, total: 0 }
        cat.total += item.totalPrice || 0
        cat.name = catName
        byCategory.set(catKey, cat)
      }
    }

    return {
      categories: Array.from(byCategory.entries()).map(([id, v]) => ({ id, ...v })),
      cashiers: Array.from(byCashier.entries()).map(([id, v]) => ({ id, ...v })),
    }
  }, [data])

  return { data, derived, loading, error, refetch: fetchReport }
}
