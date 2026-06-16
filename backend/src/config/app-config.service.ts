import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Wallet, ethers } from 'ethers';
import mongoose from 'mongoose';

const PLACEHOLDER_PATTERN =
  /your_|YOUR_|change-me|placeholder|example|xxx|<.*>/i;

@Injectable()
export class AppConfigService {
  constructor(private readonly config: ConfigService) {}

  get port(): number {
    return this.config.get<number>('PORT', 3001);
  }

  get mongoUri(): string {
    return this.config.get<string>(
      'MONGODB_URI',
      'mongodb://localhost:27017/chainestate',
    );
  }

  get nodeEnv(): string {
    return this.config.get<string>('NODE_ENV', 'development');
  }

  async resolveMongoUri(): Promise<string> {
    if (this.nodeEnv === 'production') {
      return this.mongoUri;
    }

    if (await this.canConnectToMongo(this.mongoUri)) {
      return this.mongoUri;
    }

    throw new Error(
      `Cannot connect to MongoDB at ${this.mongoUri}. Start MongoDB (e.g. docker compose up in backend/) or update MONGODB_URI in .env`,
    );
  }

  private async canConnectToMongo(uri: string): Promise<boolean> {
    try {
      const connection = await mongoose
        .createConnection(uri, {
          serverSelectionTimeoutMS: 1_000,
        })
        .asPromise();
      await connection.close();
      return true;
    } catch {
      return false;
    }
  }

  get jwtSecret(): string {
    return this.config.get<string>('JWT_SECRET', 'chainestate-dev-secret');
  }

  get jwtExpiresIn(): string {
    return this.config.get<string>('JWT_EXPIRES_IN', '7d');
  }

  get frontendOrigin(): string {
    return this.config.get<string>(
      'FRONTEND_ORIGIN',
      'http://localhost:3000',
    );
  }

  get frontendOrigins(): string[] {
    const configuredOrigins = this.frontendOrigin
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean);

    if (this.nodeEnv === 'production') {
      return configuredOrigins;
    }

    return Array.from(
      new Set([
        ...configuredOrigins,
        'http://localhost:3000',
        'http://localhost:5173',
      ]),
    );
  }

  get sepoliaRpcUrl(): string | undefined {
    const value = this.config.get<string>('SEPOLIA_RPC_URL')?.trim();
    if (!value || PLACEHOLDER_PATTERN.test(value)) return undefined;
    try {
      new URL(value);
      return value;
    } catch {
      return undefined;
    }
  }

  get deployerPrivateKey(): string | undefined {
    const value = this.config.get<string>('PRIVATE_KEY')?.trim();
    if (!value || PLACEHOLDER_PATTERN.test(value)) return undefined;
    try {
      new Wallet(value);
      return value;
    } catch {
      return undefined;
    }
  }

  get contractAddress(): string | undefined {
    const value = this.config.get<string>('CONTRACT_ADDRESS')?.trim();
    if (!value || PLACEHOLDER_PATTERN.test(value)) return undefined;
    return ethers.isAddress(value) ? value : undefined;
  }

  get blockchainEnabled(): boolean {
    return Boolean(
      this.sepoliaRpcUrl &&
        this.deployerPrivateKey &&
        this.contractAddress,
    );
  }
}
