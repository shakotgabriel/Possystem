import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import { Badge } from "../ui/badge"
import { get } from "@/api"
import type { Product } from "@/types/models"
import type { SalesReportResponse } from "@/hooks/useSalesReport"
import { useCurrency } from "@/lib/contexts/currency-context"

interface InventoryReportTableProps {
  dateRange: { from: Date; to: Date }
  report: SalesReportResponse | null
}

export function InventoryReportTable({ dateRange, report }: InventoryReportTableProps) {
  void dateRange

  const { convertToUSD, formatSSP, formatUSD } = useCurrency()

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    const run = async () => {
      try {
        setLoading(true)
        const res = await get('/api/products', { params: { page: 1, limit: 1000 } })
        if (!alive) return
        setProducts(Array.isArray(res.data) ? res.data : [])
      } catch (e) {
        if (!alive) return
        setProducts([])
      } finally {
        if (!alive) return
        setLoading(false)
      }
    }
    void run()
    return () => {
      alive = false
    }
  }, [])

  const rows = useMemo(() => {
    const soldMap = new Map<string, { qty: number; revenue: number }>()
    for (const sale of report?.sales ?? []) {
      for (const item of sale.items ?? []) {
        const cur = soldMap.get(item.productId) ?? { qty: 0, revenue: 0 }
        cur.qty += item.quantity || 0
        cur.revenue += item.totalPrice || 0
        soldMap.set(item.productId, cur)
      }
    }

    return products
      .map((p) => {
        const sold = soldMap.get(p.id) ?? { qty: 0, revenue: 0 }
        const currentStock = p.stock ?? 0
        const initialStock = currentStock + sold.qty
        const minStock = p.minStock ?? 5

        const status = currentStock === 0 ? 'out' : currentStock <= minStock ? 'low' : 'normal'

        return {
          id: p.id,
          name: p.name,
          initialStock,
          currentStock,
          sold: sold.qty,
          revenue: sold.revenue,
          status,
        }
      })
      .sort((a, b) => b.revenue - a.revenue)
  }, [products, report])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventory Movement Report</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="py-10 text-center text-muted-foreground">Loading inventory...</div>
        ) : rows.length === 0 ? (
          <div className="py-10 text-center text-muted-foreground">No products found</div>
        ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Initial Stock</TableHead>
              <TableHead>Current Stock</TableHead>
              <TableHead>Units Sold</TableHead>
              <TableHead>Revenue</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{item.initialStock}</TableCell>
                <TableCell>{item.currentStock}</TableCell>
                <TableCell>{item.sold}</TableCell>
                <TableCell>
                  <div className="font-medium">{formatSSP(item.revenue)}</div>
                  <div className="text-xs text-muted-foreground">~ {formatUSD(convertToUSD(item.revenue))}</div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={item.status === "normal" ? "outline" : item.status === "low" ? "secondary" : "destructive"}
                  >
                    {item.status === "normal" ? "Normal" : item.status === "low" ? "Low Stock" : "Out of Stock"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        )}
      </CardContent>
    </Card>
  )
}
