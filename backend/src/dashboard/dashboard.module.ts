import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import {
  Category,
  Customer,
  Product,
  Sale,
  SaleItem,
} from '../database/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([Sale, SaleItem, Product, Customer, Category]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
