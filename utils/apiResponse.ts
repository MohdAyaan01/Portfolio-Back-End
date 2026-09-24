import type { Response } from "express";
import { success } from "zod";

export const sendSuccess = (
    res: Response,
    message: string,
    data: unknown = null,
    statusCode : number = 200
) =>{
    return res.status(statusCode).json({
        success: true,
        message,
        data,
    });
};