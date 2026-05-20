import { getStorageConfiguration } from "../infrastructure/storage";

/**
 * Fetch formatted summary of uploads configuration
 */
export const getUploadSummary = () => getStorageConfiguration();

export default {
  getUploadSummary,
};
