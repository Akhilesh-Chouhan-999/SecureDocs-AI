import Joi from "joi";

export const email = Joi.object({
  email: Joi.string().email().required(),
});

export const search = Joi.object({
  email: Joi.string().email(),
  key: Joi.string(),
  source: Joi.string(),
  search: Joi.string().allow("", null),
  page: Joi.number().integer().min(1),
  limit: Joi.number().integer().min(1).max(100),
});

export const historyValidators = {
  email,
  search,
};

export default historyValidators;
