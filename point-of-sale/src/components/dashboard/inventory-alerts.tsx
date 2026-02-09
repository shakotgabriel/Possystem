import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { Product } from "@/hooks/useDashboard"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertTriangle, AlertOctagon } from "lucide-react"

interface InventoryAlertsProps {
  products: Product[]
  loading?: boolean
}

export function InventoryAlerts({ products = [], loading = false }: InventoryAlertsProps) {
                                                          
  const lowStockProducts = products.filter(product => product.stock < 5)
  
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Inventory Alerts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center space-x-4 p-2">
              <Skeleton className="h-12 w-12 rounded-md" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-8 w-20" />
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  if (lowStockProducts.length === 0) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Inventory Alerts</CardTitle>
          <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800">
            All Good
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mb-3">
              <AlertTriangle className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-900">No inventory alerts</h3>
            <p className="mt-1 text-sm text-gray-500">All products have sufficient stock levels.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0">
        <div className="flex items-center">
          <CardTitle className="text-lg">Inventory Alerts</CardTitle>
          <Badge variant="secondary" className="ml-2 bg-red-100 text-red-800">
            {lowStockProducts.length} {lowStockProducts.length === 1 ? 'Alert' : 'Alerts'}
          </Badge>
        </div>
        <Link to="/inventory" className="sm:ml-auto">
          <Button 
            variant="outline" 
            size="sm"
            className="w-full sm:w-auto"
          >
            Manage Inventory
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {lowStockProducts.map((product) => (
            <div 
              key={product.id}
              className="flex items-start p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex-shrink-0 h-10 w-10 rounded-md bg-gray-200 overflow-hidden">
                {product.image && (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <div className="ml-4 flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-900 truncate">
                    {product.name}
                  </h4>
                  <Badge 
                    variant={product.stock === 0 ? "destructive" : "default"}
                    className="ml-2"
                  >
                    {product.stock === 0 ? 'Out of Stock' : 'Low Stock'}
                  </Badge>
                </div>
                <div className="mt-1 flex items-center text-sm text-gray-500">
                  <span>Stock: {product.stock} units</span>
                  {product.category && (
                    <span className="mx-2">•</span>
                  )}
                  {product.category && (
                    <span>{product.category.name}</span>
                  )}
                </div>
                {product.stock === 0 ? (
                  <div className="mt-1 flex items-center text-xs text-red-600">
                    <AlertOctagon className="h-3 w-3 mr-1" />
                    <span>This product is out of stock</span>
                  </div>
                ) : (
                  <div className="mt-1 flex items-center text-xs text-yellow-600">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    <span>Reorder point reached</span>
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
