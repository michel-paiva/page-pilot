import { FastifyPluginAsync } from "fastify";
import { createAuthor, deleteAuthor, getAuthorById, getAuthors, updateAuthor } from "../../../services/author";
import { Author } from "../../../generated/prisma";
import { getBooksByAuthorId } from "../../../services/book";

const authorRoutes: FastifyPluginAsync = async (fastify) => {
    fastify.get("/", async (request, reply) => {
        const { page = 1, limit = 10 } = request.query as { page?: number; limit?: number };
        const authors = await getAuthors({ page: Number(page), limit: Number(limit) });
        return authors;
    });

    fastify.get("/:id", async (request, reply) => {
        const { id } = request.params as { id: string };
        const author = await getAuthorById(id);
        return author;
    });

    fastify.post("/", async (request, reply) => {
        const author = request.body as Author;
        const newAuthor = await createAuthor(author);
        reply.status(201);
        return newAuthor;
    });

    fastify.put("/:id", async (request, reply) => {
        const { id } = request.params as { id: string };
        const author = request.body as Author;
        const updatedAuthor = await updateAuthor(id, author);
        reply.status(200);
        return updatedAuthor;
    });

    fastify.delete("/:id", async (request, reply) => {
        const { id } = request.params as { id: string };
        await deleteAuthor(id);
        reply.status(204);
        return reply.send();
    });

    fastify.get("/:id/books", async (request, reply) => {
        const { id } = request.params as { id: string };
        const { page = 1, limit = 10 } = request.query as { page?: number; limit?: number };
        const books = await getBooksByAuthorId(id, { page: Number(page), limit: Number(limit) });
        return books;
    });
};

export default authorRoutes;