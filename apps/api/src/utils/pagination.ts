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

/**
 * Parse and clamp pagination query params.
 * @param input - Raw page and limit values from the request
 * @returns Validated page, limit, and computed offset
 */
export function parsePagination(input: PaginationInput): PaginationParams {
  const page = Math.max(1, input.page ?? 1);
  const limit = Math.min(100, Math.max(1, input.limit ?? 20));
  return { page, limit, offset: (page - 1) * limit };
}

/**
 * Build a paginated response envelope.
 * @param items - The page of results
 * @param total - Total number of matching records
 * @param params - The pagination parameters used for the query
 * @returns Paginated response with items, total, page, limit, and totalPages
 */
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
