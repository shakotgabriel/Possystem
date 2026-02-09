import {
  IsString,
  IsNotEmpty,
  MinLength,
  IsAlphanumeric,
  MaxLength,
  IsNumber,
  Min,
} from 'class-validator';

export class InitializeSetupDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  @IsAlphanumeric()
  @MaxLength(20)
  username!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsNumber()
  @Min(0.0000001)
  initialRate!: number;
}
