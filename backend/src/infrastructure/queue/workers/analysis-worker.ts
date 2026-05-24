import { Job } from "bull";
import { logger } from "../../../logs/index.js";
import { markJobProcessing, markJobCompleted, markJobFailed } from "./index.js";

/**
 * Worker logic for processing background analysis jobs.
 * Kept separate from the job service to allow future scaling into independent worker nodes.
 */
export class AnalysisWorker {

  private analysisService: any;
  private jobsMap: Map<string, any>;
  private emitter: any;

  constructor(analysisService: any, jobsMap: Map<string, any>, emitter: any) {
    this.analysisService = analysisService;
    this.jobsMap = jobsMap;
    this.emitter = emitter;
  }

  /**
   * Main processor function for Bull Queue
   */
  async processJob(bullJob: Job): Promise<any> {
    const jobId = String(bullJob.id);
    const currentJob = this.jobsMap.get(jobId);

    if (!currentJob) {
      throw new Error(`Unknown queued job: ${jobId}`);
    }

    try {
      logger.info(`Starting background analysis for job ${jobId}`);

      const processingJob = markJobProcessing(currentJob);
      this.jobsMap.set(processingJob.id, processingJob);
      this.emitter.emit("job_updated", processingJob);

      // Perform the heavy analysis operation
      const result = await this.analysisService.analyzeDocument(
        bullJob.data.documentId,
        bullJob.data.userId,
      );

      const completedJob = markJobCompleted(processingJob, result);
      this.jobsMap.set(completedJob.id, completedJob);
      this.emitter.emit("job_completed", completedJob);

      logger.info(
        `Successfully completed background analysis for job ${jobId}`,
      );
      return result;
    } catch (error) {
      logger.error(`Failed background analysis for job ${jobId}`, { error });

      const failedJob = markJobFailed(currentJob, error);
      this.jobsMap.set(failedJob.id, failedJob);
      this.emitter.emit("job_failed", failedJob);

      throw error;
    }
  }

}
