import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

export class SubmitKycDto {
  @ApiProperty({ example: 'Jane Doe' })
  @IsString()
  @MinLength(2)
  legalName!: string;

  @ApiProperty({ example: '1990-05-15' })
  @IsString()
  dateOfBirth!: string;

  @ApiProperty({ example: '123 Main St, Austin, TX 78701' })
  @IsString()
  @MinLength(5)
  address!: string;

  @ApiProperty({ enum: ['passport', 'drivers_license', 'national_id'] })
  @IsEnum(['passport', 'drivers_license', 'national_id'])
  idType!: 'passport' | 'drivers_license' | 'national_id';
}

export class ReviewKycDto {
  @ApiProperty({ enum: ['approved', 'rejected'] })
  @IsEnum(['approved', 'rejected'])
  decision!: 'approved' | 'rejected';

  @ApiPropertyOptional({ description: 'Notes shown to the user when rejected' })
  @IsOptional()
  @IsString()
  reviewNotes?: string;
}
