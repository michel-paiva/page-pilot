import { z } from 'zod';

export const bookSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  summary: z.string(),
  publicationYear: z.number(),
  coverUrl: z.string().optional().nullable(),
  authorId: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const bookInputSchema = bookSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  coverUrl: true,
});
