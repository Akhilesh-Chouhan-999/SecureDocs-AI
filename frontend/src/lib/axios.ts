import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios';
import { ENV } from '../config/env.config';

/**
 * Standard enterprise axios instance setup in lib/ folder
 */
export const axiosInstance: AxiosInstance = axios.create({
  baseURL: ENV.API_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);
