import { z } from "zod";

export const authorSchema = z.object({
    id: z.string(),
    name: z.string(),
    bio: z.string(),
    birthYear: z.number(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export const authorInputSchema = authorSchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});