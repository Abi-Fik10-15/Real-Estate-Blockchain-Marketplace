import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { resolveUserId } from '../common/utils/resolve-user-id';
import type { UserDocument } from './schemas/user.schema';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'List all users (admin)' })
  findAll() {
    return this.usersService.findAll();
  }

  @Patch(':id/status')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Suspend or reactivate a user account (admin)' })
  @ApiParam({ name: 'id', description: 'User id' })
  setStatus(
    @Param('id') id: string,
    @Body('status') status: 'active' | 'suspended',
  ) {
    return this.usersService.setStatus(id, status);
  }

  @Get('agents')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'List active agents (authenticated users only)' })
  findAgents() {
    return this.usersService.findAgents();
  }

  @Get('saved')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Get saved property IDs for current user' })
  getSaved(@CurrentUser() user: UserDocument) {
    return this.usersService.getSavedPropertyIds(resolveUserId(user));
  }

  @Post('saved/:propertyId')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Save a property to favorites' })
  @ApiParam({ name: 'propertyId', description: 'MongoDB property id' })
  saveProperty(
    @CurrentUser() user: UserDocument,
    @Param('propertyId') propertyId: string,
  ) {
    return this.usersService.saveProperty(resolveUserId(user), propertyId);
  }

  @Delete('saved/:propertyId')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Remove a property from favorites' })
  @ApiParam({ name: 'propertyId', description: 'MongoDB property id' })
  unsaveProperty(
    @CurrentUser() user: UserDocument,
    @Param('propertyId') propertyId: string,
  ) {
    return this.usersService.unsaveProperty(resolveUserId(user), propertyId);
  }
}
