import { AppError } from "./AppError";

/**
 * Error thrown when a user lacks sufficient permissions for an action
 */
export class ForbiddenError extends AppError {
  /**
   * @param message Error message
   * @param details Additional error details context
   */
  constructor(message: string = "Forbidden", details: unknown = null) {
    super(message, 403, "FORBIDDEN", details);
  }
}
