import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, ShoppingCart, Package, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { useCurrency } from "@/lib/contexts/currency-context"

type DashboardTotals = {
  totalSales: number
  totalRevenue: number
  totalCustomers: number
  totalProducts: number
}

interface StatCardProps {
  title: string
  value: string
  change: string
  icon: React.ReactNode
  trend?: "up" | "down"
}

function StatCard({ title, value, change, icon, trend }: StatCardProps) {
  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <div className="p-2 sm:p-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm sm:text-base font-medium">{title}</CardTitle>
          <div className={cn(
            "p-2 rounded-full",
            "bg-gray-100/50",
            trend === "up" && "text-green-600",
            trend === "down" && "text-red-600"
          )}>
            {icon}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="text-xl sm:text-2xl font-bold tracking-tight">{value}</div>
          <p className={cn(
            "text-xs sm:text-sm mt-1",
            trend === "up" ? "text-green-600" : "text-red-600"
          )}>
            {change}
          </p>
        </CardContent>
      </div>
    </Card>
  )
}

export function DashboardStats({ totals }: { totals: DashboardTotals }) {
  const { convertToUSD, formatSSP, formatUSD } = useCurrency()
  const stats = [
    {
      title: "Total Revenue",
      value: formatSSP(totals.totalRevenue || 0),
      change: `~ ${formatUSD(convertToUSD(totals.totalRevenue || 0))}`,
      icon: <DollarSign className="h-4 w-4" />,
      trend: "up" as const
    },
    {
      title: "Sales",
      value: String(totals.totalSales || 0),
      change: "\u00A0",
      icon: <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />,
      trend: "up" as const
    },
    {
      title: "Products",
      value: String(totals.totalProducts || 0),
      change: "\u00A0",
      icon: <Package className="h-4 w-4 sm:h-5 sm:w-5" />,
      trend: "up" as const
    },
    {
      title: "Customers",
      value: String(totals.totalCustomers || 0),
      change: "\u00A0",
      icon: <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />,
      trend: "up" as const
    }
  ]

  return (
    <div className="grid gap-4 grid-cols-1 xs:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <StatCard key={stat.title} {...stat} />
      ))}
    </div>
  )
}
