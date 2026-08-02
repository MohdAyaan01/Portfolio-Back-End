import type { Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import { prisma } from "../db/connectDB.js";

const client = new OAuth2Client(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID as string);
export const googleAuth = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({
        message: "Google Token Missing",
        success: false
      });
    }
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID as string
    });
    const payload = ticket.getPayload();
    if (!payload) {
      return res.status(400).json({
        message: "Invalid Google Token",
        success: false
      });
    }
    const { email, name } = payload;
    if (!email) {
      return res.status(400).json({
        message: "Email not found",
        success: false
      });
    }
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          name: name || email.split("@")[0] || "User",
          email,
          password: "google-auth"
        }
      });
    }
    const tokenData = {
      userId: user.id
    };
    const jwtToken = jwt.sign(
      tokenData,
      process.env.SECRET_KEY as string,
      { expiresIn: "1d" }
    );
    const userWithoutPassword = {
      _id: user.id,
      name: user.name,
      email: user.email,
      plan: user.plan,
      credits: user.credits
    };
    return res
      .status(200)
      .cookie("token", jwtToken, {
        httpOnly: true,
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000,
        secure: process.env.NODE_ENV === "production"
      })
      .json({
        message: "Google Login Successfully",
        success: true,
        token: jwtToken,
        user: userWithoutPassword
      });
  } catch (error: any) {
    console.error("Google Auth Error", error.message);
    return res.status(500).json({
      message: "Google Authentication Failed",
      success: false
    });
  }
};