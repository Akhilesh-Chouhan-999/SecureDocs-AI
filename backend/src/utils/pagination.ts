import type { PaginationParams, PaginationResult } from "../types/domain";

/**
 * Parse page and limit from request query, applying boundaries (e.g. max limit of 100)
 * @param query Express Request query object
 */
export const parsePagination = (query: Record<string, unknown> = {}): PaginationParams => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 100);
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

/**
 * Format total results into paginated response metadata
 * @param pagination Context pagination settings and total match count
 */
export const buildPagination = ({
  page,
  limit,
  total,
}: {
  page: number;
  limit: number;
  total: number;
}): PaginationResult => ({
  page,
  limit,
  total,
  totalPages: Math.max(Math.ceil(total / limit), 1),
});

export const pagination = {
  parsePagination,
  buildPagination,
};

export default pagination;
