import { razorpay } from "../db/razorpay.js";
import crypto from "crypto";
import type {Request,Response} from "express"
export const createOrder = async (req:Request,res:Response) =>{
    try{
        const options = {
            amount: 50000,
            currency: "INR",
            receipt: "order_rcptid_11", 
        }
        const order = await razorpay.orders.create(options);
        res.json({success: true,order})
    }catch(err:any){
        res.json({success:false, message:err.message})
    }
} 

export const verifyPayment = async(req:Request,res:Response) =>{
    const {razorpay_order_id, razorpay_payment_id, razorpay_signature} = req.body;
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
    .createHmac("sha256",process.env.RAZORPAY_KEY_SECRET!)
    .update(sign)
    .digest("hex")

    if(expectedSign === razorpay_signature){
        return res.json({success: true, message: "Payment Verified"})
    }else{
        return res.json({success: false, message: "Invalid Signature"})   
    }
}