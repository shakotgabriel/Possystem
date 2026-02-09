import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import type { SalesReportResponse } from "@/hooks/useSalesReport"
import { useCurrency } from "@/lib/contexts/currency-context"

interface TopEmployeesTableProps {
  dateRange: { from: Date; to: Date }
  report: SalesReportResponse | null
}

export function TopEmployeesTable({ dateRange, report }: TopEmployeesTableProps) {
  void dateRange

  const { convertToUSD, formatSSP, formatUSD } = useCurrency()

  const map = new Map<string, { name: string; sales: number; transactions: number }>()
  for (const sale of report?.sales ?? []) {
    const key = sale.cashierId
    const cur = map.get(key) ?? { name: sale.cashierName, sales: 0, transactions: 0 }
    cur.name = sale.cashierName
    cur.sales += sale.totalAmount || 0
    cur.transactions += 1
    map.set(key, cur)
  }

  const employees = Array.from(map.values())
    .map((e) => ({
      ...e,
      avgSale: e.transactions > 0 ? e.sales / e.transactions : 0,
    }))
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 10)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Performing Employees</CardTitle>
      </CardHeader>
      <CardContent>
        {employees.length === 0 ? (
          <div className="py-10 text-center text-muted-foreground">
            No employee sales for selected period
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Sales</TableHead>
                <TableHead>Transactions</TableHead>
                <TableHead>Avg. Sale</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => (
                <TableRow key={employee.name}>
                  <TableCell className="font-medium">{employee.name}</TableCell>
                  <TableCell>
                    <div className="font-medium">{formatSSP(employee.sales)}</div>
                    <div className="text-xs text-muted-foreground">~ {formatUSD(convertToUSD(employee.sales))}</div>
                  </TableCell>
                  <TableCell>{employee.transactions}</TableCell>
                  <TableCell>
                    <div className="font-medium">{formatSSP(employee.avgSale)}</div>
                    <div className="text-xs text-muted-foreground">~ {formatUSD(convertToUSD(employee.avgSale))}</div>
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
