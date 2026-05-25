import { AxiosError, InternalAxiosRequestConfig } from 'axios';

export const handleApiRequest = (config: InternalAxiosRequestConfig) => {
  // E.g., add analytics tags, transform URLs
  return config;
};

export const handleApiError = (error: AxiosError) => {
  if (error.response?.status === 401) {
    console.error('Session expired. Redirecting to login...');
    window.location.href = '/login';
  }
  return Promise.reject(error);
};
