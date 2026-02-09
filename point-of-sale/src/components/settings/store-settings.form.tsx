"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Settings } from "@/types/settings"
import { getSettings, updateSettings } from "@/api/settings"
import { toast } from "sonner"

export function StoreSettingsForm() {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [formData, setFormData] = useState({
    storeName: "",
    storePhone: "",
    storeEmail: "",
    storeWebsite: "",
    storeAddress: "",
    storeCity: "",
    storeState: "",
    storeZipCode: "",
    storeCountry: "",
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
        setSettings(res.data)
        setFormData({
          storeName: res.data.storeName ?? "",
          storePhone: res.data.storePhone ?? "",
          storeEmail: res.data.storeEmail ?? "",
          storeWebsite: res.data.storeWebsite ?? "",
          storeAddress: res.data.storeAddress ?? "",
          storeCity: res.data.storeCity ?? "",
          storeState: res.data.storeState ?? "",
          storeZipCode: res.data.storeZipCode ?? "",
          storeCountry: res.data.storeCountry ?? "",
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

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setSaving(true)
      const res = await updateSettings({
        storeName: formData.storeName,
        storePhone: formData.storePhone,
        storeEmail: formData.storeEmail,
        storeWebsite: formData.storeWebsite,
        storeAddress: formData.storeAddress,
        storeCity: formData.storeCity,
        storeState: formData.storeState,
        storeZipCode: formData.storeZipCode,
        storeCountry: formData.storeCountry,
      })
      setSettings(res.data)
      toast.success("Store settings saved")
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Failed to save settings")
    } finally {
      setSaving(false)
    }
  }

  if (loading && !settings) {
    return <div className="text-sm text-muted-foreground">Loading settings…</div>
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="shadow-none border-0 md:border md:shadow-sm">
        <CardHeader className="pb-4 md:pb-6">
          <CardTitle>Store Information</CardTitle>
          <CardDescription>
            Update your store details and preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="storeName">Store Name</Label>
                <Input
                  id="storeName"
                  value={formData.storeName}
                  onChange={(e) => handleChange("storeName", e.target.value)}
                  placeholder="Enter store name"
                  className="h-10"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.storePhone}
                    onChange={(e) => handleChange("storePhone", e.target.value)}
                    placeholder="Enter phone number"
                    className="h-10"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.storeEmail}
                    onChange={(e) => handleChange("storeEmail", e.target.value)}
                    placeholder="Enter email address"
                    className="h-10"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={formData.storeWebsite}
                  onChange={(e) => handleChange("storeWebsite", e.target.value)}
                  placeholder="Enter website URL"
                  className="h-10"
                />
              </div>
            </div>

            
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.storeAddress}
                  onChange={(e) => handleChange("storeAddress", e.target.value)}
                  placeholder="Enter street address"
                  className="h-10"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.storeCity}
                    onChange={(e) => handleChange("storeCity", e.target.value)}
                    placeholder="Enter city"
                    className="h-10"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={formData.storeState}
                    onChange={(e) => handleChange("storeState", e.target.value)}
                    placeholder="Enter state"
                    className="h-10"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="zipCode">ZIP Code</Label>
                  <Input
                    id="zipCode"
                    value={formData.storeZipCode}
                    onChange={(e) => handleChange("storeZipCode", e.target.value)}
                    placeholder="Enter ZIP code"
                    className="h-10"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={formData.storeCountry}
                    onChange={(e) => handleChange("storeCountry", e.target.value)}
                    placeholder="Enter country"
                    className="h-10"
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end sticky bottom-0 bg-white border-t p-4 md:p-6 -mx-4 md:mx-0 mt-auto">
        <Button type="submit" size="lg" className="w-full sm:w-auto min-w-[200px]" disabled={saving}>
          {saving ? "Saving…" : "Save Changes"}
        </Button>
      </div>
    </form>
  )
}
