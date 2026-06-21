import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';
import { LoginDto, RegisterDto, UpdateProfileDto } from './dto/auth.dto';
import type { UserDocument } from '../users/schemas/user.schema';
import { AppConfigService } from '../config/app-config.service';

const VERIFICATION_TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly config: AppConfigService,
    private readonly mailService: MailService,
  ) {}

  async register(dto: RegisterDto): Promise<{ message: string }> {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    await this.usersService.create({
      name: dto.name,
      email: dto.email,
      passwordHash,
      role: dto.role,
      phone: dto.phone ?? '',
      walletAddress: dto.walletAddress ?? '',
      avatar: `https://i.pravatar.cc/150?u=${encodeURIComponent(dto.email)}`,
      kycStatus: 'pending',
      status: 'active',
      emailVerified: true,
    });

    return {
      message: 'Account created. You can now sign in.',
    };
  }

  async verifyEmail(token: string) {
    const user = await this.usersService.findByVerificationToken(token);
    if (!user) {
      throw new BadRequestException(
        'Invalid or expired verification link. Please request a new one.',
      );
    }

    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    return this.buildAuthResponse(user);
  }

  async resendVerification(email: string): Promise<{ message: string }> {
    const user = await this.usersService.findByEmailWithVerification(email);
    if (!user) {
      // Return a generic message to avoid email enumeration
      return { message: 'If that email is registered, a verification link has been sent.' };
    }
    if (user.emailVerified) {
      throw new BadRequestException('This account is already verified. Please log in.');
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS);

    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = verificationExpires;
    await user.save();

    const verifyUrl = `${this.config.frontendPublicUrl}/verify-email?token=${verificationToken}`;
    await this.mailService.sendVerificationEmail({
      to: user.email,
      name: user.name,
      verifyUrl,
    });

    return { message: 'If that email is registered, a verification link has been sent.' };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmailWithPassword(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status !== 'active') {
      throw new UnauthorizedException('Account is suspended');
    }

    return this.buildAuthResponse(user);
  }

  async getProfile(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    if (dto.email) {
      const existing = await this.usersService.findByEmail(dto.email);
      if (existing && existing.id !== userId) {
        throw new ConflictException('Email already in use');
      }
    }

    const user = await this.usersService.updateById(userId, dto);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  private buildAuthResponse(user: UserDocument) {
    const id = String((user as unknown as { _id?: unknown; id?: unknown })._id ?? user.id);
    const payload = { sub: id, email: user.email, role: user.role };
    return {
      accessToken: this.jwtService.sign(payload, {
        secret: this.config.jwtSecret,
        expiresIn: this.config.jwtExpiresIn as `${number}d`,
      }),
      user,
    };
  }
}
