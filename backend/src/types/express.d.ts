import type { SanitizedUser } from "./domain";

declare global {
  namespace Express {
    interface Request {
      user?: SanitizedUser & { _id: unknown };
    }
  }
}

export {};
