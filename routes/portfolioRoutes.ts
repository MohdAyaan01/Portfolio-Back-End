import { Router } from 'express';
import { GeneratePortfolio, GetUserPortfolios,GetPortfolioByID,UpdatePortfolio, DeletePortfolio } from '../controller/portfolioController.js';
import multer, { MulterError } from 'multer';
import { upload } from '../db/cloudinary.js';
import { handleUpload } from '../controller/uploadController.js';
import isAuthenticated from '../middleware/isAuth.js';
import {validate} from "../validation/validate.js";
import {GeneratePortfolioSchema} from "../validation/authValidation.js"
import { updatePortfolioSchema } from '../validation/portfolioValidation.js';
import { GenerateRateLimiter } from '../middleware/rateLimiter.js';
const router = Router();
const memoryUpload = multer({ storage: multer.memoryStorage(),
    limits:{
        fileSize: 5*1024*1024,
    },
    fileFilter:(req,file,cb)=>{
        const AllowedTypes = [
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ];
        if(AllowedTypes.includes(file.mimetype)){
            cb(null,true);
        }else{
            cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE","resume"))
        }
    }
});
router.post('/upload',isAuthenticated, upload.single('image'), handleUpload);
router.post('/generate',isAuthenticated,GenerateRateLimiter,validate(GeneratePortfolioSchema),memoryUpload.single('resume'),GeneratePortfolio);
router.get("/",isAuthenticated,GetUserPortfolios);
router.get("/:id",isAuthenticated,GetPortfolioByID);
router.put("/:id",isAuthenticated,validate(updatePortfolioSchema),UpdatePortfolio)
router.delete("/:id",isAuthenticated,DeletePortfolio)
export default router;
