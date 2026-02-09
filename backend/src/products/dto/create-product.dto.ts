import { Type } from 'class-transformer';
import {
  IsDefined,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  MinLength,
} from 'class-validator';

export class CreateProductDto {
  @IsDefined({ message: 'Name is required' })
  @IsString()
  @MinLength(1, { message: 'Name is required' })
  name: string;

  @IsDefined({ message: 'Price is required' })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01, { message: 'Price must be greater than 0' })
  price: number;

  @IsDefined({ message: 'Cost price is required' })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0, { message: 'Cost price cannot be negative' })
  costPrice: number;

  @IsDefined({ message: 'Stock is required' })
  @Type(() => Number)
  @IsInt({ message: 'Stock must be an integer' })
  @Min(0, { message: 'Stock cannot be negative' })
  stock: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Minimum stock must be an integer' })
  @Min(0, { message: 'Minimum stock cannot be negative' })
  minStock: number;

  @IsDefined({ message: 'Category is required' })
  @IsUUID()
  categoryId: string;
}
