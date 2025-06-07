import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { Book } from '../../../generated/prisma';
import { bookInputSchema, bookSchema } from '../../../lib/schemas/book';
import { idRequestSchema, paginationSchema } from '../../../lib/schemas/request';
import { errorResponse, listResponse } from '../../../lib/schemas/response';
import { getAuthorById } from '../../../services/author';
import { createBook, deleteBook, getBookById, getBooks, updateBook } from '../../../services/book';

const bookRoutes: FastifyPluginAsync = async fastify => {
  fastify.get(
    '/',
    {
      schema: {
        querystring: z.object({
          ...paginationSchema,
        }),
        response: {
          200: listResponse(bookSchema),
        },
        tags: ['books'],
      },
    },
    async (request, reply) => {
      const { page = 1, limit = 10 } = request.query as { page?: number; limit?: number };
      const books = await getBooks({ page: Number(page), limit: Number(limit) });
      return books;
    }
  );

  fastify.get(
    '/:id',
    {
      schema: {
        params: idRequestSchema,
        response: {
          200: bookSchema,
          404: errorResponse,
        },
        tags: ['books'],
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const book = await getBookById(id);
      if (!book) {
        reply.status(404);
        return {
          error: 'Book not found',
          message: 'Book not found',
          statusCode: 404,
        };
      }
      return book;
    }
  );

  fastify.post(
    '/',
    {
      schema: {
        body: bookInputSchema,
        response: {
          201: bookSchema,
          422: errorResponse,
        },
        tags: ['books'],
      },
    },
    async (request, reply) => {
      const book = request.body as Book;

      const author = await getAuthorById(book.authorId);
      if (!author) {
        reply.status(404);
        return {
          error: 'Author not found',
          message: 'Author not found',
          statusCode: 404,
        };
      }

      const newBook = await createBook(book);
      reply.status(201);
      return newBook;
    }
  );

  fastify.put(
    '/:id',
    {
      schema: {
        params: idRequestSchema,
        body: bookInputSchema,
        response: {
          200: bookSchema,
          422: errorResponse,
          404: errorResponse,
        },
        tags: ['books'],
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const book = request.body as Book;
      const existingBook = await getBookById(id);
      if (!existingBook) {
        reply.status(404);
        return {
          error: 'Book not found',
          message: 'Book not found',
          statusCode: 404,
        };
      }

      const author = await getAuthorById(book.authorId);

      if (!author) {
        reply.status(404);
        return {
          error: 'Author not found',
          message: 'Author not found',
          statusCode: 404,
        };
      }

      const updatedBook = await updateBook(id, book);
      reply.status(200);
      return updatedBook;
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
        tags: ['books'],
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const book = await getBookById(id);
      if (book) {
        await deleteBook(id);
      }

      reply.status(204);
      return reply.send();
    }
  );
};

export default bookRoutes;
