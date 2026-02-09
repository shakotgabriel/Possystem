import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('settings')
@Index(['createdAt'])
@Index(['updatedAt'])
export class Settings {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ default: true })
  allowUserRegistration!: boolean;

  @Column({ default: 'CASHIER' })
  defaultUserRole!: string;

  @Column({ default: true })
  autoBackup!: boolean;

  @Column({ default: 'daily' })
  backupFrequency!: string;

  @Column({ type: 'datetime', nullable: true })
  lastBackupAt!: Date | null;

  @Column({ default: false })
  useMultiCurrency!: boolean;

  @Column('float')
  usdToSsdRate!: number;

  @Column({ default: 'SSP' })
  baseCurrency!: string;

  @Column({ default: false })
  autoUpdateRates!: boolean;

                      
  @Column({ default: 'SuperMarket POS' })
  storeName!: string;

  @Column({ default: '' })
  storePhone!: string;

  @Column({ default: '' })
  storeEmail!: string;

  @Column({ default: '' })
  storeWebsite!: string;

  @Column({ default: '' })
  storeAddress!: string;

  @Column({ default: '' })
  storeCity!: string;

  @Column({ default: '' })
  storeState!: string;

  @Column({ default: '' })
  storeZipCode!: string;

  @Column({ default: '' })
  storeCountry!: string;

                 
  @Column({ default: false })
  includeTaxInPrice!: boolean;

  @Column({ type: 'simple-json', nullable: true })
  taxRates!: Array<{
    id: string;
    name: string;
    rate: number;
    isDefault: boolean;
  }> | null;

                     
  @Column({ default: 'SuperMarket POS' })
  receiptHeaderText!: string;

  @Column({ default: 'Thank you for shopping with us!' })
  receiptFooterText!: string;

  @Column({ default: true })
  receiptShowLogo!: boolean;

  @Column({ default: true })
  receiptShowBarcode!: boolean;

  @Column({ default: '80mm' })
  receiptPaperSize!: string;

  @Column({ default: 'normal' })
  receiptFontSize!: string;

  @Column({ default: true })
  receiptIncludeCustomerInfo!: boolean;

  @Column({ default: true })
  receiptIncludeTaxDetails!: boolean;

                       
  @Column({ default: 'light' })
  theme!: string;

  @Column({ default: 'en' })
  language!: string;

  @Column({ type: 'int', default: 30 })
  autoLogoutMinutes!: number;

  @Column({ default: true })
  enableNotifications!: boolean;

  @Column({ default: true })
  enableSounds!: boolean;

  @Column({ default: true })
  enableAutomaticUpdates!: boolean;

  @Column({ default: true })
  enableOfflineMode!: boolean;

  @Column({ type: 'datetime', nullable: true })
  lastRateUpdate!: Date | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(() => User, (user) => user.settings)
  users?: User[];
}
