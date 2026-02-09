import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { SalesReportSale } from "@/hooks/useSalesReport"
import { format, parseISO } from "date-fns"
import { useCurrency } from "@/lib/contexts/currency-context"

function safeFormatDate(value: string) {
  try {
    return format(parseISO(value), "PP p")
  } catch {
    try {
      return format(new Date(value), "PP p")
    } catch {
      return value
    }
  }
}

export function SalesTransactionsTable({ sales }: { sales: SalesReportSale[] }) {
  const { convertToUSD, formatSSP, formatUSD } = useCurrency()

  const visibleSales = sales.slice(0, 10)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions (Last 10)</CardTitle>
      </CardHeader>
      <CardContent>
        {visibleSales.length === 0 ? (
          <div className="h-[200px] flex items-center justify-center text-muted-foreground">
            No transactions for selected period
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Cashier</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Profit</TableHead>
                <TableHead className="text-right">Items</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleSales.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.id}</TableCell>
                  <TableCell>{safeFormatDate(s.date)}</TableCell>
                  <TableCell>{s.cashierName}</TableCell>
                  <TableCell>{s.customerName}</TableCell>
                  <TableCell className="text-right">
                    <div>{formatSSP(s.totalAmount)}</div>
                    <div className="text-xs text-muted-foreground">~ {formatUSD(convertToUSD(s.totalAmount))}</div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div>{formatSSP(s.profit)}</div>
                    <div className="text-xs text-muted-foreground">~ {formatUSD(convertToUSD(s.profit))}</div>
                  </TableCell>
                  <TableCell className="text-right">{(s.items ?? []).reduce((acc, i) => acc + (i.quantity || 0), 0)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
