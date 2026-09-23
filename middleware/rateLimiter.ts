import rateLimit from "express-rate-limit";
import { success } from "zod";

export const GlobalRateLimiter = rateLimit({
    windowMs: 15*60*1000,//15 Min
    limit:100,
    message:{
        success:false,
        message:"Too Many Request, Please Try Again Later",
    }
})