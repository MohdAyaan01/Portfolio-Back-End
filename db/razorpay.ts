import Razorpay from "razorpay";

export const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_API_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!
});