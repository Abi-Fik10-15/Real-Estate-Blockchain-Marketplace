import { IsEnum, IsOptional, IsString } from 'class-validator';
import type { InquiryType, InquiryStatus } from '../schemas/inquiry.schema';

export class CreateInquiryDto {
  @IsString()
  propertyId!: string;

  @IsEnum(['purchase', 'rental', 'question'])
  type!: InquiryType;

  @IsString()
  message!: string;
}

export class UpdateInquiryDto {
  @IsOptional()
  @IsEnum(['new', 'in_progress', 'closed'])
  status?: InquiryStatus;
}
