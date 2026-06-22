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
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto, UpdateTransactionDto } from './dto/transaction.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import type { UserDocument } from '../users/schemas/user.schema';

@ApiTags('transactions')
@ApiBearerAuth('JWT')
@Controller('transactions')
@UseGuards(AuthGuard('jwt'))
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'List all transactions (admin)' })
  findAll(
    @Query('limit') limit?: string,
    @Query('page') page?: string,
  ) {
    const take = Math.min(Number(limit) || 100, 200);
    const skip = (Math.max(Number(page) || 1, 1) - 1) * take;
    return this.transactionsService.findAll(take, skip);
  }

  @Get('mine')
  @ApiOperation({ summary: 'List transactions for current user' })
  findMine(@CurrentUser() user: UserDocument) {
    return this.transactionsService.findByUser(user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Start a sale or rental transaction' })
  create(@CurrentUser() user: UserDocument, @Body() dto: CreateTransactionDto) {
    return this.transactionsService.create(user, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update transaction metadata (participant only)' })
  @ApiParam({ name: 'id', description: 'Transaction id' })
  update(
    @Param('id') id: string,
    @CurrentUser() user: UserDocument,
    @Body() dto: UpdateTransactionDto,
  ) {
    return this.transactionsService.update(id, dto, user.id);
  }

  @Post(':id/escrow')
  @ApiOperation({ summary: 'Record escrow deposit tx hash (buyer only)' })
  @ApiParam({ name: 'id', description: 'Transaction id' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['txHash'],
      properties: { txHash: { type: 'string', example: '0xabc...' } },
    },
  })
  markEscrow(
    @Param('id') id: string,
    @CurrentUser() user: UserDocument,
    @Body('txHash') txHash: string,
  ) {
    return this.transactionsService.markEscrow(id, txHash, user.id);
  }

  @Post(':id/confirm')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin')
  @ApiOperation({ summary: 'Confirm on-chain sale completion' })
  @ApiParam({ name: 'id', description: 'Transaction id' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['confirmTxHash'],
      properties: { confirmTxHash: { type: 'string', example: '0xdef...' } },
    },
  })
  confirmSale(
    @Param('id') id: string,
    @CurrentUser() user: UserDocument,
    @Body('confirmTxHash') confirmTxHash: string,
  ) {
    return this.transactionsService.confirmSale(id, user, confirmTxHash);
  }
}
