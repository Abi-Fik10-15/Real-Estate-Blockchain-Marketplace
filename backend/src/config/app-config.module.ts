import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppConfigService } from './app-config.service';
import { MongoLifecycleService } from './mongo-lifecycle.service';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../.env'],
    }),
  ],
  providers: [AppConfigService, MongoLifecycleService],
  exports: [AppConfigService],
})
export class AppConfigModule {}
