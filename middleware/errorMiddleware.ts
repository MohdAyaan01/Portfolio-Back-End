import type {Request,Response,NextFunction} from "express"
import multer from "multer";
import { logger } from "../utils/logger.js";
export const errMiddleware = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction,
 ) => {
    logger.error(err);
    if(err instanceof multer.MulterError){
        return res.status(400).json({
            success:false,
            message: err.message,
        })
    }
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || "Internal Server Error"    
    })
}
