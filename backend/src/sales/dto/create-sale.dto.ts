import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class SaleItemDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsNumber()
  @Min(0)
  unitPrice: number;

  @IsNumber()
  @Min(0)
  totalPrice: number;
}

export class CreateSaleDto {
  @IsArray()
  @IsNotEmpty()
  items: SaleItemDto[];

  @IsOptional()
  @IsString()
  customerId?: string;

  @IsNumber()
  @Min(0)
  totalAmount: number;

  @IsNumber()
  @Min(0)
  paidAmount: number;

  @IsNumber()
  @Min(0)
  change: number;

  @IsOptional()
  @IsString()
  paymentReference?: string;
}
