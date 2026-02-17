// Performance optimization utilities for Next.js web application

import { useState, useEffect } from 'react';

// Intersection Observer for lazy loading
export function useIntersectionObserver(
  element: Element | null,
  callback: (entries: IntersectionObserverEntry[]) => void,
  options?: IntersectionObserverInit
) {
  if (typeof window === 'undefined') return null;

  const observer = new IntersectionObserver(callback, options);
  
  if (element) {
    observer.observe(element);
  }

  return () => {
    if (element) {
      observer.unobserve(element);
    }
  };
}

// Image lazy loading with blur-up effect
export function createLazyImage(src: string, alt: string, className?: string) {
  const img = document.createElement('img');
  img.alt = alt;
  img.className = className || '';
  img.style.filter = 'blur(10px)';
  img.style.transition = 'filter 0.3s ease-in-out';
  
  img.src = src;
  
  img.onload = () => {
    img.style.filter = 'blur(0px)';
  };
  
  return img;
}

// Preload critical resources
export function preloadResource(href: string, as: string) {
  if (typeof document === 'undefined') return;
  
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = as;
  
  if (as === 'image') {
    link.imageSrcset = href;
  }
  
  document.head.appendChild(link);
}

// Prefetch pages for navigation
export function prefetchPage(url: string) {
  if (typeof document === 'undefined') return;
  
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = url;
  
  document.head.appendChild(link);
}

// Debounce function for performance
export function debounce<T extends (...args: any[])>(
  func: T,
  wait: number
): T & { cancel: () => void } {
  let timeout: NodeJS.Timeout;
  
  const debounced = ((...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  }) as T & { cancel: () => void };
  
  debounced.cancel = () => {
    clearTimeout(timeout);
  };
  
  return debounced;
}

// Throttle function for performance
export function throttle<T extends (...args: any[])>(
  func: T,
  limit: number
): T & { cancel: () => void } {
  let inThrottle: boolean;
  
  const throttled = ((...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  }) as T & { cancel: () => void };
  
  throttled.cancel = () => {
    inThrottle = false;
  };
  
  return throttled;
}

// Memoization for expensive computations
export function memoize<T extends (...args: any[])>(
  func: T
): T {
  const cache = new Map<string, ReturnType<T>>();
  
  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = func(...args);
    cache.set(key, result);
    
    return result;
  }) as T;
}

// Virtual scrolling for large lists
export function useVirtualScroll<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  renderItem: (item: T, index: number) => React.ReactNode
) {
  const [scrollTop, setScrollTop] = useState(0);
  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(Math.ceil(containerHeight / itemHeight));
  
  const visibleItems = items.slice(startIndex, endIndex);
  
  const handleScroll = throttle((e: Event) => {
    const target = e.target as HTMLDivElement;
    const newScrollTop = target.scrollTop;
    setScrollTop(newScrollTop);
    
    const newStartIndex = Math.floor(newScrollTop / itemHeight);
    const newEndIndex = Math.min(
      newStartIndex + Math.ceil(containerHeight / itemHeight),
      items.length
    );
    
    setStartIndex(newStartIndex);
    setEndIndex(newEndIndex);
  }, 100) as (e: Event) => void;
  
  return {
    visibleItems,
    startIndex,
    endIndex,
    handleScroll,
    scrollTop,
    totalHeight: items.length * itemHeight,
  };
}

// Image optimization utilities
export const imageUtils = {
  // Generate responsive image srcset
  generateSrcSet: (baseUrl: string, widths: number[]) => {
    return widths
      .map(width => `${baseUrl}?w=${width} ${width}w`)
      .join(', ');
  },
  
  // Generate WebP and AVIF formats
  generateModernFormats: (baseUrl: string) => {
    return `${baseUrl}?format=webp&format=avif`;
  },
  
  // Calculate optimal image size
  calculateOptimalSize: (containerWidth: number, containerHeight: number) => {
    const aspectRatio = containerWidth / containerHeight;
    const maxWidth = Math.min(containerWidth, 1920);
    const maxHeight = Math.min(containerHeight, 1080);
    
    if (aspectRatio > 1) {
      return { width: maxWidth, height: Math.round(maxWidth / aspectRatio) };
    } else {
      return { width: Math.round(maxHeight * aspectRatio), height: maxHeight };
    }
  },
};

// Font loading optimization
export const fontUtils = {
  // Preload fonts
  preloadFont: (fontFamily: string, fontUrl: string, fontWeight = 'normal') => {
    preloadResource(fontUrl, 'font');
    
    if (typeof document !== 'undefined') {
      const style = document.createElement('style');
      style.textContent = `
        @font-face {
          font-family: '${fontFamily}';
          src: url('${fontUrl}') format('woff2');
          font-weight: ${fontWeight};
          font-display: swap;
        }
      `;
      document.head.appendChild(style);
    }
  },
  
  // Font loading observer
  observeFontLoading: (fontFamily: string) => {
    if (typeof document === 'undefined') return;
    
    const fonts = document.fonts;
    
    fonts.forEach((font: any) => {
      if (font.family.includes(fontFamily)) {
        font.load().then(() => {
          console.log(`Font loaded: ${font.family}`);
        }).catch(() => {
          console.log(`Font failed to load: ${font.family}`);
        });
      }
    });
  },
};

