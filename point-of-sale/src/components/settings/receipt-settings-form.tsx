"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Textarea } from "../ui/textarea"
import { Button } from "../ui/button"
import { Switch } from "../ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { getSettings, updateSettings } from "@/api/settings"
import { toast } from "sonner"

export function ReceiptSettingsForm() {
  const [formData, setFormData] = useState({
    headerText: "",
    footerText: "",
    showLogo: true,
    showBarcode: true,
    paperSize: "80mm",
    fontSize: "normal",
    includeCustomerInfo: true,
    includeTaxDetails: true,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        setLoading(true)
        const res = await getSettings()
        if (!mounted) return
        setFormData({
          headerText: res.data.receiptHeaderText ?? "",
          footerText: res.data.receiptFooterText ?? "",
          showLogo: Boolean(res.data.receiptShowLogo),
          showBarcode: Boolean(res.data.receiptShowBarcode),
          paperSize: res.data.receiptPaperSize ?? "80mm",
          fontSize: res.data.receiptFontSize ?? "normal",
          includeCustomerInfo: Boolean(res.data.receiptIncludeCustomerInfo),
          includeTaxDetails: Boolean(res.data.receiptIncludeTaxDetails),
        })
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSaving(true)
      await updateSettings({
        receiptHeaderText: formData.headerText,
        receiptFooterText: formData.footerText,
        receiptShowLogo: formData.showLogo,
        receiptShowBarcode: formData.showBarcode,
        receiptPaperSize: formData.paperSize,
        receiptFontSize: formData.fontSize,
        receiptIncludeCustomerInfo: formData.includeCustomerInfo,
        receiptIncludeTaxDetails: formData.includeTaxDetails,
      })
      toast.success("Receipt settings saved")
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
          <CardTitle>Receipt Settings</CardTitle>
          <CardDescription>Customize how your receipts look and what information they include</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="headerText">Receipt Header</Label>
              <Input id="headerText" name="headerText" value={formData.headerText} onChange={handleChange} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paperSize">Paper Size</Label>
              <Select value={formData.paperSize} onValueChange={(value) => handleSelectChange("paperSize", value)}>
                <SelectTrigger id="paperSize">
                  <SelectValue placeholder="Select paper size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="58mm">58mm (2.28 inches)</SelectItem>
                  <SelectItem value="80mm">80mm (3.15 inches)</SelectItem>
                  <SelectItem value="a4">A4 Paper</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="footerText">Receipt Footer</Label>
              <Textarea
                id="footerText"
                name="footerText"
                value={formData.footerText}
                onChange={handleChange}
                rows={3}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium">Receipt Options</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="showLogo">Show Store Logo</Label>
                <Switch
                  id="showLogo"
                  checked={formData.showLogo}
                  onCheckedChange={(checked) => handleSwitchChange("showLogo", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="showBarcode">Show Receipt Barcode</Label>
                <Switch
                  id="showBarcode"
                  checked={formData.showBarcode}
                  onCheckedChange={(checked) => handleSwitchChange("showBarcode", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="includeCustomerInfo">Include Customer Info</Label>
                <Switch
                  id="includeCustomerInfo"
                  checked={formData.includeCustomerInfo}
                  onCheckedChange={(checked) => handleSwitchChange("includeCustomerInfo", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="includeTaxDetails">Include Tax Details</Label>
                <Switch
                  id="includeTaxDetails"
                  checked={formData.includeTaxDetails}
                  onCheckedChange={(checked) => handleSwitchChange("includeTaxDetails", checked)}
                />
              </div>
            </div>
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
