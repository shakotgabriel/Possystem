import { Input } from "../ui/input"
import { Search } from 'lucide-react'
import { useCustomers } from "../../hooks/useCustomers"
import type { ChangeEvent } from 'react'

interface CustomerFiltersProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  spendingFilter: string
  onSpendingChange: (filter: string) => void
  statusFilter: string
  onStatusChange: (filter: string) => void
}

export function CustomerFilters({
  searchQuery,
  onSearchChange,
  spendingFilter,
  onSpendingChange,
  statusFilter,
  onStatusChange
}: CustomerFiltersProps) {
  const { fetchCustomers } = useCustomers()

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    onSearchChange(value)
    fetchCustomers(1, { search: value })
  }

  const handleSpendingChange = (value: string) => {
    onSpendingChange(value)
    fetchCustomers(1, { spending: value })
  }

  const handleStatusChange = (value: string) => {
    onStatusChange(value)
    fetchCustomers(1, { status: value })
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex-1">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <Input
            type="search"
            placeholder="Search customers..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-10"
          />
        </div>
      </div>
      <select
        value={spendingFilter}
        onChange={(e) => handleSpendingChange(e.target.value)}
        className="rounded-md border p-2"
      >
        <option value="all">All Spending</option>
        <option value="high">High Spenders</option>
        <option value="medium">Medium Spenders</option>
        <option value="low">Low Spenders</option>
      </select>
      <select
        value={statusFilter}
        onChange={(e) => handleStatusChange(e.target.value)}
        className="rounded-md border p-2"
      >
        <option value="all">All Status</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>
    </div>
  )
}
