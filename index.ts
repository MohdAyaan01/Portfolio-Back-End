import "dotenv/config";
import { EnvSchema } from "./validation/envValidation.js";
import express from "express";
import { prisma } from "./db/connectDB.js";

import cors from "cors";
import type { CorsOptions } from "cors";

import userRoutes from "./routes/userRoutes.js";
import PortfolioRoutes from "./routes/portfolioRoutes.js";
import paymentRoutes from "./routes/razorpayRoutes.js"
import { errMiddleware } from "./middleware/errorMiddleware.js";
import { GlobalRateLimiter } from "./middleware/rateLimiter.js";
import { logger } from "./utils/logger.js";
import helmet from "helmet";

const app = express();
EnvSchema.parse(process.env);
app.use(helmet());
app.use(GlobalRateLimiter);
app.use(express.json({limit:"1mb"}));
app.use(express.urlencoded({ extended: true, limit:"1mb" }));


const corOptions: CorsOptions = {
    origin: [
        "http://localhost:3000",
        "https://portfolio-front-end-00q0.onrender.com"
    ],
    credentials: true,
};
app.use(cors(corOptions));

app.get("/health",(req,res)=>{
    res.status(200).json({
        success:true,
        message:"Serve is Healthy"
    })
})
app.use("/api/auth/user", userRoutes);
app.use("/api/portfolio", PortfolioRoutes);
app.use("/api/payment", paymentRoutes);
app.use(errMiddleware)
const startServer = async () => {
    try {

        await prisma.$connect();
        logger.info("Database Connected Successfully");

        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            logger.info(`Server Running At PORT ${PORT}`);
        });
    } catch (error) {
        logger.error("Failed to start server:", error);
    }
};

startServer();
