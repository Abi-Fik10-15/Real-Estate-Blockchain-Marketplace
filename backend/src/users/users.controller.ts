import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  BadRequestException,
  NotFoundException,
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
import { InviteAgentDto } from './dto/invite-agent.dto';

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

  @Get('agents/lookup')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('owner', 'admin')
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Look up an active agent by email' })
  async lookupAgent(@Query('email') email: string) {
    if (!email?.trim()) {
      throw new BadRequestException('Email is required');
    }
    const agent = await this.usersService.lookupAgentByEmail(email);
    if (!agent) {
      throw new NotFoundException('No active agent found with that email');
    }
    return agent;
  }

  @Post('agents/invite')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('owner', 'admin')
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Invite someone to register as an agent' })
  inviteAgent(
    @CurrentUser() user: UserDocument,
    @Body() dto: InviteAgentDto,
  ) {
    return this.usersService.inviteAgent(user, dto.email, dto.message);
  }

  @Get('agents')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'List active agents (authenticated users only)' })
  findAgents(@Query('verified') verified?: string) {
    return this.usersService.findAgents({
      verifiedOnly: verified === 'true',
    });
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
