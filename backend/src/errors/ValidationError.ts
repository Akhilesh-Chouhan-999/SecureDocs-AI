import { AppError } from "./AppError";

/**
 * Error thrown when validation check fails
 */
export class ValidationError extends AppError {
  /**
   * @param message Error message
   * @param details Additional error details context
   */
  constructor(message: string = "Validation failed", details: unknown = null) {
    super(message, 400, "VALIDATION_ERROR", details);
  }
}
