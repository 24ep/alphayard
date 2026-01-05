// PlatformConstants polyfill - MUST run before ANY React Native code
// Patches at the lowest level possible

(function () {
  if (typeof global === 'undefined') return;

  // Create polyfill object immediately
  const polyfill: any = {
    reactNativeVersion: { major: 0, minor: 74, patch: 2 },
    get Version() {
      return '0.74.2';
    },
    get OS() {
      // Basic web detection
      if (typeof window !== 'undefined' && typeof document !== 'undefined') {
        return 'web';
      }
      return 'unknown';
    },
    get: (key: string) => {
      if (key === 'reactNativeVersion') return { major: 0, minor: 74, patch: 2 };
      if (key === 'Version') return '0.74.2';
      if (key === 'OS') return (typeof window !== 'undefined') ? 'web' : 'unknown';
      return 'unknown';
    },
  };

  // Set on global IMMEDIATELY
  (global as any).PlatformConstants = polyfill;

  // Web-safe patching
  if (typeof window !== 'undefined') {
    // safe to skip native module patching for web usually
  } else {
    // Native-only patching
    try {
      // const RN = require('react-native'); // Commented out to prevent Web bundling of native RN
      // if (RN?.NativeModules) {
      //   (RN.NativeModules as any).PlatformConstants = polyfill;
      // }
    } catch {
      // React Native not loaded yet, will patch later
    }
  }

  // Also patch after a delay
  setTimeout(() => {
    // Skipped mostly for web safety
  }, 0);
})();

export { };
