import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Delete,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PropertiesService } from './properties.service';
import { CloudinaryService } from './cloudinary.service';
import {
  CreatePropertyDto,
  PropertyQueryDto,
  UpdatePropertyDto,
} from './dto/property.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import type { UserDocument } from '../users/schemas/user.schema';
import { NotificationsService } from '../notifications/notifications.service';

@ApiTags('properties')
@Controller('properties')
export class PropertiesController {
  constructor(
    private readonly propertiesService: PropertiesService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly notifications: NotificationsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all properties with optional filters' })
  @ApiResponse({ status: 200, description: 'Return all filtered properties' })
  findAll(@Query() query: PropertyQueryDto) {
    return this.propertiesService.findAll(query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get properties dashboard statistics' })
  @ApiResponse({ status: 200, description: 'Return property statistics' })
  getStats() {
    return this.propertiesService.getStats();
  }

  @Get('ownership-records')
  @ApiOperation({ summary: 'Get list of property ownership records (including on-chain info)' })
  @ApiResponse({ status: 200, description: 'Return ownership records' })
  getOwnershipRecords() {
    return this.propertiesService.getOwnershipRecords();
  }

  @Get('owner/:ownerId')
  @ApiOperation({ summary: 'Get properties owned by a specific user' })
  @ApiResponse({ status: 200, description: 'Return owner properties' })
  findByOwner(@Param('ownerId') ownerId: string) {
    return this.propertiesService.findByOwner(ownerId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get property details by database ID or Token ID' })
  @ApiResponse({ status: 200, description: 'Return property details' })
  @ApiResponse({ status: 404, description: 'Property not found' })
  findOne(@Param('id') id: string) {
    return this.propertiesService.findById(id);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('owner', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new property listing' })
  @ApiResponse({ status: 201, description: 'Property created successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 500, description: 'Server error' })
  async create(@CurrentUser() user: UserDocument, @Body() dto: CreatePropertyDto) {
    try {
      return await this.propertiesService.create(user, dto);
    } catch (error: any) {
      console.error('Property creation failed:', error);
      if (error.name === 'ValidationError') {
        throw new BadRequestException(error.message);
      }
      if (error.code === 11000) {
        throw new ConflictException('Property duplicate entry detected');
      }
      throw new InternalServerErrorException(error.message || 'Failed to create property');
    }
  }

  @Post('upload')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('owner', 'admin')
  @UseInterceptors(FileInterceptor('file'))
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiOperation({ summary: 'Upload an image' })
  @ApiResponse({ status: 201, description: 'Image uploaded successfully' })
  @ApiResponse({ status: 400, description: 'File validation failed' })
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Only JPG, PNG, and WEBP images are allowed');
    }
    try {
      return await this.cloudinaryService.uploadFile(file);
    } catch (error) {
      console.error('Image upload failed:', error);
      throw new InternalServerErrorException('Image upload failed');
    }
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('owner', 'agent', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a property by patch' })
  @ApiResponse({ status: 200, description: 'Property updated' })
  update(
    @Param('id') id: string,
    @CurrentUser() user: UserDocument,
    @Body() dto: UpdatePropertyDto,
  ) {
    return this.propertiesService.update(id, user, dto);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('owner', 'agent', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a property by put' })
  @ApiResponse({ status: 200, description: 'Property updated' })
  putUpdate(
    @Param('id') id: string,
    @CurrentUser() user: UserDocument,
    @Body() dto: UpdatePropertyDto,
  ) {
    return this.propertiesService.update(id, user, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('owner', 'admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a property listing' })
  @ApiResponse({ status: 244, description: 'Property deleted' })
  async delete(@Param('id') id: string, @CurrentUser() user: UserDocument) {
    await this.propertiesService.delete(id, user);
  }

  @Patch(':id/approve')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve property listing' })
  @ApiResponse({ status: 200, description: 'Property approved' })
  async approve(@Param('id') id: string) {
    const property = await this.propertiesService.approve(id);
    this.notifications.emitPropertyVerified(
      property.ownerId.toString(),
      property.id,
      property.title,
    );
    return property;
  }
}
