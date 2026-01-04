// Environment Configuration for Bondarys Mobile App

interface EnvironmentConfig {
  // Supabase Configuration
  supabaseUrl: string;
  supabaseAnonKey: string;

  // API Configuration
  apiUrl: string;

  // Application Configuration
  appName: string;
  appVersion: string;

  // Social Authentication
  googleClientId?: string;
  facebookAppId?: string;
  appleClientId?: string;

  // Push Notifications
  pushNotificationKey?: string;

  // Analytics & Monitoring
  analyticsKey?: string;
  errorReportingKey?: string;

  // Feature Flags
  enableAnalytics: boolean;
  enableCrashReporting: boolean;
  enablePushNotifications: boolean;
  enableLocationServices: boolean;

  // Environment
  isDevelopment: boolean;
  isProduction: boolean;
}

const getEnvironmentConfig = (): EnvironmentConfig => {
  const isDevelopment = __DEV__;
  const isProduction = !isDevelopment;

  return {
    // Supabase Configuration
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co',
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'your_supabase_anon_key_here',

    // API Configuration
    apiUrl: process.env.EXPO_PUBLIC_API_URL || (isDevelopment ? 'http://localhost:4000/api/v1' : 'https://your-api-domain.com'),

    // Application Configuration
    appName: process.env.EXPO_PUBLIC_APP_NAME || 'Bondarys',
    appVersion: process.env.EXPO_PUBLIC_APP_VERSION || '1.0.0',

    // Social Authentication
    googleClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
    facebookAppId: process.env.EXPO_PUBLIC_FACEBOOK_APP_ID,
    appleClientId: process.env.EXPO_PUBLIC_APPLE_CLIENT_ID,

    // Push Notifications
    pushNotificationKey: process.env.EXPO_PUBLIC_PUSH_NOTIFICATION_KEY,

    // Analytics & Monitoring
    analyticsKey: process.env.EXPO_PUBLIC_ANALYTICS_KEY,
    errorReportingKey: process.env.EXPO_PUBLIC_ERROR_REPORTING_KEY,

    // Feature Flags
    enableAnalytics: process.env.EXPO_PUBLIC_ENABLE_ANALYTICS === 'true' || isProduction,
    enableCrashReporting: process.env.EXPO_PUBLIC_ENABLE_CRASH_REPORTING === 'true' || isProduction,
    enablePushNotifications: process.env.EXPO_PUBLIC_ENABLE_PUSH_NOTIFICATIONS === 'true' || isProduction,
    enableLocationServices: process.env.EXPO_PUBLIC_ENABLE_LOCATION_SERVICES !== 'false',

    // Environment
    isDevelopment,
    isProduction,
  };
};

export const config = getEnvironmentConfig();

// Validation function to check if required environment variables are set
export const validateEnvironment = (): { isValid: boolean; missingVars: string[] } => {
  const missingVars: string[] = [];

  if (!config.supabaseUrl || config.supabaseUrl === 'https://your-project.supabase.co') {
    missingVars.push('EXPO_PUBLIC_SUPABASE_URL');
  }

  if (!config.supabaseAnonKey || config.supabaseAnonKey === 'your_supabase_anon_key_here') {
    missingVars.push('EXPO_PUBLIC_SUPABASE_ANON_KEY');
  }

  if (!config.apiUrl || config.apiUrl === 'https://your-api-domain.com') {
    missingVars.push('EXPO_PUBLIC_API_URL');
  }

  return {
    isValid: missingVars.length === 0,
    missingVars,
  };
};

// Log environment configuration (only in development)
if (__DEV__) {
  console.log('🔧 Environment Configuration:', {
    appName: config.appName,
    appVersion: config.appVersion,
    apiUrl: config.apiUrl,
    isDevelopment: config.isDevelopment,
    isProduction: config.isProduction,
  });

  const validation = validateEnvironment();
  if (!validation.isValid) {
    console.warn('[WARN] Missing environment variables:', validation.missingVars);
    console.warn('Please set these variables in your .env file or environment');
  }
}

export default config;
