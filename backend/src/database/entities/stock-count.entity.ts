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

@Entity('stock_counts')
@Index(['productId'])
@Index(['userId'])
export class StockCount {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  productId!: string;

  @Column('int')
  countedStock!: number;

  @Column()
  userId!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @ManyToOne(() => Product, (product) => product.stockCounts, { eager: false })
  @JoinColumn({ name: 'productId' })
  product?: Product;

  @ManyToOne(() => User, (user) => user.stockCounts, { eager: false })
  @JoinColumn({ name: 'userId' })
  user?: User;
}
