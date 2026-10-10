import type {Request,Response,NextFunction} from "express"
import multer from "multer";
import { logger } from "../utils/logger.js";
import {Prisma} from "@prisma/client"
import { success } from "zod";

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
            message:err.message
        });
    }
    if(err.message === "Only PDF And DOCX Files Are Allowed"){
        return res.status(400).json({
            success:false,
            message:err.message
        })
    }
    if(err instanceof Prisma.PrismaClientKnownRequestError){
        switch(err.code){
            case "P2002":
                return res.status(409).json({
                    success: false,
                    message: "A Record With Values Already Exists",
                });
            case "P2025":
                return res.status(404).json({
                    success:false,
                    message: "Record Not Found",
                });
            case "P2003":
                return res.status(400).json({
                    success:false,
                    message: "Related Record Not Exist",
                });
            case "P1001":
            case "P1017":
                return res.status(503).json({
                    success: false,
                    message: "Database Services Is Currently unavailable"
                })       
            default:
                return res.status(500).json({
                    success: false,
                    message: "Database Operation Failed",
                })        
        }
    }
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success:false,
        message:
        statusCode>=500?"Internal Server Error":err.message || "Request Failed"
    })
}
