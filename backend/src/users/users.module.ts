import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { Sale, StockAdjustment, StockCount, User } from '../database/entities';

@Module({
  imports: [TypeOrmModule.forFeature([User, Sale, StockAdjustment, StockCount])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}