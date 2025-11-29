import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import IconIon from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { brandColors, colors } from '../../theme/colors';

interface CalendarHeaderProps {
  currentDate: Date;
  viewMode: 'month' | 'week' | 'day';
  onNavigateMonth: (direction: 'prev' | 'next') => void;
  onGoToToday: () => void;
  onViewModeChange: (mode: 'month' | 'week' | 'day') => void;
  isAnimating?: boolean;
  headerAnim?: Animated.Value;
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  currentDate,
  viewMode,
  onNavigateMonth,
  onGoToToday,
  onViewModeChange,
  isAnimating = false,
  headerAnim,
}) => {
  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const viewModes = [
    { key: 'month', label: 'Month', icon: 'calendar-outline' },
    { key: 'week', label: 'Week', icon: 'calendar-outline' },
    { key: 'day', label: 'Day', icon: 'today-outline' },
  ] as const;

  const HeaderContent = () => (
    <View style={styles.headerContent}>
      <View style={styles.headerLeft}>
        <View style={styles.navigationButtons}>
          <TouchableOpacity 
            onPress={() => onNavigateMonth('prev')} 
            style={styles.navButton}
            activeOpacity={0.7}
            disabled={isAnimating}
          >
            <LinearGradient
              colors={['#ffffff', '#f8f9fa']}
              style={styles.navButtonGradient}
            >
              <IconIon name="chevron-back" size={20} color="#5f6368" />
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => onNavigateMonth('next')} 
            style={styles.navButton}
            activeOpacity={0.7}
            disabled={isAnimating}
          >
            <LinearGradient
              colors={['#ffffff', '#f8f9fa']}
              style={styles.navButtonGradient}
            >
              <IconIon name="chevron-forward" size={20} color="#5f6368" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
        
        <Text style={styles.monthYearText}>
          {formatMonthYear(currentDate)}
        </Text>
      </View>
      
      <View style={styles.headerRight}>
        <View style={styles.viewModeButtons}>
          {viewModes.map((mode) => (
            <TouchableOpacity
              key={mode.key}
              style={[
                styles.viewModeButton,
                viewMode === mode.key && styles.activeViewModeButton,
              ]}
              onPress={() => onViewModeChange(mode.key)}
              activeOpacity={0.7}
            >
              <IconIon 
                name={mode.icon} 
                size={16} 
                color={viewMode === mode.key ? '#ffffff' : '#5f6368'} 
              />
              <Text style={[
                styles.viewModeText,
                viewMode === mode.key && styles.activeViewModeText,
              ]}>
                {mode.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <TouchableOpacity 
          style={styles.todayButton}
          onPress={onGoToToday}
          activeOpacity={0.8}
          disabled={isAnimating}
        >
          <LinearGradient
            colors={[brandColors.primary, brandColors.secondary]}
            style={styles.todayButtonGradient}
          >
            <IconIon name="today" size={16} color="#ffffff" />
            <Text style={styles.todayButtonText}>Today</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (headerAnim) {
    return (
      <Animated.View style={[styles.calendarHeader, { transform: [{ scale: headerAnim }] }]}>
        <LinearGradient
          colors={['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.85)']}
          style={styles.headerGradient}
        >
          <HeaderContent />
        </LinearGradient>
      </Animated.View>
    );
  }

  return (
    <View style={styles.calendarHeader}>
      <LinearGradient
        colors={['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.85)']}
        style={styles.headerGradient}
      >
        <HeaderContent />
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  calendarHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerGradient: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  navigationButtons: {
    flexDirection: 'row',
    gap: 8,
    marginRight: 16,
  },
  navButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    shadowColor: brandColors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  navButtonGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthYearText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    letterSpacing: 0.5,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  viewModeButtons: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    padding: 4,
    gap: 2,
  },
  viewModeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  activeViewModeButton: {
    backgroundColor: brandColors.primary,
    shadowColor: brandColors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  viewModeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#5f6368',
  },
  activeViewModeText: {
    color: '#ffffff',
  },
  todayButton: {
    borderRadius: 20,
    shadowColor: brandColors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  todayButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
  },
  todayButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});
