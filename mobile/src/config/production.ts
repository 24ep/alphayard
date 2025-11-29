export const PRODUCTION_CONFIG = {
  // API Configuration
  API_BASE_URL: 'https://api.bondarys.com',
  API_TIMEOUT: 30000,
  
  // App Configuration
  APP_NAME: 'Bondarys',
  APP_VERSION: '1.0.0',
  BUILD_NUMBER: '1',
  
  // Feature Flags
  FEATURES: {
    LOCATION_TRACKING: true,
    PUSH_NOTIFICATIONS: true,
    VOICE_CALLS: true,
    VIDEO_CALLS: true,
    FILE_SHARING: true,
    EMERGENCY_ALERTS: true,
    FAMILY_CHAT: true,
    CALENDAR: true,
    EXPENSES: true,
    PHOTOS: true,
  },
  
  // Security
  SECURITY: {
    ENCRYPTION_ENABLED: true,
    BIOMETRIC_AUTH: true,
    SESSION_TIMEOUT: 3600, // 1 hour
    MAX_LOGIN_ATTEMPTS: 5,
  },
  
  // Performance
  PERFORMANCE: {
    CACHE_ENABLED: true,
    CACHE_DURATION: 300, // 5 minutes
    IMAGE_COMPRESSION: true,
    LAZY_LOADING: true,
  },
  
  // Analytics
  ANALYTICS: {
    ENABLED: true,
    TRACK_EVENTS: true,
    TRACK_CRASHES: true,
    TRACK_PERFORMANCE: true,
  },
  
  // Monitoring
  MONITORING: {
    ERROR_REPORTING: true,
    PERFORMANCE_MONITORING: true,
    CRASH_REPORTING: true,
  },
}; 