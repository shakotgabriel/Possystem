import { IsString, IsNotEmpty, MinLength, IsEnum, IsOptional, IsAlphanumeric, MaxLength } from 'class-validator';
import { Role } from '../../database/enums';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @IsAlphanumeric()
  @MaxLength(20)
  username: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsEnum(Role)
  @IsOptional()
  role?: Role;
}

