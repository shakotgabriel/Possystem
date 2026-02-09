import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PaymentMethod, SaleStatus } from '../enums';
import { Customer } from './customer.entity';
import { SaleItem } from './sale-item.entity';
import { User } from './user.entity';

@Entity('sales')
@Index(['customerId'])
@Index(['userId'])
@Index(['createdAt'])
export class Sale {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text', nullable: true })
  customerId!: string | null;

  @Column()
  userId!: string;

  @Column('float')
  totalAmount!: number;

  @Column('float')
  paidAmount!: number;

  @Column('float')
  change!: number;

  @Column({
    type: 'simple-enum',
    enum: SaleStatus,
    default: SaleStatus.COMPLETED,
  })
  status!: SaleStatus;

  @Column({
    type: 'simple-enum',
    enum: PaymentMethod,
    default: PaymentMethod.CASH,
  })
  paymentMethod!: PaymentMethod;

  @Column({ type: 'text', nullable: true })
  paymentReference!: string | null;

  @Column({ type: 'datetime' })
  paidAt!: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne(() => Customer, (customer) => customer.sales, {
    nullable: true,
    eager: false,
  })
  @JoinColumn({ name: 'customerId' })
  customer?: Customer | null;

  @ManyToOne(() => User, (user) => user.sales, { eager: false })
  @JoinColumn({ name: 'userId' })
  cashier?: User;

  @OneToMany(() => SaleItem, (saleItem) => saleItem.sale, {
    cascade: true,
  })
  saleItems?: SaleItem[];
}
