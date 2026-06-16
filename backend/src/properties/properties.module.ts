import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Property, PropertySchema } from './schemas/property.schema';
import { PropertiesService } from './properties.service';
import { PropertiesController } from './properties.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Property.name, schema: PropertySchema }]),
    forwardRef(() => NotificationsModule),
  ],
  controllers: [PropertiesController],
  providers: [PropertiesService],
  exports: [PropertiesService, MongooseModule],
})
export class PropertiesModule {}
