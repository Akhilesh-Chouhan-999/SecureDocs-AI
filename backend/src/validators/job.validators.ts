import Joi from "joi";

export const createAnalysisJob = Joi.object({
  documentId: Joi.string().hex().length(24).required(),
});

export const jobId = Joi.object({
  jobId: Joi.string().required(),
});

export const listJobs = Joi.object({
  status: Joi.string().valid("queued", "processing", "completed", "failed", "canceled"),
});

export const jobValidators = {
  createAnalysisJob,
  jobId,
  listJobs,
};

export default jobValidators;
