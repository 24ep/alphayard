module.exports = {
  preset: 'react-native',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|native-base|react-native-vector-icons|react-native-svg|react-native-maps|react-native-geolocation-service|react-native-permissions|react-native-image-picker|react-native-camera|react-native-video|react-native-sound|react-native-push-notification|react-native-firebase|socket.io-client|react-native-webrtc|react-native-incall-manager|react-native-background-job|react-native-background-fetch|react-native-device-info|react-native-keychain|react-native-biometrics|react-native-async-storage|react-native-fs|react-native-share|react-native-pdf|react-native-document-picker|react-native-calendar-events|react-native-contacts|react-native-sms|react-native-phone-call|react-native-mail|react-native-linear-gradient|react-native-shadow-2|react-native-modal|react-native-action-sheet|react-native-super-grid|react-native-snap-carousel|react-native-chart-kit|react-native-svg-charts|react-native-calendars|react-native-date-picker|react-native-time-picker|react-native-wheel-picker|react-native-picker-select|react-native-dropdown-picker|react-native-multi-select|react-native-tag-input|react-native-floating-action|react-native-fab|react-native-skeleton-placeholder|react-native-lottie|react-native-animatable|react-native-reanimated-carousel|react-native-parallax-scroll-view|react-native-collapsible|react-native-accordion|react-native-swipe-list-view|react-native-draggable-flatlist|react-native-sortable-list|react-native-drag-drop|react-native-pan-gesture-handler|react-native-haptic-feedback|react-native-vibration|react-native-shake|react-native-orientation-locker|react-native-splash-screen)/)',
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'node',
  testMatch: [
    '**/__tests__/**/*.(ts|tsx|js)',
    '**/?(*.)+(spec|test).(ts|tsx|js)'
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx}',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/*.spec.{ts,tsx}'
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@screens/(.*)$': '<rootDir>/src/screens/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@types/(.*)$': '<rootDir>/src/types/$1',
    '^@constants/(.*)$': '<rootDir>/src/constants/$1',
    '^@hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@context/(.*)$': '<rootDir>/src/context/$1'
  },
  testTimeout: 10000,
  verbose: true
}; 