import { ForbiddenError, NotFoundError } from "../errors";
import { parsePagination, buildPagination } from "../utils/pagination";
import type { HistoricalRepository } from "../repositories/historical.repository";

/**
 * Service managing historical record queries for fraud cross-checks and auditing
 */
export class HistoryService {
  private historicalRepository: HistoricalRepository;

  constructor(historicalRepository: HistoricalRepository) {
    this.historicalRepository = historicalRepository;
  }

  /**
   * Look up historical context profile matching email
   * @param email Target audit lookup email string
   */
  public async getHistoryByEmail(email: string): Promise<any> {
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
  public async searchHistory(query: Record<string, unknown> = {}, user: any): Promise<any> {
    if (!["admin", "manager"].includes(user.role)) {
      throw new ForbiddenError("Only admin or manager users can search history records");
    }

    const { page, limit, skip } = parsePagination(query);
    const filters = {
      email: query.email as string | undefined,
      key: query.key as string | undefined,
      source: query.source as string | undefined,
      search: query.search as string | undefined,
    };

    const [records, total] = await Promise.all([
      this.historicalRepository.search(filters, { page, limit, skip }),
      this.historicalRepository.countSearch(filters),
    ]);

    return {
      records: records.map((record) => ({
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

export default HistoryService;
