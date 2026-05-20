/**
 * Send a structured HTTP success response (200 OK by default)
 * @param res Express Response object
 * @param data Response payload properties to merge
 * @param statusCode HTTP status code (default: 200)
 */
export const success = (res: any, data: any = {}, statusCode: number = 200) => {
  return res.status(statusCode).json({
    success: true,
    ...data,
  });
};

/**
 * Send a structured HTTP resource created response (201 Created)
 * @param res Express Response object
 * @param data Response payload properties to merge
 */
export const created = (res: any, data: any = {}) => {
  return success(res, data, 201);
};

export const apiResponse = {
  success,
  created,
};
