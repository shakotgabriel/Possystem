"use client"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "../ui/dialog"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { User, Phone } from "lucide-react"
import { useCustomers } from "../../hooks/useCustomers"
import { useForm, SubmitHandler } from "react-hook-form"
import type { Customer } from "@/types/models"

interface EditCustomerDialogProps {
  customer: Customer
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditCustomerDialog({ 
  customer, 
  open, 
  onOpenChange 
}: EditCustomerDialogProps) {
  const { updateCustomer } = useCustomers()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Customer>({
    defaultValues: {
      id: customer.id,
      name: customer.name,
      phone: customer.phone,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
    },
  })

  const onSubmit: SubmitHandler<Customer> = async (data: Customer) => {
    try {
      setLoading(true)
      setError(null)
      await updateCustomer(data.id, data)
      onOpenChange(false)
    } catch (err) {
      setError("Failed to update customer")
      console.error("Error updating customer:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Customer</DialogTitle>
          <DialogDescription>
            Make changes to customer information here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-sm">
                <User className="h-4 w-4 mr-2 inline-block" />
                Name
              </Label>
              <Input
                id="name"
                {...register("name", { required: "Name is required" })}
                disabled={loading}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone" className="text-sm">
                <Phone className="h-4 w-4 mr-2 inline-block" />
                Phone
              </Label>
              <Input
                id="phone"
                {...register("phone")}
                disabled={loading}
              />
              {errors.phone && (
                <p className="text-sm text-red-500">{errors.phone.message}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
        {error && (
          <div className="text-red-500 text-sm mt-4">
            {error}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}