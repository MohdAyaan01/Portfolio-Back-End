import {} from "express"

export const errMiddleware = {
    err: any,
    req: Request,
    res: Response,
    next: NextFunction,
} => {
    console.error(err);
    res.status(statusCode || 500).json({
        success: false,
        message: err.message || "Internal Server Error"    
    })
}
