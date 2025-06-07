import { z } from "zod";

export const userSchema = z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    password: z.string(),
    name: z.string().optional(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export const userInputSchema = userSchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true,
}).extend({
    password_confirmation: z.string(),
}).refine((data) => data.password === data.password_confirmation, {
    message: "Passwords do not match",
    path: ["password_confirmation"],
});