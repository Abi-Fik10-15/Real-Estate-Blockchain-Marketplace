import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Wallet, ethers } from 'ethers';

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
