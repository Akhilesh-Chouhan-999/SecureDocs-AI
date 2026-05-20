import { AppError } from "./AppError";

/**
 * Error thrown when a requested resource is not found
 */
export class NotFoundError extends AppError {
  /**
   * @param message Error message
   * @param details Additional error details context
   */
  constructor(message: string = "Resource not found", details: unknown = null) {
    super(message, 404, "NOT_FOUND", details);
  }
}
