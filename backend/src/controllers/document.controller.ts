import { container } from "../config.js";
import { created, success } from "../utils/apiResponse.js";

/**
 * Controller handling document lifecycle upload, fetch list, detailed lookup, and deletion
 */
class DocumentController {
  static async upload(req, res, next) {
    try {
      const document = await container.get("documentService").upload(req.file, req.user._id);
      return created(res, { message: "File uploaded successfully", document });
    } catch (error) { return next(error); }
  }

  static async getDocuments(req, res, next) {
    try {
      const result = await container.get("documentService").listForUser(req.user._id, req.query);
      return success(res, result);
    } catch (error) { return next(error); }
  }

  static async getDocument(req, res, next) {
    try {
      const document = await container.get("documentService").getOwnedDocument(req.params.id, req.user._id);
      return success(res, { document });
    } catch (error) { return next(error); }
  }

  static async deleteDocument(req, res, next) {
    try {
      const document = await container.get("documentService").deleteOwnedDocument(req.params.id, req.user._id);
      return success(res, { message: "Document deleted successfully", documentId: document._id });
    } catch (error) { return next(error); }
  }
}

export { DocumentController  };
export const default = DocumentController;
