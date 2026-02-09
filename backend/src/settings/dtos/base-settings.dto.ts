import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsArray,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsIn,
  Min,
} from 'class-validator';

class TaxRateDto {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsNumber()
  rate: number;

  @IsBoolean()
  isDefault: boolean;
}

export class BaseSettingsDto {
  @IsBoolean()
  allowUserRegistration: boolean;

  @IsString()
  defaultUserRole: string;

  @IsBoolean()
  autoBackup: boolean;

  @IsEnum(['daily', 'weekly', 'monthly'])
  backupFrequency: string;

  @IsDateString()
  @IsOptional()
  lastBackupAt?: Date;

                      
  @IsBoolean()
  useMultiCurrency: boolean;

  @IsNumber()
  @IsPositive()
  usdToSsdRate: number;

  @IsString()
  @IsIn(['SSP', 'USD'])
  baseCurrency: string;

  @IsBoolean()
  autoUpdateRates: boolean;

  @IsDateString()
  @IsOptional()
  lastRateUpdate?: Date;

                      
  @IsString()
  @IsOptional()
  storeName?: string;

  @IsString()
  @IsOptional()
  storePhone?: string;

  @IsString()
  @IsOptional()
  storeEmail?: string;

  @IsString()
  @IsOptional()
  storeWebsite?: string;

  @IsString()
  @IsOptional()
  storeAddress?: string;

  @IsString()
  @IsOptional()
  storeCity?: string;

  @IsString()
  @IsOptional()
  storeState?: string;

  @IsString()
  @IsOptional()
  storeZipCode?: string;

  @IsString()
  @IsOptional()
  storeCountry?: string;

                 
  @IsBoolean()
  @IsOptional()
  includeTaxInPrice?: boolean;

  @IsArray()
  @IsOptional()
  taxRates?: TaxRateDto[];

                     
  @IsString()
  @IsOptional()
  receiptHeaderText?: string;

  @IsString()
  @IsOptional()
  receiptFooterText?: string;

  @IsBoolean()
  @IsOptional()
  receiptShowLogo?: boolean;

  @IsBoolean()
  @IsOptional()
  receiptShowBarcode?: boolean;

  @IsString()
  @IsOptional()
  @IsIn(['58mm', '80mm', 'a4'])
  receiptPaperSize?: string;

  @IsString()
  @IsOptional()
  @IsIn(['small', 'normal', 'large'])
  receiptFontSize?: string;

  @IsBoolean()
  @IsOptional()
  receiptIncludeCustomerInfo?: boolean;

  @IsBoolean()
  @IsOptional()
  receiptIncludeTaxDetails?: boolean;

                       
  @IsString()
  @IsOptional()
  theme?: string;

  @IsString()
  @IsOptional()
  language?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  autoLogoutMinutes?: number;

  @IsBoolean()
  @IsOptional()
  enableNotifications?: boolean;

  @IsBoolean()
  @IsOptional()
  enableSounds?: boolean;

  @IsBoolean()
  @IsOptional()
  enableAutomaticUpdates?: boolean;

  @IsBoolean()
  @IsOptional()
  enableOfflineMode?: boolean;
}
