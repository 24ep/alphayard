// API Configuration
import { isDev } from '../utils/isDev';

export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:4000/api/v1',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
    CHANGE_PASSWORD: '/auth/change-password',
    GOOGLE: '/auth/google',
    FACEBOOK: '/auth/facebook',
    APPLE: '/auth/apple',
    ME: '/auth/me',
  },

  // Users
  USERS: {
    PROFILE: '/users/profile',
    AVATAR: '/users/avatar',
    PREFERENCES: '/users/preferences',
    EMERGENCY_CONTACTS: '/users/emergency-contacts',
    GEOFENCES: '/users/geofences',
    ACCOUNT: '/users/account',
  },

  // Families
  FAMILIES: {
    LIST: '/families',
    CREATE: '/families',
    DETAILS: (id: string) => `/families/${id}`,
    UPDATE: (id: string) => `/families/${id}`,
    DELETE: (id: string) => `/families/${id}`,
    MEMBERS: (id: string) => `/families/${id}/members`,
    INVITE: (id: string) => `/families/${id}/invite`,
    LEAVE: (id: string) => `/families/${id}/leave`,
    SETTINGS: (id: string) => `/families/${id}/settings`,
  },

  // Invitations
  INVITATIONS: {
    LIST: '/invitations',
    ACCEPT: (id: string) => `/invitations/${id}/accept`,
    DECLINE: (id: string) => `/invitations/${id}/decline`,
  },

  // Location
  LOCATION: {
    UPDATE: '/location/update',
    HISTORY: '/location/history',
    Circle: '/location/Circle',
    GEOFENCE: '/location/geofence',
    REQUEST: '/location/request',
  },

  // Safety
  SAFETY: {
    ALERT: '/safety/alert',
    CHECK: '/safety/check',
    CRISIS: '/safety/crisis',
    NOTIFICATIONS: '/safety/notifications',
  },

  // Chat
  CHAT: {
    LIST: '/chat',
    CREATE: '/chat',
    MESSAGES: (id: string) => `/chat/${id}/messages`,
    SEND: (id: string) => `/chat/${id}/send`,
    FILES: (id: string) => `/chat/${id}/files`,
  },

  // Billing
  BILLING: {
    SUBSCRIPTION: '/billing/subscription',
    PAYMENT_METHODS: '/billing/payment-methods',
    INVOICES: '/billing/invoices',
    CANCEL: '/billing/cancel',
  },

  // Admin
  ADMIN: {
    USERS: '/admin/users',
    FAMILIES: '/admin/families',
    SUBSCRIPTIONS: '/admin/subscriptions',
    ANALYTICS: '/admin/analytics',
    BROADCAST: '/admin/broadcast',
  },

  // Webhooks
  WEBHOOKS: {
    STRIPE: '/webhooks/stripe',
    TWILIO: '/webhooks/twilio',
    FIREBASE: '/webhooks/firebase',
    GOOGLE: '/webhooks/google',
    APPLE: '/webhooks/apple',
    AWS: '/webhooks/aws',
    SENTRY: '/webhooks/sentry',
  },

  // Health
  HEALTH: '/health',
};

// App Configuration
export const APP_CONFIG = {
  NAME: 'Bondarys',
  VERSION: '1.0.0',
  BUILD_NUMBER: '1',
  BUNDLE_ID: 'com.bondarys.app',
  
  // Features
  FEATURES: {
    CIRCLE_MANAGEMENT: true,
    LOCATION_TRACKING: true,
    SAFETY_FEATURES: true,
    CHAT: true,
    VIDEO_CALLS: true,
    FILE_SHARING: true,
    CALENDAR: true,
    GALLERY: true,
    NOTES: true,
    GOALS: true,
    GAMES: true,
    MUSIC: true,
    VIDEOS: true,
    BILLING: true,
    SHOPPING: true,
    HEALTH: true,
    EDUCATION: true,
  },

  // Limits
  LIMITS: {
    MAX_CIRCLE_MEMBERS: 10,
    MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB
    MAX_MESSAGE_LENGTH: 1000,
    MAX_EVENT_DURATION: 24 * 60 * 60 * 1000, // 24 hours
    MAX_GEOFENCE_RADIUS: 10000, // 10km
    MAX_EMERGENCY_CONTACTS: 5,
  },

  // Timeouts
  TIMEOUTS: {
    LOCATION_UPDATE: 30000, // 30 seconds
    SAFETY_CHECK: 60000, // 1 minute
    MESSAGE_SEND: 10000, // 10 seconds
    FILE_UPLOAD: 300000, // 5 minutes
    VIDEO_CALL: 300000, // 5 minutes
  },

  // Cache
  CACHE: {
    USER_PROFILE: 300000, // 5 minutes
    CIRCLE_DATA: 60000, // 1 minute
    LOCATION_HISTORY: 3600000, // 1 hour
    MESSAGES: 300000, // 5 minutes
  },
};

