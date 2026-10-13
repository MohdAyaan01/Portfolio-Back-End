import { GoogleGenerativeAI } from "@google/generative-ai"
import type { Request, Response, NextFunction } from "express";
import { v2 as cloudinary } from "cloudinary";
import type { UploadApiResponse } from "cloudinary";
import { createRequire } from "node:module";
import { prisma } from "../db/connectDB.js";
import { Prisma } from "@prisma/client";
import { AppError } from "../middleware/appError.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { GeneratePortfolioOutputSchema } from "../validation/portfolioValidation.js";
import { ZodError } from "zod";
import { logger } from "../utils/logger.js";
const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");
const mammoth = require("mammoth");

const GenAi = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME as string,
    api_key: process.env.CLOUDINARY_API_KEY as string,
    api_secret: process.env.CLOUDINARY_API_SECRET as string,
})
logger.info("Cloudinary Configured In Portfolio Controller")

export const GeneratePortfolio = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).id;
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user || user.credits <= 0) {
            throw new AppError(
                "InSufficient Credits. Please Upgrade Your Plan",
                403
            )
        }
        const { prompt, style } = req.body;
        const resumeFile = req.file;
        let ResumeText = "";

        if (resumeFile) {
            try {
                if (resumeFile.mimetype === 'application/pdf') {
                    const data = await pdf(resumeFile.buffer);
                    ResumeText = data.text;
                } else if (resumeFile.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                    const result = await mammoth.extractRawText({ buffer: resumeFile.buffer });
                    ResumeText = result.value;
                }
            } catch (extractRawError) {
                logger.error("Text Extraction Error:", extractRawError);
            }
        }
        const model = GenAi.getGenerativeModel({
            model: "gemini-2.5-flash", generationConfig: {
                responseMimeType: "application/json",
            }
        });

        const styleInstruction = {
            Professional: "Maintain a formal, corporate tone. Focus on clear achievements and industry-standard terminology.",
            Creative: "Use vibrant, descriptive, and enthusiastic language. Focus on storytelling and unique personality traits.",
            Minimalist: "Keep all text extremely concise and punchy. Use short sentences and eliminate all fluff.",
            Bold: "Use strong action verbs and confident, high-impact language. Make it sound assertive and ambitious."
        }
        const selectedInfo = styleInstruction[style as keyof typeof styleInstruction] || styleInstruction.Professional;

        const MasterPrompt = `
        You are an elite, Silicon-Valley tier Technical Copywriter and Portfolio Architect.
        Your job is to read the user's raw resume/data and transform it into a highly compelling, modern, and high-conversion portfolio website payload.

        GENERATION STYLE: ${style || "Professional"}
        STYLE INSTRUCTIONS: ${selectedInfo}
        
        CRITICAL COPYWRITING RULES:
        1. NO FLUFF: Avoid generic buzzwords like "hardworking team player," "passionate," or "results-driven."
        2. METRIC-DRIVEN: Heavily emphasize numbers, scale, and impact in project descriptions (e.g., "Scaled to 10k users" instead of "Built an app").
        3. MODERN TONE: Sound confident, sharp, and authoritative. Write like a top 1% engineer presenting their work.
        4. "SHOW, DON'T TELL": Instead of saying you are good at React, describe building a high-performance React architecture.

        USER RESUME CONTENT:
        ${ResumeText || "No Resume Provided"}

        USER INSTRUCTIONS:
        ${prompt || "No Specific Instructions Provided"}

        TASK:
        Based on the provided resume and instructions, generate a perfect, production-ready JSON object representing the portfolio content.
            
        THE JSON MUST STRICTLY FOLLOW THIS EXACT STRUCTURE:
        {
            "fullName": "String — The person's full name.",

            "tagline": "String — A short, punchy 1-line role descriptor. E.g., 'Full-Stack Developer (MERN)' or 'AI/ML Engineer & Open Source Contributor'. Make it sharp and specific.",

            "professionalBio": "String — An impactful, beautifully written 3-4 sentence hook about the person. Make it memorable, confident, and results-focused.",

            "skills": {
                "Frontend": ["Array of frontend skill strings, e.g., React, Next.js, TypeScript"],
                "Backend": ["Array of backend skill strings, e.g., Node.js, Express, PostgreSQL"],
                "Tools": ["Array of tool strings, e.g., Git, Docker, Figma"],
                "Cloud/DevOps": ["Array of cloud/devops strings, e.g., AWS, Render, Vercel"]
            },

            "projects": [
                {
                    "title": "Project name",
                    "description": "Focus heavily on the problem solved, tech stack used, and measurable impact metrics. Be specific.",
                    "techStack": ["Array of tech strings used in this project"]
                }
            ],

            "experience": [
                {
                    "companyName": "Company name",
                    "designation": "Job title / role name",
                    "role": "One of: Internship | Full-Time | Part-Time | Freelance | Contract",
                    "startDate": "Start date as string, e.g., Jan 2024",
                    "endDate": "End date as string, e.g., Present or Mar 2025",
                    "description": "2-3 bullet points of key achievements and responsibilities. Be metric-driven and impactful."
                }
            ],

            "education": [
                {
                    "certificateName": "Degree or certificate name, e.g., B.Tech in Computer Science",
                    "institute": "Institution name",
                    "startDate": "Start date as string, e.g., Jun 2021",
                    "endDate": "End date as string, e.g., May 2025",
                    "description": "Optional: relevant coursework, achievements, GPA, or honors."
                }
            ],

            "contactInfo": {
                "email": "Email address, extract from resume or use placeholder",
                "linkedin": "LinkedIn URL or username, extract from resume or use placeholder",
                "github": "GitHub URL or username, extract from resume or use placeholder"
            }
        }

        IMPORTANT RULES:
        - experience and education MUST be arrays, even if there is only one entry.
        - If resume has multiple jobs or degrees, include ALL of them as separate array items.
        - If any field cannot be found in the resume, generate a realistic and appropriate placeholder.
        - You MUST ONLY return raw JSON. No markdown blocks, no triple backticks, and absolutely no surrounding text.
        `;
        let text: string
        try{
        const Result = await model.generateContent(MasterPrompt);
        const response = await Result.response;
        text = response.text();
        }catch(error){
            logger.error("Gemini API Error",{error});
            throw new AppError(
                "AI Service is currently unavailable. Please Try Again Later ",503
            )
        }
        const jsonString = text
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();
        let ParsedPortfolio;
        try {
            ParsedPortfolio = GeneratePortfolioOutputSchema.parse(
                JSON.parse(jsonString)
            );
        } catch (error) {
            if (error instanceof ZodError) {
                throw new AppError(
                    "AI Generated An Invalid Portfolio Structure",
                    502,
                )
            }
            throw error;
        }
        const newPortfolio = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            const creditUpdate = await tx.user.updateMany({
                where: {
                    id: userId,
                    credits: {
                        gt: 0,
                    },
                },
                data: {
                    credits: {
                        decrement: 1
                    }
                }
            });
            if (creditUpdate.count === 0) {
                throw new AppError(
                    "Insufficients Credits. Please Upgrade Your Plan",
                    403
                )
            }
            const portfolio = await tx.portfolio.create({
                data: {
                    userId: (req as any).id,
                    title: ParsedPortfolio.fullName || "My Portfolio",
                    content: ParsedPortfolio,
                    templateId: style || "Professional"
                }
            });
            return portfolio;
        });
        sendSuccess(
            res,
            "Portfolio Generated Successfully",
            newPortfolio,
        )
    } catch (error) {
        next(error)
    }
}


