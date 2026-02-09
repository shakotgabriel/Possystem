import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Product } from './product.entity';
import { User } from './user.entity';

@Entity('stock_adjustments')
@Index(['productId'])
@Index(['userId'])
export class StockAdjustment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  productId!: string;

  @Column('int')
  quantity!: number;

  @Column()
  reason!: string;

  @Column()
  userId!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @ManyToOne(() => Product, (product) => product.stockAdjustments, {
    eager: false,
  })
  @JoinColumn({ name: 'productId' })
  product?: Product;

  @ManyToOne(() => User, (user) => user.stockAdjustments, { eager: false })
  @JoinColumn({ name: 'userId' })
  user?: User;
}
