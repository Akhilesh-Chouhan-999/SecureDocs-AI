import { container } from "../config/index.js";
import { created, success } from "../utils/apiResponse.js";

/**
 * Controller handling document upload, listing, single lookup, and deletion
 */
export class DocumentController {

  static async uploadDocument(req: any, res: any, next: any) {
    try {
      const document = await container
        .get("documentService")
        .upload(req.file, req.user._id);
      return created(res, { message: "File uploaded successfully", document });
    } catch (error) {
      return next(error);
    }
  }

  static async getDocuments(req: any, res: any, next: any) {
    try {
      const result = await container
        .get("documentService")
        .listForUser(req.user._id, req.query);
      return success(res, result);
    } catch (error) {
      return next(error);
    }
  }

  static async getDocument(req: any, res: any, next: any) {
    try {
      const document = await container
        .get("documentService")
        .getOwnedDocument(req.params.id, req.user._id);
      return success(res, { document });
    } catch (error) {
      return next(error);
    }
  }

  static async deleteDocument(req: any, res: any, next: any) {
    try {
      const document = await container
        .get("documentService")
        .deleteOwnedDocument(req.params.id, req.user._id);
      return success(res, {
        message: "Document deleted successfully",
        documentId: document._id,
      });
    } catch (error) {
      return next(error);
    }
  }

}
