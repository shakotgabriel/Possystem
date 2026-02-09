                                                         
"use client"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog"
import { z } from "zod"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Button } from "../ui/button"
import { useState } from "react"



export const customerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().optional().nullable(),
})

export type CustomerSchema = z.infer<typeof customerSchema>

interface AddCustomerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (customer: CustomerSchema) => Promise<void> | void
}

export function AddCustomerDialog({ open, onOpenChange, onSubmit }: AddCustomerDialogProps) {
  const [name, setName] = useState("")
  const [phone, setPhone] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    const parsed = customerSchema.safeParse({ name, phone })
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Invalid input')
      return
    }

    try {
      setSaving(true)
      setError(null)
      await onSubmit(parsed.data)
      setName("")
      setPhone(null)
      onOpenChange(false)
    } catch (e: any) {
      setError(e?.message ?? 'Failed to create customer')
    } finally {
      setSaving(false)
    }
  }



  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Customer</DialogTitle>
          <DialogDescription>
            Enter customer information below. All fields are required.
          </DialogDescription>
        </DialogHeader>

        {error && <div className="text-sm text-red-600">{error}</div>}
        
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={saving}
              />
              
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={phone ?? ""}
                onChange={(e) => setPhone(e.target.value || null)}
                disabled={saving}
              />
              
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleSubmit} disabled={saving}>
              {saving ? 'Saving...' : 'Add Customer'}
            </Button>
          </div>
          
      </DialogContent>
    </Dialog>
  )
}
