import { AppError } from "./AppError";

/**
 * Error thrown when a requested resource is not found
 */
export class NotFoundError extends AppError {
  /**
   * @param message Error message
   * @param details Additional error details context
   */
  constructor(message = "Resource not found", details: any = null) {
    super(message, 404, "NOT_FOUND", details);
  }
}
