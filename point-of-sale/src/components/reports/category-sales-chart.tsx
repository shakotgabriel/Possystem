import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts"
import type { SalesReportResponse } from "@/hooks/useSalesReport"

interface CategorySalesChartProps {
  dateRange: { from: Date; to: Date }
  report: SalesReportResponse | null
}

export function CategorySalesChart({ dateRange, report }: CategorySalesChartProps) {
  void dateRange

  const categoryMap = new Map<string, { name: string; total: number }>()
  for (const sale of report?.sales ?? []) {
    for (const item of sale.items ?? []) {
      const key = item.categoryId ?? 'uncategorized'
      const name = item.categoryName ?? 'Uncategorized'
      const cur = categoryMap.get(key) ?? { name, total: 0 }
      cur.total += item.totalPrice || 0
      cur.name = name
      categoryMap.set(key, cur)
    }
  }

  const data = Array.from(categoryMap.entries())
    .map(([id, v]) => ({ id, name: v.name, value: v.total }))
    .sort((a, b) => b.value - a.value)

  const colors = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales by Category</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] rounded-md border">
          {data.length === 0 ? (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              No category data for selected period
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip />
                <Pie data={data} dataKey="value" nameKey="name" outerRadius={110}>
                  {data.map((_, idx) => (
                    <Cell key={idx} fill={colors[idx % colors.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
