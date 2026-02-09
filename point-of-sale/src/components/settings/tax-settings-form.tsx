"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Button } from "../ui/button"
import { Switch } from "../ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import { Plus, Trash } from "lucide-react"
import { getSettings, updateSettings } from "@/api/settings"
import type { TaxRate } from "@/types/settings"
import { toast } from "sonner"

export function TaxSettingsForm() {
  const [includeTaxInPrice, setIncludeTaxInPrice] = useState(false)
  const [taxRates, setTaxRates] = useState<TaxRate[]>([])
  const [newTaxRate, setNewTaxRate] = useState({ name: "", rate: "" })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        setLoading(true)
        const res = await getSettings()
        if (!mounted) return
        setIncludeTaxInPrice(Boolean(res.data.includeTaxInPrice))
        setTaxRates(res.data.taxRates ?? [])
      } catch (e: any) {
        toast.error(e?.response?.data?.message ?? "Failed to load settings")
      } finally {
        if (mounted) setLoading(false)
      }
    })()

    return () => {
      mounted = false
    }
  }, [])

  const handleAddTaxRate = () => {
    if (newTaxRate.name && newTaxRate.rate) {
      const parsed = Number(newTaxRate.rate)
      if (Number.isNaN(parsed)) return

      setTaxRates((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          name: newTaxRate.name,
          rate: parsed,
          isDefault: false,
        },
      ])
      setNewTaxRate({ name: "", rate: "" })
    }
  }

  const handleDeleteTaxRate = (id: string) => {
    setTaxRates((prev) => prev.filter((rate) => rate.id !== id))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSaving(true)
      await updateSettings({
        includeTaxInPrice,
        taxRates,
      })
      toast.success("Tax settings saved")
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Failed to save settings")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading settings…</div>
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Tax Settings</CardTitle>
          <CardDescription>Configure tax rates and calculation methods</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="tax-inclusion">Include Tax in Prices</Label>
              <p className="text-sm text-muted-foreground">Display product prices with tax included</p>
            </div>
            <Switch id="tax-inclusion" checked={includeTaxInPrice} onCheckedChange={setIncludeTaxInPrice} />
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium">Tax Rates</h3>
              <p className="text-sm text-muted-foreground">
                Configure different tax rates for various product categories
              </p>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Rate (%)</TableHead>
                  <TableHead>Default</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {taxRates.map((rate) => (
                  <TableRow key={rate.id}>
                    <TableCell>{rate.name}</TableCell>
                    <TableCell>{rate.rate}%</TableCell>
                    <TableCell>{rate.isDefault ? "Yes" : "No"}</TableCell>
                    <TableCell className="text-right">
                      {!rate.isDefault && (
                        <Button variant="outline" size="icon" onClick={() => handleDeleteTaxRate(rate.id)}>
                          <Trash className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell>
                    <Input
                      placeholder="Tax Rate Name"
                      value={newTaxRate.name}
                      onChange={(e) => setNewTaxRate({ ...newTaxRate, name: e.target.value })}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      placeholder="Rate %"
                      value={newTaxRate.rate}
                      onChange={(e) => setNewTaxRate({ ...newTaxRate, rate: e.target.value })}
                    />
                  </TableCell>
                  <TableCell>No</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="icon" type="button" onClick={handleAddTaxRate}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-end">
            <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={saving}>
              {saving ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
