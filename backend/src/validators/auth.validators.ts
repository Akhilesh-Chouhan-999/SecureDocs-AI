import Joi from "joi";

export const register = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  organization: Joi.string().min(2).max(120).required(),
  role: Joi.string().valid("analyst", "admin", "manager").default("analyst"),
});

export const login = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const refreshToken = Joi.object({
  refreshToken: Joi.string().required(),
});

export const authValidators = {
  register,
  login,
  refreshToken,
};

export default authValidators;
