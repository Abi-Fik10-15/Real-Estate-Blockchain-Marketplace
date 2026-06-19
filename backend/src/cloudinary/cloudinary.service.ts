import { Injectable, Logger } from '@nestjs/common';
import {
  v2 as cloudinary,
  type UploadApiErrorResponse,
  type UploadApiResponse,
} from 'cloudinary';
import { AppConfigService } from '../config/app-config.service';

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);
  private isConfigured = false;

  constructor(private readonly config: AppConfigService) {
    const cloudName = this.config.cloudinaryCloudName;
    const apiKey = this.config.cloudinaryApiKey;
    const apiSecret = this.config.cloudinaryApiSecret;

    if (cloudName && apiKey && apiSecret) {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
      });
      this.isConfigured = true;
      this.logger.log('Cloudinary successfully configured');
    } else {
      this.logger.warn(
        'Cloudinary credentials missing. Using local mock storage fallback.',
      );
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    folder = 'chainestate',
  ): Promise<{ url: string; publicId: string }> {
    if (!this.isConfigured) {
      const mockPublicId = `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const base64Data = file.buffer.toString('base64');
      const dataUrl = `data:${file.mimetype};base64,${base64Data}`;
      this.logger.log(`Mock uploaded file. Generated mock publicId: ${mockPublicId}`);
      return {
        url: dataUrl,
        publicId: mockPublicId,
      };
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder },
        (
          error: UploadApiErrorResponse | undefined,
          result: UploadApiResponse | undefined,
        ) => {
          if (error) {
            this.logger.error('Cloudinary upload failed:', error);
            return reject(error);
          }
          if (!result) {
            return reject(new Error('Cloudinary upload returned empty result'));
          }
          this.logger.log(`File uploaded to Cloudinary: ${result.secure_url}`);
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        },
      );
      uploadStream.end(file.buffer);
    });
  }
}
