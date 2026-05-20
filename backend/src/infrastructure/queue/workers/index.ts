import { JOB_STATUSES } from "../../../constants";
import { updateJobRecord } from "../../../jobs";
import type { JobRecord } from "../../../types/domain";

/**
 * Patch job status to PROCESSING and set started timestamp
 * @param job In-memory job record
 */
export const markJobProcessing = (job: JobRecord): JobRecord =>
  updateJobRecord(job, JOB_STATUSES.PROCESSING, {
    startedAt: new Date().toISOString(),
  });

/**
 * Patch job status to COMPLETED and set result payload
 * @param job In-memory job record
 * @param result Processing result data
 */
export const markJobCompleted = (job: JobRecord, result: any = {}): JobRecord =>
  updateJobRecord(job, JOB_STATUSES.COMPLETED, {
    completedAt: new Date().toISOString(),
    result,
  });

/**
 * Patch job status to FAILED and capture error details
 * @param job In-memory job record
 * @param error Thrown error object context
 */
export const markJobFailed = (job: JobRecord, error: any): JobRecord =>
  updateJobRecord(job, JOB_STATUSES.FAILED, {
    failedAt: new Date().toISOString(),
    error: {
      message: error?.message || "Job failed",
    },
  });

/**
 * Patch job status to CANCELED and set cancellation rationale
 * @param job In-memory job record
 * @param reason Human readable cancellation notes
 */
export const markJobCanceled = (job: JobRecord, reason: string = "Canceled by user"): JobRecord =>
  updateJobRecord(job, JOB_STATUSES.CANCELED, {
    canceledAt: new Date().toISOString(),
    result: { message: reason },
  });

export default {
  markJobProcessing,
  markJobCompleted,
  markJobFailed,
  markJobCanceled,
};
