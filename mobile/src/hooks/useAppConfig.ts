import { useState, useEffect } from 'react';
import { appConfigService } from '../services/appConfigService';

/**
 * Hook to fetch and manage app configuration
 * Provides access to dynamic backgrounds, themes, and settings
 */

export interface ScreenConfig {
  background?: {
    type?: 'gradient' | 'image' | 'color';
    gradient?: string[];
    image_url?: string;
    color?: string;
    overlay_opacity?: number;
  };
  [key: string]: any;
}

export function useAppConfig() {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const data = await appConfigService.getAppConfig();
      setConfig(data);
      setError(null);
    } catch (err: any) {
      console.error('Error loading app config:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const refresh = () => {
    loadConfig();
  };

  return { config, loading, error, refresh };
}

/**
 * Hook to fetch screen configuration by key
 */
export function useScreenConfig(screenKey: string) {
  const [screenConfig, setScreenConfig] = useState<ScreenConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadScreenConfig();
  }, [screenKey]);

  const loadScreenConfig = async () => {
    try {
      setLoading(true);
      const data = await appConfigService.getScreenConfig(screenKey);
      setScreenConfig(data.config);
      setError(null);
    } catch (err: any) {
      console.error(`Error loading screen config for ${screenKey}:`, err);
      setError(err.message);
      // Set default config on error
      setScreenConfig(getDefaultScreenConfig(screenKey));
    } finally {
      setLoading(false);
    }
  };

  const refresh = () => {
    loadScreenConfig();
  };

  return { screenConfig, loading, error, refresh };
}

/**
 * Hook specifically for login screen background
 */
/**
 * Hook specifically for login screen background
 */
export function useLoginBackground() {
  const { theme } = require('../contexts/ThemeContext').useTheme();
  
  // Default background
  const defaultBackground = {
    type: 'gradient' as const,
    gradient: ['#FA7272', '#FFBBB4'],
    overlay_opacity: 0.7
  };

  try {
      if (theme?.branding?.screens && Array.isArray(theme.branding.screens)) {
          const screen = theme.branding.screens.find((s: any) => s.id === 'login');
          if (screen && screen.background) {
              const bg = screen.background;
              
              if (bg.mode === 'image' && bg.image) {
                   return {
                      background: {
                          type: 'image' as const,
                          image_url: bg.image,
                          resize_mode: screen.resizeMode || 'cover',
                          overlay_opacity: 0.4
                      },
                      loading: false,
                      error: null
                  };
              } else if (bg.mode === 'gradient' && bg.gradient) {
                  // simple mapping of gradient stops to colors
                  const colors = bg.gradient.stops?.map((s: any) => s.color) || ['#FA7272', '#FFBBB4'];
                  return {
                      background: {
                          type: 'gradient' as const,
                          gradient: colors,
                          overlay_opacity: 0.7
                      },
                      loading: false,
                      error: null
                  };
              } else if (bg.mode === 'solid' && bg.solid) {
                  return {
                      background: {
                          type: 'solid' as const,
                          color: bg.solid
                      },
                      loading: false,
                      error: null
                  };
              }
          }
      }
  } catch (e) {
      console.warn('Error parsing login background:', e);
  }

  // Fallback to legacy string format if needed (though we are deprecating it)
  if (theme?.branding?.loginBackgroundImage) {
    return {
      background: {
        type: 'image' as const,
        image_url: theme.branding.loginBackgroundImage,
        resize_mode: theme.branding.loginBackgroundResizeMode || 'cover',
        overlay_opacity: 0.4
      },
      loading: false,
      error: null
    };
  }

  return {
    background: defaultBackground,
    loading: false,
    error: null
  };
}

/**
 * Hook specifically for welcome (marketing) screen background
 */
