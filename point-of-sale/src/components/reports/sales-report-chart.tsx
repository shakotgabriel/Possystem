import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
import { format, parseISO } from "date-fns"
import type { SalesReportResponse } from "@/hooks/useSalesReport"
import { useCurrency } from "@/lib/contexts/currency-context"

interface SalesReportChartProps {
  dateRange: { from: Date; to: Date }
  report: SalesReportResponse | null
}

export function SalesReportChart({ dateRange, report }: SalesReportChartProps) {
  const { convertToUSD, formatSSP, formatUSD } = useCurrency()

  const trend = (report?.salesTrend ?? []).map((p) => ({
    ...p,
    label: (() => {
      try {
        return format(parseISO(p.date), "MMM d")
      } catch {
        return p.date
      }
    })(),
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales Report</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground mb-4">
          Period {dateRange.from.toLocaleDateString()} to {dateRange.to.toLocaleDateString()}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <div className="rounded-md border p-3">
            <div className="text-xs text-muted-foreground">Total Sales</div>
            <div className="text-lg font-semibold">{formatSSP(report?.totalSales ?? 0)}</div>
            <div className="text-xs text-muted-foreground">~ {formatUSD(convertToUSD(report?.totalSales ?? 0))}</div>
          </div>
          <div className="rounded-md border p-3">
            <div className="text-xs text-muted-foreground">Total Profit</div>
            <div className="text-lg font-semibold">{formatSSP(report?.totalProfit ?? 0)}</div>
            <div className="text-xs text-muted-foreground">~ {formatUSD(convertToUSD(report?.totalProfit ?? 0))}</div>
          </div>
          <div className="rounded-md border p-3">
            <div className="text-xs text-muted-foreground">Items Sold</div>
            <div className="text-lg font-semibold">{report?.totalItems ?? 0}</div>
          </div>
        </div>

        <div className="h-[350px] rounded-md border">
          {trend.length === 0 ? (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              No sales data for selected period
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend} margin={{ top: 16, right: 16, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="total" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
