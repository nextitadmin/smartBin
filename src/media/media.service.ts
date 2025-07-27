import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigAttributes } from '@src/config';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class MediaService {
  constructor(private readonly configService: ConfigService<ConfigAttributes>) {
    const cloudinaryConfig = this.configService.get('cloudinary');
    cloudinary.config({
      cloud_name: cloudinaryConfig?.cloudName,
      api_key: cloudinaryConfig?.apiKey,
      api_secret: cloudinaryConfig?.apiSecret,
    });
  }

  async fileUpload(
    buffer: Buffer,
  ): Promise<{ fileUrl: string; message: string }> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'avatar',
        },
        (error, result) => {
          if (error) return reject(error);
          resolve({
            fileUrl: result.secure_url,
            message: 'file uploaded successfully',
          });
        },
      );

      const readable = new Readable();
      readable.push(buffer);
      readable.push(null);
      readable.pipe(uploadStream);
    });
  }
}
