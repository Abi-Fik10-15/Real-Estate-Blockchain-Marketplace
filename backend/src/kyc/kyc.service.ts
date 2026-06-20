import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  KycSubmission,
  KycSubmissionDocument,
} from './schemas/kyc-submission.schema';
import { SubmitKycDto, ReviewKycDto } from './dto/kyc.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { UsersService } from '../users/users.service';
import type { UserDocument } from '../users/schemas/user.schema';

type KycUploadFiles = {
  idDocument?: Express.Multer.File[];
  selfie?: Express.Multer.File[];
  addressProof?: Express.Multer.File[];
  brokerLicense?: Express.Multer.File[];
};

type KycAdminListItem = {
  id: string;
  userId: string;
  status: KycSubmissionDocument['status'];
  legalName: string;
  dateOfBirth: string;
  address: string;
  idType: KycSubmissionDocument['idType'];
  idDocumentUrl: string;
  selfieUrl: string;
  addressProofUrl: string;
  brokerLicenseUrl: string;
  reviewNotes: string;
  reviewedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  userName: string;
  userEmail: string;
  userRole: string;
  userKycStatus: string;
};

@Injectable()
export class KycService {
  private readonly allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf',
  ];

  constructor(
    @InjectModel(KycSubmission.name)
    private readonly kycModel: Model<KycSubmissionDocument>,
    private readonly cloudinaryService: CloudinaryService,
    private readonly usersService: UsersService,
  ) {}

  async findMine(userId: string) {
    const submission = await this.kycModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .lean({ virtuals: true })
      .exec();

    return submission ?? null;
  }

  async findAllForAdmin(status?: string): Promise<KycAdminListItem[]> {
    const filter: Record<string, unknown> = {};
    if (status && status !== 'all') {
      filter.status = status;
    }

    const submissions = await this.kycModel
      .find(filter)
      .sort({ updatedAt: -1 })
      .lean({ virtuals: true })
      .exec();

    const users = await this.usersService.findAll();
    const userMap = new Map(
      users.map((u) => {
        const raw = u as { id?: string; _id?: Types.ObjectId };
        const id = String(raw.id ?? raw._id);
        return [id, u];
      }),
    );

    return submissions.map((submission) => {
      const row = submission as typeof submission & {
        id?: string;
        _id?: Types.ObjectId;
        createdAt?: Date;
        updatedAt?: Date;
      };
      const user = userMap.get(String(row.userId));
      return {
        id: String(row.id ?? row._id),
        userId: String(row.userId),
        status: row.status,
        legalName: row.legalName,
        dateOfBirth: row.dateOfBirth,
        address: row.address,
        idType: row.idType,
        idDocumentUrl: row.idDocumentUrl,
        selfieUrl: row.selfieUrl,
        addressProofUrl: row.addressProofUrl,
        brokerLicenseUrl: row.brokerLicenseUrl ?? '',
        reviewNotes: row.reviewNotes ?? '',
        reviewedAt: row.reviewedAt,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        userName: user?.name ?? 'Unknown',
        userEmail: user?.email ?? '',
        userRole: user?.role ?? 'buyer',
        userKycStatus: user?.kycStatus ?? 'pending',
      };
    });
  }

  async submit(
    user: UserDocument,
    dto: SubmitKycDto,
    files: KycUploadFiles,
  ): Promise<KycSubmissionDocument> {
    const idDocument = files.idDocument?.[0];
    const selfie = files.selfie?.[0];
    const addressProof = files.addressProof?.[0];
    const brokerLicense = files.brokerLicense?.[0];

    if (!idDocument || !selfie || !addressProof) {
      throw new BadRequestException(
        'Government ID, selfie, and address proof are required',
      );
    }

    if (user.role === 'agent' && !brokerLicense) {
      throw new BadRequestException('Real estate license document is required for agents');
    }

    this.assertValidFile(idDocument, 'Government ID');
    this.assertValidFile(selfie, 'Selfie');
    this.assertValidFile(addressProof, 'Address proof');
    if (brokerLicense) {
      this.assertValidFile(brokerLicense, 'Broker license');
    }

    const existing = await this.kycModel.findOne({ userId: user._id }).exec();
    if (existing?.status === 'submitted') {
      throw new BadRequestException(
        'Your KYC application is already under review',
      );
    }
    if (existing?.status === 'approved') {
      throw new BadRequestException('Your identity is already verified');
    }

    const [idUpload, selfieUpload, addressUpload, licenseUpload] = await Promise.all([
      this.cloudinaryService.uploadFile(idDocument, 'chainestate/kyc'),
      this.cloudinaryService.uploadFile(selfie, 'chainestate/kyc'),
      this.cloudinaryService.uploadFile(addressProof, 'chainestate/kyc'),
      brokerLicense
        ? this.cloudinaryService.uploadFile(brokerLicense, 'chainestate/kyc')
        : Promise.resolve(null),
    ]);

    const payload = {
      userId: user._id,
      status: 'submitted' as const,
      legalName: dto.legalName.trim(),
      dateOfBirth: dto.dateOfBirth.trim(),
      address: dto.address.trim(),
      idType: dto.idType,
      idDocumentUrl: idUpload.url,
      idDocumentPublicId: idUpload.publicId,
      selfieUrl: selfieUpload.url,
      selfiePublicId: selfieUpload.publicId,
      addressProofUrl: addressUpload.url,
      addressProofPublicId: addressUpload.publicId,
      brokerLicenseUrl: licenseUpload?.url ?? '',
      brokerLicensePublicId: licenseUpload?.publicId ?? '',
      reviewNotes: '',
      reviewedBy: undefined,
      reviewedAt: undefined,
    };

    const submission = existing
      ? await this.kycModel
          .findByIdAndUpdate(existing._id, payload, { new: true })
          .exec()
      : await this.kycModel.create(payload);

    if (!submission) {
      throw new BadRequestException('Failed to save KYC submission');
    }

    await this.usersService.updateById(user.id, { kycStatus: 'pending' });

    return submission;
  }

  async review(
    id: string,
    admin: UserDocument,
    dto: ReviewKycDto,
  ): Promise<KycSubmissionDocument> {
    const submission = await this.kycModel.findById(id).exec();
    if (!submission) {
      throw new NotFoundException('KYC submission not found');
    }

    if (submission.status !== 'submitted') {
      throw new BadRequestException('This submission has already been reviewed');
    }

    submission.status = dto.decision === 'approved' ? 'approved' : 'rejected';
    submission.reviewNotes = dto.reviewNotes?.trim() ?? '';
    submission.reviewedBy = admin._id;
    submission.reviewedAt = new Date();
    await submission.save();

    await this.usersService.updateById(submission.userId.toString(), {
      kycStatus: dto.decision === 'approved' ? 'verified' : 'rejected',
    });

    return submission;
  }

  async getPendingCount(): Promise<number> {
    return this.kycModel.countDocuments({ status: 'submitted' }).exec();
  }

  private assertValidFile(file: Express.Multer.File, label: string) {
    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `${label}: only JPG, PNG, WEBP, or PDF files are allowed`,
      );
    }
    if (file.size > 8 * 1024 * 1024) {
      throw new BadRequestException(`${label}: file must be 8 MB or smaller`);
    }
  }
}
