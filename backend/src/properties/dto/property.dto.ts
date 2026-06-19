import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
  ArrayMinSize,
  ArrayMaxSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { PropertyStatus } from '../schemas/property.schema';

export class LocationDto {
  @ApiProperty({ description: 'Street address' })
  @IsString()
  address!: string;

  @ApiProperty({ description: 'City name' })
  @IsString()
  city!: string;

  @ApiProperty({ description: 'Country name' })
  @IsString()
  country!: string;

  @ApiProperty({ description: 'Latitude coordinate' })
  @IsNumber()
  lat!: number;

  @ApiProperty({ description: 'Longitude coordinate' })
  @IsNumber()
  lng!: number;
}

export class CreatePropertyDto {
  @ApiProperty({ description: 'Title of the property' })
  @IsString()
  title!: string;

  @ApiProperty({ description: 'Detailed description of the property' })
  @IsString()
  description!: string;

  @ApiProperty({ description: 'Property price in USD' })
  @IsNumber()
  @Min(0)
  price!: number;

  @ApiPropertyOptional({ enum: ['ETH', 'USD'], default: 'ETH' })
  @IsOptional()
  @IsEnum(['ETH', 'USD'])
  currency?: 'ETH' | 'USD';

  @ApiPropertyOptional({ enum: ['draft', 'pending', 'active', 'sold', 'rented'], default: 'pending' })
  @IsOptional()
  @IsEnum(['draft', 'pending', 'active', 'sold', 'rented'])
  status?: PropertyStatus;

  @ApiPropertyOptional({ description: 'Type of property', default: 'House' })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiProperty({ enum: ['sale', 'rent'], description: 'Listing type (sale or rent)' })
  @IsEnum(['sale', 'rent'])
  listingType!: 'sale' | 'rent';

  @ApiProperty({ type: LocationDto })
  @ValidateNested()
  @Type(() => LocationDto)
  location!: LocationDto;

  @ApiPropertyOptional({ description: 'Number of bedrooms', default: 0 })
  @IsOptional()
  @IsNumber()
  bedrooms?: number;

  @ApiPropertyOptional({ description: 'Number of bathrooms', default: 0 })
  @IsOptional()
  @IsNumber()
  bathrooms?: number;

  @ApiPropertyOptional({ description: 'Area in square feet', default: 0 })
  @IsOptional()
  @IsNumber()
  area?: number;

  @ApiPropertyOptional({ description: 'Price in Sepolia ETH', default: 0.01 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  priceEth?: number;

  @ApiProperty({ type: [String], description: 'List of image URLs' })
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1, { message: 'At least one image is required' })
  @ArrayMaxSize(10, { message: 'Maximum of 10 images' })
  images!: string[];

  @ApiPropertyOptional({ type: [String], description: 'List of Cloudinary public IDs matching the images' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imagePublicIds?: string[];

  @ApiPropertyOptional({ type: [String], description: 'List of document URLs', default: [] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  documents?: string[];

  @ApiPropertyOptional({ description: 'Owner wallet address' })
  @IsOptional()
  @IsString()
  ownerWallet?: string;
}

export class UpdatePropertyDto {
  @ApiPropertyOptional({ description: 'Title of the property' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'Detailed description of the property' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Property price in USD' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({ enum: ['ETH', 'USD'] })
  @IsOptional()
  @IsEnum(['ETH', 'USD'])
  currency?: 'ETH' | 'USD';

  @ApiPropertyOptional({ enum: ['draft', 'pending', 'active', 'sold', 'rented'] })
  @IsOptional()
  @IsEnum(['draft', 'pending', 'active', 'sold', 'rented'])
  status?: PropertyStatus;

  @ApiPropertyOptional({ description: 'Type of property' })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({ enum: ['sale', 'rent'] })
  @IsOptional()
  @IsEnum(['sale', 'rent'])
  listingType?: 'sale' | 'rent';

  @ApiPropertyOptional({ type: LocationDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocationDto)
  location?: LocationDto;

  @ApiPropertyOptional({ description: 'Number of bedrooms' })
  @IsOptional()
  @IsNumber()
  bedrooms?: number;

  @ApiPropertyOptional({ description: 'Number of bathrooms' })
  @IsOptional()
  @IsNumber()
  bathrooms?: number;

  @ApiPropertyOptional({ description: 'Area in square feet' })
  @IsOptional()
  @IsNumber()
  area?: number;

  @ApiPropertyOptional({ description: 'Price in Sepolia ETH' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  priceEth?: number;

  @ApiPropertyOptional({ type: [String], description: 'List of image URLs' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiPropertyOptional({ type: [String], description: 'List of Cloudinary public IDs' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imagePublicIds?: string[];

  @ApiPropertyOptional({ description: 'Agent user ID' })
  @IsOptional()
  @IsString()
  agentId?: string;

  @ApiPropertyOptional({ description: 'Agent wallet address' })
  @IsOptional()
  @IsString()
  agentWallet?: string;

  @ApiPropertyOptional({ description: 'Owner wallet address' })
  @IsOptional()
  @IsString()
  ownerWallet?: string;

  @ApiPropertyOptional({ description: 'Blockchain Token ID' })
  @IsOptional()
  @IsString()
  blockchainTokenId?: string;
}

export class PropertyQueryDto {
  @ApiPropertyOptional({ description: 'Search query' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Property type filter' })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({ description: 'Minimum price filter' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minPrice?: number;

  @ApiPropertyOptional({ description: 'Maximum price filter' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxPrice?: number;

  @ApiPropertyOptional({ description: 'Minimum bedrooms' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  bedrooms?: number;

  @ApiPropertyOptional({ description: 'Minimum bathrooms' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  bathrooms?: number;

  @ApiPropertyOptional({ description: 'Location search filter' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ description: 'Status filter' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'Listing type filter (sale or rent)' })
  @IsOptional()
  @IsString()
  listingType?: string;

  @ApiPropertyOptional({ enum: ['newest', 'price_asc', 'price_desc', 'area_desc'] })
  @IsOptional()
  @IsEnum(['newest', 'price_asc', 'price_desc', 'area_desc'])
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'area_desc';

  @ApiPropertyOptional({ description: 'Owner ID filter' })
  @IsOptional()
  @IsString()
  ownerId?: string;

  @ApiPropertyOptional({ description: 'Agent ID filter' })
  @IsOptional()
  @IsString()
  agentId?: string;
}
