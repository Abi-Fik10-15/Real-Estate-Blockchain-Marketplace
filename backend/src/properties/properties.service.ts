import {
  BadRequestException,
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
import { UsersService } from '../users/users.service';
import { BlockchainService } from '../blockchain/blockchain.service';
import { resolveDocumentId } from '../common/utils/document-id';
import { resolveUserId } from '../common/utils/resolve-user-id';

@Injectable()
export class PropertiesService {
  constructor(
    @InjectModel(Property.name)
    private readonly propertyModel: Model<PropertyDocument>,
    private readonly blockchainService: BlockchainService,
    private readonly usersService: UsersService,
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

    const limit = Math.min(query.limit ?? 50, 100);
    const skip = ((query.page ?? 1) - 1) * limit;
    return this.propertyModel.find(filter).sort(sort).skip(skip).limit(limit).lean({ virtuals: true }).exec() as unknown as Promise<PropertyDocument[]>;
  }

  async findById(id: string): Promise<PropertyDocument> {
    const property = await this.propertyModel
      .findOne({
        $or: [{ _id: Types.ObjectId.isValid(id) ? id : null }, { blockchainTokenId: id }],
      })
      .lean({ virtuals: true })
      .exec() as unknown as PropertyDocument | null;

    if (!property) {
      throw new NotFoundException('Property not found');
    }
    return property;
  }

  async findByOwner(ownerId: string): Promise<PropertyDocument[]> {
    return this.propertyModel.find({ ownerId: new Types.ObjectId(ownerId) }).lean({ virtuals: true }).exec() as unknown as Promise<PropertyDocument[]>;
  }

  async findByAgent(agentId: string): Promise<PropertyDocument[]> {
    return this.propertyModel
      .find({ agentId: new Types.ObjectId(agentId) })
      .lean({ virtuals: true })
      .exec() as unknown as Promise<PropertyDocument[]>;
  }

  async findIdsByOwner(ownerId: string): Promise<Types.ObjectId[]> {
    const properties = await this.propertyModel
      .find({ ownerId: new Types.ObjectId(ownerId) })
      .select('_id')
      .lean()
      .exec();
    return properties.map((p) => p._id as Types.ObjectId);
  }

  async findIdsByAgent(agentId: string): Promise<Types.ObjectId[]> {
    const properties = await this.propertyModel
      .find({ agentId: new Types.ObjectId(agentId) })
      .select('_id')
      .lean()
      .exec();
    return properties.map((p) => p._id as Types.ObjectId);
  }

  async create(user: UserDocument, dto: CreatePropertyDto): Promise<PropertyDocument> {
    const addressCountry = dto.location.address.includes(',')
      ? dto.location.address.split(',').pop()?.trim()
      : 'USA';
    const country = dto.location.country && dto.location.country.trim() !== ''
      ? dto.location.country
      : addressCountry;

    let agentId: Types.ObjectId | undefined;
    let agentWallet = '';

    if (dto.agentId) {
      const agent = await this.resolveAssignableAgent(dto.agentId);
      agentId = new Types.ObjectId(agent.id ?? resolveUserId(agent));
      agentWallet = agent.walletAddress ?? '';
    }

    const payload: Record<string, unknown> = {
      ...dto,
      location: {
        ...dto.location,
        country: country || 'USA',
      },
      ownerId: user._id,
      ownerWallet: dto.ownerWallet ?? user.walletAddress,
      status: 'pending',
    };

    delete payload.agentId;

    if (agentId) {
      payload.agentId = agentId;
      payload.agentWallet = agentWallet;
    }

    return this.propertyModel.create(payload);
  }

  async assignAgent(
    id: string,
    user: UserDocument,
    agentId: string,
  ): Promise<{ property: PropertyDocument; previousAgentId: string | null }> {
    const property = await this.findById(id);
    this.assertCanAssignAgent(property, user);

    const agent = await this.resolveAssignableAgent(agentId);
    const previousAgentId = property.agentId ? String(property.agentId) : null;

    const updated = await this.propertyModel
      .findByIdAndUpdate(
        resolveDocumentId(id),
        {
          $set: {
            agentId: new Types.ObjectId(resolveUserId(agent)),
            agentWallet: agent.walletAddress ?? '',
          },
        },
        { new: true },
      )
      .exec();

    if (!updated) {
      throw new NotFoundException('Property not found');
    }

    return { property: updated, previousAgentId };
  }

  async removeAgent(
    id: string,
    user: UserDocument,
  ): Promise<{ property: PropertyDocument; previousAgentId: string | null }> {
    const property = await this.findById(id);
    this.assertCanAssignAgent(property, user);

    const previousAgentId = property.agentId ? String(property.agentId) : null;

    const updated = await this.propertyModel
      .findByIdAndUpdate(
        resolveDocumentId(id),
        {
          $set: { agentWallet: '' },
          $unset: { agentId: 1 },
        },
        { new: true },
      )
      .exec();

    if (!updated) {
      throw new NotFoundException('Property not found');
    }

    return { property: updated, previousAgentId };
  }

  async update(
    id: string,
    user: UserDocument,
    dto: UpdatePropertyDto,
  ): Promise<PropertyDocument> {
    const property = await this.findById(id);
    this.assertCanManage(property, user);

    const userId = resolveUserId(user);
    const isOwner = String(property.ownerId) === userId;
    const isAdmin = user.role === 'admin';

    if (!isOwner && !isAdmin) {
      delete dto.agentId;
      delete dto.agentWallet;
    }

    const set: Record<string, unknown> = { ...dto };
    const unset: Record<string, 1> = {};

    if ('agentId' in dto && (dto.agentId === null || dto.agentId === '')) {
      unset.agentId = 1;
      delete set.agentId;
    }
    if ('agentWallet' in dto && dto.agentWallet === '') {
      set.agentWallet = '';
    }

    if ('agentId' in set && set.agentId) {
      const agent = await this.resolveAssignableAgent(String(set.agentId));
      set.agentId = new Types.ObjectId(resolveUserId(agent));
      set.agentWallet = agent.walletAddress ?? '';
    }

    const updateOps: Record<string, unknown> = {};
    if (Object.keys(set).length > 0) updateOps.$set = set;
    if (Object.keys(unset).length > 0) updateOps.$unset = unset;

    const updated = await this.propertyModel
      .findByIdAndUpdate(property._id ?? property.id, updateOps, { new: true })
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
    // FIX: Using the existing updateStatus method instead of .save()
    return this.updateStatus(id, 'active');
  }

  async updateStatus(
    id: string,
    status: PropertyDocument['status'],
  ): Promise<PropertyDocument> {
    await this.findById(id);
    const updated = await this.propertyModel
      .findByIdAndUpdate(resolveDocumentId(id), { status }, { new: true })
      .exec();

    if (!updated) {
      throw new NotFoundException('Property not found');
    }
    return updated;
  }

  async completeSale(
    id: string,
    buyerWallet: string,
    buyerId: string,
  ): Promise<PropertyDocument> {
    const property = await this.findById(id);
    const updated = await this.propertyModel
      .findByIdAndUpdate(
        property._id ?? property.id,
        {
          $set: {
            status: 'sold',
            ownerWallet: buyerWallet,
            ownerId: new Types.ObjectId(buyerId),
            agentWallet: '',
          },
          $unset: { agentId: 1 },
        },
        { new: true },
      )
      .exec();

    if (!updated) {
      throw new NotFoundException('Property not found');
    }
    return updated;
  }

  async completeRental(id: string): Promise<PropertyDocument> {
    const property = await this.findById(id);
    const updated = await this.propertyModel
      .findByIdAndUpdate(
        property._id ?? property.id,
        {
          $set: { status: 'rented', agentWallet: '' },
          $unset: { agentId: 1 },
        },
        { new: true },
      )
      .exec();

    if (!updated) {
      throw new NotFoundException('Property not found');
    }
    return updated;
  }

  async getOwnershipRecords() {
    const properties = await this.propertyModel.find().lean({ virtuals: true }).exec() as unknown as PropertyDocument[];
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
        id: String((p as { _id?: Types.ObjectId; id?: string })._id ?? p.id),
        propertyId: p.blockchainTokenId || String((p as { _id?: Types.ObjectId; id?: string })._id ?? p.id),
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
    const [result] = await this.propertyModel.aggregate<{
      total: number; active: number; sold: number; rented: number;
    }>([
      {
        $facet: {
          total: [{ $count: 'n' }],
          active: [{ $match: { status: 'active' } }, { $count: 'n' }],
          sold: [{ $match: { status: 'sold' } }, { $count: 'n' }],
          rented: [{ $match: { status: 'rented' } }, { $count: 'n' }],
        },
      },
      {
        $project: {
          total: { $ifNull: [{ $arrayElemAt: ['$total.n', 0] }, 0] },
          active: { $ifNull: [{ $arrayElemAt: ['$active.n', 0] }, 0] },
          sold: { $ifNull: [{ $arrayElemAt: ['$sold.n', 0] }, 0] },
          rented: { $ifNull: [{ $arrayElemAt: ['$rented.n', 0] }, 0] },
        },
      },
    ]);

    return {
      totalProperties: result?.total ?? 0,
      activeListings: result?.active ?? 0,
      soldProperties: result?.sold ?? 0,
      rentedProperties: result?.rented ?? 0,
    };
  }

  private assertCanAssignAgent(property: PropertyDocument, user: UserDocument) {
    const userId = resolveUserId(user);
    const isOwner = String(property.ownerId) === userId;
    const isAdmin = user.role === 'admin';

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('Only the property owner can manage agent assignments');
    }
  }

  private async resolveAssignableAgent(agentId: string): Promise<UserDocument> {
    if (!Types.ObjectId.isValid(agentId)) {
      throw new BadRequestException('Invalid agent id');
    }

    const agent = await this.usersService.findById(agentId);
    if (!agent) {
      throw new NotFoundException('Agent not found');
    }
    if (agent.role !== 'agent') {
      throw new BadRequestException('Selected user is not an agent');
    }
    if (agent.status !== 'active') {
      throw new BadRequestException('Agent account is not active');
    }

    return agent;
  }

  private assertCanManage(property: PropertyDocument, user: UserDocument) {
    const userId = resolveUserId(user);
    const isOwner = String(property.ownerId) === userId;
    const isAdmin = user.role === 'admin';
    const isAgent =
      user.role === 'agent' &&
      property.agentId != null &&
      String(property.agentId) === userId;

    if (!isOwner && !isAdmin && !isAgent) {
      throw new ForbiddenException('Not allowed to modify this property');
    }
  }
}