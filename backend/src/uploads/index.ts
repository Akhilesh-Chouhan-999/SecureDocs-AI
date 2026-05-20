import { getStorageConfiguration } from "../infrastructure/storage/index.js";

/**
 * Fetch formatted summary of uploads configuration
 */
export const getUploadSummary = () => getStorageConfiguration();

export default {
  getUploadSummary,
};
