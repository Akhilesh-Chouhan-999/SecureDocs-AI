import { container } from "../config/index.js";
import { created, success } from "../utils/apiResponse.js";

/**
 * Controller exposing endpoints for creating, listing, checking status, cancelling, and retrying async jobs
 */
export class JobController {

  static async createAnalysisJob(req: any, res: any, next: any) {
    try {
      const job = await container
        .get("jobService")
        .createAnalysisJob({
          documentId: req.body.documentId,
          userId: req.user._id,
        });
      return created(res, { message: "Analysis job queued", job });
    } catch (error) {
      return next(error);
    }
  }

  static async getJobStatus(req: any, res: any, next: any) {
    try {
      const job = await container
        .get("jobService")
        .getJobStatus(req.params.jobId);
      return success(res, { job });
    } catch (error) {
      return next(error);
    }
  }

  static async listJobs(req: any, res: any, next: any) {
    try {
      const result = await container
        .get("jobService")
        .listJobs(req.user._id, req.query);
      return success(res, result);
    } catch (error) {
      return next(error);
    }
  }

  static async cancelJob(req: any, res: any, next: any) {
    try {
      const job = await container
        .get("jobService")
        .cancelJob(req.params.jobId, req.user._id);
      return success(res, { message: "Job canceled successfully", job });
    } catch (error) {
      return next(error);
    }
  }

  static async retryJob(req: any, res: any, next: any) {
    try {
      const job = await container
        .get("jobService")
        .retryJob(req.params.jobId, req.user._id);
      return success(res, { message: "Job retried successfully", job });
    } catch (error) {
      return next(error);
    }
  }

}
