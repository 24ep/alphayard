import React, { useMemo } from 'react';
import { View, ImageBackground, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useBranding } from '../contexts/BrandingContext';
import { mapScreenConfigToBackground, BackgroundConfig } from '../utils/brandingUtils';

interface ScreenBackgroundProps {
  background?: BackgroundConfig;
  screenId?: string;
  loading?: boolean;
  children?: React.ReactNode;
  style?: any;
}

/**
 * Screen Background Component
 * Renders background based on CMS configuration
 * Supports: gradient, image, solid color
 * 
 * Usage:
 * <ScreenBackground screenId="login">...</ScreenBackground>
 * OR
 * <ScreenBackground background={customConfig}>...</ScreenBackground>
 */
export const ScreenBackground: React.FC<ScreenBackgroundProps> = ({
  background: explicitBackground,
  screenId,
  loading = false,
  children,
  style
}) => {
  const { screens, isLoaded } = useBranding();

  // "Smart" lookup logic
  const derivedBackground = useMemo(() => {
    // If explicit background is provided, use it directly
    if (explicitBackground) {
        // console.log('[ScreenBackground] Using explicit background');
        return explicitBackground;
    }

    // If screenId is provided, look it up in the branding config
    if (screenId && screens) {
      const screenConfig = screens.find(s => s.id.toLowerCase() === screenId.toLowerCase());
      
      // DEBUG: Trace what we found
      if (screenConfig) {
          // console.log(`[ScreenBackground] Found config for ${screenId}:`, screenConfig.background);
      } else {
          // console.log(`[ScreenBackground] No config found for ${screenId}, using default.`);
      }

      // Map CMS config to BackgroundConfig
      return mapScreenConfigToBackground(screenConfig);
    }

    // Default fallback if nothing matches
    return mapScreenConfigToBackground(undefined);
  }, [explicitBackground, screenId, screens]);

  const isLoading = loading || (screenId && !isLoaded && !explicitBackground);

  // Helper to convert angle to start/end points
  const getGradientPoints = (angle: number = 135) => {
    // Convert degrees to radians and adjust for LinearGradient coordinate system
    // 0deg is bottom to top, 90deg is left to right
    const angleRad = (angle - 90) * (Math.PI / 180);
    const x1 = 0.5 - 0.5 * Math.cos(angleRad);
    const y1 = 0.5 - 0.5 * Math.sin(angleRad);
    const x2 = 0.5 + 0.5 * Math.cos(angleRad);
    const y2 = 0.5 + 0.5 * Math.sin(angleRad);
    
    return {
      start: { x: Number(x1.toFixed(3)), y: Number(y1.toFixed(3)) },
      end: { x: Number(x2.toFixed(3)), y: Number(y2.toFixed(3)) }
    };
  };

  // Show loading state
  if (isLoading) {
    return (
      <View style={[styles.container, style]}>
        <ActivityIndicator size="large" color="#FA7272" />
      </View>
    );
  }

  const background = derivedBackground;

  // Render based on background type
  switch (background.type) {
    case 'image':
      return (
        <ImageBackground
          onError={(e) => console.log('[ScreenBackground] Image Load Error:', e.nativeEvent.error)}
          source={{ uri: background.image_url }}
          style={[styles.container, style]}
          resizeMode={background.resize_mode || 'cover'}
        >
          {background.overlay_opacity && background.overlay_opacity > 0 && (
            <View
              style={[
                styles.overlay,
                { backgroundColor: `rgba(0, 0, 0, ${background.overlay_opacity})` }
              ]}
            />
          )}
          {children}
        </ImageBackground>
      );

    case 'gradient':
      const { start, end } = getGradientPoints(background.angle);
      return (
        <LinearGradient
          colors={background.gradient && background.gradient.length >= 2 ? background.gradient : ['#FA7272', '#FFBBB4']}
          style={[styles.container, style]}
          start={start}
          end={end}
        >
          {children}
        </LinearGradient>
      );

    case 'color':
    case 'solid':
      return (
        <View style={[styles.container, { backgroundColor: background.color || background.value || '#FFFFFF' }, style]}>
          {children}
        </View>
      );

    default:
      // Fallback
      return (
        <View style={[styles.container, { backgroundColor: '#FFFFFF' }, style]}>
          {children}
        </View>
      );
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
});

