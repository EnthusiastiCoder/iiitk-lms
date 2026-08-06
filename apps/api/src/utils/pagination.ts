import type { PaginatedResponse } from "@lms/shared";

interface PaginationInput {
  page?: number;
  limit?: number;
}

interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

/** Parse and clamp pagination query params. */
export function parsePagination(input: PaginationInput): PaginationParams {
  const page = Math.max(1, input.page ?? 1);
  const limit = Math.min(100, Math.max(1, input.limit ?? 20));
  return { page, limit, offset: (page - 1) * limit };
}

/** Build a paginated response envelope. */
export function paginate<T>(
  items: T[],
  total: number,
  params: PaginationParams
): PaginatedResponse<T> {
  return {
    items,
    total,
    page: params.page,
    limit: params.limit,
    totalPages: Math.ceil(total / params.limit),
  };
}
