import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Wallet, ethers } from 'ethers';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

const PLACEHOLDER_PATTERN =
  /your_|YOUR_|change-me|placeholder|example|xxx|<.*>/i;

@Injectable()
export class AppConfigService {
  private readonly logger = new Logger(AppConfigService.name);
  private memoryMongoServer?: MongoMemoryServer;

  constructor(private readonly config: ConfigService) { }

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

  get useMemoryMongo(): boolean {
    return this.getBooleanEnv('MONGODB_USE_MEMORY', false);
  }

  async resolveMongoUri(): Promise<string> {
    if (this.nodeEnv === 'production') {
      return this.mongoUri;
    }

    if (this.useMemoryMongo) {
      return this.getMemoryMongoUri(
        'MONGODB_USE_MEMORY=true is enabled for local development',
      );
    }

    if (await this.canConnectToMongo(this.mongoUri)) {
      return this.mongoUri;
    }

    return this.getMemoryMongoUri(
      `Cannot connect to MongoDB at ${this.mongoUri}; falling back to in-memory MongoDB`,
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

  private async getMemoryMongoUri(reason: string): Promise<string> {
    if (!this.memoryMongoServer) {
      this.logger.warn(reason);
      this.memoryMongoServer = await MongoMemoryServer.create({
        instance: {
          dbName: this.getMongoDbName(),
        },
      });
      this.logger.log(
        `Using in-memory MongoDB for development: ${this.memoryMongoServer.getUri()}`,
      );
    }
    return this.memoryMongoServer.getUri();
  }

  private getMongoDbName(): string {
    const match = this.mongoUri.match(/\/([^/?]+)(\?|$)/);
    return match?.[1] || 'chainestate';
  }

  private getBooleanEnv(key: string, defaultValue: boolean): boolean {
    const rawValue = this.config.get<string>(key);
    if (!rawValue) {
      return defaultValue;
    }
    return ['1', 'true', 'yes', 'on'].includes(rawValue.toLowerCase());
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
        'http://localhost:3001',
        'http://localhost:3002',
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

  get cloudinaryCloudName(): string | undefined {
    return this.config.get<string>('CLOUDINARY_CLOUD_NAME')?.trim();
  }

  get cloudinaryApiKey(): string | undefined {
    return this.config.get<string>('CLOUDINARY_API_KEY')?.trim();
  }

  get cloudinaryApiSecret(): string | undefined {
    return this.config.get<string>('CLOUDINARY_API_SECRET')?.trim();
  }

  /** Public API base URL (no trailing slash), e.g. https://api.example.com */
  get apiPublicUrl(): string | undefined {
    const value = this.config.get<string>('API_PUBLIC_URL')?.trim();
    if (!value) return undefined;
    return value.replace(/\/$/, '');
  }

  /** Base URL for local Swagger server entry (host-aware). */
  get localApiBaseUrl(): string {
    const port = this.port;
    return `http://localhost:${port}`;
  }

  get swaggerEnabled(): boolean {
    return this.getBooleanEnv('SWAGGER_ENABLED', true);
  }

  /** Path segment under /api/ for Swagger UI (default: docs). */
  get swaggerPath(): string {
    const path = this.config.get<string>('SWAGGER_PATH', 'docs')?.trim();
    return path?.replace(/^\/+|\/+$/g, '') || 'docs';
  }

  // ── Email / Resend ───────────────────────────────────────────────────────

  /** Resend API key (https://resend.com). Leave blank in dev to log links to console. */
  get resendApiKey(): string | undefined {
    return this.config.get<string>('RESEND_API_KEY')?.trim() || undefined;
  }

  /** From address used in outgoing emails. Must be a verified domain in Resend. */
  get smtpFrom(): string {
    return (
      this.config.get<string>('EMAIL_FROM')?.trim() ||
      'ChainEstate <noreply@chainestate.io>'
    );
  }

  /** Public URL of the frontend app (no trailing slash). Used in email links. */
  get frontendPublicUrl(): string {
    return (
      this.config.get<string>('FRONTEND_PUBLIC_URL')?.trim().replace(/\/$/, '') ||
      this.frontendOrigins[0] ||
      'http://localhost:3000'
    );
  }

  assertProductionSecrets(): void {
    if (this.nodeEnv !== 'production') return;

    const weakJwt =
      !this.jwtSecret ||
      this.jwtSecret.length < 32 ||
      PLACEHOLDER_PATTERN.test(this.jwtSecret);

    if (weakJwt) {
      throw new Error(
        'Production requires a strong JWT_SECRET (32+ chars, not a placeholder).',
      );
    }
  }
}
