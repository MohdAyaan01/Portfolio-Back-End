import {z} from "zod";

export const SignUpSchema = z.object({
    name: z.string().min(2,"Name Must Be Atleast 2 Character"),
    email: z.string().email("Invalid Email Address"),
    password: z.string().min(6,"Password Must Be Atleast 6 Characters")
})
