import { IsString, IsOptional, Length } from 'class-validator';

export class CreateCustomerDto {
  @IsString()
  @Length(2, 100, { message: 'Name must be between 2 and 100 characters' })
  name: string;

  @IsOptional()
  @IsString()
  @Length(3, 30, { message: 'Phone must be between 3 and 30 characters' })
  phone?: string;
}
