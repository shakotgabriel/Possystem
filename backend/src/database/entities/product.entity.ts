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
import { Category } from './category.entity';
import { SaleItem } from './sale-item.entity';
import { StockAdjustment } from './stock-adjustment.entity';
import { StockCount } from './stock-count.entity';

@Entity('products')
@Index(['categoryId'])
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column('float')
  price!: number;

  @Column('float')
  costPrice!: number;

  @Column('int')
  stock!: number;

  @Column('int', { default: 5 })
  minStock!: number;

  @Column()
  categoryId!: string;

  @ManyToOne(() => Category, (category) => category.products, {
    eager: false,
  })
  @JoinColumn({ name: 'categoryId' })
  category?: Category;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(() => SaleItem, (saleItem) => saleItem.product)
  saleItems?: SaleItem[];

  @OneToMany(() => StockAdjustment, (adjustment) => adjustment.product)
  stockAdjustments?: StockAdjustment[];

  @OneToMany(() => StockCount, (count) => count.product)
  stockCounts?: StockCount[];
}
