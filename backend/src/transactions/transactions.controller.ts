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
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto, UpdateTransactionDto } from './dto/transaction.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import type { UserDocument } from '../users/schemas/user.schema';

@Controller('transactions')
@UseGuards(AuthGuard('jwt'))
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles('admin')
  findAll() {
    return this.transactionsService.findAll();
  }

  @Get('mine')
  findMine(@CurrentUser() user: UserDocument) {
    return this.transactionsService.findByUser(user.id);
  }

  @Post()
  create(@CurrentUser() user: UserDocument, @Body() dto: CreateTransactionDto) {
    return this.transactionsService.create(user, dto);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('admin', 'owner')
  update(@Param('id') id: string, @Body() dto: UpdateTransactionDto) {
    return this.transactionsService.update(id, dto);
  }

  @Post(':id/escrow')
  markEscrow(@Param('id') id: string, @Body('txHash') txHash: string) {
    return this.transactionsService.markEscrow(id, txHash);
  }

  @Post(':id/confirm')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin')
  confirmSale(
    @Param('id') id: string,
    @CurrentUser() user: UserDocument,
    @Body('confirmTxHash') confirmTxHash: string,
  ) {
    return this.transactionsService.confirmSale(id, user, confirmTxHash);
  }
}
