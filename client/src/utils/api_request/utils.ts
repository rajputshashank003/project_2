import axios, { type AxiosRequestConfig, type AxiosError } from 'axios';
import toast from 'react-hot-toast';
import { STORAGE_KEYS } from '../constants';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach auth token and handle FormData Content-Type
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
    if (typeof config.headers.delete === 'function') {
      config.headers.delete('Content-Type');
    }
  }
  return config;
});

// Handle 401 globally
axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface RequestConfig extends AxiosRequestConfig {
  showErrorToast?: boolean;
}

// Backend success envelope: { data: T }
export interface ApiResponse<T> {
  data: T;
}

// Backend paginated list envelope: { data: T[], pagination: {...} }
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/** Unwraps the backend's { data: T } single-item envelope */
export const unwrap = <T>(response: ApiResponse<T>): T => response.data;

export const request = async <T>(config: RequestConfig): Promise<T> => {
  const { showErrorToast = true, ...axiosConfig } = config;
  try {
    const response = await axiosInstance.request<T>(axiosConfig);
    return response.data;
  } catch (err) {
    const axiosErr = err as AxiosError<{ error?: { message?: string }; message?: string }>;
    const message =
      axiosErr.response?.data?.error?.message ||
      axiosErr.response?.data?.message ||
      axiosErr.message ||
      'Something went wrong';
    if (showErrorToast) {
      toast.error(message);
    }
    throw err;
  }
};
