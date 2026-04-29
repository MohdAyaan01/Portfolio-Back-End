import { v2 as cloudinary } from 'cloudinary';
//@ts-ignore
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME as string,
  api_key: process.env.CLOUDINARY_API_KEY as string,
  api_secret: process.env.CLOUDINARY_API_SECRET as string,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'profoliox_uploads',
    allowed_formats: ['jpg', 'png', 'jpeg'],
  } as any,
});
export const upload = multer({ storage });