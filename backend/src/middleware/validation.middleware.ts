import { ValidationError } from "../errors/index.js";

/**
 * Higher-order middleware to validate incoming request data using Joi schemas
 * @param schema The Joi ObjectSchema to validate against
 * @param source The property of the Request object to validate (body, query, params, etc.)
 */
const validate = (schema: any, source = "body") => {
  return (req: any, _res: any, next: any) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const details = error.details.map((detail: any) => ({
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
