import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type KycSubmissionStatus = 'submitted' | 'approved' | 'rejected';
export type KycIdType = 'passport' | 'drivers_license' | 'national_id';

@Schema({ timestamps: true, collection: 'kyc_submissions' })
export class KycSubmission {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true, index: true })
  userId!: Types.ObjectId;

  @Prop({
    required: true,
    enum: ['submitted', 'approved', 'rejected'],
    default: 'submitted',
    index: true,
  })
  status!: KycSubmissionStatus;

  @Prop({ required: true, trim: true })
  legalName!: string;

  @Prop({ required: true, trim: true })
  dateOfBirth!: string;

  @Prop({ required: true, trim: true })
  address!: string;

  @Prop({
    required: true,
    enum: ['passport', 'drivers_license', 'national_id'],
  })
  idType!: KycIdType;

  @Prop({ required: true })
  idDocumentUrl!: string;

  @Prop({ default: '' })
  idDocumentPublicId!: string;

  @Prop({ required: true })
  selfieUrl!: string;

  @Prop({ default: '' })
  selfiePublicId!: string;

  @Prop({ required: true })
  addressProofUrl!: string;

  @Prop({ default: '' })
  addressProofPublicId!: string;

  @Prop({ default: '' })
  brokerLicenseUrl!: string;

  @Prop({ default: '' })
  brokerLicensePublicId!: string;

  @Prop({ default: '' })
  reviewNotes!: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  reviewedBy?: Types.ObjectId;

  @Prop()
  reviewedAt?: Date;
}

export type KycSubmissionDocument = HydratedDocument<KycSubmission>;
export const KycSubmissionSchema = SchemaFactory.createForClass(KycSubmission);

KycSubmissionSchema.set('toJSON', {
  virtuals: true,
  transform(_doc, ret) {
    const obj = ret as unknown as Record<string, unknown>;
    obj.id = String(obj._id);
    if (obj.userId) obj.userId = String(obj.userId);
    if (obj.reviewedBy) obj.reviewedBy = String(obj.reviewedBy);
    delete obj._id;
    delete obj.__v;
    return obj;
  },
});
