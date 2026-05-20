import type { Response, NextFunction } from "express";
import { container } from "../config";
import { created, success } from "../utils/apiResponse";

/**
 * Controller handling document lifecycle upload, fetch list, detailed lookup, and deletion
 */
export class DocumentController {
  /**
   * File upload handler
   * @param req Express request containing uploaded file
   * @param res Express response
   * @param next Next middleware function
   */
  public static async upload(req: any, res: Response, next: NextFunction): Promise<any> {
    try {
      const document = await container
        .get("documentService")
        .upload(req.file, req.user._id);

      return created(res, {
        message: "File uploaded successfully",
        document,
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Search, filter, and fetch user-owned documents list
   * @param req Express request
   * @param res Express response
   * @param next Next middleware function
   */
  public static async getDocuments(req: any, res: Response, next: NextFunction): Promise<any> {
    try {
      const result = await container
        .get("documentService")
        .listForUser(req.user._id, req.query);
      return success(res, result);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Retrieve a specific owned document's metadata
   * @param req Express request containing document ID parameter
   * @param res Express response
   * @param next Next middleware function
   */
  public static async getDocument(req: any, res: Response, next: NextFunction): Promise<any> {
    try {
      const document = await container
        .get("documentService")
        .getOwnedDocument(req.params.id, req.user._id);
      return success(res, { document });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Delete an owned document from the system
   * @param req Express request containing document ID parameter
   * @param res Express response
   * @param next Next middleware function
   */
  public static async deleteDocument(req: any, res: Response, next: NextFunction): Promise<any> {
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

export default DocumentController;
