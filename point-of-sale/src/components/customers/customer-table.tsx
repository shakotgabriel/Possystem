import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import { Button } from "../ui/button"
import { Trash, Eye, MoreHorizontal } from 'lucide-react'
import { format } from "date-fns"
import { CustomerDetailsDialog } from "./customer-details"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import type { Customer } from "@/types/models"

interface CustomerTableProps {
  customers: Customer[]
  onDelete: (id: string) => Promise<void> | void
  onUpdate: (
    id: string,
    customerData: Partial<Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>>,
  ) => Promise<void> | void
  loading: boolean
}

export function CustomerTable({ customers, loading, onDelete, onUpdate }: CustomerTableProps) {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [openDetails, setOpenDetails] = useState(false)

  const handleDelete = async (customerId: string) => {
    if (confirm("Are you sure you want to delete this customer?")) {
      await onDelete(customerId)
    }
  }

  const handleUpdate = async (customerId: string, customerData: Partial<Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>>) => {
    await onUpdate(customerId, customerData)
  }

  return (
    <div className="space-y-4">
      {loading && (
        <div className="animate-pulse">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4 p-4 bg-muted/50 rounded-md">
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted/50 rounded-md" />
                  <div className="h-3 bg-muted/50 rounded-md" />
                </div>
                <div className="h-8 bg-muted/50 rounded-md" />
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && customers.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No customers found
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell>{customer.name}</TableCell>
                <TableCell>{customer.phone || 'N/A'}</TableCell>
                <TableCell>
                  {customer.createdAt
                    ? format(new Date(customer.createdAt), "MMM d, yyyy")
                    : '—'}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => {
                        setSelectedCustomer(customer)
                        setOpenDetails(true)
                      }}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(customer.id)}>
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selectedCustomer && (
        <CustomerDetailsDialog
          open={openDetails}
          onOpenChange={setOpenDetails}
          customer={selectedCustomer}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  )
}
