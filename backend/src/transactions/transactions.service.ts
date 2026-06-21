import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Transaction, TransactionDocument } from './schemas/transaction.schema';
import { CreateTransactionDto, UpdateTransactionDto } from './dto/transaction.dto';
import { PropertiesService } from '../properties/properties.service';
import { BlockchainService } from '../blockchain/blockchain.service';
import { UsersService } from '../users/users.service';
import type { UserDocument } from '../users/schemas/user.schema';
import { NotificationsService } from '../notifications/notifications.service';
import { InquiriesService } from '../inquiries/inquiries.service';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectModel(Transaction.name)
    private readonly transactionModel: Model<TransactionDocument>,
    private readonly propertiesService: PropertiesService,
    private readonly blockchainService: BlockchainService,
    private readonly usersService: UsersService,
    private readonly notifications: NotificationsService,
    private readonly inquiriesService: InquiriesService,
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

  async confirmSale(
    id: string,
    seller: UserDocument,
    confirmTxHash: string,
  ): Promise<TransactionDocument> {
    const tx = await this.transactionModel.findById(id).exec();
    if (!tx) {
      throw new NotFoundException('Transaction not found');
    }

    if (tx.sellerId.toString() !== seller.id) {
      throw new ForbiddenException('Only the seller can confirm this sale');
    }

    if (tx.status !== 'escrow') {
      throw new BadRequestException('Transaction is not awaiting sale confirmation');
    }

    if (!confirmTxHash) {
      throw new BadRequestException(
        'confirmTxHash required — sign confirmSale in MetaMask first',
      );
    }

    if (tx.type === 'rental') {
      tx.status = 'completed';
      tx.confirmTxHash = confirmTxHash;
      await tx.save();

      await this.propertiesService.completeRental(tx.propertyId.toString());

      await this.inquiriesService.closeForBuyerProperty(
        tx.propertyId.toString(),
        tx.buyerId.toString(),
      );

      this.notifications.emitTransactionCompleted(
        tx.buyerId.toString(),
        tx.sellerId.toString(),
        tx.id,
      );

      return tx;
    }

    // Only treat fully numeric IDs (e.g. "369189") as real Sepolia NFT tokens.
    // Placeholder IDs like "EST-F51F05" are off-chain references and must skip
    // blockchain verification, matching the same check used by the frontend.
    const isOnChainToken = /^\d+$/.test(tx.blockchainTokenId ?? '');

    if (!isOnChainToken) {
      tx.status = 'completed';
      tx.confirmTxHash = confirmTxHash;
      await tx.save();

      const buyer = await this.usersService.findById(tx.buyerId.toString());
      const buyerWallet = buyer?.walletAddress ?? '';

      if (buyerWallet) {
        await this.propertiesService.completeSale(
          tx.propertyId.toString(),
          buyerWallet,
          tx.buyerId.toString(),
        );
      } else {
        await this.propertiesService.updateStatus(tx.propertyId.toString(), 'sold');
      }

      await this.inquiriesService.closeForBuyerProperty(
        tx.propertyId.toString(),
        tx.buyerId.toString(),
      );

      this.notifications.emitTransactionCompleted(
        tx.buyerId.toString(),
        tx.sellerId.toString(),
        tx.id,
      );

      return tx;
    }

    const buyer = await this.usersService.findById(tx.buyerId.toString());
    const buyerWallet = buyer?.walletAddress ?? '';

    if (this.blockchainService.isEnabled()) {
      const verified = await this.blockchainService.verifySaleCompleted(
        tx.blockchainTokenId,
        buyerWallet,
      );
      if (!verified && buyerWallet) {
        throw new BadRequestException(
          'On-chain sale not detected — ensure confirmSale succeeded and buyer wallet matches',
        );
      }
    }

    tx.status = 'completed';
    tx.confirmTxHash = confirmTxHash;
    await tx.save();

    if (buyerWallet) {
      await this.propertiesService.completeSale(
        tx.propertyId.toString(),
        buyerWallet,
        tx.buyerId.toString(),
      );
    } else {
      await this.propertiesService.updateStatus(tx.propertyId.toString(), 'sold');
    }

    await this.inquiriesService.closeForBuyerProperty(
      tx.propertyId.toString(),
      tx.buyerId.toString(),
    );

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
