import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type TransactionType = 'sale' | 'rental';
export type TransactionStatus = 'initiated' | 'escrow' | 'completed' | 'cancelled';

@Schema({ timestamps: true, collection: 'transactions' })
export class Transaction {
  @Prop({ type: Types.ObjectId, ref: 'Property', required: true, index: true })
  propertyId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  buyerId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  sellerId!: Types.ObjectId;

  @Prop({ required: true, enum: ['sale', 'rental'] })
  type!: TransactionType;

  @Prop({ required: true, min: 0 })
  amount!: number;

  @Prop({
    enum: ['initiated', 'escrow', 'completed', 'cancelled'],
    default: 'initiated',
    index: true,
  })
  status!: TransactionStatus;

  @Prop({ default: '' })
  contractAddress!: string;

  @Prop({ default: '' })
  txHash!: string;

  @Prop({ default: '' })
  blockchainTokenId!: string;
}

export type TransactionDocument = HydratedDocument<Transaction>;
export const TransactionSchema = SchemaFactory.createForClass(Transaction);

TransactionSchema.set('toJSON', {
  virtuals: true,
  transform(_doc, ret) {
    const obj = ret as unknown as Record<string, unknown>;
    obj.id = String(obj._id);
    if (obj.propertyId) obj.propertyId = String(obj.propertyId);
    if (obj.buyerId) obj.buyerId = String(obj.buyerId);
    if (obj.sellerId) obj.sellerId = String(obj.sellerId);
    delete obj._id;
    delete obj.__v;
    return obj;
  },
});
