import { ValidationError } from "../errors.js";

/**
 * Higher-order middleware to validate incoming request data using Joi schemas
 * @param schema The Joi ObjectSchema to validate against
 * @param source The property of the Request object to validate (body, query, params, etc.)
 */
const validate = (schema, source = "body") => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const details = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message,
      }));

      return next(new ValidationError("Invalid request data", details));
    }

    req[source] = value;
    return next();
  };
};

export default validate;
export const validate = validate;
