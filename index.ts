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
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));


const corOptions: CorsOptions = {
    origin: [
        "http://localhost:3000",
        "https://portfolio-front-end-00q0.onrender.com"
    ],
    credentials: true,
};
app.use(cors(corOptions));

app.get("/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Serve is Healthy"
    })
})
app.use("/api/auth/user", userRoutes);
app.use("/api/portfolio", PortfolioRoutes);
app.use("/api/payment", paymentRoutes);
app.use(errMiddleware)
let server: ReturnType<typeof app.listen>

const startServer = async () => {
    const PORT = Number(process.env.PORT) || 5000;
    server = app.listen(PORT, "0.0.0.0", async () => {
        logger.info(`Server running on port ${PORT}`);
        try {
            await prisma.$connect();
            logger.info("Database Connected Successfully");
        } catch (dbError) {
            logger.error("Database connection error:", dbError);
        }
    });
    server.on("error", (err) => {
        logger.error("Server failed to start:", err);
        process.exit(1);
    });
};
startServer();
const shutdown = async (signal: string) => {
    logger.info(`${signal}received Shutting Down Gracefully`);
    server.close(async () => {
        await prisma.$disconnect();

        logger.info("Server And Database Connection Failed");
        process.exit(0);
    })
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));