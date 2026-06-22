import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { InquiriesService } from './inquiries.service';
import { CreateInquiryDto, UpdateInquiryDto } from './dto/inquiry.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import type { UserDocument } from '../users/schemas/user.schema';

@ApiTags('inquiries')
@ApiBearerAuth('JWT')
@Controller('inquiries')
@UseGuards(AuthGuard('jwt'))
export class InquiriesController {
  constructor(private readonly inquiriesService: InquiriesService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles('admin', 'owner', 'agent')
  @ApiOperation({
    summary: 'List inquiries scoped to role (admin: all, owner/agent: own listings)',
  })
  findAll(@CurrentUser() user: UserDocument) {
    return this.inquiriesService.findForUser(user);
  }

  @Get('mine')
  @ApiOperation({ summary: 'List inquiries created by current buyer' })
  findMine(@CurrentUser() user: UserDocument) {
    return this.inquiriesService.findByBuyer(user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a buyer inquiry on a property' })
  create(@CurrentUser() user: UserDocument, @Body() dto: CreateInquiryDto) {
    return this.inquiriesService.create(user, dto);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('admin', 'owner', 'agent')
  @ApiOperation({ summary: 'Update inquiry status' })
  @ApiParam({ name: 'id', description: 'Inquiry id' })
  update(@Param('id') id: string, @Body() dto: UpdateInquiryDto) {
    return this.inquiriesService.updateStatus(id, dto);
  }
}
