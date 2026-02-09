"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Label } from "../ui/label"
import { Button } from "../ui/button"
import { Switch } from "../ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Input } from "../ui/input"
import { useCurrency } from "@/lib/contexts/currency-context"
import { getSettings, updateSettings } from "@/api/settings"
import { toast } from "sonner"

export function SystemPreferencesForm() {
  const { currencyRate, updateCurrencyRate } = useCurrency()
  const [formData, setFormData] = useState({
    theme: "light",
    language: "en",
    autoLogout: "30",
    enableNotifications: true,
    enableSounds: true,
    enableAutomaticUpdates: true,
    enableOfflineMode: true,
    backupFrequency: "daily",
    currencyRate: "",
    baseCurrency: "SSP",
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
        setFormData((prev) => ({
          ...prev,
          theme: res.data.theme ?? prev.theme,
          language: res.data.language ?? prev.language,
          autoLogout: String(res.data.autoLogoutMinutes ?? 30),
          enableNotifications: Boolean(res.data.enableNotifications),
          enableSounds: Boolean(res.data.enableSounds),
          enableAutomaticUpdates: Boolean(res.data.enableAutomaticUpdates),
          enableOfflineMode: Boolean(res.data.enableOfflineMode),
          backupFrequency: res.data.backupFrequency ?? prev.backupFrequency,
          currencyRate: String(res.data.usdToSsdRate ?? currencyRate),
          baseCurrency: res.data.baseCurrency ?? prev.baseCurrency,
        }))

        if (typeof res.data.usdToSsdRate === 'number' && res.data.usdToSsdRate > 0) {
          updateCurrencyRate(res.data.usdToSsdRate)
        }
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

                                           
  useEffect(() => {
    setFormData((prev) => ({ ...prev, currencyRate: currencyRate.toString() }))
  }, [currencyRate])

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const handleCurrencyRateChange = (value: string) => {
                         
    if (!/^\d*$/.test(value)) return
    setFormData((prev) => ({ ...prev, currencyRate: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSaving(true)
      const newRate = parseInt(formData.currencyRate)
      const autoLogoutMinutes = parseInt(formData.autoLogout)

      const res = await updateSettings({
        theme: formData.theme,
        language: formData.language,
        backupFrequency: formData.backupFrequency,
        baseCurrency: formData.baseCurrency,
        usdToSsdRate: !Number.isNaN(newRate) ? newRate : undefined,
        autoLogoutMinutes: !Number.isNaN(autoLogoutMinutes) ? autoLogoutMinutes : undefined,
        enableNotifications: formData.enableNotifications,
        enableSounds: formData.enableSounds,
        enableAutomaticUpdates: formData.enableAutomaticUpdates,
        enableOfflineMode: formData.enableOfflineMode,
      })

      if (typeof res.data.usdToSsdRate === 'number' && res.data.usdToSsdRate > 0) {
        updateCurrencyRate(res.data.usdToSsdRate)
      }

      toast.success("System preferences saved")
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
          <CardTitle>System Preferences</CardTitle>
          <CardDescription>Configure system-wide settings and preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Currency Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="currencyRate">Exchange Rate (1 USD = X SSP)</Label>
                <div className="flex items-center space-x-2">
                  <div className="flex-shrink-0">1 USD =</div>
                  <Input
                    id="currencyRate"
                    type="text"
                    value={formData.currencyRate}
                    onChange={(e) => handleCurrencyRateChange(e.target.value)}
                    className="flex-1"
                    placeholder="Enter SSP rate"
                  />
                  <div className="flex-shrink-0">SSP</div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Current rate: 1 USD = {parseInt(formData.currencyRate).toLocaleString()} SSP
                </p>
                <p className="text-xs text-muted-foreground">
                  Update this rate according to the current market exchange rate
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select value={formData.language} onValueChange={(value) => handleSelectChange("language", value)}>
                <SelectTrigger id="language">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="backupFrequency">Backup Frequency</Label>
              <Select
                value={formData.backupFrequency}
                onValueChange={(value) => handleSelectChange("backupFrequency", value)}
              >
                <SelectTrigger id="backupFrequency">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="manual">Manual Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium">System Options</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="enableNotifications">Enable Notifications</Label>
                <Switch
                  id="enableNotifications"
                  checked={formData.enableNotifications}
                  onCheckedChange={(checked) => handleSwitchChange("enableNotifications", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="enableSounds">Enable Sounds</Label>
                <Switch
                  id="enableSounds"
                  checked={formData.enableSounds}
                  onCheckedChange={(checked) => handleSwitchChange("enableSounds", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="enableAutomaticUpdates">Automatic Updates</Label>
                <Switch
                  id="enableAutomaticUpdates"
                  checked={formData.enableAutomaticUpdates}
                  onCheckedChange={(checked) => handleSwitchChange("enableAutomaticUpdates", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="enableOfflineMode">Enable Offline Mode</Label>
                <Switch
                  id="enableOfflineMode"
                  checked={formData.enableOfflineMode}
                  onCheckedChange={(checked) => handleSwitchChange("enableOfflineMode", checked)}
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
