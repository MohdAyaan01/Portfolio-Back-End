import express, { Router } from "express";
import { createOrder, verifyPayment } from "../controller/razorpayController.js";

const router = express.Router();

router.post("/create-order",createOrder);
router.post("/verify-payment",verifyPayment);

export default router;

