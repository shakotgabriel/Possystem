import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Product } from '@/hooks/useDashboard'
import { useCurrency } from '@/lib/contexts/currency-context'

interface TopSellingProductsProps {
  data: Product[]
}

export function TopSellingProducts({ data }: TopSellingProductsProps) {
  const { convertToUSD, formatSSP, formatUSD } = useCurrency()

  if (!data || data.length === 0) {
    return (
      <div className="flex h-80 items-center justify-center text-muted-foreground">
        No product data available
      </div>
    )
  }

                                                      
  const productsWithStats = data.map(product => {
    const totalSold = product.saleItems?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0
    const revenue = product.saleItems?.reduce((sum, item) => sum + (item.totalPrice || (item.unitPrice || 0) * (item.quantity || 0)), 0) || 0
    
    return {
      ...product,
      totalSold,
      revenue
    }
  })
  
                                           
  const sortedProducts = [...productsWithStats].sort((a, b) => b.totalSold - a.totalSold)

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">In Stock</TableHead>
              <TableHead className="text-right">Sold</TableHead>
              <TableHead className="text-right">Revenue</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedProducts.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center">
                    {product.image && (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-8 w-8 rounded-md mr-2 object-cover"
                      />
                    )}
                    <div className="flex flex-col">
                      <span>{product.name}</span>
                      {product.category && (
                        <span className="text-xs text-muted-foreground">
                          {product.category.name}
                        </span>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="font-medium">{formatSSP(product.price)}</div>
                  <div className="text-xs text-muted-foreground">~ {formatUSD(convertToUSD(product.price))}</div>
                </TableCell>
                <TableCell className="text-right">
                  <Badge 
                    variant={product.stock === 0 ? 'destructive' : 'outline'}
                    className={product.stock > 0 && product.stock < 5 ? 'bg-yellow-50 text-yellow-800 border-yellow-200' : ''}
                  >
                    {product.stock} in stock
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {product.totalSold}
                </TableCell>
                <TableCell className="text-right font-medium">
                  <div className="font-medium">{formatSSP(product.revenue)}</div>
                  <div className="text-xs text-muted-foreground">~ {formatUSD(convertToUSD(product.revenue))}</div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
