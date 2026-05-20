import { NotFoundError, ValidationError } from "../errors/index.js";
import { DOCUMENT_STATUSES } from "../constants/index.js";
import { toDocumentSummary } from "../domain/entities/index.js";
import { parsePagination, buildPagination } from "../utils/pagination.js";

/**
 * Service managing document life cycle uploads, listing, lookup, and OCR updates
 */
export class DocumentService {
  private documentRepository: any;

  constructor(documentRepository: any) {
    this.documentRepository = documentRepository;
  }

  /**
   * Upload and register a new document in the system
   * @param file Express Multer uploaded file metadata
   * @param userId The ID of the analyst who uploaded the file
   */
  async upload(file: any, userId: any) {
    if (!file) {
      throw new ValidationError("No file uploaded");
    }

    return this.documentRepository.create({
      user: userId,
      fileName: file.originalname,
      filePath: file.path,
      fileSize: file.size,
      fileType: file.mimetype,
      status: DOCUMENT_STATUSES.PENDING,
    });
  }

  /**
   * List and filter documents owned by a user
   * @param userId Owner User ObjectId string
   * @param query Request query params containing filter/pagination criteria
   */
  async listForUser(userId: any, query: Record<string, any> = {}) {
    const { page, limit, skip } = parsePagination(query);
    const filters = {
      status: query.status,
      search: query.search,
    };
    const [documents, total] = await Promise.all([
      this.documentRepository.searchByUser(userId, filters, { page, limit, skip }),
      this.documentRepository.countByUser(userId, filters),
    ]);

    return {
      documents: documents.map(toDocumentSummary),
      pagination: buildPagination({ page, limit, total }),
      filters,
    };
  }

  /**
   * Fetch a document and check ownership
   * @param documentId Document ObjectId string
   * @param userId Owner User ObjectId string
   */
  async getOwnedDocument(documentId: any, userId: any) {
    const document = await this.documentRepository.findOwnedById(documentId, userId);

    if (!document) {
      throw new NotFoundError("Document");
    }

    return document;
  }

  /**
   * Delete a document and verify ownership
   * @param documentId Document ObjectId string
   * @param userId Owner User ObjectId string
   */
  async deleteOwnedDocument(documentId: any, userId: any) {
    const document = await this.getOwnedDocument(documentId, userId);
    await this.documentRepository.deleteById(document._id);
    return document;
  }

  /**
   * Update OCR extraction results on the document
   * @param document Document DB model document context
   * @param result OCR processing results
   */
  async updateOcrResult(document: any, result: any) {
    document.ocrText = result.text;
    document.ocrConfidence = result.confidence;
    document.structuredData = result.structuredData || {};
    document.status = DOCUMENT_STATUSES.COMPLETED;
    document.statusMessage = result.warning || "OCR analysis completed";
    return document.save();
  }
}
