import rateLimit from "express-rate-limit";

export const GlobalRateLimiter = rateLimit({
    windowMs: 15*60*1000,//15 Min
    limit:100,
    message:{
        success:false,
        message:"Too Many Request, Please Try Again Later",
    }
})

export const GenerateRateLimiter = rateLimit({
    windowMs: 15*60*1000,
    limit: 5,
    message: {
        success: false,
        message: "Too Many Portfolios Generation Requests. Please Try Again Later"
    }
})