/**
 * Parse page and limit from request query, applying boundaries (e.g. max limit of 100)
 * @param query Express Request query object
 */
const parsePagination = (query = {}) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 100);
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

/**
 * Format total results into paginated response metadata
 * @param pagination Context pagination settings and total match count
 */
const buildPagination = ({ page, limit, total }) => ({
  page,
  limit,
  total,
  totalPages: Math.max(Math.ceil(total / limit), 1),
});

const pagination = {
  parsePagination,
  buildPagination,
};

export { parsePagination,
  buildPagination,
  pagination,
 };