// Storage Keys
export const STORAGE_KEYS = {
  // Authentication
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  TOKEN_EXPIRES_AT: 'token_expires_at',
  USER: 'user',
  
  // App Settings
  THEME: 'theme',
  LANGUAGE: 'language',
  NOTIFICATIONS: 'notifications',
  PRIVACY: 'privacy',
  
  // Circle
  CURRENT_CIRCLE: 'current_circle',
  CIRCLE_DATA: 'circle_data',
  INVITATIONS: 'invitations',
  
  // Location
  LOCATION_PERMISSION: 'location_permission',
  LAST_LOCATION: 'last_location',
  GEOFENCES: 'geofences',
  
  // Safety
  EMERGENCY_CONTACTS: 'emergency_contacts',
  SAFETY_SETTINGS: 'safety_settings',
  
  // Chat
  CHAT_HISTORY: 'chat_history',
  MESSAGE_DRAFTS: 'message_drafts',
  
  // Files
  UPLOADED_FILES: 'uploaded_files',
  DOWNLOADED_FILES: 'downloaded_files',
  
  // Cache
  CACHE_TIMESTAMP: 'cache_timestamp',
  CACHE_DATA: 'cache_data',
};

// Error Messages
export const ERROR_MESSAGES = {
  // Network
  NETWORK_ERROR: 'Network connection failed. Please check your internet connection.',
  TIMEOUT_ERROR: 'Request timed out. Please try again.',
  SERVER_ERROR: 'Server error occurred. Please try again later.',
  
  // Authentication
  INVALID_CREDENTIALS: 'Invalid email or password.',
  ACCOUNT_LOCKED: 'Your account has been temporarily locked.',
  EMAIL_NOT_VERIFIED: 'Please verify your email address.',
  TOKEN_EXPIRED: 'Your session has expired. Please log in again.',
  
  // Registration
  EMAIL_EXISTS: 'An account with this email already exists.',
  WEAK_PASSWORD: 'Password must be at least 8 characters long.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  
  // Circle
  CIRCLE_NOT_FOUND: 'Circle not found.',
  ALREADY_MEMBER: 'You are already a member of this Circle.',
  INVITATION_EXPIRED: 'This invitation has expired.',
  PERMISSION_DENIED: 'You do not have permission to perform this action.',
  
  // Location
  LOCATION_PERMISSION_DENIED: 'Location permission is required for this feature.',
  LOCATION_UNAVAILABLE: 'Location is currently unavailable.',
  
  // Safety
  EMERGENCY_CONTACT_REQUIRED: 'At least one emergency contact is required.',
  SAFETY_CHECK_FAILED: 'Safety check failed. Please try again.',
  
  // File
  FILE_TOO_LARGE: 'File size exceeds the maximum limit.',
  INVALID_FILE_TYPE: 'File type not supported.',
  UPLOAD_FAILED: 'File upload failed. Please try again.',
  
  // General
  UNKNOWN_ERROR: 'An unknown error occurred. Please try again.',
  VALIDATION_ERROR: 'Please check your input and try again.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  // Authentication
  LOGIN_SUCCESS: 'Successfully logged in.',
  REGISTER_SUCCESS: 'Account created successfully.',
  LOGOUT_SUCCESS: 'Successfully logged out.',
  PASSWORD_CHANGED: 'Password changed successfully.',
  
  // Circle
  CIRCLE_CREATED: 'Circle created successfully.',
  CIRCLE_JOINED: 'Successfully joined Circle.',
  CIRCLE_LEFT: 'Successfully left Circle.',
  MEMBER_INVITED: 'Invitation sent successfully.',
  MEMBER_REMOVED: 'Member removed successfully.',
  ROLE_UPDATED: 'Role updated successfully.',
  
  // Safety
  SAFETY_CHECK_SENT: 'Safety check sent successfully.',
  EMERGENCY_ALERT_SENT: 'Emergency alert sent successfully.',
  
  // General
  PROFILE_UPDATED: 'Profile updated successfully.',
  SETTINGS_SAVED: 'Settings saved successfully.',
  FILE_UPLOADED: 'File uploaded successfully.',
  MESSAGE_SENT: 'Message sent successfully.',
};

