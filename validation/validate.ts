import type { Request, Response, NextFunction } from "express";
import { success, type ZodSchema } from "zod";

export const validate = (schema:ZodSchema) => {
    return(req:Request, res:Response, next:NextFunction) => {
        const result = schema.safeParse(req.body);

        if(!result.success){
            return res.status(400).json({
                success:false,
                message: "Validation Failed",
                errors: result.error.flatten().fieldErrors,
            });
        }
        req.body = result.data;
        next();
    }
}