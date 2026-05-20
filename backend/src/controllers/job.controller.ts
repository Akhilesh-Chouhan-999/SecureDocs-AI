import type { Response, NextFunction } from "express";
import { container } from "../config";
import { created, success } from "../utils/apiResponse";

/**
 * Controller exposing endpoints for creating, listing, checking status, cancelling, and retrying async jobs
 */
export class JobController {
  /**
   * Enqueue a new document analysis job
   * @param req Express request
   * @param res Express response
   * @param next Next middleware function
   */
  public static async createAnalysisJob(req: any, res: Response, next: NextFunction): Promise<any> {
    try {
      const job = await container.get("jobService").createAnalysisJob({
        documentId: req.body.documentId,
        userId: req.user._id,
      });

      return created(res, {
        message: "Analysis job queued",
        job,
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Retrieve current progress of an active job
   * @param req Express request containing jobId path param
   * @param res Express response
   * @param next Next middleware function
   */
  public static async getJobStatus(req: any, res: Response, next: NextFunction): Promise<any> {
    try {
      const job = await container
        .get("jobService")
        .getJobStatus(req.params.jobId);

      return success(res, { job });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * List and filter queued analysis tasks
   * @param req Express request
   * @param res Express response
   * @param next Next middleware function
   */
  public static async listJobs(req: any, res: Response, next: NextFunction): Promise<any> {
    try {
      const result = await container.get("jobService").listJobs(req.user._id, req.query);
      return success(res, result);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Request cancellation of a queued job before it starts processing
   * @param req Express request containing jobId path param
   * @param res Express response
   * @param next Next middleware function
   */
  public static async cancelJob(req: any, res: Response, next: NextFunction): Promise<any> {
    try {
      const job = await container
        .get("jobService")
        .cancelJob(req.params.jobId, req.user._id);

      return success(res, {
        message: "Job canceled successfully",
        job,
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Request retry of a failed or canceled job
   * @param req Express request containing jobId path param
   * @param res Express response
   * @param next Next middleware function
   */
  public static async retryJob(req: any, res: Response, next: NextFunction): Promise<any> {
    try {
      const job = await container
        .get("jobService")
        .retryJob(req.params.jobId, req.user._id);

      return success(res, {
        message: "Job retried successfully",
        job,
      });
    } catch (error) {
      return next(error);
    }
  }
}

export default JobController;
