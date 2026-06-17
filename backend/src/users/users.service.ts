import { Injectable, NotFoundException } from '@nestjs/common';
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
    return this.userModel.find().select('-passwordHash').exec();
  }

  findAgents(): Promise<UserDocument[]> {
    return this.userModel
      .find({ role: 'agent', status: 'active' })
      .select('-passwordHash')
      .exec();
  }

  findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: email.trim().toLowerCase() }).exec();
  }

  findByEmailWithPassword(email: string): Promise<UserDocument | null> {
    return this.userModel
      .findOne({ email: email.trim().toLowerCase() })
      .select('+passwordHash')
      .exec();
  }

  findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).select('-passwordHash').exec();
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

  async getSavedPropertyIds(userId: string): Promise<string[]> {
    const user = await this.userModel
      .findById(userId)
      .select('savedPropertyIds')
      .exec();
    if (!user) throw new NotFoundException('User not found');
    return user.savedPropertyIds.map((id) => String(id));
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
