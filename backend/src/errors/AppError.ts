/**
 * Base operational application error class
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly status: number;
  public readonly code: string;
  public readonly details: unknown;
  public readonly isOperational: boolean;

  /**
   * @param message Error message
   * @param statusCode HTTP Status Code
   * @param code App-specific error code string
   * @param details Additional error details context
   */
  constructor(
    message: string,
    statusCode: number = 500,
    code: string = "APP_ERROR",
    details: unknown = null,
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.status = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}
