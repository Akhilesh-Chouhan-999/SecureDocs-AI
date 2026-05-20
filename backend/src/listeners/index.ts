import { EventEmitter } from "events";
import { JOB_EVENTS } from "../events/index.js";
import { logger } from "../logs/index.js";

/**
 * Register structured console logger outputs to respond to async job status events
 * @param emitter Job lifecycle events emitter instance
 */
export const registerJobListeners = (emitter: EventEmitter) => {
  emitter.on(JOB_EVENTS.CREATED, (job: any) => {
    logger.info("Job created", { jobId: job.id, status: job.status });
  });

  emitter.on(JOB_EVENTS.UPDATED, (job: any) => {
    logger.debug("Job updated", { jobId: job.id, status: job.status });
  });

  emitter.on(JOB_EVENTS.COMPLETED, (job: any) => {
    logger.info("Job completed", { jobId: job.id, status: job.status });
  });

  emitter.on(JOB_EVENTS.FAILED, (job: any) => {
    logger.warn("Job failed", { jobId: job.id, status: job.status });
  });

  emitter.on(JOB_EVENTS.CANCELED, (job: any) => {
    logger.info("Job canceled", { jobId: job.id, status: job.status });
  });

  emitter.on(JOB_EVENTS.RETRIED, (job: any) => {
    logger.info("Job retried", { jobId: job.id, status: job.status });
  });

  return emitter;
};
