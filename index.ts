import "dotenv/config";
import express from "express";
import { prisma } from "./db/connectDB.js";

import cors from "cors";
import type { CorsOptions } from "cors";

import userRoutes from "./routes/userRoutes.js";
import PortfolioRoutes from "./routes/portfolioRoutes.js";
import paymentRoutes from "./routes/razorpayRoutes.js"

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const corOptions: CorsOptions = {
    origin: [
        "http://localhost:3000",
        "https://portfolio-front-end-00q0.onrender.com"
    ],
    credentials: true,
};
app.use(cors(corOptions));

app.use("/api/auth/user", userRoutes);
app.use("/api/portfolio", PortfolioRoutes);
app.use("/api/payment", paymentRoutes);
const startServer = async () => {
    try {

        await prisma.$connect();
        console.log("Database Connected Successfully");

        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            console.log(`Server Running At PORT ${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error);
    }
};

startServer();
