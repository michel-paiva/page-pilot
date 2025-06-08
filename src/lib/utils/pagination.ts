import { PaginatedResponse } from '../types/pagination';

export const calculateSkip = (page: number, limit: number) => (page - 1) * limit;

export const formatResponse = <T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResponse<T> => {
  return {
    data,
    meta: {
      total,
      page,
      totalPages: Math.ceil(total / limit),
    },
  };
};
