/**
 * Decorator helper appending standardized metadata to API payload response
 * @param payload Result payload structure
 * @param meta Additional properties to override/extend
 */
export const withMeta = (
  payload: Record<string, any>,
  meta: Record<string, any> = {},
) => ({
  ...payload,
  meta: {
    generatedAt: new Date().toISOString(),
    ...meta,
  },
});
