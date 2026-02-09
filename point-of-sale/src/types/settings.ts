export type TaxRate = {
  id: string
  name: string
  rate: number
  isDefault: boolean
}

export type Settings = {
  id: string

  allowUserRegistration: boolean
  defaultUserRole: string

  autoBackup: boolean
  backupFrequency: string
  lastBackupAt: string | null

  useMultiCurrency: boolean
  usdToSsdRate: number
  baseCurrency: string
  autoUpdateRates: boolean
  lastRateUpdate: string | null

                      
  storeName: string
  storePhone: string
  storeEmail: string
  storeWebsite: string
  storeAddress: string
  storeCity: string
  storeState: string
  storeZipCode: string
  storeCountry: string

                 
  includeTaxInPrice: boolean
  taxRates: TaxRate[] | null

                     
  receiptHeaderText: string
  receiptFooterText: string
  receiptShowLogo: boolean
  receiptShowBarcode: boolean
  receiptPaperSize: string
  receiptFontSize: string
  receiptIncludeCustomerInfo: boolean
  receiptIncludeTaxDetails: boolean

                       
  theme: string
  language: string
  autoLogoutMinutes: number
  enableNotifications: boolean
  enableSounds: boolean
  enableAutomaticUpdates: boolean
  enableOfflineMode: boolean
}
