'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { 
  debounce, 
  throttle, 
  memoize, 
  measurePerformance, 
  cache, 
  requestIdleCallback 
} from '@/lib/performance';

export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const debouncedRef = useRef(debounce(callback, delay));
  
  useEffect(() => {
    return () => {
      debouncedRef.current.cancel?.();
    };
  }, []);

  return debouncedRef.current as T;
}

export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const throttledRef = useRef(throttle(callback, delay));
  
  useEffect(() => {
    return () => {
      throttledRef.current.cancel?.();
    };
  }, []);

  return throttledRef.current as T;
}

export function useMemoized<T extends (...args: any[]) => any>(
  fn: T,
  deps?: React.DependencyList
): T {
  const memoizedFn = useMemo(() => memoize(fn), deps || []);
  return memoizedFn;
}

export function usePerformanceMonitor(name: string) {
  const [metrics, setMetrics] = useState<{
    duration: number;
    memory: number;
  } | null>(null);

  const measure = useCallback(() => {
    const result = measurePerformance(name);
    setMetrics(result);
    return result;
  }, [name]);

  return { metrics, measure };
}

export function useCache<T>(key: string, fetcher: () => Promise<T>, ttl = 300000) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const cached = cache.get(key) as T;
    if (cached) {
      setData(cached);
      return;
    }

    setLoading(true);
    fetcher()
      .then((result) => {
        cache.set(key, result);
        setData(result);
      })
      .catch((err) => {
        setError(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [key, fetcher, ttl]);

  const invalidate = useCallback(() => {
    (cache as any).delete?.(key);
    setData(null);
  }, [key]);

  return { data, loading, error, invalidate };
}

export function useIdleCallback(
  callback: () => void,
  options?: { timeout?: number }
) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    requestIdleCallback(() => callbackRef.current(), options);
  }, [options]);
}

export function useIntersectionObserver(
  target: React.RefObject<Element>,
  callback: IntersectionObserverCallback,
  options?: IntersectionObserverInit
) {
  useEffect(() => {
    const element = target.current;
    if (!element) return;

    const observer = new IntersectionObserver(callback, options);
    observer.observe(element);

    return () => {
      observer.unobserve(element);
      observer.disconnect();
    };
  }, [target, callback, options]);
}

export function useResizeObserver(
  target: React.RefObject<Element>,
  callback: ResizeObserverCallback
) {
  useEffect(() => {
    const element = target.current;
    if (!element) return;

    const observer = new ResizeObserver(callback);
    observer.observe(element);

    return () => {
      observer.unobserve(element);
      observer.disconnect();
    };
  }, [target, callback]);
}

export function useImagePreload(urls: string[]) {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  useEffect(() => {
    const promises = urls.map((url) => {
      return new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          setLoadedImages((prev) => new Set(prev).add(url));
          resolve();
        };
        img.onerror = () => {
          setFailedImages((prev) => new Set(prev).add(url));
          reject(new Error(`Failed to load image: ${url}`));
        };
        img.src = url;
      });
    });

    Promise.allSettled(promises);
  }, [urls]);

  return { loadedImages, failedImages };
}
