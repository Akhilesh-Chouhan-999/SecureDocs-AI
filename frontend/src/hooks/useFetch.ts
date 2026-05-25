import { useState, useEffect } from 'react';
import { axiosInstance } from '../../lib/axios';
import { AxiosRequestConfig, AxiosError } from 'axios';

interface FetchState<T> {
  data: T | null;
  error: AxiosError | null;
  isLoading: boolean;
}

export function useFetch<T>(url: string, options?: AxiosRequestConfig) {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    error: null,
    isLoading: true,
  });

  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      setState(s => ({ ...s, isLoading: true }));
      try {
        const response = await axiosInstance(url, options);
        if (isMounted) {
          setState({ data: response.data, error: null, isLoading: false });
        }
      } catch (error) {
        if (isMounted) {
          setState({ data: null, error: error as AxiosError, isLoading: false });
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [url, JSON.stringify(options)]);

  return state;
}
