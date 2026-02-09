import {
  IsOptional,
  IsString,
  IsNumber,
  IsBoolean,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SaleStatus, PaymentMethod } from '../../database/enums';

export enum SaleSortBy {
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
  TOTAL_AMOUNT = 'totalAmount',
  PAID_AMOUNT = 'paidAmount',
  PAID_AT = 'paidAt',
}

export class SaleQueryDto {
  @IsOptional()
  @IsString()
  customerId?: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  productId?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  minTotalAmount?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  maxTotalAmount?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  minPaidAmount?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  maxPaidAmount?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  minChange?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  maxChange?: number;

  @IsOptional()
  @IsEnum(SaleStatus)
  status?: SaleStatus;

  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @IsOptional()
  @IsString()
  paymentReference?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsDateString()
  paidAfter?: string;

  @IsOptional()
  @IsDateString()
  paidBefore?: string;

  @IsOptional()
  @IsEnum(SaleSortBy)
  sortBy: SaleSortBy = SaleSortBy.CREATED_AT;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  sortDescending: boolean = false;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page: number = 1;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit: number = 20;
}
