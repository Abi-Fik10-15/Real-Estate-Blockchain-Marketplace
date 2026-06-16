import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Inquiry, InquirySchema } from './schemas/inquiry.schema';
import { InquiriesService } from './inquiries.service';
import { InquiriesController } from './inquiries.controller';
import { PropertiesModule } from '../properties/properties.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Inquiry.name, schema: InquirySchema }]),
    PropertiesModule,
    forwardRef(() => NotificationsModule),
  ],
  controllers: [InquiriesController],
  providers: [InquiriesService],
  exports: [InquiriesService],
})
export class InquiriesModule {}
