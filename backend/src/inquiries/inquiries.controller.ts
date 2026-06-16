import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { InquiriesService } from './inquiries.service';
import { CreateInquiryDto, UpdateInquiryDto } from './dto/inquiry.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import type { UserDocument } from '../users/schemas/user.schema';

@Controller('inquiries')
@UseGuards(AuthGuard('jwt'))
export class InquiriesController {
  constructor(private readonly inquiriesService: InquiriesService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles('admin', 'owner', 'agent')
  findAll() {
    return this.inquiriesService.findAll();
  }

  @Get('mine')
  findMine(@CurrentUser() user: UserDocument) {
    return this.inquiriesService.findByBuyer(user.id);
  }

  @Post()
  create(@CurrentUser() user: UserDocument, @Body() dto: CreateInquiryDto) {
    return this.inquiriesService.create(user, dto);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('admin', 'owner', 'agent')
  update(@Param('id') id: string, @Body() dto: UpdateInquiryDto) {
    return this.inquiriesService.updateStatus(id, dto);
  }
}
