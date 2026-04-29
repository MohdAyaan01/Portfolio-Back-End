import type { Request,Response } from 'express';
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from '../db/connectDB.js';

interface AuthBody{
  name?: string,
  email: string,
  password: string
}

export const SignUp = async (req:Request, res:Response) => {
  try {
    const { name, email, password } = req.body as AuthBody;
    if (!name || !email || !password) return res.status(400).json({ message: "All Fields Are Required", success: false });

    const user = await prisma.user.findUnique({where: { email }});
    if (user) return res.status(400).json({ message: "User Already Exist...", success: false });

    const saltRounds = Number(process.env.SALT) || 10;
    const hashPassword = await bcrypt.hash(password, saltRounds);
    const newUser = await prisma.user.create({
      data:{
      name,
      email,
      password: hashPassword
      }
    })

    // Remove password before sending
    const userWithoutPassword = {
      _id: newUser.id,
      name: newUser.name,
      email: newUser.email
    };

    return res.status(200).json({
      message: "Account Created SuccessFully...",
      success: true,
      user: userWithoutPassword
    })
  } catch (err:any) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error", success: false });
  }
}

export const Login = async (req:Request, res:Response) => {
  try {
    const { email, password } = req.body as AuthBody;

    if (!email || !password) {
      return res.status(400).json({
        message: "All Fields Are Required...",
        success: false,
      });
    }

    const user = await prisma.user.findUnique({where:{ email }});

    if (!user) {
      return res.status(400).json({
        message: "Incorrect Email And Password...",
        success: false,
      });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        message: "Incorrect Email And Password...",
        success: false,
      });
    }

    const tokenData = {
      userId: user.id,
    };

    const token = jwt.sign(
      tokenData,
      process.env.SECRET_KEY as string,
      { expiresIn: "1d" }
    );

    // Remove password from user object
    const userWithoutPassword = {
      _id: user.id,
      name: user.name,
      email: user.email
    };

    return res
      .status(200)
      .cookie("token", token, {
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: "lax", // Changed from strict for better dev compatibility
      })
      .json({
        message: `${user.name} Login Successfully...`,
        success: true,
        user: userWithoutPassword,
        token: token
      });

  } catch (err:any) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error", success: false });
  }
};

export const Logout = async (req:Request, res:Response) => {
  try {
    return res.status(200).cookie("token", "", { maxAge: 0 }).json({
      message: "Logged Out SuccessFully"
    })
  } catch (err:any) {
    console.log(err);
  }
}
export const getUserHistory = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId as string;
    
    if (!userId) {
        return res.status(400).json({ message: "User ID is required", success: false });
    }

    const portfolios = await prisma.portfolio.findMany({ 
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json(portfolios);
  } catch (error) {
    res.status(500).json({ message: "Error Fetching History" });
  }
}

export const getMe = async (req: any, res: Response) => {
  try {
    const user = await prisma.user.findUnique({ 
      where: { id: req.id } 
    });
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // Remove password
    const { password, ...userWithoutPassword } = user;
    res.status(200).json({ success: true, user: userWithoutPassword });
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
