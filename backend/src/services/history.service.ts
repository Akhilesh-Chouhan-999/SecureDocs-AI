import { ForbiddenError, NotFoundError } from "../errors/index.js";
import { parsePagination, buildPagination } from "../utils/pagination.js";

/**
 * Service managing historical record queries for fraud cross-checks and auditing
 */
export class HistoryService {
  private historicalRepository: any;

  constructor(historicalRepository: any) {
    this.historicalRepository = historicalRepository;
  }

  /**
   * Look up historical context profile matching email
   * @param email Target audit lookup email string
   */
  async getHistoryByEmail(email: string) {
    const record = await this.historicalRepository.findByEmail(email);

    if (!record) {
      throw new NotFoundError("History");
    }

    return {
      email: String(email).toLowerCase().trim(),
      key: record.key,
      source: record.source || "historical-record",
      history: record.value,
      createdAt: record.createdAt,
    };
  }

  /**
   * Search, filter, and paginate historical record archives
   * Restricts operation to admin and manager roles
   * @param query Request query params containing search inputs
   * @param user Authenticated user details requesting query
   */
  async searchHistory(query: Record<string, any> = {}, user: any) {
    if (!["admin", "manager"].includes(user.role)) {
      throw new ForbiddenError("Only admin or manager users can search history records");
    }

    const { page, limit, skip } = parsePagination(query);
    const filters = {
      email: query.email,
      key: query.key,
      source: query.source,
      search: query.search,
    };

    const [records, total] = await Promise.all([
      this.historicalRepository.search(filters, { page, limit, skip }),
      this.historicalRepository.countSearch(filters),
    ]);

    return {
      records: records.map((record: any) => ({
        id: record._id,
        key: record.key,
        source: record.source || "historical-record",
        value: record.value,
        createdAt: record.createdAt,
      })),
      pagination: buildPagination({ page, limit, total }),
      filters,
    };
  }
}
