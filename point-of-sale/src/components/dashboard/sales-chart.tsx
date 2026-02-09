import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, TooltipProps } from 'recharts'
import { format, parseISO, startOfDay } from 'date-fns'
import { Sale } from '@/hooks/useDashboard'
import { useCurrency } from '@/lib/contexts/currency-context'

interface SalesData {
  date: string
  amount: number
  count: number
}

interface SalesChartProps {
  data: Sale[]
}

export function SalesChart({ data }: SalesChartProps) {
  const { convertToUSD, formatSSP, formatUSD } = useCurrency()

                        
  const groupedData = data.reduce<Record<string, SalesData>>((acc, sale) => {
    const date = startOfDay(parseISO(sale.createdAt)).toISOString()
    if (!acc[date]) {
      acc[date] = {
        date,
        amount: 0,
        count: 0
      }
    }
    acc[date].amount += sale.totalAmount
    acc[date].count += 1
    return acc
  }, {})

  const chartData = Object.values(groupedData).sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      const tooltipData = payload[0].payload as SalesData
      return (
        <div className="rounded-lg border bg-background p-4 shadow-sm">
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col">
              <span className="text-[0.70rem] uppercase text-muted-foreground">Date</span>
              <span className="font-bold text-muted-foreground">
                {format(new Date(tooltipData.date), 'MMM d, yyyy')}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[0.70rem] uppercase text-muted-foreground">Sales</span>
              <span className="font-bold">{tooltipData.count}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[0.70rem] uppercase text-muted-foreground">Revenue</span>
              <span className="font-bold">{formatSSP(tooltipData.amount)}</span>
              <span className="text-xs text-muted-foreground">~ {formatUSD(convertToUSD(tooltipData.amount))}</span>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  if (!chartData || chartData.length === 0) {
    return (
      <div className="flex h-80 items-center justify-center text-muted-foreground">
        No sales data available
      </div>
    )
  }

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{
            top: 5,
            right: 10,
            left: 10,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="date"
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => format(new Date(value), 'MMM d')}
          />
          <YAxis
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => formatSSP(Number(value))}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="amount"
            stroke="#8884d8"
            strokeWidth={2}
            dot={false}
            activeDot={{
              r: 6,
              style: { fill: '#8884d8', opacity: 0.8 },
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
