import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { favoriteSchema } from '../../../lib/schemas/favorite';
import { idRequestSchema, paginationSchema } from '../../../lib/schemas/request';
import { errorResponse, listResponse } from '../../../lib/schemas/response';
import { PaginationParams } from '../../../lib/types/pagination';
import { getBookById } from '../../../services/book';
import {
  createFavorite,
  deleteFavorite,
  getFavoriteBooksByUserId,
  getFavoriteByIdAndUserId,
  getFavoriteByUserIdAndBookId,
} from '../../../services/favorite';

const favoriteRoutes: FastifyPluginAsync = async fastify => {
  fastify.get(
    '/',
    {
      schema: {
        querystring: z.object({
          ...paginationSchema,
        }),
        response: {
          200: listResponse(favoriteSchema),
        },
        security: [
          {
            token: [],
          },
        ],
        tags: ['favorites'],
      },
      preHandler: fastify.authenticate,
    },
    async (request, reply) => {
      const userId = (request.user as { userId: string }).userId;
      const { page, limit } = request.query as PaginationParams;
      const favorites = await getFavoriteBooksByUserId(userId, { page, limit });
      return favorites;
    }
  );

  fastify.post(
    '/',
    {
      schema: {
        body: z.object({
          bookId: z.string(),
        }),
        response: {
          201: favoriteSchema,
          404: errorResponse,
          400: errorResponse,
        },
        security: [
          {
            token: [],
          },
        ],
        tags: ['favorites'],
      },
      preHandler: fastify.authenticate,
    },
    async (request, reply) => {
      const userId = (request.user as { userId: string }).userId;
      const { bookId } = request.body as { bookId: string };

      const book = await getBookById(bookId);
      if (!book) {
        reply.status(404);
        return {
          error: 'Book not found',
          message: 'Book not found',
          statusCode: 404,
        };
      }

      const existingFavorite = await getFavoriteByUserIdAndBookId(userId, bookId);
      if (existingFavorite) {
        reply.status(400);
        return {
          error: 'Book already in favorites',
          message: 'Book already in favorites',
          statusCode: 400,
        };
      }

      const favorite = await createFavorite(userId, bookId);
      reply.status(201);
      return favorite;
    }
  );

  fastify.delete(
    '/:id',
    {
      schema: {
        params: idRequestSchema,
        response: {
          204: z.null(),
        },
        tags: ['favorites'],
        security: [
          {
            token: [],
          },
        ],
      },
      preHandler: fastify.authenticate,
    },
    async (request, reply) => {
      const userId = (request.user as { userId: string }).userId;
      const { id } = request.params as { id: string };
      const favorite = await getFavoriteByIdAndUserId(id, userId);

      if (favorite) {
        await deleteFavorite(id);
      }

      reply.status(204);
      return reply.send();
    }
  );
};

export default favoriteRoutes;
