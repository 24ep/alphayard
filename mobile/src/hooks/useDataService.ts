import { useState, useEffect, useCallback } from 'react';
import { ServiceResponse, ServiceWrapper, ErrorHandler } from '../utils/errorHandling';

export interface UseDataServiceOptions<T> {
  retries?: number;
  retryDelay?: number;
  fallbackData?: T;
  autoFetch?: boolean;
  dependencies?: any[];
}

export interface UseDataServiceReturn<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
  refetch: () => Promise<void>;
  clearError: () => void;
}

export function useDataService<T>(
  serviceCall: () => Promise<T>,
  options: UseDataServiceOptions<T> = {}
): UseDataServiceReturn<T> {
  const {
    retries = 2,
    retryDelay = 1000,
    fallbackData = null,
    autoFetch = true,
    dependencies = []
  } = options;

  const [data, setData] = useState<T | null>(fallbackData);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    const result = await ServiceWrapper.execute(serviceCall, {
      retries,
      retryDelay,
      fallbackData
    });

    setData(result.data);
    setError(result.error ? ErrorHandler.getErrorMessage(result.error) : null);
    setLoading(false);
  }, [serviceCall, retries, retryDelay, fallbackData]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [autoFetch, fetchData, ...dependencies]);

  return {
    data,
    error,
    loading,
    refetch: fetchData,
    clearError
  };
}

export function useDataServiceWithRefresh<T>(
  serviceCall: () => Promise<T>,
  options: UseDataServiceOptions<T> = {}
) {
  const service = useDataService(serviceCall, options);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await service.refetch();
    setRefreshing(false);
  }, [service]);

  return {
    ...service,
    refreshing,
    onRefresh
  };
}

export function useDataServiceWithPagination<T>(
  serviceCall: (page: number, limit: number) => Promise<{ data: T[]; hasMore: boolean; total: number }>,
  options: UseDataServiceOptions<{ data: T[]; hasMore: boolean; total: number }> = {}
) {
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [allData, setAllData] = useState<T[]>([]);
  const [total, setTotal] = useState(0);

  const service = useDataService(
    () => serviceCall(page, 20),
    {
      ...options,
      fallbackData: { data: [], hasMore: false, total: 0 }
    }
  );

  const loadMore = useCallback(async () => {
    if (!hasMore || service.loading) return;
    
    setPage(prev => prev + 1);
  }, [hasMore, service.loading]);

  const reset = useCallback(() => {
    setPage(1);
    setAllData([]);
    setHasMore(true);
    setTotal(0);
  }, []);

  useEffect(() => {
    if (service.data) {
      if (page === 1) {
        setAllData(service.data.data);
      } else {
        setAllData(prev => [...prev, ...service.data!.data]);
      }
      setHasMore(service.data.hasMore);
      setTotal(service.data.total);
    }
  }, [service.data, page]);

  return {
    data: allData,
    error: service.error,
    loading: service.loading,
    hasMore,
    total,
    loadMore,
    reset,
    refetch: () => {
      reset();
      return service.refetch();
    },
    clearError: service.clearError
  };
}
