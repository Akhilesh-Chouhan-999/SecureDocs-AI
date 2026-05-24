import { BaseRepository } from "./base.repository.js";
import Document from "../models/Document.js";

/**
 * Repository layer handling Document persistence operations
 */
export class DocumentRepository extends BaseRepository {
  constructor() {
    super(Document);
  }

  /**
   * Look up document by ID and verify owner constraints
   * @param documentId Document ObjectId string
   * @param userId Owner User ObjectId string
   */
  async findOwnedById(documentId: any, userId: any) {
    return this.model.findOne({ _id: documentId, user: userId }).exec();
  }

  /**
   * Look up all documents belonging to a user sorted newest first
   * @param userId Owner User ObjectId string
   */
  async findByUser(userId: any) {
    return this.model.find({ user: userId }).sort({ createdAt: -1 }).exec();
  }

  /**
   * Search, filter, and paginate user documents
   * @param userId Owner User ObjectId string
   * @param filters Key value filters mapping (status, search term)
   * @param pagination Page, limit, skip parameters
   */
  async searchByUser(userId: any, filters: Record<string, any> = {}, pagination = { page: 1, limit: 10, skip: 0 }) {
    const query: Record<string, any> = { user: userId };

    if (filters.status) query.status = filters.status;
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
  async countByUser(userId: any, filters: Record<string, any> = {}) {
    const query: Record<string, any> = { user: userId };

    if (filters.status) query.status = filters.status;
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
