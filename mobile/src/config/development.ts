export const DEVELOPMENT_CONFIG = {
  // API Configuration
  API_BASE_URL: 'http://localhost:3000',
  API_TIMEOUT: 30000,
  
  // App Configuration
  APP_NAME: 'Bondarys (Dev)',
  APP_VERSION: '1.0.0',
  BUILD_NUMBER: '1',
  
  // Feature Flags
  FEATURES: {
    LOCATION_TRACKING: true,
    PUSH_NOTIFICATIONS: false, // Disabled in dev
    VOICE_CALLS: false, // Disabled in dev
    VIDEO_CALLS: false, // Disabled in dev
    FILE_SHARING: true,
    EMERGENCY_ALERTS: false, // Disabled in dev
    FAMILY_CHAT: true,
    CALENDAR: true,
    EXPENSES: true,
    PHOTOS: true,
  },
  
  // Security
  SECURITY: {
    ENCRYPTION_ENABLED: false, // Disabled in dev
    BIOMETRIC_AUTH: false, // Disabled in dev
    SESSION_TIMEOUT: 86400, // 24 hours for dev
    MAX_LOGIN_ATTEMPTS: 10, // Higher for dev
  },
  
  // Performance
  PERFORMANCE: {
    CACHE_ENABLED: false, // Disabled in dev
    CACHE_DURATION: 60, // 1 minute for dev
    IMAGE_COMPRESSION: false, // Disabled in dev
    LAZY_LOADING: false, // Disabled in dev
  },
  
  // Analytics
  ANALYTICS: {
    ENABLED: false, // Disabled in dev
    TRACK_EVENTS: false,
    TRACK_CRASHES: false,
    TRACK_PERFORMANCE: false,
  },
  
  // Monitoring
  MONITORING: {
    ERROR_REPORTING: true,
    PERFORMANCE_MONITORING: true,
    CRASH_REPORTING: false, // Disabled in dev
  },
  
  // Debug
  DEBUG: {
    LOG_LEVEL: 'debug',
    SHOW_DEBUG_MENU: true,
    MOCK_DATA: true,
    NETWORK_LOGGING: true,
  },
}; 