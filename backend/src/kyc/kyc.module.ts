import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  KycSubmission,
  KycSubmissionSchema,
} from './schemas/kyc-submission.schema';
import { KycService } from './kyc.service';
import { KycController } from './kyc.controller';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: KycSubmission.name, schema: KycSubmissionSchema },
    ]),
    CloudinaryModule,
    UsersModule,
  ],
  controllers: [KycController],
  providers: [KycService],
  exports: [KycService],
})
export class KycModule {}
