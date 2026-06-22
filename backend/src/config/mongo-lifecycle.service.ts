import {
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import mongoose from 'mongoose';
import { AppConfigService } from './app-config.service';

const MONGO_OPTIONS = {
  maxPoolSize: 20,
  minPoolSize: 2,
  serverSelectionTimeoutMS: 5_000,
  socketTimeoutMS: 30_000,
  maxIdleTimeMS: 60_000,
};

@Injectable()
export class MongoLifecycleService implements OnModuleInit {
  private readonly logger = new Logger(MongoLifecycleService.name);
  private reconnecting = false;
  private reconnectTimer?: ReturnType<typeof setTimeout>;

  constructor(
    private readonly config: AppConfigService,
    private readonly moduleRef: ModuleRef,
  ) {}

  onModuleInit(): void {
    if (this.config.nodeEnv === 'production') {
      return;
    }

    const connection = mongoose.connection;

    connection.on('disconnected', () => {
      this.scheduleReconnect('disconnected');
    });

    connection.on('error', (error: Error) => {
      const message = error.message ?? '';
      if (
        message.includes('ECONNREFUSED') ||
        error.name === 'MongoServerSelectionError'
      ) {
        this.scheduleReconnect(error.name);
      }
    });
  }

  private scheduleReconnect(reason: string): void {
    if (this.reconnectTimer) {
      return;
    }

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = undefined;
      void this.tryReconnect(reason);
    }, 1_000);
  }

  private async tryReconnect(reason: string): Promise<void> {
    if (this.reconnecting || this.config.nodeEnv === 'production') {
      return;
    }

    this.reconnecting = true;

    try {
      this.logger.warn(`MongoDB connection lost (${reason}) — attempting recovery…`);
      const uri = await this.config.ensureMemoryMongoAlive();

      if (mongoose.connection.readyState === 1) {
        await mongoose.disconnect();
      }

      await mongoose.connect(uri, MONGO_OPTIONS);
      this.logger.log(`MongoDB reconnected at ${uri}`);

      await this.reseedIfAvailable();
    } catch (error) {
      this.logger.error(
        'MongoDB reconnect failed — restart the backend or run Docker MongoDB',
        error instanceof Error ? error.message : error,
      );
    } finally {
      this.reconnecting = false;
    }
  }

  private async reseedIfAvailable(): Promise<void> {
    try {
      const { SeedService } = await import('../seed/seed.service');
      const seed = this.moduleRef.get(SeedService, { strict: false });
      await seed.ensureDemoData();
    } catch {
      // SeedModule not loaded (production) or not ready yet
    }
  }
}
