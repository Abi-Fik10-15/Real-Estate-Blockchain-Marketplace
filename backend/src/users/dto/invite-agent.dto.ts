import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class InviteAgentDto {
  @ApiProperty({ example: 'agent@example.com' })
  @IsEmail()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  email!: string;

  @ApiPropertyOptional({ description: 'Optional note included in the invitation email' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  message?: string;
}
