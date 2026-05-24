/**
 * Base operational application error class
 */
export class AppError extends Error {

  public statusCode: number;
  public status: number;
  public code: string;
  public details: any;
  public isOperational: boolean;

  /**
   * @param message Error message
   * @param statusCode HTTP Status Code
   * @param code App-specific error code string
   * @param details Additional error details context
   */
  constructor(
    message: string,
    statusCode = 500,
    code = "APP_ERROR",
    details: any = null,
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
