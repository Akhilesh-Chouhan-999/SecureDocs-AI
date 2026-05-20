import Joi from "joi";

export const analyze = Joi.object({
  documentId: Joi.string().hex().length(24).required(),
  runAsync: Joi.boolean().default(false),
});

export const documentId = Joi.object({
  documentId: Joi.string().hex().length(24).required(),
});

export const analysisValidators = {
  analyze,
  riskScore: analyze,
  documentId,
};

export default analysisValidators;
