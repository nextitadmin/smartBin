// src/config/cloudinary.provider.ts
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';

const storage = new CloudinaryStorage({
  cloudinary,
  params: () => ({
    folder: 'smartbin_profiles',
    format: async () => 'png', // or just `format: 'png'`
    transformation: [{ width: 500, height: 500, crop: 'limit' }],
  }),
});

export const upload = multer({ storage });
