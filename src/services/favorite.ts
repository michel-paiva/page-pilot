import prisma from '../lib/prisma';
import { PaginationParams } from '../lib/types/pagination';

const createFavorite = async (userId: string, bookId: string) => {
  const favorite = await prisma.favorite.create({
    data: {
      userId,
      bookId,
    },
    include: {
      book: true,
    },
  });
  return favorite;
};

const getFavoriteBooksByUserId = async (
  userId: string,
  { page = 1, limit = 10, search }: PaginationParams & { search?: string }
) => {
  const skip = (page - 1) * limit;

  const where = {
    userId,
    ...(search
      ? {
          book: {
            OR: [{ title: { contains: search } }, { summary: { contains: search } }],
          },
        }
      : {}),
  };

  const [favorites, total] = await Promise.all([
    prisma.favorite.findMany({
      where,
      include: {
        book: true,
      },
      orderBy: {
        book: {
          title: 'asc',
        },
      },
      skip,
      take: limit,
    }),
    prisma.favorite.count({
      where,
    }),
  ]);

  return {
    data: favorites,
    meta: {
      total,
      page,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getFavoriteByIdAndUserId = async (id: string, userId: string) => {
  const favorite = await prisma.favorite.findUnique({
    where: { id, userId },
  });
  return favorite;
};

const getFavoriteByUserIdAndBookId = async (userId: string, bookId: string) => {
  const favorite = await prisma.favorite.findUnique({
    where: {
      userId_bookId: { userId, bookId },
    },
  });
  return favorite;
};

const deleteFavorite = async (id: string) => {
  await prisma.favorite.delete({
    where: { id },
  });
};

export {
  createFavorite,
  deleteFavorite,
  getFavoriteBooksByUserId,
  getFavoriteByIdAndUserId,
  getFavoriteByUserIdAndBookId,
};
