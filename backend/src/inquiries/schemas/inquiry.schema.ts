import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type InquiryType = 'purchase' | 'rental' | 'question';
export type InquiryStatus = 'new' | 'in_progress' | 'closed';

@Schema({ timestamps: true, collection: 'inquiries' })
export class Inquiry {
  @Prop({ type: Types.ObjectId, ref: 'Property', required: true, index: true })
  propertyId!: Types.ObjectId;

  @Prop({ required: true })
  propertyTitle!: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  buyerId!: Types.ObjectId;

  @Prop({ required: true })
  buyerName!: string;

  @Prop({
    required: true,
    enum: ['purchase', 'rental', 'question'],
  })
  type!: InquiryType;

  @Prop({ required: true })
  message!: string;

  @Prop({
    enum: ['new', 'in_progress', 'closed'],
    default: 'new',
    index: true,
  })
  status!: InquiryStatus;
}

export type InquiryDocument = HydratedDocument<Inquiry>;
export const InquirySchema = SchemaFactory.createForClass(Inquiry);

InquirySchema.set('toJSON', {
  virtuals: true,
  transform(_doc, ret) {
    const obj = ret as unknown as Record<string, unknown>;
    obj.id = String(obj._id);
    if (obj.propertyId) obj.propertyId = String(obj.propertyId);
    if (obj.buyerId) obj.buyerId = String(obj.buyerId);
    delete obj._id;
    delete obj.__v;
    return obj;
  },
});
