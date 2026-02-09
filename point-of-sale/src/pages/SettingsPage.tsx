"use client"

import { useState } from "react"
import { PageContainer } from "@/components/layout/page-container"
import { SettingsTabs } from "../components/settings/settings-tabs"
import { StoreSettingsForm } from "../components/settings/store-settings.form"
import { UserManagementTable } from "../components/settings/user-management-table"
import { ReceiptSettingsForm } from "../components/settings/receipt-settings-form"
import { SystemPreferencesForm } from "../components/settings/system-preference-form"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("store")

  return (
    <PageContainer title="Settings">
      <div className="flex flex-col flex-1 bg-white rounded-lg shadow-sm min-h-0">
        <SettingsTabs activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6">
            {activeTab === "store" && <StoreSettingsForm />}
            {activeTab === "users" && <UserManagementTable />}
            {activeTab === "receipt" && <ReceiptSettingsForm />}
            {activeTab === "system" && <SystemPreferencesForm />}
          </div>
        </div>
      </div>
    </PageContainer>
  )
}
