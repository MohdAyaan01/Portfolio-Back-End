import { z } from "zod";

export const GeneratePortfolioOutputSchema = z.object({
    fullName: z.string(),
    professionalBio: z.string(),

    skills: z.object({
        Frontend: z.array(z.string()),
        Backend: z.array(z.string()),
        Tools: z.array(z.string()),
        "Cloud/DevOps": z.array(z.string()),
    }),
    projects: z.array(
        z.object({
            title: z.string(),
            description: z.string(),
            techStack: z.array(z.string()),
        })
    ),
    contactInfo: z.object({
        email: z.string(),
        linkedin: z.string(),
        github: z.string(),
    }),
    experience: z.array(z.object({
        companyName: z.string(),
        designation: z.string(),
        startDate: z.string(),
        endDate: z.string(),
        description: z.string(),
        role: z.string(),
    })),
    education: z.array(z.object({
        certificateName: z.string(),
        institute: z.string(),
        startDate: z.string(),
        endDate: z.string(),
        description: z.string(),
    })),
    tagline: z.string(),
})
export const updatePortfolioSchema = z.object({
    title: z.string().min(1, "Title Is Required"),
    content: z.record(z.string(), z.any()),
    templateId: z.string().optional(),
})