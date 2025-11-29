// Re-export the unified apiClient to keep imports stable
export { apiClient as api } from './apiClient';
export * from './auth';
export * from './chat';
export * from './location';
export * from './safety';
export * from './hourse';
export * from './storage';
export * from './notes';
export * from './todos';

// New data services APIs
export * from './social';
export * from './familyStatus';
export * from './appointments';
export * from './shopping';
export * from './recentlyUsed';
export * from './locationData';
export * from './widgets';