// API base URL configuration
// Browser: relative URL → Next.js handles routing via rewrites
// Server (SSR): absolute URL to the running server
const getBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    return '/api';
  }

  const port = process.env.PORT || '3002';
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ||
         `http://127.0.0.1:${port}`;
};

export const API_BASE_URL: string = getBaseUrl();
