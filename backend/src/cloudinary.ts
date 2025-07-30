import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

export const storage = new CloudinaryStorage({
    cloudinary,
    params: async(req, file) => {
        return {
            folder: 'avatars',
            allowed_formats: ['jpg', 'jpeg', 'png'],
            transformation: [{ width: 256, height: 256, crop: 'fill' }],
            public_id: `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`
        }
    }
});

export { cloudinary };
