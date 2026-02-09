import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, AlertCircle } from 'lucide-react'
import { SalesChart } from '@/components/dashboard/sales-chart'
import { TopSellingProducts } from '@/components/dashboard/top-selling-products'
import { DashboardStats } from '@/components/dashboard/dashboard-stats'
import { InventoryAlerts } from '@/components/dashboard/inventory-alerts'
import { RecentTransactions } from '@/components/dashboard/recent-transactions'
import { useDashboard } from '@/hooks/useDashboard'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { PageContainer } from '@/components/layout/page-container'

export default function DashboardPage() {
  const { data, loading, error, refetch } = useDashboard()

  if (loading) {
    return (
      <PageContainer title="Dashboard">
        <div className="flex h-[80vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </PageContainer>
    )
  }

  if (error) {
    return (
      <PageContainer title="Dashboard">
        <div className="container mx-auto p-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error}
              <button 
                onClick={refetch}
                className="ml-2 text-sm underline hover:text-primary"
              >
                Retry
              </button>
            </AlertDescription>
          </Alert>
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer title="Dashboard">
      <div className="container mx-auto space-y-6 p-4">
        
        <DashboardStats totals={data.stats} />

        
        <div className="grid gap-6">
          
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Sales Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <SalesChart data={data.sales} />
              </CardContent>
            </Card>

            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Top Selling Products</CardTitle>
              </CardHeader>
              <CardContent>
                <TopSellingProducts data={data.topProducts} />
              </CardContent>
            </Card>
          </div>

          
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Inventory Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <InventoryAlerts products={data.stats.lowStockProducts} loading={loading} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <RecentTransactions sales={data.sales.slice(0, 5)} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}
