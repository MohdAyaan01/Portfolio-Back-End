import {z} from "zod";

export const GeneratePortfolioOutputSchema = z.object({
    fullName: z.string(),
    professionalBio: z.string(),

    skills: z.object({
        Frontend: z.array(z.string()),
        Backend: z.array(z.string()),
        Tools: z.array(z.string()),
        "Cloud/DevOps":z.array(z.string()),
    }),
    projects:z.array(
        z.object({
            title:z.string(),
            description:z.string(),
            techStack: z.array(z.string()),
        })
    ),
    contactInfo: z.object({
        email:z.string(),
        linkedin: z.string(),
        github: z.string(),
    }),
})