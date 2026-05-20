import BaseRepository from "./base.repository";
import { HistoricalRecord } from "../infrastructure/database/models";
import type { HistoricalRecordDocument, ListFilters, PaginationParams } from "../types/domain";

/**
 * Repository layer handling Historical records cross-check persistence operations
 */
export class HistoricalRepository extends BaseRepository<HistoricalRecordDocument> {
  constructor() {
    super(HistoricalRecord);
  }

  /**
   * Look up record by its exact key identifier
   * @param key String identifier key
   */
  public async findByKey(key: string): Promise<HistoricalRecordDocument | null> {
    return this.model.findOne({ key }).exec();
  }

  /**
   * Look up record matching user email across key and value properties
   * @param email The target email address string
   */
  public async findByEmail(email: string): Promise<HistoricalRecordDocument | null> {
    const normalizedEmail = String(email).toLowerCase().trim();

    return this.model
      .findOne({
        $or: [
          { key: normalizedEmail },
          { "value.ownerEmail": normalizedEmail },
          { "value.email": normalizedEmail },
        ],
      })
      .exec();
  }

  /**
   * Build MongoDB query filter based on request query parameters
   * @param filters Key value filters mapping
   */
  private buildSearchFilter(filters: ListFilters = {}): any {
    const query: any = {};

    if (filters.key) {
      query.key = { $regex: filters.key, $options: "i" };
    }

    if (filters.source) {
      query.source = { $regex: filters.source, $options: "i" };
    }

    if (filters.email) {
      const normalizedEmail = String(filters.email).toLowerCase().trim();
      query.$or = [
        { key: normalizedEmail },
        { "value.ownerEmail": normalizedEmail },
        { "value.email": normalizedEmail },
      ];
    } else if (filters.search) {
      query.$or = [
        { key: { $regex: filters.search, $options: "i" } },
        { source: { $regex: filters.search, $options: "i" } },
      ];
    }

    return query;
  }

  /**
   * Search, filter, and paginate historical records
   * @param filters Filtering params
   * @param pagination Page, limit, skip params
   */
  public async search(
    filters: ListFilters = {},
    pagination: PaginationParams = { page: 1, limit: 10, skip: 0 },
  ): Promise<HistoricalRecordDocument[]> {
    return this.model
      .find(this.buildSearchFilter(filters))
      .sort({ createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit)
      .exec();
  }

  /**
   * Count total historical records matching search filter
   * @param filters Search filters mapping
   */
  public async countSearch(filters: ListFilters = {}): Promise<number> {
    return this.model.countDocuments(this.buildSearchFilter(filters)).exec();
  }
}

export default HistoricalRepository;
