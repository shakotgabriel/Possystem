import { IsString, IsNotEmpty, MinLength, IsAlphanumeric } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  @IsAlphanumeric()
  username: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