export function useWelcomeBackground() {
  const { theme } = require('../contexts/ThemeContext').useTheme();
  
  // Default background
  const defaultBackground = {
    type: 'gradient' as const,
    gradient: ['#FA7272', '#FFBBB4'],
    overlay_opacity: 0.7
  };

  try {
      if (theme?.branding?.screens && Array.isArray(theme.branding.screens)) {
          const screen = theme.branding.screens.find((s: any) => s.id === 'welcome');
          if (screen && screen.background) {
              const bg = screen.background;
              
              if (bg.mode === 'image' && bg.image) {
                   return {
                      background: {
                          type: 'image' as const,
                          image_url: bg.image,
                          resize_mode: screen.resizeMode || 'cover',
                          overlay_opacity: 0.4
                      },
                      loading: false,
                      error: null
                  };
              } else if (bg.mode === 'gradient' && bg.gradient) {
                  const colors = bg.gradient.stops?.map((s: any) => s.color) || ['#FA7272', '#FFBBB4'];
                  return {
                      background: {
                          type: 'gradient' as const,
                          gradient: colors,
                          overlay_opacity: 0.7
                      },
                      loading: false,
                      error: null
                  };
              } else if (bg.mode === 'solid' && bg.solid) {
                  return {
                      background: {
                          type: 'solid' as const,
                          color: bg.solid
                      },
                      loading: false,
                      error: null
                  };
              }
          }
      }
  } catch (e) {
      console.warn('Error parsing welcome background:', e);
  }

  // Fallback to legacy string format if needed (though we are deprecating it)
  if (theme?.branding?.welcomeBackgroundImage) {
    return {
      background: {
        type: 'image' as const,
        image_url: theme.branding.welcomeBackgroundImage,
        resize_mode: theme.branding.welcomeBackgroundResizeMode || 'cover',
        overlay_opacity: 0.4
      },
      loading: false,
      error: null
    };
  }

  return {
    background: defaultBackground,
    loading: false,
    error: null
  };
}

/**
 * Hook specifically for home (you) screen background
 */
export function useHomeBackground() {
  const { theme } = require('../contexts/ThemeContext').useTheme();

  // Default background
  const defaultBackground = {
    type: 'gradient' as const,
    gradient: ['#FA7272', '#FFBBB4'],
    overlay_opacity: 0.7
  };

  try {
      if (theme?.branding?.screens && Array.isArray(theme.branding.screens)) {
          const screen = theme.branding.screens.find((s: any) => s.id === 'home');
          if (screen && screen.background) {
              const bg = screen.background;
              
              if (bg.mode === 'image' && bg.image) {
                   return {
                      background: {
                          type: 'image' as const,
                          image_url: bg.image,
                          resize_mode: screen.resizeMode || 'cover',
                          overlay_opacity: 0.4
                      },
                      loading: false,
                      error: null
                  };
              } else if (bg.mode === 'gradient' && bg.gradient) {
                  const colors = bg.gradient.stops?.map((s: any) => s.color) || ['#FA7272', '#FFBBB4'];
                  return {
                      background: {
                          type: 'gradient' as const,
                          gradient: colors,
                          overlay_opacity: 0.7
                      },
                      loading: false,
                      error: null
                  };
              } else if (bg.mode === 'solid' && bg.solid) {
                  return {
                      background: {
                          type: 'solid' as const,
                          color: bg.solid
                      },
                      loading: false,
                      error: null
                  };
              }
          }
      }
  } catch (e) {
      console.warn('Error parsing home background:', e);
  }

  if (theme?.branding?.homeBackgroundImage) {
    return {
      background: {
        type: 'image' as const,
        image_url: theme.branding.homeBackgroundImage,
        resize_mode: theme.branding.homeBackgroundResizeMode || 'cover',
        overlay_opacity: 0.4
      },
      loading: false,
      error: null
    };
  }

  return {
    background: defaultBackground,
    loading: false,
    error: null
  };
}

/**
 * Hook specifically for circle screen background
 */
