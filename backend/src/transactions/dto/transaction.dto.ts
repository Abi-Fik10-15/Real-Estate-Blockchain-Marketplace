import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import type { TransactionStatus, TransactionType } from '../schemas/transaction.schema';

export class CreateTransactionDto {
  @IsString()
  propertyId!: string;

  @IsEnum(['sale', 'rental'])
  type!: TransactionType;

  @IsNumber()
  @Min(0)
  amount!: number;

  @IsOptional()
  @IsString()
  blockchainTokenId?: string;
}

export class UpdateTransactionDto {
  @IsOptional()
  @IsEnum(['initiated', 'escrow', 'completed', 'cancelled'])
  status?: TransactionStatus;

  @IsOptional()
  @IsString()
  txHash?: string;

  @IsOptional()
  @IsString()
  contractAddress?: string;
}
