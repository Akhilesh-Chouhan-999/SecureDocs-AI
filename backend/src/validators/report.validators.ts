import Joi from "joi";

export const generate = Joi.object({
  documentId: Joi.string().hex().length(24).required(),
  anomalies: Joi.array().items(
    Joi.object({
      type: Joi.string().required(),
      severity: Joi.string()
        .valid("low", "medium", "high", "critical")
        .required(),
      description: Joi.string().required(),
      affectedField: Joi.string().default("document"),
      confidence: Joi.number().min(0).max(1).default(0.5),
      suggestedAction: Joi.string().default("Review manually"),
    }),
  ),
});

export const reportId = Joi.object({
  reportId: Joi.string().hex().length(24).required(),
});

export const userId = Joi.object({
  userId: Joi.string().hex().length(24).required(),
});

export const list = Joi.object({
  riskLevel: Joi.string().valid("low", "medium", "high", "critical"),
  decision: Joi.string().valid(
    "pending",
    "approved",
    "rejected",
    "manual_review",
  ),
  search: Joi.string().allow("", null),
  minRiskScore: Joi.number().min(0).max(100),
  maxRiskScore: Joi.number().min(0).max(100),
  page: Joi.number().integer().min(1),
  limit: Joi.number().integer().min(1).max(100),
});

export const review = Joi.object({
  decision: Joi.string()
    .valid("pending", "approved", "rejected", "manual_review")
    .required(),
  notes: Joi.string().allow("", null).max(2000),
});

export const reportValidators = {
  generate,
  reportId,
  userId,
  list,
  review,
};

export default reportValidators;
