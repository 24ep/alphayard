import { StyleSheet, Dimensions } from 'react-native';
import { brandColors } from '../../theme/colors';

const { width, height } = Dimensions.get('window');

export interface CalendarTheme {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    shadow: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  typography: {
    h1: any;
    h2: any;
    h3: any;
    body: any;
    caption: any;
  };
  shadows: {
    sm: any;
    md: any;
    lg: any;
  };
}

export const lightTheme: CalendarTheme = {
  colors: {
    primary: brandColors.primary,
    secondary: brandColors.secondary,
    background: '#f8f9fa',
    surface: '#ffffff',
    text: '#333333',
    textSecondary: '#666666',
    border: '#e0e0e0',
    shadow: 'rgba(0, 0, 0, 0.1)',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
  },
  typography: {
    h1: {
      fontSize: 24,
      fontWeight: '700',
      color: '#333333',
    },
    h2: {
      fontSize: 20,
      fontWeight: '600',
      color: '#333333',
    },
    h3: {
      fontSize: 18,
      fontWeight: '600',
      color: '#333333',
    },
    body: {
      fontSize: 16,
      fontWeight: '400',
      color: '#333333',
    },
    caption: {
      fontSize: 14,
      fontWeight: '400',
      color: '#666666',
    },
  },
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
  },
};

export const darkTheme: CalendarTheme = {
  colors: {
    primary: brandColors.primary,
    secondary: brandColors.secondary,
    background: '#1a1a1a',
    surface: '#2d2d2d',
    text: '#ffffff',
    textSecondary: '#cccccc',
    border: '#404040',
    shadow: 'rgba(0, 0, 0, 0.3)',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
  },
  typography: {
    h1: {
      fontSize: 24,
      fontWeight: '700',
      color: '#ffffff',
    },
    h2: {
      fontSize: 20,
      fontWeight: '600',
      color: '#ffffff',
    },
    h3: {
      fontSize: 18,
      fontWeight: '600',
      color: '#ffffff',
    },
    body: {
      fontSize: 16,
      fontWeight: '400',
      color: '#ffffff',
    },
    caption: {
      fontSize: 14,
      fontWeight: '400',
      color: '#cccccc',
    },
  },
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.3,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 2,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 8,
      elevation: 4,
    },
  },
};

export const getResponsiveStyles = (theme: CalendarTheme) => {
  const isTablet = width > 768;
  const isLandscape = width > height;

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.md,
      paddingTop: isTablet ? theme.spacing.lg : theme.spacing.xl,
    },
    calendarGrid: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
    },
    dayCell: {
      width: isTablet ? (width / 7) - 4 : (width / 7) - 2,
      minHeight: isTablet ? 120 : 100,
      margin: isTablet ? 2 : 1,
    },
    eventCard: {
      marginHorizontal: theme.spacing.md,
      marginVertical: theme.spacing.sm,
    },
    filterChip: {
      paddingHorizontal: isTablet ? theme.spacing.lg : theme.spacing.md,
      paddingVertical: isTablet ? theme.spacing.md : theme.spacing.sm,
    },
    modal: {
      maxHeight: isLandscape ? height * 0.8 : height * 0.9,
    },
    section: {
      marginHorizontal: theme.spacing.md,
      marginVertical: theme.spacing.sm,
    },
    sectionTitle: {
      ...theme.typography.h3,
      fontSize: isTablet ? 20 : 18,
    },
    button: {
      paddingHorizontal: isTablet ? theme.spacing.lg : theme.spacing.md,
      paddingVertical: isTablet ? theme.spacing.md : theme.spacing.sm,
      borderRadius: theme.borderRadius.lg,
    },
    textInput: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: isTablet ? theme.spacing.md : theme.spacing.sm,
      fontSize: isTablet ? 18 : 16,
      borderRadius: theme.borderRadius.md,
    },
  });
};

export const getEventTypeColors = () => ({
  personal: '#4caf50',
  Circle: '#e91e63',
  work: '#2196f3',
  school: '#9c27b0',
  medical: '#f44336',
  other: '#666666',
});

export const getPriorityColors = () => ({
  low: '#10b981',
  medium: '#f59e0b',
  high: '#ef4444',
});

export const getEventTypeIcons = () => ({
  personal: 'person-outline',
  Circle: 'people-outline',
  work: 'briefcase-outline',
  school: 'school-outline',
  medical: 'medical-outline',
  other: 'calendar-outline',
});

export const getResponsiveFontSize = (baseSize: number) => {
  const scale = width / 375; // Base width for iPhone
  return Math.max(baseSize * scale, baseSize * 0.8);
};

export const getResponsiveSpacing = (baseSpacing: number) => {
  const scale = width / 375;
  return Math.max(baseSpacing * scale, baseSpacing * 0.8);
};

