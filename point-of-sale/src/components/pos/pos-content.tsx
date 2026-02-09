"use client"

import { Button } from "@/components/ui/button"
import { Plus, Search } from "lucide-react"

export function POSContent() {
  return (
    <div className="p-3 md:p-6">
      <div className="mb-4 md:mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-2">
          <h1 className="text-2xl font-bold">Point of Sale</h1>
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
            <Button variant="outline" className="w-full md:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              New Sale
            </Button>
            <Button variant="outline" className="w-full md:w-auto">
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-white rounded-lg shadow p-4 md:p-6">
          <h2 className="text-lg font-semibold mb-4">Current Sale</h2>
        </div>

        <div className="bg-white rounded-lg shadow p-4 md:p-6">
          <h2 className="text-lg font-semibold mb-4">Products</h2>
        </div>

        <div className="bg-white rounded-lg shadow p-4 md:p-6">
          <h2 className="text-lg font-semibold mb-4">Receipt</h2>
        </div>
      </div>
    </div>
  );
}