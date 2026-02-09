import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Users, UserPlus, Calendar } from 'lucide-react'
import type { Customer } from "@/types/models"
import { useCurrency } from "@/lib/contexts/currency-context"

interface CustomerStatsProps {
  customers: Customer[]
}

export function CustomerStats({ customers }: CustomerStatsProps) {
  const { convertToUSD, formatSSP, formatUSD } = useCurrency()

  const totalCustomers = customers.length
  const now = new Date()
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const newCustomersThisMonth = customers.filter((c) => {
    if (!c.createdAt) return false
    return new Date(c.createdAt) >= firstDayOfMonth
  }).length

  const totalSales = customers.reduce((sum, customer) => {
    return (
      sum +
      (customer.sales?.reduce((saleSum, sale) => saleSum + sale.totalAmount, 0) || 0)
    )
  }, 0)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalCustomers}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">New Customers</CardTitle>
          <UserPlus className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">+{newCustomersThisMonth}</div>
          <p className="text-xs text-muted-foreground">
            This month
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Created This Month</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{newCustomersThisMonth}</div>
          <p className="text-xs text-muted-foreground">
            New customers
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatSSP(totalSales)}</div>
          <p className="text-xs text-muted-foreground">~ {formatUSD(convertToUSD(totalSales))}</p>
        </CardContent>
      </Card>
    </div>
  )
}
