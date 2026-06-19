import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Property, PropertyDocument } from '../properties/schemas/property.schema';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Property.name)
    private readonly propertyModel: Model<PropertyDocument>,
  ) {}

  async onModuleInit() {
    this.logger.log('Ensuring demo users exist…');

    // Check if demo users already exist before hashing (skips bcrypt on warm boots)
    const existingCount = await this.userModel.countDocuments({
      email: { $in: ['sophia@chainestate.io', 'elena@chainestate.io', 'admin@chainestate.io'] },
    });

    if (existingCount >= 3) {
      const propCount = await this.propertyModel.countDocuments();
      if (propCount > 0) {
        this.logger.log('Seed already complete — skipping.');
        return;
      }
    }

    const passwordHash = await bcrypt.hash('DemoPassword123!', 10);

    const demoUsers: Partial<User>[] = [
      {
        name: 'Sophia Bennett',
        email: 'sophia@chainestate.io',
        passwordHash,
        role: 'owner',
        phone: '+1 415 555 0132',
        walletAddress: '0xA4B7C2D9E1F3A5B7C9D1E3F5A7B9C1D3E5F7D81F',
        avatar: 'https://i.pravatar.cc/150?img=47',
        kycStatus: 'verified',
        status: 'active',
      },
      {
        name: 'Marcus Reed',
        email: 'marcus@chainestate.io',
        passwordHash,
        role: 'agent',
        phone: '+1 312 555 0177',
        walletAddress: '0xC81F3B7A2E9D4C6F8A1B3D5E7F9A2C4B6D8E0F11',
        avatar: 'https://i.pravatar.cc/150?img=12',
        kycStatus: 'verified',
        status: 'active',
      },
      {
        name: 'Elena Cruz',
        email: 'elena@chainestate.io',
        passwordHash,
        role: 'buyer',
        phone: '+1 206 555 0144',
        walletAddress: '0xD12E4F6A8B0C2D4E6F8A0B2C4D6E8F0A2B4C6D88',
        avatar: 'https://i.pravatar.cc/150?img=32',
        kycStatus: 'verified',
        status: 'active',
      },
      {
        name: 'Admin Control',
        email: 'admin@chainestate.io',
        passwordHash,
        role: 'admin',
        walletAddress: '0x000000000000000000000000000000000000d6e8',
        avatar: 'https://i.pravatar.cc/150?img=5',
        kycStatus: 'verified',
        status: 'active',
      },
    ];

    const [owner, agent] = await Promise.all(
      demoUsers.map((user) =>
        this.userModel.findOneAndUpdate(
          { email: user.email },
          { $set: user },
          { new: true, upsert: true },
        ).orFail().exec(),
      ),
    );

    const count = await this.propertyModel.countDocuments();
    if (count > 0) {
      this.logger.log(
        'Demo users ready — login with sophia@chainestate.io / DemoPassword123! (owner), elena@chainestate.io (buyer), admin@chainestate.io (admin)',
      );
      return;
    }

    this.logger.log('Seeding demo properties…');

    const images = [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?auto=format&fit=crop&w=1200&q=80',
    ];

    const listings = [
      {
        title: 'Skyline Penthouse',
        city: 'San Francisco',
        price: 2450000,
        type: 'Apartment',
        bedrooms: 3,
        bathrooms: 3,
        area: 2800,
        featured: true,
        status: 'active' as const,
      },
      {
        title: 'Marina Bay Villa',
        city: 'Miami',
        price: 1890000,
        type: 'Villa',
        bedrooms: 4,
        bathrooms: 4,
        area: 4200,
        featured: true,
        status: 'active' as const,
      },
      {
        title: 'Downtown Loft',
        city: 'Austin',
        price: 875000,
        type: 'Condo',
        bedrooms: 2,
        bathrooms: 2,
        area: 1450,
        featured: false,
        status: 'active' as const,
      },
      {
        title: 'Lakeview Estate',
        city: 'Chicago',
        price: 3200000,
        type: 'House',
        bedrooms: 5,
        bathrooms: 4,
        area: 5100,
        featured: true,
        status: 'pending' as const,
      },
    ];

    await this.propertyModel.insertMany(
      listings.map((l, i) => ({
        ownerId: owner._id,
        agentId: i % 2 === 0 ? agent._id : undefined,
        title: l.title,
        description: `${l.title} is a premium blockchain-verified listing on ChainEstate.`,
        price: l.price,
        currency: 'USD',
        status: l.status,
        type: l.type,
        listingType: 'sale',
        location: {
          address: `${100 + i} Main Street`,
          city: l.city,
          country: 'USA',
          lat: 37.77 + i * 0.1,
          lng: -122.41 - i * 0.1,
        },
        bedrooms: l.bedrooms,
        bathrooms: l.bathrooms,
        area: l.area,
        blockchainTokenId: `${1000 + i}`,
        ownerWallet: owner.walletAddress,
        agentWallet: i % 2 === 0 ? agent.walletAddress : '',
        images: [images[i % images.length]],
        documents: [],
        featured: l.featured,
        views: 120 + i * 15,
        saves: 10 + i,
      })),
    );

    this.logger.log(
      `Seed complete — login with sophia@chainestate.io / DemoPassword123! (owner), elena@chainestate.io (buyer), admin@chainestate.io (admin)`,
    );
  }
}
