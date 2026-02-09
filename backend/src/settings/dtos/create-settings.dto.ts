import { BaseSettingsDto } from './base-settings.dto';

export class CreateSettingsDto extends BaseSettingsDto {
  constructor(usdToSsdRate: number) {
    super();
                               
    this.allowUserRegistration = true;
    this.defaultUserRole = 'CASHIER';

                      
    this.autoBackup = true;
    this.backupFrequency = 'daily';

                                           
    if (!usdToSsdRate || usdToSsdRate <= 0) {
      throw new Error(
        'USD to SSP exchange rate is required and must be greater than 0',
      );
    }

    this.usdToSsdRate = usdToSsdRate;
    this.useMultiCurrency = false;
    this.baseCurrency = 'SSP';
    this.autoUpdateRates = false;                             

                     
    this.storeName = 'SuperMarket POS';
    this.storePhone = '';
    this.storeEmail = '';
    this.storeWebsite = '';
    this.storeAddress = '';
    this.storeCity = '';
    this.storeState = '';
    this.storeZipCode = '';
    this.storeCountry = '';

                   
    this.includeTaxInPrice = false;
    this.taxRates = [
      { id: 'standard', name: 'Standard Rate', rate: 0, isDefault: true },
    ];

                       
    this.receiptHeaderText = 'SuperMarket POS';
    this.receiptFooterText = 'Thank you for shopping with us!';
    this.receiptShowLogo = true;
    this.receiptShowBarcode = true;
    this.receiptPaperSize = '80mm';
    this.receiptFontSize = 'normal';
    this.receiptIncludeCustomerInfo = true;
    this.receiptIncludeTaxDetails = true;

                      
    this.theme = 'light';
    this.language = 'en';
    this.autoLogoutMinutes = 30;
    this.enableNotifications = true;
    this.enableSounds = true;
    this.enableAutomaticUpdates = true;
    this.enableOfflineMode = true;
  }
}
