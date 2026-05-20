import { NotFoundError, ValidationError } from "../errors";
import { DOCUMENT_STATUSES } from "../constants";
import { toDocumentSummary } from "../domain/entities";
import { parsePagination, buildPagination } from "../utils/pagination";
import type { DocumentRepository } from "../repositories/document.repository";
import type { DocumentDocument } from "../types/domain";

/**
 * Service managing document life cycle uploads, listing, lookup, and OCR updates
 */
export class DocumentService {
  private documentRepository: DocumentRepository;

  constructor(documentRepository: DocumentRepository) {
    this.documentRepository = documentRepository;
  }

  /**
   * Upload and register a new document in the system
   * @param file Express Multer uploaded file metadata
   * @param userId The ID of the analyst who uploaded the file
   */
  public async upload(file: any, userId: string): Promise<DocumentDocument> {
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
  public async listForUser(userId: string, query: Record<string, unknown> = {}): Promise<any> {
    const { page, limit, skip } = parsePagination(query);
    const filters = {
      status: query.status as string | undefined,
      search: query.search as string | undefined,
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
  public async getOwnedDocument(documentId: string, userId: string): Promise<DocumentDocument> {
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
  public async deleteOwnedDocument(documentId: string, userId: string): Promise<DocumentDocument> {
    const document = await this.getOwnedDocument(documentId, userId);
    await this.documentRepository.deleteById(document._id as string);
    return document;
  }

  /**
   * Update OCR extraction results on the document
   * @param document Document DB model document context
   * @param result OCR processing results
   */
  public async updateOcrResult(document: DocumentDocument, result: any): Promise<DocumentDocument> {
    document.ocrText = result.text;
    document.ocrConfidence = result.confidence;
    document.structuredData = result.structuredData || {};
    document.status = DOCUMENT_STATUSES.COMPLETED;
    document.statusMessage = result.warning || "OCR analysis completed";
    return document.save();
  }
}

export default DocumentService;
