import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { MailService } from '../mail/mail.service';
import { AppConfigService } from '../config/app-config.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly mailService: MailService,
    private readonly config: AppConfigService,
  ) {}

  create(data: Partial<User>): Promise<UserDocument> {
    return this.userModel.create(data);
  }

  findAll(): Promise<UserDocument[]> {
    return this.userModel.find().select('-passwordHash').lean({ virtuals: true }).exec() as unknown as Promise<UserDocument[]>;
  }

  findAgents(options?: { verifiedOnly?: boolean }): Promise<UserDocument[]> {
    const filter: Record<string, unknown> = { role: 'agent', status: 'active' };
    if (options?.verifiedOnly) {
      filter.kycStatus = 'verified';
    }

    return this.userModel
      .find(filter)
      .select('-passwordHash')
      .sort({ name: 1 })
      .lean({ virtuals: true })
      .exec() as unknown as Promise<UserDocument[]>;
  }

  async lookupAgentByEmail(email: string): Promise<UserDocument | null> {
    const user = await this.findByEmail(email.trim().toLowerCase());
    if (!user || user.role !== 'agent' || user.status !== 'active') {
      return null;
    }
    return user;
  }

  async inviteAgent(
    owner: UserDocument,
    email: string,
    message?: string,
  ): Promise<{ status: 'existing' | 'invited'; message: string; user?: UserDocument }> {
    const normalized = email.trim().toLowerCase();
    const existing = await this.findByEmail(normalized);

    if (existing) {
      if (existing.role === 'agent' && existing.status === 'active') {
        return {
          status: 'existing',
          message: 'This email is already registered as an active agent.',
          user: existing,
        };
      }
      throw new ConflictException(
        'This email belongs to an account that is not an active agent.',
      );
    }

    const registerUrl = `${this.config.frontendPublicUrl}/register?role=agent&email=${encodeURIComponent(normalized)}`;

    await this.mailService.sendAgentInviteEmail({
      to: normalized,
      ownerName: owner.name,
      registerUrl,
      message,
    });

    return {
      status: 'invited',
      message: 'Invitation sent. They can register using the agent signup link.',
    };
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
