import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppConfigModule } from './config/app-config.module';
import { AppConfigService } from './config/app-config.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PropertiesModule } from './properties/properties.module';
import { InquiriesModule } from './inquiries/inquiries.module';
import { TransactionsModule } from './transactions/transactions.module';
import { BlockchainModule } from './blockchain/blockchain.module';
import { NotificationsModule } from './notifications/notifications.module';
import { HealthController } from './health/health.controller';
import { SeedModule } from './seed/seed.module';

@Module({
  imports: [
    AppConfigModule,
    MongooseModule.forRootAsync({
      inject: [AppConfigService],
      useFactory: async (config: AppConfigService) => ({
        uri: await config.resolveMongoUri(),
      }),
    }),
    SeedModule,
    AuthModule,
    UsersModule,
    PropertiesModule,
    InquiriesModule,
    TransactionsModule,
    BlockchainModule,
    NotificationsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
