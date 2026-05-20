import BaseRepository from "./base.repository";
import { Document } from "../infrastructure/database/models";
import type { DocumentDocument, ListFilters, PaginationParams } from "../types/domain";

/**
 * Repository layer handling Document persistence operations
 */
export class DocumentRepository extends BaseRepository<DocumentDocument> {
  constructor() {
    super(Document);
  }

  /**
   * Look up document by ID and verify owner constraints
   * @param documentId Document ObjectId string
   * @param userId Owner User ObjectId string
   */
  public async findOwnedById(documentId: string, userId: string): Promise<DocumentDocument | null> {
    return this.model.findOne({ _id: documentId, user: userId }).exec();
  }

  /**
   * Look up all documents belonging to a user sorted newest first
   * @param userId Owner User ObjectId string
   */
  public async findByUser(userId: string): Promise<DocumentDocument[]> {
    return this.model.find({ user: userId }).sort({ createdAt: -1 }).exec();
  }

  /**
   * Search, filter, and paginate user documents
   * @param userId Owner User ObjectId string
   * @param filters Key value filters mapping (status, search term)
   * @param pagination Page, limit, skip parameters
   */
  public async searchByUser(
    userId: string,
    filters: ListFilters = {},
    pagination: PaginationParams = { page: 1, limit: 10, skip: 0 },
  ): Promise<DocumentDocument[]> {
    const query: any = { user: userId };

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.search) {
      query.$or = [
        { fileName: { $regex: filters.search, $options: "i" } },
        { fileType: { $regex: filters.search, $options: "i" } },
        { ocrText: { $regex: filters.search, $options: "i" } },
      ];
    }

    return this.model
      .find(query)
      .sort({ createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit)
      .exec();
  }

  /**
   * Count total filtered documents belonging to a user
   * @param userId Owner User ObjectId string
   * @param filters Filter constraints mapping
   */
  public async countByUser(userId: string, filters: ListFilters = {}): Promise<number> {
    const query: any = { user: userId };

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.search) {
      query.$or = [
        { fileName: { $regex: filters.search, $options: "i" } },
        { fileType: { $regex: filters.search, $options: "i" } },
        { ocrText: { $regex: filters.search, $options: "i" } },
      ];
    }

    return this.model.countDocuments(query).exec();
  }
}

export default DocumentRepository;
