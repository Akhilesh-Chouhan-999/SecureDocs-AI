import type { NextFunction, Request, Response } from "express";
import type { SanitizedUser } from "./domain";

/** Multer uploaded file metadata format */
export interface UploadedFile {
  fieldname: string;
  originalname: string;
  mimetype: string;
  size: number;
  path: string;
}

/** Standard API success payload */
export interface ApiSuccessPayload {
  success: true;
  [key: string]: unknown;
}

/** Standard API error payload */
export interface ApiErrorPayload {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
    stack?: string;
  };
}

/** Express Request authenticated with User context */
export interface AuthenticatedRequest<
  Params = Record<string, string>,
  ResBody = unknown,
  ReqBody = Record<string, unknown>,
  ReqQuery = Record<string, unknown>,
> extends Request<Params, ResBody, ReqBody, ReqQuery> {
  user: SanitizedUser & { _id: unknown };
  file?: UploadedFile;
}

/** Express middleware or route handler wrapper signature */
export type AsyncRouteHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => unknown | Promise<unknown>;

/** Swagger/JSON API Route documentation record */
export interface RouteDoc {
  method: string;
  path: string;
  group: string;
  auth: boolean;
  purpose: string;
}

/** Folder module listing documentation mapping */
export type FolderUsageMap = Record<string, string>;

/** Payload meta extension wrapper */
export type ApiMetaPayload<T extends Record<string, unknown>> = T & {
  meta: {
    generatedAt: string;
    [key: string]: unknown;
  };
};
