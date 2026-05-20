import Queue from "bull";
import EventEmitter from "events";
import { env } from "../config";
import { NotFoundError, ValidationError } from "../errors";
import { JOB_EVENTS } from "../events";
import { createJobRecord } from "../jobs";
import { registerJobListeners } from "../listeners";
import {
  markJobCanceled,
  markJobCompleted,
  markJobFailed,
  markJobProcessing,
} from "../infrastructure/queue/workers";
import { emitJobUpdate } from "../sockets";
import { JOB_STATUSES } from "../constants";
import { parsePagination, buildPagination } from "../utils/pagination";
import type { AnalysisService } from "./analysis.service";
import type { JobRecord } from "../types/domain";

/**
 * Service managing background document analysis jobs
 * Handles in-memory job status tracking and Bull + Redis queue worker scheduling.
 */
export class JobService {
  private jobs: Map<string, JobRecord>;
  private emitter: EventEmitter;
  private analysisService: AnalysisService;
  private queue: Queue.Queue | null;

  constructor(analysisService: AnalysisService) {
    this.jobs = new Map();
    this.emitter = registerJobListeners(new EventEmitter());
    this.analysisService = analysisService;
    this.queue = this.createQueue();
  }

  /**
   * Create a new analysis job and queue it for processing
   * @param params Document and User context properties
   */
  public async createAnalysisJob({ documentId, userId }: { documentId: string; userId: string }): Promise<JobRecord> {
    const queuedJob = createJobRecord({ documentId, userId });
    this.jobs.set(queuedJob.id, queuedJob);
    this.emitter.emit(JOB_EVENTS.CREATED, queuedJob);
    emitJobUpdate(queuedJob);
    this.enqueueJob(queuedJob);
    return queuedJob;
  }

  /**
   * Look up job details by unique job identifier string
   * @param jobId UUID string representing job
   */
  public async getJobStatus(jobId: string): Promise<JobRecord> {
    const job = this.jobs.get(jobId);

    if (!job) {
      throw new NotFoundError("Job");
    }

    return job;
  }

  /**
   * Search, filter, and paginate analyst job records
   * @param userId Owner User ObjectId string
   * @param query Filtering queries map
   */
  public async listJobs(userId: string, query: Record<string, unknown> = {}): Promise<any> {
    const { page, limit, skip } = parsePagination(query);
    const items = Array.from(this.jobs.values())
      .filter((job) => String(job.userId) === String(userId))
      .filter((job) => !query.status || job.status === query.status)
      .filter((job) => {
        if (!query.search) {
          return true;
        }

        return [job.id, job.documentId, job.type, job.status]
          .some((value) => String(value || "").toLowerCase().includes(String(query.search).toLowerCase()));
      })
      .sort((left, right) => {
        return new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime();
      });

    return {
      jobs: items.slice(skip, skip + limit),
      pagination: buildPagination({ page, limit, total: items.length }),
      filters: {
        status: query.status as string | undefined,
        search: query.search as string | undefined,
      },
    };
  }

  /**
   * Cancel a job in QUEUED or PROCESSING status
   * @param jobId UUID string representing job
   * @param userId Requesting User ID verification check
   */
  public async cancelJob(jobId: string, userId: string): Promise<JobRecord> {
    const job = this.jobs.get(jobId);

    if (!job) {
      throw new NotFoundError("Job");
    }

    if (String(job.userId) !== String(userId)) {
      throw new NotFoundError("Job");
    }

    if (![JOB_STATUSES.QUEUED, JOB_STATUSES.PROCESSING].includes(job.status)) {
      throw new ValidationError("Only queued or processing jobs can be canceled");
    }

    const canceledJob = markJobCanceled(job);
    this.jobs.set(canceledJob.id, canceledJob);
    this.emitter.emit(JOB_EVENTS.CANCELED, canceledJob);
    emitJobUpdate(canceledJob);

    return canceledJob;
  }

