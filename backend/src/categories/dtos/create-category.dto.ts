import { IsString, IsNotEmpty, MaxLength, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty({ message: 'Category name is required' })
  @MaxLength(255, { message: 'Category name must be less than 255 characters' })
  @Transform(({ value }) => value?.trim())
  name: string;
  
}