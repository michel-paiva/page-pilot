import prisma from "../lib/prisma";
import { PaginationParams } from "../lib/types/pagination";

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
}

const getFavoriteBooksByUserId = async (userId: string, { page = 1, limit = 10 }: PaginationParams) => {
    const skip = (page - 1) * limit;

    const [favorites, total] = await Promise.all([
        prisma.favorite.findMany({
            where: {
                userId,
            },
            include: {
                book: true,
            },
            skip,
            take: limit,
        }),
        prisma.favorite.count({
            where: {
                userId,
            },
        })
    ]);

    return {
        data: favorites,
        meta: {
            total,
            page,
            totalPages: Math.ceil(total / limit)
        }
    };
}

const getFavoriteByIdAndUserId = async (id: string, userId: string) => {
    const favorite = await prisma.favorite.findUnique({
        where: { id, userId },
    });
    return favorite;
}

const getFavoriteByUserIdAndBookId = async (userId: string, bookId: string) => {
    const favorite = await prisma.favorite.findUnique({
        where: {
            userId_bookId: { userId, bookId },
        },
    });
    return favorite;
}

const deleteFavorite = async (id: string) => {
    await prisma.favorite.delete({
        where: { id },
    });
}

export { createFavorite, getFavoriteBooksByUserId, getFavoriteByUserIdAndBookId, deleteFavorite, getFavoriteByIdAndUserId };