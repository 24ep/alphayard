'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

interface AnalyticsProviderProps {
  children: React.ReactNode;
  measurementId?: string;
}

export function AnalyticsProvider({ children, measurementId }: AnalyticsProviderProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!measurementId || typeof window === 'undefined') return;

    // Load Google Analytics
    const script = document.createElement('script');
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    script.async = true;
    document.head.appendChild(script);

    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      window.dataLayer.push(arguments);
    };
    window.gtag('js', new Date());
    window.gtag('config', measurementId, {
      page_path: pathname,
    });

    return () => {
      // Cleanup
      const scripts = document.head.querySelectorAll(`script[src*="googletagmanager"]`);
      scripts.forEach(script => script.remove());
    };
  }, [measurementId]);

  useEffect(() => {
    if (!measurementId || typeof window === 'undefined') return;

    // Track page views
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
    window.gtag('config', measurementId, {
      page_path: url,
    });
  }, [pathname, searchParams, measurementId]);

  return <>{children}</>;
}

// Performance monitoring
export function trackWebVitals() {
  if (typeof window === 'undefined') return;

  const reportWebVitals = (onPerfEntry?: (metric: any) => void) => {
    if (onPerfEntry && onPerfEntry instanceof Function) {
      import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
        getCLS(onPerfEntry);
        getFID(onPerfEntry);
        getFCP(onPerfEntry);
        getLCP(onPerfEntry);
        getTTFB(onPerfEntry);
      });
    }
  };

  reportWebVitals((metric) => {
    // Send to analytics
    if (window.gtag) {
      window.gtag('event', metric.name, {
        event_category: 'Web Vitals',
        event_label: metric.id,
        value: Math.round(metric.value),
        non_interaction: true,
      });
    }
  });
}

// Custom event tracking
export function trackEvent(eventName: string, parameters?: Record<string, any>) {
  if (typeof window === 'undefined' || !window.gtag) return;

  window.gtag('event', eventName, {
    event_category: 'Custom',
    ...parameters,
  });
}

// User engagement tracking
export function trackEngagement(action: string, label?: string) {
  trackEvent('engagement', {
    event_action: action,
    event_label: label,
  });
}

// Error tracking
export function trackError(error: Error, context?: string) {
  trackEvent('error', {
    event_action: 'javascript_error',
    event_label: context || error.message,
    value: error.stack?.length || 0,
  });
}

// Performance tracking
export function trackPerformance(metricName: string, value: number) {
  trackEvent('performance', {
    event_action: metricName,
    value: Math.round(value),
  });
}

// Declare types for gtag
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}
