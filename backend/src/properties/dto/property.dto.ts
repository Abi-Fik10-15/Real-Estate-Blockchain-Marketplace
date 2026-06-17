import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import type { PropertyStatus } from '../schemas/property.schema';

class LocationDto {
  @IsString()
  address!: string;

  @IsString()
  city!: string;

  @IsString()
  country!: string;

  @IsNumber()
  lat!: number;

  @IsNumber()
  lng!: number;
}

export class CreatePropertyDto {
  @IsString()
  title!: string;

  @IsString()
  description!: string;

  @IsNumber()
  @Min(0)
  price!: number;

  @IsOptional()
  @IsEnum(['ETH', 'USD'])
  currency?: 'ETH' | 'USD';

  @IsOptional()
  @IsEnum(['draft', 'pending', 'active', 'sold', 'rented'])
  status?: PropertyStatus;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsEnum(['sale', 'rent'])
  listingType?: 'sale' | 'rent';

  @ValidateNested()
  @Type(() => LocationDto)
  location!: LocationDto;

  @IsOptional()
  @IsNumber()
  bedrooms?: number;

  @IsOptional()
  @IsNumber()
  bathrooms?: number;

  @IsOptional()
  @IsNumber()
  area?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  priceEth?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  documents?: string[];

  @IsOptional()
  @IsString()
  ownerWallet?: string;
}

export class UpdatePropertyDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsEnum(['ETH', 'USD'])
  currency?: 'ETH' | 'USD';

  @IsOptional()
  @IsEnum(['draft', 'pending', 'active', 'sold', 'rented'])
  status?: PropertyStatus;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsEnum(['sale', 'rent'])
  listingType?: 'sale' | 'rent';

  @IsOptional()
  @ValidateNested()
  @Type(() => LocationDto)
  location?: LocationDto;

  @IsOptional()
  @IsNumber()
  bedrooms?: number;

  @IsOptional()
  @IsNumber()
  bathrooms?: number;

  @IsOptional()
  @IsNumber()
  area?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  priceEth?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsString()
  agentId?: string;

  @IsOptional()
  @IsString()
  agentWallet?: string;

  @IsOptional()
  @IsString()
  ownerWallet?: string;

  @IsOptional()
  @IsString()
  blockchainTokenId?: string;
}

export class PropertyQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  bedrooms?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  bathrooms?: number;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  listingType?: string;

  @IsOptional()
  @IsEnum(['newest', 'price_asc', 'price_desc', 'area_desc'])
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'area_desc';

  @IsOptional()
  @IsString()
  ownerId?: string;

  @IsOptional()
  @IsString()
  agentId?: string;
}
