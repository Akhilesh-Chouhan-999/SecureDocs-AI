import { AppError } from "./AppError";

/**
 * Error thrown when authentication fails or credentials are invalid
 */
export class AuthError extends AppError {
  /**
   * @param message Error message
   * @param details Additional error details context
   */
  constructor(message: string = "Authentication failed", details: unknown = null) {
    super(message, 401, "AUTH_ERROR", details);
  }
}
