import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, Dimensions, ImageBackground, ActivityIndicator, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../contexts/ThemeContext';
import { themeConfigService, ColorValue } from '../../services/themeConfigService';

const { width } = Dimensions.get('window');

export const SplashBranding: React.FC = () => {
  const { branding } = useTheme();
  
  // Default values
  const config = branding?.splash || {
    backgroundColor: '#FFFFFF',
    spinnerColor: '#000000',
    spinnerType: 'circle',
    showAppName: true,
    showLogo: true,
    logoAnimation: 'none'
  } as any;

  const animValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (config.logoAnimation === 'none') {
        animValue.setValue(0);
        return;
    }

    const startAnimation = () => {
      if (config.logoAnimation === 'rotate') {
        Animated.loop(
          Animated.timing(animValue, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          })
        ).start();
      } else if (config.logoAnimation === 'bounce') {
        Animated.loop(
          Animated.sequence([
            Animated.timing(animValue, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(animValue, {
              toValue: 0,
              duration: 1000,
              useNativeDriver: true,
            })
          ])
        ).start();
      } else if (config.logoAnimation === 'pulse' || config.logoAnimation === 'zoom') {
        Animated.loop(
          Animated.sequence([
             Animated.timing(animValue, {
               toValue: 1,
               duration: 1000,
               useNativeDriver: true,
             }),
             Animated.timing(animValue, {
               toValue: 0,
               duration: 1000,
               useNativeDriver: true,
             })
           ])
        ).start();
      }
    };

    startAnimation();
  }, [config.logoAnimation]);

  const getLogoTransform = () => {
    switch (config.logoAnimation) {
      case 'rotate':
        const rotate = animValue.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '360deg']
        });
        return { transform: [{ rotate }] };
      case 'bounce':
        const translateY = animValue.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -20]
        });
        return { transform: [{ translateY }] };
      case 'pulse':
        const scalePulse = animValue.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 1.1]
        });
        return { transform: [{ scale: scalePulse }] };
      case 'zoom':
          const scaleZoom = animValue.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 1.3] 
          });
          return { transform: [{ scale: scaleZoom }] };
      default:
        return {};
    }
  };

  // Helper to determine background type
  const renderContent = () => {
    const bg = config.backgroundColor as ColorValue | string;
    let containerStyle: any = { flex: 1, alignItems: 'center', justifyContent: 'center' };
    
    // Handle string (legacy/solid)
    if (typeof bg === 'string') {
        containerStyle.backgroundColor = bg;
        return (
            <View style={containerStyle}>
                {renderInner()}
            </View>
        );
    }

    // Handle ColorValue object
    const colorBg = bg as ColorValue;
    if (colorBg.mode === 'image' && colorBg.image) {
        return (
            <ImageBackground source={{ uri: colorBg.image }} style={containerStyle} resizeMode={config.resizeMode || 'cover'}>
                {renderInner()}
            </ImageBackground>
        );
    } else if (colorBg.mode === 'gradient') {
        const colors = themeConfigService.getGradientColors(colorBg);
        const locations = themeConfigService.getGradientLocations(colorBg);
        return (
            <LinearGradient
                colors={colors}
                locations={locations}
                start={colorBg.gradient?.angle ? undefined : { x: 0, y: 0 }} // Default to corner
                end={colorBg.gradient?.angle ? undefined : { x: 1, y: 1 }}
                style={containerStyle}
            >
                {renderInner()}
            </LinearGradient>
        );
    } else {
        // Solid fallback
        containerStyle.backgroundColor = themeConfigService.colorToString(colorBg);
        return (
            <View style={containerStyle}>
                {renderInner()}
            </View>
        );
    }
  };

  const renderInner = () => {
      // Need to stringify spinner color if it's an object, or pass to specialized component
      // For now, assuming spinnerColor is solid or we take the first color
      const spinnerColor = typeof config.spinnerColor === 'string' 
          ? config.spinnerColor 
          : themeConfigService.colorToString(config.spinnerColor);

      return (
        <>
            {config.showLogo && (
                branding?.logoUrl ? (
                <Animated.Image 
                    source={{ uri: branding.logoUrl }} 
                    style={[styles.logo, getLogoTransform()]} 
                    resizeMode="contain"
                />
                ) : (
                <Animated.View style={[styles.placeholderLogo, getLogoTransform()]}>
                    <Text style={{ fontSize: 40 }}>🏷️</Text>
                </Animated.View>
                )
            )}
            
            {config.showAppName && (
                <Text style={[styles.appName, { color: spinnerColor }]}>
                {branding?.appName || 'Bondarys'}
                </Text>
            )}

            {config.spinnerType !== 'none' && (
                // Use ActivityIndicator for simple spinner. 
                // Custom spinners (dots/pulse) would require custom implementation here.
                <View style={styles.spinner}>
                    <ActivityIndicator 
                        size="large" 
                        color={spinnerColor} 
                    />
                </View>
            )}
        </>
      );
  };

  return renderContent();
};

const styles = StyleSheet.create({
  logo: {
    width: width * 0.3,
    height: width * 0.3,
    marginBottom: 32,
  },
  placeholderLogo: {
    width: 96, 
    height: 96, 
    borderRadius: 24, 
    marginBottom: 32, 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: '#F3F4F6'
  },
  appName: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 48,
    letterSpacing: 0.5,
  },
  spinner: {
    position: 'absolute',
    bottom: 64
  }
});

export default SplashBranding;