export const GetUserPortfolios = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = (req as any).id;
        const page = Math.max(Number(req.query.page) || 1, 1);
        const reqlimit = Number(req.query.limit) || 10;
        const limit = Math.min(Math.max(reqlimit, 1), 50);
        const skip = (page - 1) * limit;
        const [Portfolios, Total] = await Promise.all([

            prisma.portfolio.findMany({
                where: {
                    userId,
                },
                orderBy: {
                    createdAt: "desc",
                },
                skip,
                take: limit,
            }),
            prisma.portfolio.count({
                where: {
                    userId,
                }
            })
        ])
        const totalPages = Math.ceil(Total / limit)
        return sendSuccess(
            res,
            "Portfolios fetched Successfully",
            {
                Portfolios,
                pagination: {
                    page,
                    limit,
                    Total,
                    totalPages
                }
            }
        );
    } catch (error) {
        next(error);
    }
}

export const GetPortfolioByID = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = (req as any).id;
        const { id } = req.params;
        if (typeof id !== "string") {
            throw new AppError("Invalid POrtfolio ID", 400)
        }
        const portfolio = await prisma.portfolio.findFirst({
            where: {
                id,
                userId,
            }
        })
        if (!portfolio) {
            throw new AppError("Portfolio Not Found", 404);
        }
        return sendSuccess(
            res,
            "Portfolio Fetched Successfully",
            portfolio
        );
    } catch (error) {
        next(error);
    }
}
export const UpdatePortfolio = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { userId } = (req as any).id;
        const { id } = req.params;
        if (typeof id !== "string") {
            throw new AppError("Invalid Portfolio ID", 400)
        };
        const { title, content, templateId } = req.body;
        const Portfolio = await prisma.portfolio.findFirst({
            where: {
                id,
                userId,
            }
        });
        if (!Portfolio) {
            throw new AppError("Portfolio Not Found", 404);
        }
        const updatePortfolio = await prisma.portfolio.update({
            where: {
                id: Portfolio.id,
            },
            data: {
                title,
                content,
                templateId
            },
        });
        return sendSuccess(
            res,
            "Portfolio Updated Successfully",
            updatePortfolio
        );
    } catch (error) {
        next(error);
    }
}

export const DeletePortfolio = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { userId } = (req as any).id;
        const { id } = req.params;
        if (typeof id !== "string") {
            throw new AppError("Invalid Portfolio ID", 400)
        };
        if (typeof id !== "string") {
            throw new AppError("Invalid Portfolio Id", 400)
        }
        const portfolio = await prisma.portfolio.findFirst({
            where: {
                id,
                userId,
            }
        });
        if (!portfolio) {
            throw new AppError("Portfolio Not Found", 404);
        }
        await prisma.portfolio.delete({
            where: {
                id: portfolio.id,
            }
        });
        return sendSuccess(
            res,
            "Portfolio Deleted Successfully"
        )
    } catch (error) {
        next(error)
    }
}