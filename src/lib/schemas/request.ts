import { z } from 'zod';

export const idRequestSchema = z.object({
  id: z.string().uuid(),
});

export const paginationSchema = {
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
};