export function useCircleBackground() {
  const { theme } = require('../contexts/ThemeContext').useTheme();

  // Default background
  const defaultBackground = {
    type: 'gradient' as const,
    gradient: ['#FA7272', '#FFBBB4'],
    overlay_opacity: 0.7
  };

  try {
      if (theme?.branding?.screens && Array.isArray(theme.branding.screens)) {
          const screen = theme.branding.screens.find((s: any) => s.id === 'circle');
          if (screen && screen.background) {
              const bg = screen.background;
              
              if (bg.mode === 'image' && bg.image) {
                   return {
                      background: {
                          type: 'image' as const,
                          image_url: bg.image,
                          resize_mode: screen.resizeMode || 'cover',
                          overlay_opacity: 0.4
                      },
                      loading: false,
                      error: null
                  };
              } else if (bg.mode === 'gradient' && bg.gradient) {
                  const colors = bg.gradient.stops?.map((s: any) => s.color) || ['#FA7272', '#FFBBB4'];
                  return {
                      background: {
                          type: 'gradient' as const,
                          gradient: colors,
                          overlay_opacity: 0.7
                      },
                      loading: false,
                      error: null
                  };
              } else if (bg.mode === 'solid' && bg.solid) {
                  return {
                      background: {
                          type: 'solid' as const,
                          color: bg.solid
                      },
                      loading: false,
                      error: null
                  };
              }
          }
      }
  } catch (e) {
      console.warn('Error parsing circle background:', e);
  }

  if (theme?.branding?.circleBackgroundImage) {
    return {
      background: {
        type: 'image' as const,
        image_url: theme.branding.circleBackgroundImage,
        resize_mode: theme.branding.circleBackgroundResizeMode || 'cover',
        overlay_opacity: 0.4
      },
      loading: false,
      error: null
    };
  }

  return {
    background: defaultBackground,
    loading: false,
    error: null
  };
}

/**
 * Hook specifically for social screen background
 */
export function useSocialBackground() {
  const { theme } = require('../contexts/ThemeContext').useTheme();

  // Default background
  const defaultBackground = {
    type: 'gradient' as const,
    gradient: ['#FA7272', '#FFBBB4'],
    overlay_opacity: 0.7
  };

  try {
      if (theme?.branding?.screens && Array.isArray(theme.branding.screens)) {
          const screen = theme.branding.screens.find((s: any) => s.id === 'social');
          if (screen && screen.background) {
              const bg = screen.background;
              
              if (bg.mode === 'image' && bg.image) {
                   return {
                      background: {
                          type: 'image' as const,
                          image_url: bg.image,
                          resize_mode: screen.resizeMode || 'cover',
                          overlay_opacity: 0.4
                      },
                      loading: false,
                      error: null
                  };
              } else if (bg.mode === 'gradient' && bg.gradient) {
                  const colors = bg.gradient.stops?.map((s: any) => s.color) || ['#FA7272', '#FFBBB4'];
                  return {
                      background: {
                          type: 'gradient' as const,
                          gradient: colors,
                          overlay_opacity: 0.7
                      },
                      loading: false,
                      error: null
                  };
              } else if (bg.mode === 'solid' && bg.solid) {
                  return {
                      background: {
                          type: 'solid' as const,
                          color: bg.solid
                      },
                      loading: false,
                      error: null
                  };
              }
          }
      }
  } catch (e) {
      console.warn('Error parsing social background:', e);
  }

  if (theme?.branding?.socialBackgroundImage) {
    return {
      background: {
        type: 'image' as const,
        image_url: theme.branding.socialBackgroundImage,
        resize_mode: theme.branding.socialBackgroundResizeMode || 'cover',
        overlay_opacity: 0.4
      },
      loading: false,
      error: null
    };
  }

  return {
    background: defaultBackground,
    loading: false,
    error: null
  };
}

/**
 * Hook specifically for application list (market) screen background
 */
export function useApplicationListBackground() {
  const { theme } = require('../contexts/ThemeContext').useTheme();

  // Default background (matching current hardcoded gradient)
  const defaultBackground = {
    type: 'gradient' as const,
    gradient: ['#FA7272', '#FFBBB4'],
    overlay_opacity: 0.7
  };

  // Check for new object format (Admin v2)
  if (theme.branding?.applicationListBackground) {
        console.log('[useAppConfig] applicationListBackground found:', JSON.stringify(theme.branding.applicationListBackground));
        const bg = theme.branding.applicationListBackground;
        if (bg.type === 'image' && bg.value) {
            return {
                background: {
                    type: 'image' as const,
                    image_url: bg.value,
                    resize_mode: 'cover' as const,
                    overlay_opacity: bg.overlayOpacity ?? 0.4
                },
                loading: false,
                error: null
            };
        } else if (bg.type === 'gradient') {
             const colors = bg.gradientStops?.map((s: any) => s.color) || ['#FA7272', '#FFBBB4'];
             return {
                 background: {
                     type: 'gradient' as const,
                     gradient: colors,
                     overlay_opacity: bg.overlayOpacity ?? 0.7
                 },
                 loading: false,
                 error: null
             };
        } else if (bg.type === 'solid' && bg.value) {
            return {
                background: {
                    type: 'solid' as const,
                    color: bg.value
                },
                loading: false,
                error: null
            };
        }
  }

  return {
    background: defaultBackground,
    loading: false,
    error: null
  };
}

