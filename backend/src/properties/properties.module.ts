import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Property, PropertySchema } from './schemas/property.schema';
import { PropertiesService } from './properties.service';
import { PropertiesController } from './properties.controller';
import { NotificationsModule } from '../notifications/notifications.module';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Property.name, schema: PropertySchema }]),
    BlockchainModule,
    CloudinaryModule,
    UsersModule,
    forwardRef(() => NotificationsModule),
  ],
  controllers: [PropertiesController],
  providers: [PropertiesService],
  exports: [PropertiesService, MongooseModule],
})
export class PropertiesModule {}