  /**
   * Retry a FAILED or CANCELED job
   * @param jobId UUID string representing job
   * @param userId Requesting User ID verification check
   */
  public async retryJob(jobId: string, userId: string): Promise<JobRecord> {
    const job = this.jobs.get(jobId);

    if (!job) {
      throw new NotFoundError("Job");
    }

    if (String(job.userId) !== String(userId)) {
      throw new NotFoundError("Job");
    }

    if (![JOB_STATUSES.FAILED, JOB_STATUSES.CANCELED].includes(job.status)) {
      throw new ValidationError("Only failed or canceled jobs can be retried");
    }

    const retriedJob: JobRecord = {
      ...job,
      status: JOB_STATUSES.QUEUED,
      updatedAt: new Date().toISOString(),
      retriedAt: new Date().toISOString(),
      retryCount: Number(job.retryCount || 0) + 1,
      error: undefined,
    };

    this.jobs.set(retriedJob.id, retriedJob);
    this.emitter.emit(JOB_EVENTS.RETRIED, retriedJob);
    emitJobUpdate(retriedJob);
    this.enqueueJob(retriedJob);

    return retriedJob;
  }

  /**
   * Wire Redis connection and initialize Bull Queue
   */
  private createQueue(): Queue.Queue | null {
    if (!env.enableJobQueue || !env.redisUrl) {
      return null;
    }

    const queue = new Queue(env.jobQueueName, env.redisUrl);

    queue.process(async (bullJob) => {
      const jobId = String(bullJob.id);
      const currentJob = this.jobs.get(jobId);

      if (!currentJob) {
        throw new Error("Unknown queued job");
      }

      const processingJob = markJobProcessing(currentJob);
      this.jobs.set(processingJob.id, processingJob);
      this.emitter.emit(JOB_EVENTS.UPDATED, processingJob);
      emitJobUpdate(processingJob);

      try {
        const result = await this.analysisService.analyzeDocument(
          bullJob.data.documentId,
          bullJob.data.userId,
        );
        const completedJob = markJobCompleted(processingJob, result);
        this.jobs.set(completedJob.id, completedJob);
        this.emitter.emit(JOB_EVENTS.COMPLETED, completedJob);
        emitJobUpdate(completedJob);
        return result;
      } catch (error) {
        const failedJob = markJobFailed(processingJob, error);
        this.jobs.set(failedJob.id, failedJob);
        this.emitter.emit(JOB_EVENTS.FAILED, failedJob);
        emitJobUpdate(failedJob);
        throw error;
      }
    });

    return queue;
  }

  /**
   * Enqueue a job into Redis Bull or fall back to async in-memory timeout processing
   * @param job The job record metadata
   */
  private enqueueJob(job: JobRecord): void {
    if (this.queue) {
      this.queue.add(
        { documentId: job.documentId, userId: job.userId },
        { jobId: job.id, removeOnComplete: 25, attempts: 2 },
      );
      return;
    }

    // In-memory fallback processor
    setTimeout(async () => {
      const currentJob = this.jobs.get(job.id);

      if (!currentJob || currentJob.status === JOB_STATUSES.CANCELED) {
        return;
      }

      const processingJob = markJobProcessing(currentJob);
      this.jobs.set(processingJob.id, processingJob);
      this.emitter.emit(JOB_EVENTS.UPDATED, processingJob);
      emitJobUpdate(processingJob);

      try {
        const result = await this.analysisService.analyzeDocument(
          processingJob.documentId,
          processingJob.userId,
        );
        const completedJob = markJobCompleted(processingJob, result);
        this.jobs.set(completedJob.id, completedJob);
        this.emitter.emit(JOB_EVENTS.COMPLETED, completedJob);
        emitJobUpdate(completedJob);
      } catch (error) {
        const failedJob = markJobFailed(processingJob, error);
        this.jobs.set(failedJob.id, failedJob);
        this.emitter.emit(JOB_EVENTS.FAILED, failedJob);
        emitJobUpdate(failedJob);
      }
    }, 25);
  }
}

export default JobService;
