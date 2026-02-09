"use client"

import { useState, useEffect } from "react"
import { PageContainer } from "@/components/layout/page-container"
import { CustomerTable } from "../components/customers/customer-table"
import { CustomerFilters } from "../components/customers/customer-filters"
import { CustomerStats } from "../components/customers/customer-stats"
import { Button } from "../components/ui/button"
import { Plus } from "lucide-react"
import { AddCustomerDialog } from "../components/customers/add-customer-dialog"
import { useCustomers } from "../hooks/useCustomers"
import type { Customer } from "@/types/models"

export default function CustomersPage() {
  const { 
    customers, 
    loading, 
    error, 
    fetchCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer
  } = useCustomers()

  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [spendingFilter, setSpendingFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  const handleCreateCustomer = async (customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => {
    await createCustomer(customerData)
  }

  const handleUpdateCustomer = async (id: string, customerData: Partial<Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>>) => {
    await updateCustomer(id, customerData)
  }

  const handleDeleteCustomer = async (id: string) => {
    if (confirm("Are you sure you want to delete this customer?")) {
      await deleteCustomer(id)
    }
  }

  const filteredCustomers = customers?.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  }) || []

  return (
    <PageContainer>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Customers</h1>
        <div className="flex gap-2">
          <Button
            onClick={() => setIsAddCustomerOpen(true)}
            variant="outline"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Customer
          </Button>
        </div>
      </div>

      {error && (
        <div className="text-red-500 mb-4">
          {error}
        </div>
      )}

      <CustomerStats customers={customers || []} />

      <div className="grid gap-4">
        <CustomerFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          spendingFilter={spendingFilter}
          onSpendingChange={setSpendingFilter}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
        />
        <CustomerTable
          customers={filteredCustomers}
          onDelete={handleDeleteCustomer}
          onUpdate={handleUpdateCustomer}
          loading={loading}
        />
      </div>

      <AddCustomerDialog
        open={isAddCustomerOpen}
        onOpenChange={setIsAddCustomerOpen}
        onSubmit={handleCreateCustomer}
      />
    </PageContainer>
  )
}
