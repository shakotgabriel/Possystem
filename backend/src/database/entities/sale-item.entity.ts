import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Product } from './product.entity';
import { Sale } from './sale.entity';

@Entity('sale_items')
@Index(['saleId', 'productId'])
export class SaleItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  saleId!: string;

  @Column()
  productId!: string;

  @Column('int')
  quantity!: number;

  @Column('float')
  unitPrice!: number;

  @Column('float')
  totalPrice!: number;

  @ManyToOne(() => Product, (product) => product.saleItems, { eager: false })
  @JoinColumn({ name: 'productId' })
  product?: Product;

  @ManyToOne(() => Sale, (sale) => sale.saleItems, {
    onDelete: 'CASCADE',
    eager: false,
  })
  @JoinColumn({ name: 'saleId' })
  sale?: Sale;
}
