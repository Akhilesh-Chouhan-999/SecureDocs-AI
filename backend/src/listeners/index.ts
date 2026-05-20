import { JOB_EVENTS } from "../events.js";
import { logger } from "../logs.js";

/**
 * Register structured console logger outputs to respond to async job status events
 * @param emitter Job lifecycle events emitter instance
 */
const registerJobListeners = (emitter) => {
  emitter.on(JOB_EVENTS.CREATED, (job) => {
    logger.info("Job created", { jobId: job.id, status: job.status });
  });

  emitter.on(JOB_EVENTS.UPDATED, (job) => {
    logger.debug("Job updated", { jobId: job.id, status: job.status });
  });

  emitter.on(JOB_EVENTS.COMPLETED, (job) => {
    logger.info("Job completed", { jobId: job.id, status: job.status });
  });

  emitter.on(JOB_EVENTS.FAILED, (job) => {
    logger.warn("Job failed", { jobId: job.id, status: job.status });
  });

  emitter.on(JOB_EVENTS.CANCELED, (job) => {
    logger.info("Job canceled", { jobId: job.id, status: job.status });
  });

  emitter.on(JOB_EVENTS.RETRIED, (job) => {
    logger.info("Job retried", { jobId: job.id, status: job.status });
  });

  return emitter;
};

export { registerJobListeners,
 };
