import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { Property, PropertyDocument } from './schemas/property.schema';
import {
  CreatePropertyDto,
  PropertyQueryDto,
  UpdatePropertyDto,
} from './dto/property.dto';
import type { UserDocument } from '../users/schemas/user.schema';
import { BlockchainService } from '../blockchain/blockchain.service';

@Injectable()
export class PropertiesService {
  constructor(
    @InjectModel(Property.name)
    private readonly propertyModel: Model<PropertyDocument>,
    private readonly blockchainService: BlockchainService,
  ) {}

  async findAll(query: PropertyQueryDto): Promise<PropertyDocument[]> {
    const filter: FilterQuery<PropertyDocument> = {};

    if (query.search) {
      const q = query.search.toLowerCase();
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { 'location.city': { $regex: q, $options: 'i' } },
        { 'location.country': { $regex: q, $options: 'i' } },
      ];
    }

    if (query.type && query.type !== 'all') filter.type = query.type;
    if (query.minPrice != null) filter.price = { ...filter.price, $gte: query.minPrice };
    if (query.maxPrice != null && query.maxPrice > 0) {
      filter.price = { ...filter.price, $lte: query.maxPrice };
    }
    if (query.bedrooms) filter.bedrooms = { $gte: query.bedrooms };
    if (query.bathrooms) filter.bathrooms = { $gte: query.bathrooms };
    if (query.location) {
      filter['location.city'] = { $regex: query.location, $options: 'i' };
    }
    if (query.status && query.status !== 'all') filter.status = query.status;
    if (query.listingType && query.listingType !== 'all') {
      filter.listingType = query.listingType;
    }
    if (query.ownerId) filter.ownerId = new Types.ObjectId(query.ownerId);
    if (query.agentId) filter.agentId = new Types.ObjectId(query.agentId);

    let sort: Record<string, 1 | -1> = { createdAt: -1 };
    switch (query.sort) {
      case 'price_asc':
        sort = { price: 1 };
        break;
      case 'price_desc':
        sort = { price: -1 };
        break;
      case 'area_desc':
        sort = { area: -1 };
        break;
    }

    return this.propertyModel.find(filter).sort(sort).exec();
  }

  async findById(id: string): Promise<PropertyDocument> {
    const property = await this.propertyModel
      .findOne({
        $or: [{ _id: Types.ObjectId.isValid(id) ? id : null }, { blockchainTokenId: id }],
      })
      .exec();

    if (!property) {
      throw new NotFoundException('Property not found');
    }
    return property;
  }

  async findByOwner(ownerId: string): Promise<PropertyDocument[]> {
    return this.propertyModel.find({ ownerId: new Types.ObjectId(ownerId) }).exec();
  }

  async findIdsByOwner(ownerId: string): Promise<Types.ObjectId[]> {
    const properties = await this.propertyModel
      .find({ ownerId: new Types.ObjectId(ownerId) })
      .select('_id')
      .exec();
    return properties.map((p) => p._id);
  }

  async findIdsByAgent(agentId: string): Promise<Types.ObjectId[]> {
    const properties = await this.propertyModel
      .find({ agentId: new Types.ObjectId(agentId) })
      .select('_id')
      .exec();
    return properties.map((p) => p._id);
  }

  async create(user: UserDocument, dto: CreatePropertyDto): Promise<PropertyDocument> {
    const addressCountry = dto.location.address.includes(',')
      ? dto.location.address.split(',').pop()?.trim()
      : 'USA';
    const country = dto.location.country && dto.location.country.trim() !== ''
      ? dto.location.country
      : addressCountry;

    return this.propertyModel.create({
      ...dto,
      location: {
        ...dto.location,
        country: country || 'USA',
      },
      ownerId: user._id,
      ownerWallet: dto.ownerWallet ?? user.walletAddress,
      status: dto.status ?? 'pending',
    });
  }

  async update(
    id: string,
    user: UserDocument,
    dto: UpdatePropertyDto,
  ): Promise<PropertyDocument> {
    const property = await this.findById(id);
    this.assertCanManage(property, user);

    const updated = await this.propertyModel
      .findByIdAndUpdate(property._id, dto, { new: true })
      .exec();

    if (!updated) {
      throw new NotFoundException('Property not found');
    }
    return updated;
  }

  async delete(id: string, user: UserDocument): Promise<void> {
    const property = await this.findById(id);
    this.assertCanManage(property, user);
    const result = await this.propertyModel.findByIdAndDelete(property._id).exec();
    if (!result) {
      throw new NotFoundException('Property not found');
    }
  }

  async approve(id: string): Promise<PropertyDocument> {
    const property = await this.findById(id);
    property.status = 'active';
    return property.save();
  }

  async updateStatus(
    id: string,
    status: PropertyDocument['status'],
  ): Promise<PropertyDocument> {
    const property = await this.findById(id);
    property.status = status;
    return property.save();
  }

  async completeSale(
    id: string,
    buyerWallet: string,
    buyerId: string,
  ): Promise<PropertyDocument> {
    const property = await this.findById(id);
    property.status = 'sold';
    property.ownerWallet = buyerWallet;
    property.ownerId = new Types.ObjectId(buyerId);
    property.agentId = undefined;
    property.agentWallet = '';
    return property.save();
  }

  async getOwnershipRecords() {
    const properties = await this.propertyModel.find().exec();
    const tokenIds = properties
      .map((p) => p.blockchainTokenId)
      .filter((id) => id && /^\d+$/.test(id));

    const onChainMap = new Map(
      (
        await this.blockchainService.getRecordsForTokenIds(tokenIds)
      ).map((r) => [r.tokenId, r]),
    );

    return properties.map((p) => {
      const onChain = p.blockchainTokenId
        ? onChainMap.get(p.blockchainTokenId)
        : undefined;

      return {
        id: p.id,
        propertyId: p.blockchainTokenId || p.id,
        propertyTitle: p.title,
        ownerWallet: onChain?.owner ?? p.ownerWallet,
        agentWallet: p.agentWallet,
        priceEth: p.priceEth,
        status: p.status,
        inEscrow: onChain?.inEscrow ?? false,
        escrowBuyer: onChain?.escrowBuyer ?? '',
        escrowAmount: onChain?.escrowAmount ?? '',
        tokenURI: onChain?.tokenURI ?? '',
        verificationStatus:
          p.status === 'active' || p.status === 'sold' ? 'verified' : 'pending',
        onChain: Boolean(onChain),
      };
    });
  }

  async getStats() {
    const [total, active, sold, rented] = await Promise.all([
      this.propertyModel.countDocuments(),
      this.propertyModel.countDocuments({ status: 'active' }),
      this.propertyModel.countDocuments({ status: 'sold' }),
      this.propertyModel.countDocuments({ status: 'rented' }),
    ]);

    return {
      totalProperties: total,
      activeListings: active,
      soldProperties: sold,
      rentedProperties: rented,
    };
  }

  private assertCanManage(property: PropertyDocument, user: UserDocument) {
    const isOwner = property.ownerId.toString() === user.id;
    const isAdmin = user.role === 'admin';
    const isAgent =
      user.role === 'agent' &&
      property.agentId?.toString() === user.id;

    if (!isOwner && !isAdmin && !isAgent) {
      throw new ForbiddenException('Not allowed to modify this property');
    }
  }
}
