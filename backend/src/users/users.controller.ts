import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { UserDocument } from './schemas/user.schema';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  findAll() {
    return this.usersService.findAll();
  }

  @Get('agents')
  findAgents() {
    return this.usersService.findAgents();
  }

  @Get('saved')
  @UseGuards(AuthGuard('jwt'))
  getSaved(@CurrentUser() user: UserDocument) {
    return this.usersService.getSavedPropertyIds(user.id);
  }

  @Post('saved/:propertyId')
  @UseGuards(AuthGuard('jwt'))
  saveProperty(
    @CurrentUser() user: UserDocument,
    @Param('propertyId') propertyId: string,
  ) {
    return this.usersService.saveProperty(user.id, propertyId);
  }

  @Delete('saved/:propertyId')
  @UseGuards(AuthGuard('jwt'))
  unsaveProperty(
    @CurrentUser() user: UserDocument,
    @Param('propertyId') propertyId: string,
  ) {
    return this.usersService.unsaveProperty(user.id, propertyId);
  }
}
