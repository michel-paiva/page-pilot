import { z } from "zod";
import { bookSchema } from "./book";

export const favoriteSchema = z.object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    bookId: z.string().uuid(),
    createdAt: z.date(),
    book: bookSchema,
});

export const favoriteInputSchema = favoriteSchema.omit({
    id: true,
    createdAt: true,
    book: true,
});