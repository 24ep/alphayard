import React, { createContext, useContext, useEffect, useState } from 'react';
import themeConfigService, { ThemeConfig, BrandingConfig } from '../services/themeConfigService';

// Re-export types for backward compatibility
export type ThemeColors = {
    primary: string;
    secondary: string;
    background: string;
    cardBackground: string;
    inputBackground: string;
    textPrimary: string;
    textSecondary: string;
    border: string;
    success: string;
    error: string;
    warning: string;
    info: string;
    tabBarBackground: string;
    tabBarActive: string;
    tabBarInactive: string;
    pink: {
        primary: string;
        secondary: string;
    };
    text: {
        white: string;
    };
};

export type ThemeRadius = {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    full: number;
    card: number;
    button: number;
    input: number;
};

export type ThemeType = {
    colors: ThemeColors;
    radius: ThemeRadius;
    branding?: BrandingConfig;
};

// Default Legacy Theme (Fallback/Structure)
const defaultLegacyTheme: ThemeType = {
    colors: {
        primary: '#FFB6C1', // Rose Pink
        secondary: 'rgba(255, 182, 193, 0.1)',
        background: '#FAF9F6',
        cardBackground: 'rgba(255, 255, 255, 0.8)',
        inputBackground: 'rgba(255, 255, 255, 0.8)',
        textPrimary: '#374151',
        textSecondary: '#6B7280',
        border: 'rgba(255, 182, 193, 0.2)',
        success: '#10B981',
        error: '#EF4444',
        warning: '#F59E0B',
        info: '#3B82F6',
        tabBarBackground: 'rgba(255, 182, 193, 0.1)',
        tabBarActive: '#FFB6C1',
        tabBarInactive: '#6B7280',
        pink: {
            primary: '#FFB6C1',
            secondary: '#FFC0CB',
        },
        text: {
            white: '#FFFFFF',
        }
    },
    radius: {
        xs: 4,
        sm: 8,
        md: 12,
        lg: 16,
        xl: 24,
        full: 9999,
        card: 16,
        button: 12,
        input: 12,
    }
};

type ThemeContextType = {
    theme: ThemeType; // Legacy support
    themeConfig: ThemeConfig | null; // New config
    branding: BrandingConfig | null;
    loading: boolean;
    refreshTheme: () => Promise<void>;
};

export const ThemeContext = createContext<ThemeContextType>({
    theme: defaultLegacyTheme,
    themeConfig: null,
    branding: null,
    loading: true,
    refreshTheme: async () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeType>(defaultLegacyTheme);
  const [themeConfig, setThemeConfig] = useState<ThemeConfig | null>(null);
  const [branding, setBranding] = useState<BrandingConfig | null>(null);
  const [loading, setLoading] = useState(true);

  const mapConfigToLegacyTheme = (config: ThemeConfig): ThemeType => {
    const base = { ...defaultLegacyTheme }; // Start with defaults
    
    // Helper to extract solid color
    const getColor = (cat: string, comp: string, isBg: boolean = true) => {
      const style = themeConfigService.getComponentStyle(cat, comp);
      if (!style) return null;
      return themeConfigService.colorToString(isBg ? style.backgroundColor : style.textColor);
    };

    // Helper to get radius
    const getRadius = (cat: string, comp: string) => {
       const style = themeConfigService.getComponentStyle(cat, comp);
       return style ? style.borderRadius : null;
    };

    // Map new config to legacy structure
    const primaryColor = getColor('buttons', 'primary') || base.colors.primary;
    const secondaryColor = getColor('buttons', 'secondary') || base.colors.secondary;
    
    base.colors = {
      ...base.colors,
      primary: primaryColor,
      secondary: secondaryColor,
      background: themeConfigService.colorToString(config.categories.find(c => c.id === 'layout')?.components.find(c => c.id === 'container')?.styles.backgroundColor || { mode: 'solid', solid: base.colors.background }),
      cardBackground: getColor('cards', 'default') || base.colors.cardBackground,
      inputBackground: getColor('inputs', 'textInput') || base.colors.inputBackground,
      textPrimary: getColor('typography', 'heading', false) || base.colors.textPrimary,
      textSecondary: getColor('typography', 'body', false) || base.colors.textSecondary,
      border: getColor('cards', 'default', false) || base.colors.border, // Using card border as generic border
      tabBarBackground: getColor('navigation', 'tabBar') || base.colors.tabBarBackground,
      tabBarActive: getColor('navigation', 'tabActive') || base.colors.tabBarActive,
      pink: {
        primary: primaryColor,
        secondary: secondaryColor, // Approximation
      }
    };

    base.radius = {
      ...base.radius,
      button: getRadius('buttons', 'primary') ?? base.radius.button,
      card: getRadius('cards', 'default') ?? base.radius.card,
      input: getRadius('inputs', 'textInput') ?? base.radius.input,
    };

    return {
      ...base,
      branding: config.branding
    };
  };

  const refreshTheme = async () => {
    setLoading(true);
    try {
      const config = await themeConfigService.getTheme(true);
      if (config) {
        console.log('[ThemeContext] Fetched branding:', JSON.stringify(config.branding, null, 2));
        setThemeConfig(config);
        setBranding(config.branding);
        const legacyTheme = mapConfigToLegacyTheme(config);
        setTheme(legacyTheme);
      }
    } catch (error) {
       console.log('Failed to fetch config, using defaults', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial load
    const loadInitial = async () => {
        try {
            await themeConfigService.clearCache(); // Force clear cache to get fresh images
            const config = await themeConfigService.getTheme(true);
            setThemeConfig(config);
            if (config.branding) {
                setBranding(config.branding);
            }
            // The original code had this, which was removed in the provided edit.
            // Re-adding it to maintain functionality as per "without making any unrelated edits".
            if (config) {
                setTheme(mapConfigToLegacyTheme(config));
            }
        } catch (error) {
            console.error('[ThemeContext] Failed to load theme:', error);
        } finally {
            setLoading(false);
        }
    };
    loadInitial();

    // Subscribe to changes
    const unsubscribe = themeConfigService.subscribe((newConfig) => {
       setThemeConfig(newConfig);
       setBranding(newConfig.branding);
       setTheme(mapConfigToLegacyTheme(newConfig));
    });

    return unsubscribe;
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, themeConfig, branding, loading, refreshTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
