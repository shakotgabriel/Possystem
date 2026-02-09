import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('stock_entries')
@Index(['createdAt'])
export class StockEntry {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('int')
  quantity!: number;

  @CreateDateColumn()
  createdAt!: Date;
}
