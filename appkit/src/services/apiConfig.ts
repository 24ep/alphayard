// Shared API base URL configuration for the admin console
// In the browser, use relative URL so requests go through Next.js API routes
// On the server (SSR), call the backend directly
const localPort = process.env.PORT || '3002';
const defaultBase = typeof window !== 'undefined'
  ? '/api/v1'  // Browser: uses Next.js API routes as proxy
  : `${process.env.BACKEND_ADMIN_URL || `http://127.0.0.1:${localPort}`}/api/v1`;  // SSR: uses runtime env var

export const API_BASE_URL: string = process.env.NEXT_PUBLIC_API_URL || defaultBase;
