import {z} from "zod";

export const EnvSchema = z.object({
    DATABASE_URL: z.string().min(1),
    SECRET_KEY: z.string().min(1),
    GEMINI_API_KEY: z.string().min(1),
    CLOUDINARY_CLOUD_NAME: z.string().min(1),
    CLOUDINARY_API_KEY: z.string().min(1),
    CLOUDINARY_API_SECRET: z.string().min(1),
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: z.string().min(1),
    GOOGLE_CLIENT_SECRET: z.string().min(1),
    RAZORPAY_API_ID: z.string().min(1),
    RAZORPAY_KEY_SECRET: z.string().min(1),
})