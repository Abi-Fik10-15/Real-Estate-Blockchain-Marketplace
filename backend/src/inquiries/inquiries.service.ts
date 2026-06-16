import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Inquiry, InquiryDocument } from './schemas/inquiry.schema';
import { CreateInquiryDto, UpdateInquiryDto } from './dto/inquiry.dto';
import { PropertiesService } from '../properties/properties.service';
import type { UserDocument } from '../users/schemas/user.schema';
import { NotificationsService } from '../notifications/notifications.service';

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

  findByBuyer(buyerId: string): Promise<InquiryDocument[]> {
    return this.inquiryModel.find({ buyerId }).sort({ createdAt: -1 }).exec();
  }

  async create(
    buyer: UserDocument,
    dto: CreateInquiryDto,
  ): Promise<InquiryDocument> {
    const property = await this.propertiesService.findById(dto.propertyId);

    const inquiry = await this.inquiryModel.create({
      propertyId: property._id,
      propertyTitle: property.title,
      buyerId: buyer._id,
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
}
