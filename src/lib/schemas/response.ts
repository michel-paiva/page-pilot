import { z } from 'zod';

export const listResponse = (resourceSchema: z.Schema) =>
  z.object({
    data: z.array(resourceSchema),
    meta: z.object({
      total: z.number(),
      page: z.number(),
      totalPages: z.number(),
    }),
  });

export const errorResponse = z.object({
  error: z.string(),
  message: z.string(),
  statusCode: z.number(),
});
