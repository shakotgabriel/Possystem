"use client"

import { useEffect, useRef, useState } from "react"
import { PageContainer } from "@/components/layout/page-container"
import { ReportsTabs } from "../components/reports/reports-tabs"
import { SalesReportChart } from "../components/reports/sales-report-chart"
import { InventoryReportTable } from "../components/reports/inventory-report-table"
import { CategorySalesChart } from "../components/reports/category-sales-chart"
import { TopEmployeesTable } from "../components/reports/top-employees-table"
import { SalesTransactionsTable } from "../components/reports/sales-transactions-table"
import { DateRangePicker } from "../components/dashboard/date-range-picker"
import { Button } from "../components/ui/button"
import { Download } from "lucide-react"
import { useSalesReport } from "@/hooks/useSalesReport"
import { useSearchParams } from "react-router-dom"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface DateRange {
  from: Date | null
  to: Date | null
}

export default function ReportsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tabParam = searchParams.get("tab")
  const sectionParam = searchParams.get("section")

  const [activeTab, setActiveTab] = useState(tabParam || "sales")
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    to: new Date(),
  })

  const transactionsRef = useRef<HTMLDivElement | null>(null)
  const didScrollRef = useRef(false)

  useEffect(() => {
    if (!tabParam) return
    if (tabParam === activeTab) return
    setActiveTab(tabParam)
                                                           
  }, [tabParam])

  useEffect(() => {
                                              
    if ((searchParams.get("tab") || "sales") === activeTab) return
    const next = new URLSearchParams(searchParams)
    next.set("tab", activeTab)
    setSearchParams(next, { replace: true })
  }, [activeTab, searchParams, setSearchParams])

  const downloadCsv = (
    filename: string,
    rows: Array<Record<string, any>>,
    headers?: string[],
  ) => {
    const resolvedHeaders = headers
      ? headers
      : (() => {
          const headerSet = new Set<string>()
          for (const row of rows) {
            for (const k of Object.keys(row)) headerSet.add(k)
          }
          return Array.from(headerSet)
        })()

    const escape = (value: any) => {
      const str = value === null || value === undefined ? "" : String(value)
      const needsQuotes = /[\n\r,\"]/.test(str)
      const escaped = str.replace(/"/g, '""')
      return needsQuotes ? `"${escaped}"` : escaped
    }

    const csv = [
      resolvedHeaders.join(","),
      ...rows.map((r) => resolvedHeaders.map((h) => escape(r[h])).join(",")),
    ].join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

                                                       
  const validDateRange = {
    from: dateRange.from || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    to: dateRange.to || new Date(),
  }

  const { data: salesReport, loading: salesLoading, error: salesError } = useSalesReport(validDateRange)

  useEffect(() => {
    if (sectionParam !== "transactions") {
      didScrollRef.current = false
      return
    }
    if (activeTab !== "sales") return
    if (didScrollRef.current) return
    if (!transactionsRef.current) return
    transactionsRef.current.scrollIntoView({ behavior: "smooth", block: "start" })
    didScrollRef.current = true
  }, [activeTab, sectionParam])

  const handleExportReport = () => {
    if (activeTab === "sales") {
      const rows = (salesReport?.sales ?? []).flatMap((sale) =>
        (sale.items ?? []).map((item) => ({
          saleId: sale.id,
          saleDate: sale.date,
          cashierId: sale.cashierId,
          cashierName: sale.cashierName,
          customerName: sale.customerName,
          saleTotalAmount: sale.totalAmount,
          saleProfit: sale.profit,
          productId: item.productId,
          productName: item.productName,
          categoryId: item.categoryId,
          categoryName: item.categoryName ?? "Uncategorized",
          unitPrice: item.unitPrice,
          quantitySold: item.quantity,
          lineTotal: item.totalPrice,
          lineProfit: item.profit,
        })),
      )

      const headers = [
        "saleId",
        "saleDate",
        "cashierId",
        "cashierName",
        "customerName",
        "saleTotalAmount",
        "saleProfit",
        "productId",
        "productName",
        "categoryId",
        "categoryName",
        "unitPrice",
        "quantitySold",
        "lineTotal",
        "lineProfit",
      ]

      downloadCsv("sales-report.csv", rows, headers)
      return
    }

                                                                           
    downloadCsv(`${activeTab}-report.csv`, [])
  }

  return (
    <PageContainer title="Reports">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <DateRangePicker dateRange={dateRange} onChange={setDateRange} />
          <Button variant="outline" onClick={handleExportReport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <ReportsTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === "sales" && (salesError || salesLoading) && (
        <div className="mt-4">
          {salesError ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{salesError}</AlertDescription>
            </Alert>
          ) : (
            <div className="text-sm text-muted-foreground">Loading sales report…</div>
          )}
        </div>
      )}

      <div className="mt-6">
        {activeTab === "sales" && (
          <div className="space-y-6">
            <SalesReportChart dateRange={validDateRange} report={salesReport} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CategorySalesChart dateRange={validDateRange} report={salesReport} />
              <TopEmployeesTable dateRange={validDateRange} report={salesReport} />
            </div>

            <div ref={transactionsRef} id="recent-transactions">
              <SalesTransactionsTable sales={salesReport?.sales ?? []} />
            </div>
          </div>
        )}

        {activeTab === "inventory" && (
          <div className="space-y-6">
            <InventoryReportTable dateRange={validDateRange} report={salesReport} />
          </div>
        )}

        {activeTab === "customers" && (
          <div className="space-y-6">
            <div className="h-[400px] flex items-center justify-center border rounded-md">
              <p className="text-muted-foreground">Customer acquisition and retention charts would appear here</p>
            </div>
          </div>
        )}

      </div>
    </PageContainer>
  )
}
