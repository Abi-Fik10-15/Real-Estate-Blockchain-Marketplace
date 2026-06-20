import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Inquiry, InquiryDocument } from './schemas/inquiry.schema';
import { CreateInquiryDto, UpdateInquiryDto } from './dto/inquiry.dto';
import { PropertiesService } from '../properties/properties.service';
import type { UserDocument } from '../users/schemas/user.schema';
import { NotificationsService } from '../notifications/notifications.service';
import { resolveDocumentId } from '../common/utils/document-id';

@Injectable()
export class InquiriesService {
  constructor(
    @InjectModel(Inquiry.name)
    private readonly inquiryModel: Model<InquiryDocument>,
    private readonly propertiesService: PropertiesService,
    private readonly notifications: NotificationsService,
  ) {}

  findAll(): Promise<InquiryDocument[]> {
    return this.inquiryModel.find().sort({ createdAt: -1 }).exec();
  }

  async findForUser(user: UserDocument): Promise<InquiryDocument[]> {
    if (user.role === 'admin') {
      return this.findAll();
    }

    const ownerId = resolveDocumentId(user);
    const propertyIds =
      user.role === 'owner'
        ? await this.propertiesService.findIdsByOwner(ownerId)
        : user.role === 'agent'
          ? await this.propertiesService.findIdsByAgent(ownerId)
          : [];

    if (propertyIds.length === 0) {
      return [];
    }

    return this.inquiryModel
      .find({ propertyId: { $in: propertyIds } })
      .sort({ createdAt: -1 })
      .exec();
  }

  findByBuyer(buyerId: string): Promise<InquiryDocument[]> {
    if (!Types.ObjectId.isValid(buyerId)) {
      return Promise.resolve([]);
    }
    return this.inquiryModel
      .find({ buyerId: new Types.ObjectId(buyerId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  async create(
    buyer: UserDocument,
    dto: CreateInquiryDto,
  ): Promise<InquiryDocument> {
    const property = await this.propertiesService.findById(dto.propertyId);
    const propertyObjectId = new Types.ObjectId(resolveDocumentId(property));
    const buyerObjectId = new Types.ObjectId(resolveDocumentId(buyer));

    const inquiry = await this.inquiryModel.create({
      propertyId: propertyObjectId,
      propertyTitle: property.title,
      buyerId: buyerObjectId,
      buyerName: buyer.name,
      type: dto.type,
      message: dto.message,
      status: 'new',
    });

    this.notifications.emitVisitRequest(
      property.ownerId.toString(),
      inquiry.id,
      property.title,
      buyer.name,
    );

    return inquiry;
  }

  async updateStatus(
    id: string,
    dto: UpdateInquiryDto,
  ): Promise<InquiryDocument> {
    const inquiry = await this.inquiryModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();

    if (!inquiry) {
      throw new NotFoundException('Inquiry not found');
    }
    return inquiry;
  }

  async closeForBuyerProperty(
    propertyId: string,
    buyerId: string,
  ): Promise<void> {
    await this.inquiryModel
      .updateMany(
        {
          propertyId: new Types.ObjectId(propertyId),
          buyerId: new Types.ObjectId(buyerId),
          status: { $ne: 'closed' },
        },
        { status: 'closed' },
      )
      .exec();
  }
}
