import { axiosInstance } from "../lib/axios";

/**
 * Service API wrapper extending the base Axios instance.
 * Maps responses to their data payloads.
 */
const api = {
  get: <T = any>(url: string) =>
    axiosInstance.get<T>(url).then((res) => res.data),
  post: <T = any>(url: string, data?: any, config?: any) =>
    axiosInstance.post<T>(url, data, config).then((res) => res.data),
  put: <T = any>(url: string, data?: any) =>
    axiosInstance.put<T>(url, data).then((res) => res.data),
  delete: <T = any>(url: string) =>
    axiosInstance.delete<T>(url).then((res) => res.data),
};

export default api;
