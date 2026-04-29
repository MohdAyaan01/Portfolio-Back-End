import { Router } from 'express';
// 1. Import your new controller
import { GeneratePortfolio } from '../controller/portfolioController.js';
// 2. Import standard multer for memory storage
import multer from 'multer';

import { upload } from '../db/cloudinary.js';
import { handleUpload } from '../controller/uploadController.js';

const router = Router();
// Setup a quick memory storage just for parsing resumes locally
const memoryUpload = multer({ storage: multer.memoryStorage() });

// Your existing image upload route
router.post('/upload', upload.single('image'), handleUpload);

// 3. YOUR NEW GENERATOR ROUTE
router.post('/generate', memoryUpload.single('resume'), GeneratePortfolio);

export default router;
