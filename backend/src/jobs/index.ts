import crypto from "crypto";
import { JOB_STATUSES, JOB_TYPES } from "../constants/index.js";

/**
 * Instantiate an in-memory job tracker object
 * @param params Context parameters (type, documentId, userId)
 */
export const createJobRecord = ({
  type = JOB_TYPES.ANALYSIS,
  documentId,
  userId,
}: {
  type?: string;
  documentId: any;
  userId: any;
}) => ({
  id: crypto.randomUUID(),
  type,
  status: JOB_STATUSES.QUEUED,
  documentId,
  userId,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

/**
 * Patch an existing in-memory job tracker object with new status or metadata properties
 * @param job Current job record object
 * @param status New job lifecycle status to set
 * @param patch Suffix property overrides to merge
 */
export const updateJobRecord = (
  job: any,
  status: string,
  patch: Record<string, any> = {},
) => ({
  ...job,
  ...patch,
  status,
  updatedAt: new Date().toISOString(),
});
