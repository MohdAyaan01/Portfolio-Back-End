import type { Response, Request, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface JWTPayload {
    userId: string
}
const isAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            console.log("Auth Failure: No token in cookies");
            return res.status(401).json({ message: "User Not Authenticated..." });
        }

        const decode = await jwt.verify(token, process.env.SECRET_KEY as string) as JWTPayload;
        if (!decode) {
            console.log("Auth Failure: Token verification failed");
            return res.status(401).json({ message: "Invalid Token..." });
        }

        console.log("Auth Success: User authenticated with ID:", decode.userId);
        (req as any).id = decode.userId;
        next();
    } catch (err: any) {
        console.error("Authentication Error:", err.message);
        return res.status(401).json({ message: "Authentication Error", error: err.message });
    }
}
export default isAuthenticated