import { FastifyPluginAsync } from "fastify";
import { createAuthor, deleteAuthor, getAuthorById, getAuthors, updateAuthor } from "../../../services/author";
import { Author } from "../../../generated/prisma";
import { getBooksByAuthorId } from "../../../services/book";
import { z } from "zod";
import { PaginationParams } from "../../../lib/types/pagination";
import { listResponse, errorResponse } from "../../../lib/schemas/response";
import { authorInputSchema, authorSchema } from "../../../lib/schemas/author";
import { idRequestSchema, paginationSchema } from "../../../lib/schemas/request";
import { bookSchema } from "../../../lib/schemas/book";

const authorRoutes: FastifyPluginAsync = async (fastify) => {
    fastify.get("/", {
        schema: {
            querystring: z.object({
                ...paginationSchema,
            }),
            response: {
                200: listResponse(authorSchema)
            },
            tags: ["authors"],
        }
    }, async (request, reply) => {
        const { page = 1, limit = 10 } = request.query as PaginationParams;
        const authors = await getAuthors({ page: Number(page), limit: Number(limit) });
        return authors;
    });

    fastify.get("/:id", {
        schema: {
            params: idRequestSchema,
            response: {
                200: authorSchema,
                404: errorResponse,
            },
            tags: ["authors"],
        }
    }, async (request, reply) => {
        const { id } = request.params as { id: string };
        const author = await getAuthorById(id);
        if (!author) {
            reply.status(404);
            return {
                error: "Author not found",
                message: "Author not found",
                statusCode: 404,
            };
        }
        return author;
    });

    fastify.post("/", {
        schema: {
            body: authorInputSchema,
            response: {
                201: authorSchema,
                422: errorResponse,
            },
            tags: ["authors"],
        }
    }, async (request, reply) => {
        const author = request.body as Author;
        const newAuthor = await createAuthor(author);
        reply.status(201);
        return newAuthor;
    });

    fastify.put("/:id", {
        schema: {
            params: idRequestSchema,
            body: authorInputSchema,
            response: {
                200: authorSchema,
                422: errorResponse,
                404: errorResponse,
            },
            tags: ["authors"],
        }
    }, async (request, reply) => {
        const { id } = request.params as { id: string };
        const author = request.body as Author;
        const existingAuthor = await getAuthorById(id);
        if (!existingAuthor) {
            reply.status(404);
            return {
                error: "Author not found",
                message: "Author not found",
                statusCode: 404,
            };
        }
        const updatedAuthor = await updateAuthor(id, author);
        reply.status(200);
        return updatedAuthor;
    });

    fastify.delete("/:id", {
        schema: {
            params: idRequestSchema,
            response: {
                204: z.null(),
            },
            tags: ["authors"],
        }
    }, async (request, reply) => {
        const { id } = request.params as { id: string };
        const author = await getAuthorById(id);
        if (author) {
            await deleteAuthor(id);
        }

        reply.status(204);
        return reply.send();
    });

    fastify.get("/:id/books", {
        schema: {
            params: idRequestSchema,
            querystring: z.object({
                ...paginationSchema,
            }),
            response: {
                200: listResponse(bookSchema),
            },
            tags: ["authors"],
        }
    }, async (request, reply) => {
        const { id } = request.params as { id: string };
        const { page = 1, limit = 10 } = request.query as { page?: number; limit?: number };
        const books = await getBooksByAuthorId(id, { page: Number(page), limit: Number(limit) });
        return books;
    });
};

export default authorRoutes;