import Joi from "joi";

export const documentId = Joi.object({
  id: Joi.string().hex().length(24).required(),
});

export const list = Joi.object({
  status: Joi.string().valid("pending", "processing", "completed", "failed"),
  search: Joi.string().allow("", null),
  page: Joi.number().integer().min(1),
  limit: Joi.number().integer().min(1).max(100),
});

export const documentValidators = {
  documentId,
  list,
};

export default documentValidators;
