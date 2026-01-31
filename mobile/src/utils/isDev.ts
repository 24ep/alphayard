/**
 * Centralized development environment check.
 * This utility provides a web-safe alternative to React Native's __DEV__ global.
 * Use this instead of __DEV__ directly to ensure compatibility with web environments
 * (e.g., when mobile code is imported into a Next.js admin panel via react-native-web).
 */
export const isDev = typeof __DEV__ !== 'undefined' ? __DEV__ : process.env.NODE_ENV !== 'production';
