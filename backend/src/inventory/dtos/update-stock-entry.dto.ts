import { IsNumber, IsOptional, Min } from 'class-validator';

export class UpdateStockEntryDto {
  @IsNumber()
  @Min(0, { message: 'Quantity cannot be negative' })
  @IsOptional()
  quantity?: number;
}
