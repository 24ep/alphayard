/**
 * useThemeConfig Hook
 * Provides access to remote theme configuration from admin panel
 */

import { useState, useEffect, useCallback } from 'react';
import themeConfigService, {
  ThemeConfig,
  ComponentStyle,
  BrandingConfig,
  ColorValue,
} from '../services/themeConfigService';

interface UseThemeConfigResult {
  theme: ThemeConfig | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  getComponentStyle: (categoryId: string, componentId: string) => ComponentStyle | null;
  branding: BrandingConfig;
  colorToString: (color: ColorValue) => string;
  getGradientColors: (color: ColorValue) => string[];
  getGradientLocations: (color: ColorValue) => number[];
  getShadow: (level: 'none' | 'sm' | 'md' | 'lg') => any;
}

export function useThemeConfig(): UseThemeConfigResult {
  const [theme, setTheme] = useState<ThemeConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadTheme = async () => {
      try {
        setLoading(true);
        const loadedTheme = await themeConfigService.getTheme();
        if (mounted) {
          setTheme(loadedTheme);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err as Error);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadTheme();

    // Subscribe to theme changes
    const unsubscribe = themeConfigService.subscribe((newTheme) => {
      if (mounted) {
        setTheme(newTheme);
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const refreshedTheme = await themeConfigService.refresh();
      setTheme(refreshedTheme);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  const getComponentStyle = useCallback(
    (categoryId: string, componentId: string) => {
      return themeConfigService.getComponentStyle(categoryId, componentId);
    },
    []
  );

  return {
    theme,
    loading,
    error,
    refresh,
    getComponentStyle,
    branding: themeConfigService.getBranding(),
    colorToString: themeConfigService.colorToString.bind(themeConfigService),
    getGradientColors: themeConfigService.getGradientColors.bind(themeConfigService),
    getGradientLocations: themeConfigService.getGradientLocations.bind(themeConfigService),
    getShadow: themeConfigService.getShadow.bind(themeConfigService),
  };
}

/**
 * Get a specific button style
 */
export function useButtonStyle(buttonType: 'primary' | 'secondary' | 'outline' | 'ghost' = 'primary') {
  const { getComponentStyle, colorToString, getShadow } = useThemeConfig();
  
  const style = getComponentStyle('buttons', buttonType);
  
  if (!style) {
    return {
      backgroundColor: buttonType === 'primary' ? '#FFB6C1' : 'transparent',
      color: buttonType === 'primary' ? '#FFFFFF' : '#374151',
      borderRadius: 12,
      borderColor: 'transparent',
      ...getShadow('sm'),
    };
  }

  return {
    backgroundColor: colorToString(style.backgroundColor),
    color: colorToString(style.textColor),
    borderRadius: style.borderRadius,
    borderColor: colorToString(style.borderColor),
    ...getShadow(style.shadowLevel),
  };
}

/**
 * Get card style
 */
export function useCardStyle(cardType: 'default' | 'glass' | 'modal' = 'default') {
  const { getComponentStyle, colorToString, getShadow } = useThemeConfig();
  
  const style = getComponentStyle('cards', cardType);
  
  if (!style) {
    return {
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      borderRadius: 16,
      borderColor: 'rgba(255, 182, 193, 0.2)',
      ...getShadow('md'),
    };
  }

  return {
    backgroundColor: colorToString(style.backgroundColor),
    borderRadius: style.borderRadius,
    borderColor: colorToString(style.borderColor),
    borderWidth: 1,
    ...getShadow(style.shadowLevel),
  };
}

/**
 * Get input style
 */
export function useInputStyle() {
  const { getComponentStyle, colorToString, getShadow } = useThemeConfig();
  
  const style = getComponentStyle('inputs', 'textInput');
  
  if (!style) {
    return {
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      color: '#374151',
      borderRadius: 12,
      borderColor: 'rgba(255, 182, 193, 0.2)',
      borderWidth: 1,
      ...getShadow('sm'),
    };
  }

  return {
    backgroundColor: colorToString(style.backgroundColor),
    color: colorToString(style.textColor),
    borderRadius: style.borderRadius,
    borderColor: colorToString(style.borderColor),
    borderWidth: 1,
    ...getShadow(style.shadowLevel),
  };
}

export default useThemeConfig;
