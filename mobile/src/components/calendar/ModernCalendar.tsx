import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Easing,
  RefreshControl,
  Alert,
} from 'react-native';
import IconIon from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { brandColors } from '../../theme/colors';
import { CalendarHeader } from './CalendarHeader';
import { CalendarGrid, Event, DateData } from './CalendarGrid';
import { EventCard } from './EventCard';
import { EventModal } from './EventModal';
import { CalendarFilters, CalendarFilter } from './CalendarFilters';

interface ModernCalendarProps {
  events?: Event[];
  onEventCreate?: (eventData: Partial<Event>) => void;
  onEventUpdate?: (eventData: Partial<Event>) => void;
  onEventDelete?: (eventId: string) => void;
  onRefresh?: () => Promise<void>;
  loading?: boolean;
  familyId?: string;
}

export const ModernCalendar: React.FC<ModernCalendarProps> = ({
  events = [],
  onEventCreate,
  onEventUpdate,
  onEventDelete,
  onRefresh,
  loading = false,
  familyId,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<DateData | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [refreshing, setRefreshing] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [filters, setFilters] = useState<CalendarFilter>({
    type: 'all',
    priority: 'all',
    dateRange: 'all',
    showCompleted: false,
  });

  // Animation values
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const headerAnim = useRef(new Animated.Value(1)).current;
  const eventAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate events on mount
    Animated.timing(eventAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
      easing: Easing.out(Easing.cubic),
    }).start();
  }, []);

  const filteredEvents = events.filter(event => {
    if (filters.type !== 'all' && event.type !== filters.type) return false;
    if (filters.priority !== 'all' && event.priority !== filters.priority) return false;
    // Add more filtering logic as needed
    return true;
  });

  const getEventsForDate = (dateString: string): Event[] => {
    return filteredEvents.filter(event => {
      const eventDate = new Date(event.startDate).toISOString().split('T')[0];
      return eventDate === dateString;
    });
  };

  const getUpcomingEvents = (): Event[] => {
    const today = new Date().toISOString().split('T')[0];
    return filteredEvents
      .filter(event => {
        const eventDate = new Date(event.startDate).toISOString().split('T')[0];
        return eventDate >= today;
      })
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
      .slice(0, 5);
  };

  const getTodayEvents = (): Event[] => {
    const today = new Date().toISOString().split('T')[0];
    return getEventsForDate(today);
  };

  const handleNavigateMonth = (direction: 'prev' | 'next') => {
    if (isAnimating) return;
    setIsAnimating(true);

    const slideDirection = direction === 'next' ? 1 : -1;
    
    // Complex animation sequence
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(slideAnim, {
        toValue: slideDirection * 50,
        duration: 200,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 200,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
    ]).start(() => {
      const newDate = new Date(currentDate);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      setCurrentDate(newDate);

      // Reset and animate back
      slideAnim.setValue(-slideDirection * 50);
      scaleAnim.setValue(0.9);
      
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
      ]).start(() => {
        setIsAnimating(false);
      });
    });
  };

  const handleGoToToday = () => {
    if (isAnimating) return;
    
    setCurrentDate(new Date());
    setSelectedDate(null);
    
    // Pulse animation for today button
    Animated.sequence([
      Animated.timing(headerAnim, {
        toValue: 1.1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleDayPress = (day: DateData) => {
    if (isAnimating) return;
    
    setSelectedDate(day);
    
    // Animate day selection
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
    ]).start();
  };

  const handleEventPress = (event: Event) => {
    setSelectedEvent(event);
    setModalMode('view');
    setModalVisible(true);
  };

  const handleEventEdit = (event: Event) => {
    setSelectedEvent(event);
    setModalMode('edit');
    setModalVisible(true);
  };

  const handleEventDelete = (event: Event) => {
    Alert.alert(
      'Delete Event',
      `Are you sure you want to delete "${event.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            onEventDelete?.(event.id);
          },
        },
      ]
    );
  };

  const handleCreateEvent = () => {
    setSelectedEvent(null);
    setModalMode('create');
    setModalVisible(true);
  };

  const handleSaveEvent = (eventData: Partial<Event>) => {
    if (modalMode === 'create') {
      onEventCreate?.(eventData);
    } else if (modalMode === 'edit' && selectedEvent) {
      onEventUpdate?.({ ...eventData, id: selectedEvent.id });
    }
  };

  const handleDeleteEvent = (eventId: string) => {
    onEventDelete?.(eventId);
  };

  const handleRefresh = async () => {
    if (onRefresh) {
      setRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setRefreshing(false);
      }
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <LinearGradient
        colors={[brandColors.primary, brandColors.secondary]}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <IconIon name="calendar-outline" size={24} color="#ffffff" />
            <Text style={styles.headerTitle}>Calendar</Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleCreateEvent}
            activeOpacity={0.8}
          >
            <IconIon name="add" size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );

  const renderQuickChips = () => (
    <View style={styles.chipsRow}>
      <View style={styles.chipsGroup}>
        {(['month','week','day'] as const).map((mode) => (
          <TouchableOpacity
            key={mode}
            onPress={() => setViewMode(mode)}
            style={[styles.chip, viewMode === mode && styles.chipActive]}
            activeOpacity={0.8}
          >
            <Text style={[styles.chipText, viewMode === mode && styles.chipTextActive]}>
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.chipsGroup}>
        {(['all','week','month','custom'] as const).map((range) => (
          <TouchableOpacity
            key={range}
            onPress={() => setFilters({ ...filters, dateRange: range })}
            style={[styles.chip, filters.dateRange === range && styles.chipActive]}
            activeOpacity={0.8}
          >
            <Text style={[styles.chipText, filters.dateRange === range && styles.chipTextActive]}>
              {range === 'all' ? 'All' : range.charAt(0).toUpperCase() + range.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderTodayEvents = () => {
    const todayEvents = getTodayEvents();
    
    return (
      <View style={styles.section}>
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Events</Text>
            <Text style={styles.eventCount}>{todayEvents.length} events</Text>
          </View>
          {todayEvents.length > 0 ? (
            <View style={styles.todayEventsList}>
              {todayEvents.map((event, index) => (
                <EventCard
                  key={event.id}
                  event={event}
                  variant="compact"
                  onPress={handleEventPress}
                  onEdit={handleEventEdit}
                  onDelete={handleEventDelete}
                  animationDelay={index * 100}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <IconIon name="calendar-outline" size={48} color="#ccc" />
              <Text style={styles.emptyStateText}>No events scheduled for today</Text>
              <TouchableOpacity style={styles.addEventButton} onPress={handleCreateEvent}>
                <Text style={styles.addEventButtonText}>Add Event</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderUpcomingEvents = () => {
    const upcomingEvents = getUpcomingEvents();
    
    return (
      <View style={styles.section}>
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Events</Text>
            <Text style={styles.eventCount}>{upcomingEvents.length} events</Text>
          </View>
          {upcomingEvents.length > 0 ? (
            <View style={styles.upcomingEventsList}>
              {upcomingEvents.map((event, index) => (
                <EventCard
                  key={event.id}
                  event={event}
                  variant="default"
                  onPress={handleEventPress}
                  onEdit={handleEventEdit}
                  onDelete={handleEventDelete}
                  animationDelay={index * 100}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <IconIon name="time-outline" size={48} color="#ccc" />
              <Text style={styles.emptyStateText}>No upcoming events</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderSelectedDateEvents = () => {
    if (!selectedDate) return null;
    
    const dateEvents = getEventsForDate(selectedDate.dateString);
    
    return (
      <View style={styles.section}>
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {new Date(selectedDate.dateString).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
            <Text style={styles.eventCount}>{dateEvents.length} events</Text>
          </View>
          {dateEvents.length > 0 ? (
            <View style={styles.selectedDateEventsList}>
              {dateEvents.map((event, index) => (
                <EventCard
                  key={event.id}
                  event={event}
                  variant="detailed"
                  onPress={handleEventPress}
                  onEdit={handleEventEdit}
                  onDelete={handleEventDelete}
                  animationDelay={index * 100}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <IconIon name="calendar-outline" size={48} color="#ccc" />
              <Text style={styles.emptyStateText}>No events on this date</Text>
              <TouchableOpacity style={styles.addEventButton} onPress={handleCreateEvent}>
                <Text style={styles.addEventButtonText}>Add Event</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {renderHeader()}
      {renderQuickChips()}
      
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <CalendarHeader
          currentDate={currentDate}
          viewMode={viewMode}
          onNavigateMonth={handleNavigateMonth}
          onGoToToday={handleGoToToday}
          onViewModeChange={setViewMode}
          isAnimating={isAnimating}
          headerAnim={headerAnim}
        />

        <CalendarFilters
          filters={filters}
          onFilterChange={setFilters}
          onSearchPress={() => {
            // Implement search functionality
          }}
        />

        {renderTodayEvents()}
        {renderUpcomingEvents()}

        <View style={styles.calendarContainer}>
          <CalendarGrid
            currentDate={currentDate}
            events={filteredEvents}
            selectedDate={selectedDate}
            onDayPress={handleDayPress}
            onEventPress={handleEventPress}
            isAnimating={isAnimating}
            fadeAnim={fadeAnim}
            scaleAnim={scaleAnim}
            slideAnim={slideAnim}
            eventAnim={eventAnim}
          />
        </View>

        {renderSelectedDateEvents()}

        <View style={styles.bottomSpacing} />
      </ScrollView>

      <EventModal
        visible={modalVisible}
        event={selectedEvent}
        onClose={() => setModalVisible(false)}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
        mode={modalMode}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  headerGradient: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  chipsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 12,
  },
  chipsGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  chipActive: {
    backgroundColor: brandColors.primary,
    borderColor: brandColors.primary,
  },
  chipText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  section: {
    paddingHorizontal: 20,
    marginVertical: 12,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  eventCount: {
    fontSize: 14,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  todayEventsList: {
    gap: 8,
  },
  upcomingEventsList: {
    gap: 12,
  },
  selectedDateEventsList: {
    gap: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
    marginBottom: 16,
  },
  addEventButton: {
    backgroundColor: brandColors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  addEventButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  calendarContainer: {
    marginVertical: 8,
    marginHorizontal: 20,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    overflow: 'hidden',
  },
  bottomSpacing: {
    height: 20,
  },
});
