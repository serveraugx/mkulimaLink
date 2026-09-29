'use client';

import { useState, useCallback } from 'react';
import api from '@/lib/api';
import { AxiosRequestConfig } from 'axios';

interface UseFetchState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Generic data-fetching hook using the shared API client.
 *
 * @example
 * const { data, isLoading, error, execute } = useFetch<User[]>();
 * useEffect(() => { execute('/users'); }, []);
 */
export function useFetch<T = unknown>() {
  const [state, setState] = useState<UseFetchState<T>>({
    data: null,
    isLoading: false,
    error: null,
  });

  const execute = useCallback(async (url: string, config?: AxiosRequestConfig) => {
    setState({ data: null, isLoading: true, error: null });
    try {
      const response = await api.request<{ data: T }>({ url, ...config });
      setState({ data: response.data.data, isLoading: false, error: null });
      return response.data.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      setState({ data: null, isLoading: false, error: message });
      throw err;
    }
  }, []);

  return { ...state, execute };
}