/**
 * Hook to check if a feature is enabled
 */
export function useFeatureFlag(featureKey: string): boolean {
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    checkFeature();
  }, [featureKey]);

  const checkFeature = async () => {
    try {
      const enabled = await appConfigService.isFeatureEnabled(featureKey);
      setIsEnabled(enabled);
    } catch (error) {
      console.error(`Error checking feature ${featureKey}:`, error);
      setIsEnabled(false);
    }
  };

  return isEnabled;
}

/**
 * Hook to get app theme
 */
export function useAppTheme() {
  const [theme, setTheme] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      setLoading(true);
      const themeData = await appConfigService.getTheme();
      setTheme(themeData);
    } catch (error) {
      console.error('Error loading theme:', error);
      setTheme(getDefaultTheme());
    } finally {
      setLoading(false);
    }
  };

  return { theme, loading };
}

/**
 * Hook to get a specific asset by key
 */
export function useAppAsset(assetKey: string) {
  const [asset, setAsset] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAsset();
  }, [assetKey]);

  const loadAsset = async () => {
    if (!assetKey) return;
    try {
      setLoading(true);
      const data = await appConfigService.getAsset(assetKey);
      setAsset(data);
      setError(null);
    } catch (err: any) {
      console.error(`Error loading asset ${assetKey}:`, err);
      setError(err.message);
      setAsset(null);
    } finally {
      setLoading(false);
    }
  };

  return { asset, loading, error };
}

/**
 * Hook to get assets by category
 */
export function useAssetsByCategory(category: string) {
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAssets();
  }, [category]);

  const loadAssets = async () => {
    try {
      setLoading(true);
      const data = await appConfigService.getAssetsByCategory(category);
      setAssets(data);
      setError(null);
    } catch (err: any) {
      console.error(`Error loading assets for category ${category}:`, err);
      setError(err.message);
      setAssets([]);
    } finally {
      setLoading(false);
    }
  };

  return { assets, loading, error };
}

/**
 * Hook to get logo assets
 */
export function useLogos() {
  return useAssetsByCategory('branding');
}

/**
 * Hook to get onboarding images
 */
export function useOnboardingImages() {
  return useAssetsByCategory('onboarding');
}

/**
 * Hook to get empty state images
 */
export function useEmptyStateImages() {
  return useAssetsByCategory('empty_state');
}

/**
 * Hook to get a specific logo (primary, white, or small)
 */
export function useLogo(logoType: 'primary' | 'white' | 'small' = 'primary') {
  const assetKey = `logo_${logoType}`;
  return useAppAsset(assetKey);
}

// Default configurations
function getDefaultScreenConfig(screenKey: string): ScreenConfig {
  const defaults: Record<string, ScreenConfig> = {
    login_screen: {
      background: {
        type: 'gradient',
        gradient: ['#FA7272', '#FFBBB4'],
        overlay_opacity: 0.7
      }
    },
    home_screen: {
      background: {
        type: 'gradient',
        gradient: ['#FFFFFF', '#F5F5F5']
      }
    },
    splash_screen: {
      background: {
        type: 'gradient',
        gradient: ['#FA7272', '#FFBBB4']
      }
    }
  };

  return defaults[screenKey] || { background: { type: 'color', color: '#FFFFFF' } };
}

function getDefaultTheme() {
  return {
    key: 'default',
    name: 'Default Theme',
    config: {
      colors: {
        primary: '#FA7272',
        secondary: '#FFD700',
        background: '#FFFFFF',
        text: '#333333'
      }
    }
  };
}


