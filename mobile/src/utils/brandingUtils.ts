import { Platform } from 'react-native';
import { ScreenConfig } from '../services/api/branding';
import { config } from '../config/environment';

/**
 * Interface matching DynamicBackground's BackgroundConfig
 */
export interface BackgroundConfig {
  type?: 'gradient' | 'image' | 'color' | 'solid';
  gradient?: string[];
  angle?: number;
  image_url?: string;
  color?: string;
  value?: string;
  overlay_opacity?: number;
  resize_mode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
}

/**
 * Helper to fix image URLs for remote/local environments
 */
const fixImageUrl = (url?: string): string => {
  if (!url) return '';

  let finalUrl = url;

  // Case 1: Relative Path (starting with /)
  if (url.startsWith('/')) {
    // config.apiUrl is something like "http://192.168.1.5:4000/api/v1"
    // If url is "/api/v1/storage/proxy/UUID", we want to avoid doubling /api/v1
    const apiBase = config.apiUrl; // e.g. "http://localhost:4000/api/v1"
    const domainOnly = apiBase.split('/api/v1')[0];
    finalUrl = `${domainOnly}${url}`;
  } 
  // Case 2: Just a UUID string (not a URL, not starting with /)
  else if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(url)) {
    const apiBase = config.apiUrl;
    finalUrl = `${apiBase}/storage/proxy/${url}`;
  }

  // Case 3: Absolute URL with Localhost (fix for Android Emulator)
  if (Platform.OS === 'android' && finalUrl.includes('localhost')) {
    finalUrl = finalUrl.replace('localhost', '10.0.2.2');
  }

  return finalUrl;
};

/**
 * Maps a screen configuration from the CMS to a background configuration
 * compatible with the DynamicBackground component.
 */
export const mapScreenConfigToBackground = (screenConfig?: ScreenConfig): BackgroundConfig => {
  if (!screenConfig?.background) {
    // Default Gradient if no config
    return {
      type: 'gradient',
      gradient: ['#FA7272', '#FFBBB4']
    };
  }

  const bg = screenConfig.background;

  // Handle legacy string (simple hex or potential url)
  if (typeof bg === 'string') {
    if (bg.startsWith('http') || bg.startsWith('/')) {
      return {
        type: 'image',
        image_url: fixImageUrl(bg),
        resize_mode: (screenConfig.resizeMode as any) || 'cover'
      };
    }
    return {
      type: 'solid',
      color: bg
    };
  }

  // Handle ColorValue object
  if (bg.mode === 'image' && bg.image) {
    return {
      type: 'image',
      image_url: fixImageUrl(bg.image),
      resize_mode: (screenConfig.resizeMode as any) || 'cover'
    };
  }

  if (bg.mode === 'gradient' && bg.gradient) {
    // Sort stops and map to colors array for LinearGradient
    const sortedStops = [...bg.gradient.stops].sort((a, b) => a.position - b.position);
    return {
      type: 'gradient',
      gradient: sortedStops.map(s => s.color),
      angle: bg.gradient.angle
    };
  }

  if (bg.mode === 'solid' && bg.solid) {
    return {
      type: 'solid',
      color: bg.solid
    };
  }

  // Handle video/other fallbacks
  if (bg.mode === 'video') {
    return {
      type: 'solid',
      color: '#000000'
    };
  }

  // Default fallback
  return {
    type: 'gradient',
    gradient: ['#FA7272', '#FFBBB4']
  };
};