// Performance monitoring
export const performanceUtils = {
  // Measure Core Web Vitals
  measureWebVitals: () => {
    if (typeof window === 'undefined') return null;
    
    return new Promise((resolve) => {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        
        const vitals = entries.reduce((acc, entry) => {
          switch (entry.name) {
            case 'LCP':
              acc.lcp = entry.startTime;
              break;
            case 'FID': {
              const fidEntry = entry as any;
              acc.fid = fidEntry.processingStart - fidEntry.startTime;
              break;
            }
            case 'CLS': {
              const clsEntry = entry as any;
              acc.cls = clsEntry.value;
              break;
            }
            case 'FCP': {
              const fcpEntry = entry as any;
              acc.fcp = fcpEntry.responseStart;
              break;
            }
            case 'TTFB': {
              const ttfbEntry = entry as any;
              acc.ttfb = ttfbEntry.responseStart - ttfbEntry.requestStart;
              break;
            }
          }
          return acc;
        }, {} as any);
        
        resolve(vitals);
      });
      
      observer.observe({ entryTypes: ['navigation', 'paint', 'layout'] });
    });
  },
  
  // Measure page load time
  measurePageLoadTime: () => {
    if (typeof window === 'undefined') return 0;
    
    const navigation = performance.getEntriesByType('navigation')[0] as any;
    return navigation ? navigation.loadEventEnd - navigation.fetchStart : 0;
  },
  
  // Get memory usage
  getMemoryUsage: () => {
    if (typeof window === 'undefined' || !('memory' in performance)) {
      return { used: 0, total: 0 };
    }
    
    const memory = (performance as any).memory;
    return {
      used: memory.usedJSHeapSize,
      total: memory.totalJSHeapSize,
    };
  },
};

// Cache management
export const cacheUtils = {
  // Simple in-memory cache
  createCache: <T>(maxSize: number = 100) => {
    const cache = new Map<string, { data: T; timestamp: number }>();
    
    return {
      get: (key: string) => {
        const item = cache.get(key);
        if (!item) return null;
        
        // Check if item is expired (5 minutes)
        if (Date.now() - item.timestamp > 5 * 60 * 1000) {
          cache.delete(key);
          return null;
        }
        
        return item.data;
      },
      
      set: (key: string, data: T) => {
        // Remove oldest item if cache is full
        if (cache.size >= maxSize) {
          const firstKey = cache.keys().next().value;
          if (firstKey) {
            cache.delete(firstKey);
          }
        }
        
        cache.set(key, { data, timestamp: Date.now() });
      },
      
      clear: () => {
        cache.clear();
      },
      
      size: () => cache.size,
    };
  },
  
  // Local storage cache with expiration
  createLocalStorageCache: <T>(prefix: string = 'cache_') => {
    return {
      get: (key: string): T | null => {
        try {
          const item = localStorage.getItem(`${prefix}${key}`);
          if (!item) return null;
          
          const parsed = JSON.parse(item);
          
          // Check if expired
          if (parsed.expires && Date.now() > parsed.expires) {
            localStorage.removeItem(`${prefix}${key}`);
            return null;
          }
          
          return parsed.data;
        } catch {
          return null;
        }
      },
      
      set: (key: string, data: T, ttl: number = 5 * 60 * 1000) => {
        try {
          const item = {
            data,
            expires: Date.now() + ttl,
          };
          
          localStorage.setItem(`${prefix}${key}`, JSON.stringify(item));
        } catch (error) {
          console.warn('Failed to set cache item:', error);
        }
      },
      
      remove: (key: string) => {
        try {
          localStorage.removeItem(`${prefix}${key}`);
        } catch (error) {
          console.warn('Failed to remove cache item:', error);
        }
      },
      
      clear: () => {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          if (key.startsWith(prefix)) {
            localStorage.removeItem(key);
          }
        });
      },
    };
  },
};

// Performance monitoring utilities
export const measurePerformance = (name: string) => {
  if (typeof window === 'undefined') return { duration: 0, memory: 0 };
  
  const startTime = performance.now();
  const startMemory = performanceUtils.getMemoryUsage();
  
  return {
    duration: performance.now() - startTime,
    memory: startMemory.used,
  };
};

// Request idle callback polyfill
export const requestIdleCallback = (callback: () => void, options?: { timeout?: number }) => {
  if (typeof window === 'undefined') return;
  
  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(callback, options);
  } else {
    setTimeout(callback, options?.timeout || 1);
  }
};

// Simple cache instance
export const cache = cacheUtils.createCache();

export default {
  useIntersectionObserver,
  createLazyImage,
  preloadResource,
  prefetchPage,
  debounce,
  throttle,
  memoize,
  useVirtualScroll,
  imageUtils,
  fontUtils,
  performanceUtils,
  cacheUtils,
};
