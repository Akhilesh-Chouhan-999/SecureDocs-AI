import Joi from "joi";

export const analyze = Joi.object({
  documentId: Joi.string().hex().length(24).required(),
  runAsync: Joi.boolean().default(false),
});

export const documentId = Joi.object({
  documentId: Joi.string().hex().length(24).required(),
});

export const batchOcr = Joi.object({
  documentIds: Joi.array()
    .items(Joi.string().hex().length(24))
    .min(1)
    .max(10)
    .required(),
});

export const analysisValidators = {
  analyze,
  riskScore: analyze,
  documentId,
  batchOcr,
};

export default analysisValidators;
