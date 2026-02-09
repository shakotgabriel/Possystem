import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalesService } from './sales.service';
import { SalesController } from './sales.controller';
import { Customer, Product, Sale, SaleItem } from '../database/entities';

@Module({
  imports: [TypeOrmModule.forFeature([Sale, SaleItem, Product, Customer])],
  controllers: [SalesController],
  providers: [SalesService],
  exports: [SalesService],
})
export class SalesModule {}