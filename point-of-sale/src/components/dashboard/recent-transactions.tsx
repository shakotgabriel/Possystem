import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"
import { Link } from "react-router-dom"
import { Sale } from "@/hooks/useDashboard"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowUpRight, Loader2 } from "lucide-react"
import { useCurrency } from "@/lib/contexts/currency-context"

interface RecentTransactionsProps {
  sales: Sale[]
  loading?: boolean
}

export function RecentTransactions({ sales = [], loading = false }: RecentTransactionsProps) {
  const { convertToUSD, formatSSP, formatUSD } = useCurrency()

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true })
    } catch (e) {
      return ''
    }
  }

  const getStatusColor = (_sale: Sale) => {
                                                                                     
                                                              
    return 'bg-green-100 text-green-800';
  }

  const getStatusText = (_sale: Sale) => {
                                                              
    return 'Completed';
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between p-2">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }


  if (sales.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="rounded-full bg-gray-100 p-3 mb-3">
              <Loader2 className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-sm font-medium text-gray-900">No recent transactions</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Transactions will appear here when they occur.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Recent Transactions</CardTitle>
        <div className="flex items-center">
          <Badge variant="secondary" className="mr-2 bg-gray-100">
            {sales.length} {sales.length === 1 ? 'Sale' : 'Sales'}
          </Badge>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/reports?tab=sales&section=transactions">
              View All
              <ArrowUpRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sales.map((sale) => (
            <div 
              key={sale.id}
              className="flex items-start p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="text-sm font-medium text-gray-900">
                      {sale.id}
                    </div>
                    <Badge 
                      variant="secondary"
                      className={cn(
                        "text-xs",
                        getStatusColor(sale)
                      )}
                    >
                      {getStatusText(sale)}
                    </Badge>
                  </div>
                  <div className="text-sm font-medium text-right">
                    <div>{formatSSP(sale.totalAmount)}</div>
                    <div className="text-xs text-muted-foreground">~ {formatUSD(convertToUSD(sale.totalAmount))}</div>
                  </div>
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  {sale.customer ? (
                    <span>Customer: {sale.customer.name}</span>
                  ) : (
                    <span>Walk-in Customer</span>
                  )}
                  <span className="mx-2">•</span>
                  <span>{formatDate(sale.createdAt)}</span>
                </div>
                {sale.saleItems && sale.saleItems.length > 0 && (
                  <div className="mt-1 text-xs text-gray-500 truncate">
                    {(sale.saleItems ?? []).map((item, index) => (
                      <span key={item.id}>
                        {item.quantity}x {item.product?.name || 'Product'}
                        {index < (sale.saleItems?.length ?? 0) - 1 ? ', ' : ''}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
