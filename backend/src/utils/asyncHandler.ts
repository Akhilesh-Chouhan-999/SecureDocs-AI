/**
 * Express middleware wrapper to catch asynchronous errors and forward them to error middleware
 * @param handler Asynchronous route handler or middleware
 */
const asyncHandler = (handler) => {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
};

export { asyncHandler,
 };
