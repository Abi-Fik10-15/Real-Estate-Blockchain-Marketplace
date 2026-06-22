import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  create(data: Partial<User>): Promise<UserDocument> {
    return this.userModel.create(data);
  }

  findAll(): Promise<UserDocument[]> {
    return this.userModel.find().select('-passwordHash').lean({ virtuals: true }).exec() as unknown as Promise<UserDocument[]>;
  }

  findAgents(): Promise<UserDocument[]> {
    return this.userModel
      .find({ role: 'agent', status: 'active' })
      .select('-passwordHash')
      .lean({ virtuals: true })
      .exec() as unknown as Promise<UserDocument[]>;
  }

  findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: email.trim().toLowerCase() }).lean({ virtuals: true }).exec() as unknown as Promise<UserDocument | null>;
  }

  findByEmailWithPassword(email: string): Promise<UserDocument | null> {
    return this.userModel
      .findOne({ email: email.trim().toLowerCase() })
      .select('+passwordHash')
      .exec();
  }

  /** Fetch user with verification fields (for resend / verify flows). */
  findByEmailWithVerification(email: string): Promise<UserDocument | null> {
    return this.userModel
      .findOne({ email: email.trim().toLowerCase() })
      .select('+emailVerificationToken +emailVerificationExpires')
      .exec();
  }

  findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).select('-passwordHash').lean({ virtuals: true }).exec() as unknown as Promise<UserDocument | null>;
  }

  /** Used during email verification — includes hidden token fields. */
  findByVerificationToken(token: string): Promise<UserDocument | null> {
    return this.userModel
      .findOne({
        emailVerificationToken: token,
        emailVerificationExpires: { $gt: new Date() },
      })
      .select('+emailVerificationToken +emailVerificationExpires')
      .exec();
  }

  async updateById(
    id: string,
    patch: Partial<User>,
  ): Promise<UserDocument | null> {
    return this.userModel
      .findByIdAndUpdate(id, patch, { new: true })
      .select('-passwordHash')
      .exec();
  }

  async setStatus(
    id: string,
    status: 'active' | 'suspended',
  ): Promise<UserDocument> {
    if (!['active', 'suspended'].includes(status)) {
      throw new BadRequestException('Status must be "active" or "suspended"');
    }
    const user = await this.userModel
      .findByIdAndUpdate(id, { status }, { new: true })
      .select('-passwordHash')
      .exec();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async getSavedPropertyIds(userId: string): Promise<string[]> {
    const user = await this.userModel
      .findById(userId)
      .select('savedPropertyIds')
      .lean()
      .exec();
    if (!user) throw new NotFoundException('User not found');
    return (user.savedPropertyIds as unknown as Types.ObjectId[]).map((id) => String(id));
  }

  async saveProperty(userId: string, propertyId: string): Promise<string[]> {
    const user = await this.userModel
      .findByIdAndUpdate(
        userId,
        { $addToSet: { savedPropertyIds: new Types.ObjectId(propertyId) } },
        { new: true },
      )
      .select('savedPropertyIds')
      .exec();
    if (!user) throw new NotFoundException('User not found');
    return user.savedPropertyIds.map((id) => String(id));
  }

  async unsaveProperty(userId: string, propertyId: string): Promise<string[]> {
    const user = await this.userModel
      .findByIdAndUpdate(
        userId,
        { $pull: { savedPropertyIds: new Types.ObjectId(propertyId) } },
        { new: true },
      )
      .select('savedPropertyIds')
      .exec();
    if (!user) throw new NotFoundException('User not found');
    return user.savedPropertyIds.map((id) => String(id));
  }
}
