import { Book } from '../generated/prisma';
import prisma from '../lib/prisma';
import { PaginationParams } from '../lib/types/pagination';
import { calculateSkip, formatResponse } from '../lib/utils/pagination';
import { publishBookCoverRequest } from '../subscribers/book';

const createBookSearchWhere = (search?: string) => {
  return search
    ? {
        OR: [{ title: { contains: search } }, { summary: { contains: search } }],
      }
    : {};
};

const getBooks = async ({
  page = 1,
  limit = 10,
  search,
}: PaginationParams & { search?: string }) => {
  const skip = calculateSkip(page, limit);
  const where = createBookSearchWhere(search);

  const [books, total] = await Promise.all([
    prisma.book.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        title: 'asc',
      },
    }),
    prisma.book.count({ where }),
  ]);

  return formatResponse(books, total, page, limit);
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

const getBooksByAuthorId = async (
  authorId: string,
  { page = 1, limit = 10, search }: PaginationParams & { search?: string }
) => {
  const skip = calculateSkip(page, limit);
  const where = {
    authorId,
    ...createBookSearchWhere(search),
  };

  const [books, total] = await Promise.all([
    prisma.book.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        title: 'asc',
      },
    }),
    prisma.book.count({
      where,
    }),
  ]);

  return formatResponse(books, total, page, limit);
};

export { createBook, deleteBook, getBookById, getBooks, getBooksByAuthorId, updateBook };
