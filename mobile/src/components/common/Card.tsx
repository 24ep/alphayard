import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

interface CardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  size?: 'small' | 'medium' | 'large';
  onPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
  contentStyle?: ViewStyle;
  testID?: string;
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  children,
  variant = 'default',
  size = 'medium',
  onPress,
  disabled = false,
  style,
  titleStyle,
  subtitleStyle,
  contentStyle,
  testID,
}) => {
  const cardStyle = [
    styles.card,
    styles[variant],
    styles[size],
    disabled && styles.disabled,
    style,
  ];

  const titleStyleArray = [
    styles.title,
    styles[`${size}Title`],
    titleStyle,
  ];

  const subtitleStyleArray = [
    styles.subtitle,
    styles[`${size}Subtitle`],
    subtitleStyle,
  ];

  const contentStyleArray = [
    styles.content,
    styles[`${size}Content`],
    contentStyle,
  ];

  const CardContainer = onPress ? TouchableOpacity : View;

  return (
    <CardContainer
      style={cardStyle}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      testID={testID}
    >
      {(title || subtitle) && (
        <View style={styles.header}>
          {title && (
            <Text style={titleStyleArray}>{title}</Text>
          )}
          {subtitle && (
            <Text style={subtitleStyleArray}>{subtitle}</Text>
          )}
        </View>
      )}
      
      <View style={contentStyleArray}>
        {children}
      </View>
    </CardContainer>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white[500],
    borderRadius: 12,
    overflow: 'hidden',
  },

  // Variants
  default: {
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  elevated: {
    shadowColor: colors.gray[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  outlined: {
    borderWidth: 2,
    borderColor: colors.primary[300],
  },
  filled: {
    backgroundColor: colors.gray[50],
    borderWidth: 1,
    borderColor: colors.gray[200],
  },

  // Sizes
  small: {
    padding: 12,
  },
  medium: {
    padding: 16,
  },
  large: {
    padding: 20,
  },

  // States
  disabled: {
    opacity: 0.5,
  },

  // Header
  header: {
    marginBottom: 12,
  },

  // Title
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray[800],
    marginBottom: 4,
  },
  smallTitle: {
    fontSize: 16,
  },
  mediumTitle: {
    fontSize: 18,
  },
  largeTitle: {
    fontSize: 20,
  },

  // Subtitle
  subtitle: {
    fontSize: 14,
    color: colors.gray[600],
    lineHeight: 20,
  },
  smallSubtitle: {
    fontSize: 12,
  },
  mediumSubtitle: {
    fontSize: 14,
  },
  largeSubtitle: {
    fontSize: 16,
  },

  // Content
  content: {
    flex: 1,
  },
  smallContent: {
    // No additional styles
  },
  mediumContent: {
    // No additional styles
  },
  largeContent: {
    // No additional styles
  },
}); 