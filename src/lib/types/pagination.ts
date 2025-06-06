export type PaginationParams = {
  page: number;
  limit: number;
}

export type PaginatedResponse<T> ={
  data: T[];
  meta: {
    total: number;
    page: number;
    totalPages: number;
  }
}