import type { Response, Request, NextFunction } from "express";

import jwt from "jsonwebtoken";
import { AppError } from "./appError.js";
import { logger } from "../utils/logger.js";

interface JWTPayload {
    userId: string
}
const isAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const authHeader = req.headers.authorization;
        const token = authHeader?.startsWith("Bearer")?authHeader.slice(7):null

        if (!token) {
            throw new AppError("User Not Authenticated",401);
        }

        const decode = await jwt.verify(token, process.env.SECRET_KEY as string) as JWTPayload;
        if (!decode) {
            logger.info("Auth Failure: Token verification failed");
            return res.status(401).json({ message: "Invalid Token..." });
        }

        logger.info("Auth Success: User authenticated with ID:", decode.userId);
        (req as any).id = decode.userId;
        next();
    } catch (err: unknown) {
        logger.error("Authentication Error");
        next(new AppError("Invalid And Expired Token",401));
    }
}
export default isAuthenticated