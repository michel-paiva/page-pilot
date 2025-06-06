import { FastifyPluginAsync } from "fastify";
import { createBook, deleteBook, getBookById, getBooks, updateBook } from "../../../services/book";
import { Book } from "../../../generated/prisma";

const bookRoutes: FastifyPluginAsync = async (fastify) => {
    fastify.get("/", async (request, reply) => {
        const { page = 1, limit = 10 } = request.query as { page?: number; limit?: number };
        const books = await getBooks({ page: Number(page), limit: Number(limit) });
        return books;
    });

    fastify.get("/:id", async (request, reply) => {
        const { id } = request.params as { id: string };
        const book = await getBookById(id);
        return book;
    });

    fastify.post("/", async (request, reply) => {
        const book = request.body as Book;
        const newBook = await createBook(book);
        reply.status(201);
        return newBook;
    });

    fastify.put("/:id", async (request, reply) => {
        const { id } = request.params as { id: string };
        const book = request.body as Book;
        const updatedBook = await updateBook(id, book);
        reply.status(200);
        return updatedBook;
    });

    fastify.delete("/:id", async (request, reply) => {
        const { id } = request.params as { id: string };
        await deleteBook(id);
        reply.status(204);
        return reply.send();
    });
};

export default bookRoutes;