import { GoogleGenerativeAI } from "@google/generative-ai"
import type { Request, Response } from "express";
import { v2 as cloudinary } from "cloudinary";
import type { UploadApiResponse } from "cloudinary";
import { toast } from "react-hot-toast"
import { createRequire } from "node:module";
import { buffer } from "node:stream/consumers";
import { prisma } from "../db/connectDB.js";
const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");
const mammoth = require("mammoth");

const GenAi = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME as string,
    api_key: process.env.CLOUDINARY_API_KEY as string,
    api_secret: process.env.CLOUDINARY_API_SECRET as string,
})
console.log("Cloudinary Configured In Portfolio Controller")

export const GeneratePortfolio = async (req: Request, res: Response) => {
    try {
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
                console.error("Text Extraction Error:", extractRawError);
            }
        }
        const model = GenAi.getGenerativeModel({ model: "gemini-2.5-flash" });

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
            
            THE JSON MUST STRICTLY INCLUDE:
            - fullName (String: The person's name)
            - professionalBio (String: An impactful, beautifully written 3-4 sentence hook. Make it memorable.)
            - skills (Object: Group into exact categories: "Frontend", "Backend", "Tools", "Cloud/DevOps". Return arrays of strings.)
            - projects (Array of objects: Each must have 'title', 'description' (Focus heavily on the problem solved, tech stack, and impact metrics), and 'techStack' (Array of strings))
            - contactInfo (Object: 'email', 'linkedin', 'github'. Extract from resume or use placeholders)

            WARNING: You MUST ONLY return raw JSON. No markdown blocks, no triple backticks, and absolutely no surrounding text.
        `;
        const Result = await model.generateContent(MasterPrompt);
        const response = await Result.response;
        const text = response.text();

        const jsonStart = text.indexOf('{');
        const jsonEnd = text.lastIndexOf('}') + 1;

        if (jsonStart === -1 || jsonEnd === 0) {
            throw new Error("AI Failed to return a valid JSON Structure");
        }
        const jsonString = text.slice(jsonStart, jsonEnd);
        const ParsedPortfolio = JSON.parse(jsonString);

         const newPortfolio = await prisma.portfolio.create({
            data: {
                userId: (req as any).id, // From your isAuth middleware
                title: ParsedPortfolio.fullName || "My Portfolio",
                content: ParsedPortfolio,
                templateId: style || "Professional"
            }
        });
        res.status(200).json(newPortfolio);
    } catch (error: any) {
        console.error("Critical Generation Error", error);
        res.status(500).json({
            message: "Failed To Generate Portfolio.",
            error: error.message
        })
    }
}

