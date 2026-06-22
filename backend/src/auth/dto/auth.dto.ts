import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import type { UserRole } from '../../users/schemas/user.schema';

export class RegisterDto {
  @IsString()
  name!: string;

  @IsEmail()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsEnum(['buyer', 'owner', 'agent'])
  role!: UserRole;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  walletAddress?: string;
}

export class LoginDto {
  @IsEmail()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  email!: string;

  @IsString()
  password!: string;
}

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  walletAddress?: string;

  @IsOptional()
  @IsString()
  avatar?: string;
}
