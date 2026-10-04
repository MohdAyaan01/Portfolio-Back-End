import { Router } from 'express';
import { GeneratePortfolio, GetUserPortfolios,GetPortfolioByID } from '../controller/portfolioController.js';
import multer from 'multer';
import { upload } from '../db/cloudinary.js';
import { handleUpload } from '../controller/uploadController.js';
import isAuthenticated from '../middleware/isAuth.js';
import {validate} from "../validation/validate.js";
import {GeneratePortfolioSchema} from "../validation/authValidation.js"

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
            cb(new Error("Only PDF and DOCX files are allowed"))
        }
    }
 });
router.post('/upload',isAuthenticated, upload.single('image'), handleUpload);
router.post('/generate',isAuthenticated,validate(GeneratePortfolioSchema),memoryUpload.single('resume'),GeneratePortfolio);
router.get("/",isAuthenticated,GetUserPortfolios);
router.get("/:id",isAuthenticated,GetPortfolioByID)
export default router;
