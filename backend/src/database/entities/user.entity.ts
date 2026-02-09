import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from '../enums';
import { Sale } from './sale.entity';
import { StockAdjustment } from './stock-adjustment.entity';
import { StockCount } from './stock-count.entity';
import { Settings } from './settings.entity';

@Entity('users')
@Index(['role'])
@Index(['username'], { unique: true })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column()
  username!: string;

  @Column()
  password!: string;

  @Column({ type: 'simple-enum', enum: Role, default: Role.CASHIER })
  role!: Role;

  @Column({ type: 'text', nullable: true })
  settingsId!: string | null;

  @ManyToOne(() => Settings, (settings) => settings.users, {
    nullable: true,
  })
  @JoinColumn({ name: 'settingsId' })
  settings?: Settings | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(() => Sale, (sale) => sale.cashier)
  sales?: Sale[];

  @OneToMany(() => StockAdjustment, (adjustment) => adjustment.user)
  stockAdjustments?: StockAdjustment[];

  @OneToMany(() => StockCount, (count) => count.user)
  stockCounts?: StockCount[];
}
