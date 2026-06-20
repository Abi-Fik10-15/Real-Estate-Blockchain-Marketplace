import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type UserRole = 'buyer' | 'owner' | 'agent' | 'admin';
export type KycStatus = 'pending' | 'verified' | 'rejected';

@Schema({ timestamps: true, collection: 'users' })
export class User {
  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email!: string;

  @Prop({ required: true, select: false })
  passwordHash!: string;

  @Prop({
    required: true,
    enum: ['buyer', 'owner', 'agent', 'admin'],
    default: 'buyer',
  })
  role!: UserRole;

  @Prop({ default: '' })
  phone!: string;

  @Prop({ default: '' })
  walletAddress!: string;

  @Prop({
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending',
  })
  kycStatus!: KycStatus;

  @Prop({ default: '' })
  avatar!: string;

  @Prop({ enum: ['active', 'suspended'], default: 'active' })
  status!: 'active' | 'suspended';

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Property' }], default: [] })
  savedPropertyIds!: Types.ObjectId[];

  @Prop({ default: false })
  emailVerified!: boolean;

  @Prop({ select: false })
  emailVerificationToken?: string;

  @Prop({ select: false })
  emailVerificationExpires?: Date;
}

export type UserDocument = HydratedDocument<User>;
export const UserSchema = SchemaFactory.createForClass(User);

// Compound index for agent lookups (findAgents)
UserSchema.index({ role: 1, status: 1 });

UserSchema.set('toJSON', {
  virtuals: true,
  transform(_doc, ret) {
    const obj = ret as unknown as Record<string, unknown>;
    obj.id = String(obj._id);
    delete obj._id;
    delete obj.__v;
    delete obj.passwordHash;
    return obj;
  },
});
