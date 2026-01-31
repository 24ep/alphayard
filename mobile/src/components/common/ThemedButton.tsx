import React, { useRef } from 'react';
import { Pressable, Text, StyleSheet, Platform, ActivityIndicator, ViewStyle, TextStyle, Animated, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useBranding } from '../../contexts/BrandingContext';
import { ComponentConfig, ColorValue } from '../../services/api/branding';

interface ThemedButtonProps {
  componentId: string;
  label: string;
  onPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

const resolveColor = (colorValue?: ColorValue, defaultColor: string = '#FA7272'): string => {
  if (!colorValue) return defaultColor;
  return colorValue.solid || defaultColor;
};

// Helper to check if ColorValue is a gradient
const isGradient = (colorValue?: ColorValue): boolean => {
  return colorValue?.mode === 'gradient' && !!colorValue.gradient?.stops?.length;
};

// Helper to get gradient colors and locations
const getGradientProps = (colorValue: ColorValue) => {
  const stops = colorValue.gradient?.stops || [];
  const sortedStops = [...stops].sort((a, b) => a.position - b.position);
  const colors = sortedStops.map(s => s.color);
  const locations = sortedStops.map(s => s.position / 100);
  const angle = colorValue.gradient?.angle || 135;
  
  // Convert angle to start/end points
  const angleRad = ((angle - 90) * Math.PI) / 180;
  const start = { x: 0.5 - Math.cos(angleRad) * 0.5, y: 0.5 - Math.sin(angleRad) * 0.5 };
  const end = { x: 0.5 + Math.cos(angleRad) * 0.5, y: 0.5 + Math.sin(angleRad) * 0.5 };
  
  return { colors, locations, start, end };
};

export const ThemedButton: React.FC<ThemedButtonProps> = ({
  componentId,
  label,
  onPress,
  isLoading,
  disabled,
  style,
  textStyle,
  icon
}) => {
  const { categories } = useBranding();
  
  // Animation values
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  // Find the component config
  let componentConfig: ComponentConfig | undefined;
  
  if (categories) {
    for (const cat of categories) {
      const found = cat.components.find(c => c.id === componentId);
      if (found) {
        componentConfig = found;
        break;
      }
    }
  }

  // extract styles or defaults
  const styles = componentConfig?.styles;
  const clickAnimation = styles?.clickAnimation || 'scale'; // Default to scale if not set, or 'none' if specific
  
  const backgroundColor = resolveColor(styles?.backgroundColor, '#FA7272');
  const textColor = resolveColor(styles?.textColor, '#FFFFFF');
  const borderColor = resolveColor(styles?.borderColor, 'transparent');
  const borderRadius = styles?.borderRadius ?? 12;
  const borderWidth = styles?.borderWidth ?? 0;
  
  const shadowStyle = styles?.shadowLevel && styles.shadowLevel !== 'none' ? Platform.select({
    ios: {
      shadowColor: resolveColor(styles.shadowColor, '#000'),
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: styles.shadowLevel === 'sm' ? 4 : styles.shadowLevel === 'md' ? 8 : 12,
    },
    android: {
      elevation: styles.shadowLevel === 'sm' ? 2 : styles.shadowLevel === 'md' ? 5 : 10,
    }
  }) : {};

  const handlePressIn = () => {
    if (disabled || isLoading) return;
    
    switch (clickAnimation) {
      case 'scale':
        Animated.spring(scaleAnim, { toValue: 0.96, useNativeDriver: true, speed: 20 }).start();
        break;
      case 'pulse':
        Animated.spring(scaleAnim, { toValue: 1.04, useNativeDriver: true, speed: 20 }).start();
        break;
      case 'opacity':
        Animated.timing(opacityAnim, { toValue: 0.6, duration: 100, useNativeDriver: true }).start();
        break;
    }
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 20 }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 150, useNativeDriver: true })
    ]).start();
  };

  const baseOpacity = disabled || isLoading ? 0.6 : 1;
  const hasGradientBg = isGradient(styles?.backgroundColor);
  const gradientProps = hasGradientBg ? getGradientProps(styles!.backgroundColor) : null;

  const buttonContent = (
    <>
      {isLoading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <>
          {icon}
          <Text style={[
            defaultStyles.text, 
            { color: textColor, fontWeight: '600' }, 
            Platform.OS === 'ios' ? { fontSize: 17 } : { fontSize: 16 },
            textStyle
          ]}>
            {label}
          </Text>
        </>
      )}
    </>
  );

  return (
    <Animated.View style={[
      { transform: [{ scale: scaleAnim }], opacity: opacityAnim, borderRadius },
      shadowStyle,
      style
    ]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || isLoading}
        style={[
          defaultStyles.button,
          {
            backgroundColor: hasGradientBg ? 'transparent' : backgroundColor,
            borderColor,
            borderWidth,
            borderTopWidth: styles?.borderTopWidth,
            borderRightWidth: styles?.borderRightWidth,
            borderBottomWidth: styles?.borderBottomWidth,
            borderLeftWidth: styles?.borderLeftWidth,
            borderRadius,
            padding: styles?.padding ?? 16,
            opacity: baseOpacity,
            overflow: 'hidden',
          },
        ]}
      >
        {hasGradientBg && gradientProps ? (
          <LinearGradient
            colors={gradientProps.colors as any}
            locations={gradientProps.locations}
            start={gradientProps.start}
            end={gradientProps.end}
            style={[StyleSheet.absoluteFillObject, { borderRadius }]}
          />
        ) : null}
        <View style={defaultStyles.contentWrapper}>
          {buttonContent}
        </View>
      </Pressable>
    </Animated.View>
  );
};

const defaultStyles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 52,
  },
  text: {
    textAlign: 'center',
  },
  contentWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    zIndex: 1,
  }
});
