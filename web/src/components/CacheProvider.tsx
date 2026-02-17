'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface CacheContextType {
  get: <T>(key: string) => T | null;
  set: <T>(key: string, value: T, ttl?: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  size: () => number;
}

const CacheContext = createContext<CacheContextType | null>(null);

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl?: number;
}

export function CacheProvider({ children }: { children: ReactNode }) {
  const [cache, setCache] = useState<Map<string, CacheItem<any>>>(new Map());

  const get = <T,>(key: string): T | null => {
    const item = cache.get(key);
    if (!item) return null;

    // Check if item is expired
    if (item.ttl && Date.now() - item.timestamp > item.ttl) {
      cache.delete(key);
      setCache(new Map(cache));
      return null;
    }

    return item.data;
  };

  const set = <T,>(key: string, value: T, ttl = 300000) => {
    const item: CacheItem<T> = {
      data: value,
      timestamp: Date.now(),
      ttl,
    };

    const newCache = new Map(cache);
    newCache.set(key, item);
    setCache(newCache);
  };

  const remove = (key: string) => {
    const newCache = new Map(cache);
    newCache.delete(key);
    setCache(newCache);
  };

  const clear = () => {
    setCache(new Map());
  };

  const size = () => cache.size;

  // Cleanup expired items periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const newCache = new Map<string, CacheItem<any>>();

      cache.forEach((item, key) => {
        if (!item.ttl || now - item.timestamp <= item.ttl) {
          newCache.set(key, item);
        }
      });

      if (newCache.size !== cache.size) {
        setCache(newCache);
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [cache]);

  const value: CacheContextType = {
    get,
    set,
    remove,
    clear,
    size,
  };

  return (
    <CacheContext.Provider value={value}>
      {children}
    </CacheContext.Provider>
  );
}

export function useCache() {
  const context = useContext(CacheContext);
  if (!context) {
    throw new Error('useCache must be used within a CacheProvider');
  }
  return context;
}

// Hook for API response caching
export function useApiCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl = 300000
) {
  const cache = useCache();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Try to get from cache first
    const cached = cache.get<T>(key);
    if (cached) {
      setData(cached);
      return;
    }

    // Fetch fresh data
    setLoading(true);
    fetcher()
      .then((result) => {
        cache.set(key, result, ttl);
        setData(result);
      })
      .catch((err) => {
        setError(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [key, fetcher, ttl, cache]);

  const invalidate = () => {
    cache.remove(key);
    setData(null);
  };

  const refetch = () => {
    setLoading(true);
    fetcher()
      .then((result) => {
        cache.set(key, result, ttl);
        setData(result);
        setError(null);
      })
      .catch((err) => {
        setError(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return { data, loading, error, invalidate, refetch };
}

// Local storage cache for persistent data
export const localStorageCache = {
  get: <T,>(key: string): T | null => {
    if (typeof window === 'undefined') return null;
    
    try {
      const item = localStorage.getItem(`cache_${key}`);
      if (!item) return null;

      const parsed = JSON.parse(item);
      
      // Check if expired
      if (parsed.expires && Date.now() > parsed.expires) {
        localStorage.removeItem(`cache_${key}`);
        return null;
      }

      return parsed.data;
    } catch {
      return null;
    }
  },

  set: <T,>(key: string, data: T, ttl = 300000) => {
    if (typeof window === 'undefined') return;

    try {
      const item = {
        data,
        expires: Date.now() + ttl,
      };

      localStorage.setItem(`cache_${key}`, JSON.stringify(item));
    } catch (error) {
      console.warn('Failed to set localStorage cache:', error);
    }
  },

  remove: (key: string) => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.removeItem(`cache_${key}`);
    } catch (error) {
      console.warn('Failed to remove localStorage cache:', error);
    }
  },

  clear: () => {
    if (typeof window === 'undefined') return;

    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('cache_')) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Failed to clear localStorage cache:', error);
    }
  },
};
