import { Author } from '../generated/prisma';
import prisma from '../lib/prisma';
import { PaginatedResponse, PaginationParams } from '../lib/types/pagination';

const getAuthors = async ({
  page = 1,
  limit = 10,
  search,
}: PaginationParams & { search?: string }): Promise<PaginatedResponse<Author>> => {
  const skip = (page - 1) * limit;

  const where = search
    ? {
        OR: [{ name: { contains: search } }, { bio: { contains: search } }],
      }
    : {};

  const [authors, total] = await Promise.all([
    prisma.author.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        name: 'asc',
      },
    }),
    prisma.author.count({ where }),
  ]);

  return {
    data: authors,
    meta: {
      total,
      page,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getAuthorById = async (id: string) => {
  const author = await prisma.author.findUnique({
    where: { id },
  });
  return author;
};

const createAuthor = async (author: Author) => {
  const newAuthor = await prisma.author.create({
    data: author,
  });
  return newAuthor;
};

const updateAuthor = async (id: string, author: Author) => {
  const updatedAuthor = await prisma.author.update({
    where: { id },
    data: author,
  });
  return updatedAuthor;
};

const deleteAuthor = async (id: string) => {
  const deletedAuthor = await prisma.author.delete({
    where: { id },
  });
  return deletedAuthor;
};

export { createAuthor, deleteAuthor, getAuthorById, getAuthors, updateAuthor };
