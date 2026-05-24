import { AppError } from "./AppError.js";

/**
 * Error thrown when validation check fails
 */
export class ValidationError extends AppError {

  /**
   * @param message Error message
   * @param details Additional error details context
   */
  constructor(message = "Validation failed", details: any = null) {
    super(message, 400, "VALIDATION_ERROR", details);
  }

}
