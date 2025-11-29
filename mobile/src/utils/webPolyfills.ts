// Web polyfills for React Native components that don't exist in react-native-web
import { Platform } from 'react-native';

// Polyfill for BackHandler (used by native-base)
if (Platform.OS === 'web') {
  const BackHandler = {
    addEventListener: () => ({ remove: () => {} }),
    removeEventListener: () => {},
    exitApp: () => {},
    goBack: () => {},
  };

  // Add to global scope for native-base to find
  (global as any).BackHandler = BackHandler;
  
  // Also patch react-native-web exports
  const reactNativeWeb = require('react-native-web');
  if (reactNativeWeb && !reactNativeWeb.BackHandler) {
    reactNativeWeb.BackHandler = BackHandler;
  }
}

// Polyfill for other missing components
export const webPolyfills = {
  BackHandler: Platform.OS === 'web' ? {
    addEventListener: () => ({ remove: () => {} }),
    removeEventListener: () => {},
    exitApp: () => {},
    goBack: () => {},
  } : require('react-native').BackHandler,
}; 