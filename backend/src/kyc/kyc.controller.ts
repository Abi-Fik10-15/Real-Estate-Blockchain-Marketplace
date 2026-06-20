import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { KycService } from './kyc.service';
import { SubmitKycDto, ReviewKycDto } from './dto/kyc.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import type { UserDocument } from '../users/schemas/user.schema';

@ApiTags('kyc')
@ApiBearerAuth('JWT')
@Controller('kyc')
@UseGuards(AuthGuard('jwt'))
export class KycController {
  constructor(private readonly kycService: KycService) {}

  @Get('mine')
  @ApiOperation({ summary: 'Get current user KYC submission' })
  findMine(@CurrentUser() user: UserDocument) {
    return this.kycService.findMine(user.id);
  }

  @Get('stats')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'KYC queue statistics (admin)' })
  async stats() {
    const pending = await this.kycService.getPendingCount();
    return { pending };
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'List KYC submissions (admin)' })
  @ApiQuery({ name: 'status', required: false, enum: ['all', 'submitted', 'approved', 'rejected'] })
  findAll(@Query('status') status?: string) {
    return this.kycService.findAllForAdmin(status);
  }

  @Post('submit')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'idDocument', maxCount: 1 },
      { name: 'selfie', maxCount: 1 },
      { name: 'addressProof', maxCount: 1 },
      { name: 'brokerLicense', maxCount: 1 },
    ]),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['legalName', 'dateOfBirth', 'address', 'idType', 'idDocument', 'selfie', 'addressProof'],
      properties: {
        legalName: { type: 'string' },
        dateOfBirth: { type: 'string' },
        address: { type: 'string' },
        idType: { type: 'string', enum: ['passport', 'drivers_license', 'national_id'] },
        idDocument: { type: 'string', format: 'binary' },
        selfie: { type: 'string', format: 'binary' },
        addressProof: { type: 'string', format: 'binary' },
        brokerLicense: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiOperation({ summary: 'Submit KYC documents for review' })
  submit(
    @CurrentUser() user: UserDocument,
    @Body() dto: SubmitKycDto,
    @UploadedFiles()
    files: {
      idDocument?: Express.Multer.File[];
      selfie?: Express.Multer.File[];
      addressProof?: Express.Multer.File[];
      brokerLicense?: Express.Multer.File[];
    },
  ) {
    if (!files) {
      throw new BadRequestException('Document uploads are required');
    }
    return this.kycService.submit(user, dto, files);
  }

  @Patch(':id/review')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Approve or reject a KYC submission (admin)' })
  review(
    @Param('id') id: string,
    @CurrentUser() admin: UserDocument,
    @Body() dto: ReviewKycDto,
  ) {
    return this.kycService.review(id, admin, dto);
  }
}