// Validation Rules
export const VALIDATION_RULES = {
  // User
  FIRST_NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
    PATTERN: /^[a-zA-Z\s\-']+$/,
  },
  LAST_NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
    PATTERN: /^[a-zA-Z\s\-']+$/,
  },
  EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBER: true,
    REQUIRE_SPECIAL: true,
  },
  PHONE_NUMBER: {
    PATTERN: /^[\+]?[1-9][\d]{0,15}$/,
  },
  
  // Circle
  CIRCLE_NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 100,
  },
  CIRCLE_DESCRIPTION: {
    MAX_LENGTH: 500,
  },
  
  // Message
  MESSAGE_CONTENT: {
    MAX_LENGTH: 1000,
  },
  
  // Event
  EVENT_TITLE: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 200,
  },
  EVENT_DESCRIPTION: {
    MAX_LENGTH: 1000,
  },
};

// App Routes
export const ROUTES = {
  // Auth
  LOGIN: 'Login',
  REGISTER: 'Register',
  FORGOT_PASSWORD: 'ForgotPassword',
  RESET_PASSWORD: 'ResetPassword',
  
  // Main
  HOME: 'Home',
  CALENDAR: 'Calendar',
  APPLICATIONS: 'Applications',
  PROFILE: 'Profile',
  
  // Circle
  CIRCLE_LIST: 'CircleList',
  CIRCLE_DETAILS: 'CircleDetails',
  CIRCLE_SETTINGS: 'CircleSettings',
  INVITE_MEMBER: 'InviteMember',
  
  // Safety
  SAFETY_CHECK: 'SafetyCheck',
  EMERGENCY_CONTACTS: 'EmergencyContacts',
  LOCATION_HISTORY: 'LocationHistory',
  
  // Chat
  CHAT_LIST: 'ChatList',
  CHAT_ROOM: 'ChatRoom',
  
  // Settings
  SETTINGS: 'Settings',
  NOTIFICATIONS: 'Notifications',
  PRIVACY: 'Privacy',
  SECURITY: 'Security',
  
  // Apps
  GALLERY: 'Gallery',
  NOTES: 'Notes',
  GOALS: 'Goals',
  GAMES: 'Games',
  MUSIC: 'Music',
  VIDEOS: 'Videos',
  BILLING: 'Billing',
  SHOPPING: 'Shopping',
  HEALTH: 'Health',
  EDUCATION: 'Education',
};

// Feature Flags
export const FEATURE_FLAGS = {
  // Development
  DEBUG_MODE: isDev,
  SHOW_DEBUG_MENU: isDev,
  ENABLE_LOGGING: isDev,
  
  // Features
  ENABLE_BETA_FEATURES: false,
  ENABLE_EXPERIMENTAL_UI: false,
  ENABLE_ANALYTICS: true,
  ENABLE_CRASH_REPORTING: true,
  
  // Performance
  ENABLE_CACHE: true,
  ENABLE_OFFLINE_MODE: false,
  ENABLE_BACKGROUND_SYNC: true,
  
  // Security
  ENABLE_BIOMETRIC_AUTH: true,
  ENABLE_TWO_FACTOR: false,
  ENABLE_ENCRYPTION: true,
}; 

