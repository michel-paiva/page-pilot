import { Book } from '../generated/prisma';
import prisma from '../lib/prisma';
import { PaginatedResponse, PaginationParams } from '../lib/types/pagination';
import { publishBookCoverRequest } from '../subscribers/book';

const getBooks = async ({
  page = 1,
  limit = 10,
}: PaginationParams): Promise<PaginatedResponse<Book>> => {
  const skip = (page - 1) * limit;

  const [books, total] = await Promise.all([
    prisma.book.findMany({
      skip,
      take: limit,
      orderBy: {
        title: 'asc',
      },
    }),
    prisma.book.count(),
  ]);

  return {
    data: books,
    meta: {
      total,
      page,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getBookById = async (id: string) => {
  const book = await prisma.book.findUnique({
    where: { id },
  });
  return book;
};

const createBook = async (book: Book) => {
  const newBook = await prisma.book.create({
    data: book,
  });

  await publishBookCoverRequest(newBook.id, newBook.title);

  return newBook;
};

const updateBook = async (id: string, book: Book) => {
  const updatedBook = await prisma.book.update({
    where: { id },
    data: book,
  });
  return updatedBook;
};

const deleteBook = async (id: string) => {
  const deletedBook = await prisma.book.delete({
    where: { id },
  });
  return deletedBook;
};

const getBooksByAuthorId = async (authorId: string, { page = 1, limit = 10 }: PaginationParams) => {
  const skip = (page - 1) * limit;
  const [books, total] = await Promise.all([
    prisma.book.findMany({
      where: { authorId },
      skip,
      take: limit,
    }),
    prisma.book.count({
      where: { authorId },
    }),
  ]);

  return {
    data: books,
    meta: {
      total,
      page,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export { createBook, deleteBook, getBookById, getBooks, getBooksByAuthorId, updateBook };
