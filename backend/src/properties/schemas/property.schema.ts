import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type PropertyStatus =
  | 'draft'
  | 'pending'
  | 'active'
  | 'sold'
  | 'rented';

@Schema({ _id: false })
export class PropertyLocation {
  @Prop({ required: true })
  address!: string;

  @Prop({ required: true })
  city!: string;

  @Prop({ required: true })
  country!: string;

  @Prop({ required: true })
  lat!: number;

  @Prop({ required: true })
  lng!: number;
}

const PropertyLocationSchema = SchemaFactory.createForClass(PropertyLocation);

@Schema({ timestamps: true, collection: 'properties' })
export class Property {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  ownerId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  agentId?: Types.ObjectId;

  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({ required: true })
  description!: string;

  @Prop({ required: true, min: 0 })
  price!: number;

  @Prop({ default: 'ETH', enum: ['ETH', 'USD'] })
  currency!: 'ETH' | 'USD';

  @Prop({
    required: true,
    enum: ['draft', 'pending', 'active', 'sold', 'rented'],
    default: 'draft',
    index: true,
  })
  status!: PropertyStatus;

  @Prop({ default: 'Apartment' })
  type!: string;

  @Prop({ default: 'sale', enum: ['sale', 'rent'] })
  listingType!: 'sale' | 'rent';

  @Prop({ type: PropertyLocationSchema, required: true })
  location!: PropertyLocation;

  @Prop({ default: 0 })
  bedrooms!: number;

  @Prop({ default: 0 })
  bathrooms!: number;

  @Prop({ default: 0 })
  area!: number;

  @Prop({ default: 0.01, min: 0 })
  priceEth!: number;

  @Prop({ default: '' })
  blockchainTokenId!: string;

  @Prop({ default: '' })
  ownerWallet!: string;

  @Prop({ default: '' })
  agentWallet!: string;

  @Prop({ type: [String], default: [] })
  images!: string[];

  @Prop({ type: [String], default: [] })
  documents!: string[];

  @Prop({ default: false })
  featured!: boolean;

  @Prop({ default: 0 })
  views!: number;

  @Prop({ default: 0 })
  saves!: number;
}

export type PropertyDocument = HydratedDocument<Property>;
export const PropertySchema = SchemaFactory.createForClass(Property);

PropertySchema.set('toJSON', {
  virtuals: true,
  transform(_doc, ret) {
    const obj = ret as unknown as Record<string, unknown>;
    obj.id = String(obj._id);
    if (obj.ownerId) obj.ownerId = String(obj.ownerId);
    if (obj.agentId) obj.agentId = String(obj.agentId);
    delete obj._id;
    delete obj.__v;
    return obj;
  },
});
