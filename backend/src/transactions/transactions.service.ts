import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Transaction, TransactionDocument } from './schemas/transaction.schema';
import { CreateTransactionDto, UpdateTransactionDto } from './dto/transaction.dto';
import { PropertiesService } from '../properties/properties.service';
import { BlockchainService } from '../blockchain/blockchain.service';
import type { UserDocument } from '../users/schemas/user.schema';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectModel(Transaction.name)
    private readonly transactionModel: Model<TransactionDocument>,
    private readonly propertiesService: PropertiesService,
    private readonly blockchainService: BlockchainService,
    private readonly notifications: NotificationsService,
  ) {}

  findAll(): Promise<TransactionDocument[]> {
    return this.transactionModel.find().sort({ createdAt: -1 }).exec();
  }

  findByUser(userId: string): Promise<TransactionDocument[]> {
    const oid = new Types.ObjectId(userId);
    return this.transactionModel
      .find({ $or: [{ buyerId: oid }, { sellerId: oid }] })
      .sort({ createdAt: -1 })
      .exec();
  }

  async create(
    buyer: UserDocument,
    dto: CreateTransactionDto,
  ): Promise<TransactionDocument> {
    const property = await this.propertiesService.findById(dto.propertyId);

    const tx = await this.transactionModel.create({
      propertyId: property._id,
      buyerId: buyer._id,
      sellerId: property.ownerId,
      type: dto.type,
      amount: dto.amount,
      status: 'initiated',
      blockchainTokenId: dto.blockchainTokenId ?? property.blockchainTokenId,
      contractAddress: this.blockchainService.getContractAddress(),
    });

    return tx;
  }

  async markEscrow(id: string, txHash: string): Promise<TransactionDocument> {
    const tx = await this.transactionModel
      .findByIdAndUpdate(id, { status: 'escrow', txHash }, { new: true })
      .exec();

    if (!tx) {
      throw new NotFoundException('Transaction not found');
    }

    this.notifications.emitEscrowDeposited(
      tx.buyerId.toString(),
      tx.sellerId.toString(),
      tx.id,
      tx.amount,
    );

    return tx;
  }

  async confirmSale(id: string): Promise<TransactionDocument> {
    const tx = await this.transactionModel.findById(id).exec();
    if (!tx) {
      throw new NotFoundException('Transaction not found');
    }

    if (!tx.blockchainTokenId) {
      throw new BadRequestException('Property has no blockchain token ID');
    }

    const result = await this.blockchainService.confirmSale(tx.blockchainTokenId);

    tx.status = 'completed';
    tx.txHash = result.txHash;
    await tx.save();

    await this.propertiesService.updateStatus(tx.propertyId.toString(), 'sold');

    this.notifications.emitTransactionCompleted(
      tx.buyerId.toString(),
      tx.sellerId.toString(),
      tx.id,
    );

    return tx;
  }

  async update(id: string, dto: UpdateTransactionDto): Promise<TransactionDocument> {
    const tx = await this.transactionModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();

    if (!tx) {
      throw new NotFoundException('Transaction not found');
    }
    return tx;
  }
}
