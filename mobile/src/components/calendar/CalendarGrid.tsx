import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { brandColors } from '../../theme/colors';

const { width } = Dimensions.get('window');

export interface Event {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  allDay: boolean;
  color: string;
  type: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface DateData {
  dateString: string;
  day: number;
  month: number;
  year: number;
  timestamp: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
}

interface CalendarGridProps {
  currentDate: Date;
  events: Event[];
  selectedDate?: DateData | null;
  onDayPress: (day: DateData) => void;
  onEventPress?: (event: Event) => void;
  isAnimating?: boolean;
  fadeAnim?: Animated.Value;
  scaleAnim?: Animated.Value;
  slideAnim?: Animated.Value;
  eventAnim?: Animated.Value;
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  currentDate,
  events,
  selectedDate,
  onDayPress,
  onEventPress,
  isAnimating = false,
  fadeAnim,
  scaleAnim,
  slideAnim,
  eventAnim,
}) => {
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getDaysInMonth = (date: Date): DateData[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    
    const days: DateData[] = [];
    
    // Add days from previous month
    const prevMonth = new Date(year, month, 0);
    const daysInPrevMonth = prevMonth.getDate();
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      const dateString = `${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      days.push({
        dateString,
        day,
        month: prevMonth.getMonth() + 1,
        year: prevMonth.getFullYear(),
        timestamp: new Date(prevMonth.getFullYear(), prevMonth.getMonth(), day).getTime(),
        isCurrentMonth: false,
        isToday: false,
        isSelected: false,
      });
    }
    
    // Add days of current month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
      days.push({
        dateString,
        day,
        month: month + 1,
        year,
        timestamp: new Date(year, month, day).getTime(),
        isCurrentMonth: true,
        isToday,
        isSelected: selectedDate?.dateString === dateString,
      });
    }
    
    // Add days from next month to complete the grid
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const nextMonth = new Date(year, month + 1, day);
      const dateString = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      days.push({
        dateString,
        day,
        month: nextMonth.getMonth() + 1,
        year: nextMonth.getFullYear(),
        timestamp: nextMonth.getTime(),
        isCurrentMonth: false,
        isToday: false,
        isSelected: false,
      });
    }
    
    return days;
  };

  const getEventsForDate = (dateString: string): Event[] => {
    return events.filter(event => {
      const eventDate = new Date(event.startDate).toISOString().split('T')[0];
      return eventDate === dateString;
    });
  };

  const getEventPriorityColor = (priority?: 'low' | 'medium' | 'high'): string => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return brandColors.primary;
    }
  };

  const renderWeekDays = () => (
    <View style={styles.weekDaysHeader}>
      <LinearGradient
        colors={['rgba(248,249,250,0.95)', 'rgba(248,249,250,0.85)']}
        style={styles.weekDaysGradient}
      >
        {weekDays.map(day => (
          <Text key={day} style={styles.weekDayText}>{day}</Text>
        ))}
      </LinearGradient>
    </View>
  );

  const renderDayCell = (day: DateData, index: number) => {
    const dayEvents = getEventsForDate(day.dateString);
    const isSelected = selectedDate?.dateString === day.dateString;

    const DayCellContent = () => (
      <TouchableOpacity
        style={[
          styles.dayCell,
          day.isToday && styles.todayCell,
          isSelected && styles.selectedCell,
        ]}
        onPress={() => onDayPress(day)}
        activeOpacity={0.7}
        disabled={isAnimating}
      >
        <LinearGradient
          colors={
            day.isToday 
              ? ['#fef7e0', '#fef3c7']
              : isSelected
              ? ['#e8f0fe', '#d2e3fc']
              : ['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)']
          }
          style={styles.dayCellGradient}
        >
          <View style={styles.dayContent}>
            <Text style={[
              styles.dayNumber,
              day.isToday && styles.todayText,
              !day.isCurrentMonth && styles.otherMonthText,
              isSelected && styles.selectedText,
            ]}>
              {day.day}
            </Text>
            
            {dayEvents.length > 0 && (
              <View style={styles.eventsContainer}>
                {dayEvents.slice(0, 3).map((event, eventIndex) => (
                  <TouchableOpacity
                    key={event.id}
                    style={[
                      styles.eventContainer,
                      { backgroundColor: getEventPriorityColor(event.priority) }
                    ]}
                    onPress={() => onEventPress?.(event)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.eventTitle} numberOfLines={1}>
                      {event.title}
                    </Text>
                  </TouchableOpacity>
                ))}
                {dayEvents.length > 3 && (
                  <View style={styles.moreEventsIndicator}>
                    <Text style={styles.moreEventsText}>+{dayEvents.length - 3}</Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );

    if (fadeAnim && scaleAnim && slideAnim) {
      return (
        <Animated.View
          key={day.dateString}
          style={[
            styles.dayCellContainer,
            {
              transform: [
                { scale: scaleAnim },
                { translateX: slideAnim },
              ],
              opacity: fadeAnim,
            },
          ]}
        >
          <DayCellContent />
        </Animated.View>
      );
    }

    return (
      <View key={day.dateString} style={styles.dayCellContainer}>
        <DayCellContent />
      </View>
    );
  };

  const renderCalendarGrid = () => {
    const days = getDaysInMonth(currentDate);
    
    const GridContent = () => (
      <View style={styles.calendarGrid}>
        {days.map((day, index) => renderDayCell(day, index))}
      </View>
    );

    if (fadeAnim && scaleAnim && slideAnim) {
      return (
        <Animated.View 
          style={[
            styles.calendarGridContainer,
            {
              opacity: fadeAnim,
              transform: [
                { scale: scaleAnim },
                { translateX: slideAnim },
              ],
            },
          ]}
        >
          <GridContent />
        </Animated.View>
      );
    }

    return (
      <View style={styles.calendarGridContainer}>
        <GridContent />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {renderWeekDays()}
      {renderCalendarGrid()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
  },
  weekDaysHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  weekDaysGradient: {
    flexDirection: 'row',
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
  },
  weekDayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  calendarGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCellContainer: {
    width: width / 7 - 2,
    minHeight: 110,
  },
  dayCell: {
    flex: 1,
    margin: 1,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  dayCellGradient: {
    flex: 1,
    padding: 8,
  },
  dayContent: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  dayNumber: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
    marginBottom: 6,
    textAlign: 'center',
  },
  todayText: {
    color: brandColors.primary,
    fontWeight: '800',
  },
  selectedText: {
    color: brandColors.primary,
    fontWeight: '700',
  },
  otherMonthText: {
    color: '#ccc',
    fontWeight: '400',
  },
  todayCell: {
    borderWidth: 2,
    borderColor: brandColors.primary,
  },
  selectedCell: {
    borderWidth: 2,
    borderColor: brandColors.primary,
  },
  eventsContainer: {
    gap: 3,
    marginTop: 4,
  },
  eventContainer: {
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  eventTitle: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: '600',
    textAlign: 'center',
  },
  moreEventsIndicator: {
    backgroundColor: '#f1f3f4',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: 'center',
  },
  moreEventsText: {
    fontSize: 9,
    color: '#666',
    fontWeight: '600',
    textAlign: 'center',
  },
});
