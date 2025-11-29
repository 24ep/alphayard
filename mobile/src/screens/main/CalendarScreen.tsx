import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
} from 'react-native';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { calendarService } from '../../services/calendar/CalendarService';
// Simple local event type for the simplified calendar screen
type SimpleEvent = {
  id: string;
  title: string;
  description?: string;
  startDate: string; // ISO
  endDate: string;   // ISO
  allDay?: boolean;
  location?: string;
  color?: string;
};
import { brandColors } from '../../theme/colors';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigationAnimation } from '../../contexts/NavigationAnimationContext';
import { useFocusEffect } from '@react-navigation/native';
import { FamilyDropdown } from '../../components/home/FamilyDropdown';
import SegmentedTabs from '../../components/common/SegmentedTabs';
import MainScreenLayout from '../../components/layout/MainScreenLayout';

const H_PADDING = 20;

interface CalendarScreenProps { embedded?: boolean }
const CalendarScreen: React.FC<CalendarScreenProps> = ({ embedded }) => {
  console.log('[UI] CalendarScreen (main) using MainScreenLayout');

  const [events, setEvents] = useState<SimpleEvent[]>([]);
  const [filter, setFilter] = useState<'all' | 'today' | 'week'>('all');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const cardOpacityAnim = useRef(new Animated.Value(0)).current;

  const { cardMarginTopAnim, animateToGallery, familyNameScaleAnim } = useNavigationAnimation();

  // Family selection (match Gallery/Home header outside the card)
  const [showFamilyDropdown, setShowFamilyDropdown] = useState(false);
  const [selectedFamily, setSelectedFamily] = useState('Smith Family');
  const availableFamilies = [
    { id: '1', name: 'Smith Family', members: 4 },
    { id: '2', name: 'Johnson Family', members: 3 },
    { id: '3', name: 'Williams Family', members: 5 },
    { id: '4', name: 'Brown Family', members: 2 },
  ];
  const handleFamilySelect = (familyName: string) => {
    setSelectedFamily(familyName);
    setShowFamilyDropdown(false);
  };

  // Calendar state
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // Drawer states
  const [showEventsDrawer, setShowEventsDrawer] = useState(false);
  const [showCreateEventDrawer, setShowCreateEventDrawer] = useState(false);
  const [showEventDetailDrawer, setShowEventDetailDrawer] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<SimpleEvent | null>(null);
  
  // Form state for create/edit
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    allDay: false,
    location: '',
    color: brandColors.primary,
  });

  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const isSameDay = (a: Date, b: Date) => startOfDay(a).getTime() === startOfDay(b).getTime();
  const isSameMonth = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
  const addMonths = (d: Date, m: number) => new Date(d.getFullYear(), d.getMonth() + m, 1);
  const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
  const endOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0);
  const startOfWeek = (d: Date) => {
    const day = d.getDay(); // 0 Sun ... 6 Sat
    const diff = (day + 6) % 7; // make Monday=0
    const res = new Date(d);
    res.setDate(d.getDate() - diff);
    res.setHours(0,0,0,0);
    return res;
  };
  const endOfWeek = (d: Date) => {
    const res = new Date(startOfWeek(d));
    res.setDate(res.getDate() + 6);
    return res;
  };
  const monthDays = useMemo(() => {
    const firstOfMonth = startOfMonth(currentMonthDate);
    const lastOfMonth = endOfMonth(currentMonthDate);
    const gridStart = startOfWeek(firstOfMonth);
    const gridEnd = endOfWeek(lastOfMonth);
    const days: Date[] = [];
    const cur = new Date(gridStart);
    while (cur <= gridEnd) {
      days.push(new Date(cur));
      cur.setDate(cur.getDate() + 1);
    }
    return days;
  }, [currentMonthDate]);

  useEffect(() => {
    Animated.timing(cardOpacityAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  // Hard-stop guard: ensure loading clears after 8s regardless of request state
  useEffect(() => {
    const hardStop = setTimeout(() => {
      setLoading(false);
    }, 8000);
    return () => clearTimeout(hardStop);
  }, []);

  // Safety: ensure loading never hangs more than 6 seconds (network issues)
  useEffect(() => {
    if (loading) {
      const safetyTimer = setTimeout(() => {
        setLoading(false);
        try {
          if (events.length === 0) {
            const mock = calendarService.getMockEvents();
            setEvents(mock);
          }
        } catch {}
      }, 6000);
      return () => clearTimeout(safetyTimer);
    }
  }, [loading]);

  useFocusEffect(
    React.useCallback(() => {
      animateToGallery();
    }, [animateToGallery])
  );

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    const to = setTimeout(() => {
      try {
        const mockEvents = calendarService.getMockEvents();
        setEvents(mockEvents.map(event => ({
          id: event.id,
          title: event.title,
          description: event.description || '',
          startDate: event.startDate,
          endDate: event.endDate,
          allDay: event.allDay,
          location: event.location || '',
          color: event.color,
        })));
      } catch {}
      setLoading(false);
    }, 5000);

    try {
      setLoading(true);
      const apiEvents = await calendarService.getEvents();
      clearTimeout(to);
      setEvents(apiEvents.map(event => ({
        id: event.id,
        title: event.title,
        description: event.description || '',
        startDate: event.startDate,
        endDate: event.endDate,
        allDay: event.allDay,
        location: event.location || '',
        color: event.color,
      })));
      setLoading(false);
    } catch (apiError) {
      clearTimeout(to);
      try {
        const mockEvents = calendarService.getMockEvents();
        setEvents(mockEvents.map(event => ({
          id: event.id,
          title: event.title,
          description: event.description || '',
          startDate: event.startDate,
          endDate: event.endDate,
          allDay: event.allDay,
          location: event.location || '',
          color: event.color,
        })));
      } catch {}
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadEvents();
    } finally {
      setRefreshing(false);
    }
  };

  const handleEventCreate = async (eventData: Partial<SimpleEvent>) => {
    try {
      const newEvent: SimpleEvent = {
        id: Date.now().toString(),
        title: eventData.title || 'New Event',
        description: eventData.description,
        startDate: eventData.startDate || new Date().toISOString(),
        endDate: eventData.endDate || new Date().toISOString(),
        allDay: eventData.allDay || false,
        location: eventData.location,
        color: eventData.color || brandColors.primary,
      };
      setEvents(prev => [...prev, newEvent]);
    } catch {}
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setShowEventsDrawer(true);
  };

  const handleEventClick = (event: SimpleEvent) => {
    setSelectedEvent(event);
    setEventForm({
      title: event.title,
      description: event.description || '',
      startDate: event.startDate,
      endDate: event.endDate,
      allDay: event.allDay || false,
      location: event.location || '',
      color: event.color || brandColors.primary,
    });
    setShowEventDetailDrawer(true);
  };

  type DayCellProps = {
    day: Date;
    inMonth: boolean;
    isToday: boolean;
    isSelected: boolean;
    dayEvents: SimpleEvent[];
    onPressDay: (d: Date) => void;
    onPressEvent: (e: SimpleEvent) => void;
  };

  const DayCell: React.FC<DayCellProps> = ({ day, inMonth, isToday, isSelected, dayEvents, onPressDay, onPressEvent }) => {
    return (
      <TouchableOpacity
        key={day.toISOString()}
        style={{ flex: 1, paddingHorizontal: 6 }}
        onPress={() => onPressDay(new Date(day))}
      >
        <View style={{ borderRadius: 8, padding: 6, backgroundColor: isSelected ? 'rgba(255,182,193,0.12)' : 'transparent' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 12, fontWeight: isToday ? '800' : '600', color: inMonth ? '#111827' : '#9CA3AF' }}>
              {day.getDate()}
            </Text>
            {isToday && (
              <View style={{ backgroundColor: '#FFB6C1', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 9999 }}>
                <Text style={{ fontSize: 10, color: '#1F2937', fontWeight: '700' }}>Today</Text>
              </View>
            )}
          </View>
          <View style={{ marginTop: 6 }}>
            {dayEvents.slice(0, 2).map(ev => (
              <TouchableOpacity
                key={ev.id}
                style={{ height: 16, borderRadius: 4, backgroundColor: ev.color || '#93C5FD', justifyContent: 'center', paddingHorizontal: 4 }}
                onPress={() => onPressEvent(ev)}
              >
                <Text numberOfLines={1} style={{ fontSize: 10, color: '#FFFFFF', fontWeight: '700' }}>{ev.title}</Text>
              </TouchableOpacity>
            ))}
            {dayEvents.length > 2 && (
              <Text style={{ fontSize: 10, color: '#6B7280' }}>+{dayEvents.length - 2} more</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const saveEvent = () => {
    if (selectedEvent) {
      setEvents(prev => prev.map(e => e.id === selectedEvent.id ? { ...e, ...eventForm } : e));
      setShowEventDetailDrawer(false);
    } else {
      const newEvent: SimpleEvent = { id: Date.now().toString(), ...eventForm } as any;
      setEvents(prev => [...prev, newEvent]);
      setShowCreateEventDrawer(false);
    }
    setSelectedEvent(null);
  };

  const deleteEvent = () => {
    if (selectedEvent) {
      setEvents(prev => prev.filter(e => e.id !== selectedEvent.id));
      setShowEventDetailDrawer(false);
      setSelectedEvent(null);
    }
  };

  const inner = (
    <>
      {loading && (
        <View style={{ paddingHorizontal: H_PADDING, paddingTop: 8 }}>
          <LoadingSpinner fullScreen={false} text="Loading calendar..." />
        </View>
      )}
      <SegmentedTabs
        tabs={[
          { id: 'all', label: 'All', icon: 'calendar' },
          { id: 'today', label: 'Today', icon: 'calendar-today' },
          { id: 'week', label: 'Week', icon: 'calendar-week' },
        ]}
        activeId={filter}
        onChange={(id) => setFilter(id as any)}
      />

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Toolbar */}
        <View style={{ paddingHorizontal: H_PADDING, paddingTop: 12, marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity onPress={() => setCurrentMonthDate(addMonths(currentMonthDate, -1))} style={{ padding: 8, borderRadius: 20, backgroundColor: '#F3F4F6', marginRight: 6 }}>
                <IconMC name="chevron-left" size={20} color="#6B7280" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setCurrentMonthDate(new Date())} style={{ paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, backgroundColor: '#F3F4F6', marginRight: 6 }}>
                <Text style={{ color: '#374151', fontWeight: '600' }}>Today</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setCurrentMonthDate(addMonths(currentMonthDate, 1))} style={{ padding: 8, borderRadius: 20, backgroundColor: '#F3F4F6' }}>
                <IconMC name="chevron-right" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity
                onPress={() => handleEventCreate({ title: 'New Event' })}
                activeOpacity={0.9}
                style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#FFB6C1' }}
              >
                <Text style={{ color: '#1F2937', fontWeight: '700' }}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
          <Text style={{ marginTop: 8, fontSize: 18, fontWeight: '700', color: '#111827' }}>
            {currentMonthDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
          </Text>
        </View>

        {/* Weekday header */}
        <View style={{ paddingHorizontal: H_PADDING }}>
          <View style={{ flexDirection: 'row', backgroundColor: '#FFFFFF', borderTopLeftRadius: 12, borderTopRightRadius: 12, paddingVertical: 8, paddingHorizontal: 8 }}>
            {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => (
              <View key={d} style={{ flex: 1, alignItems: 'center' }}>
                <Text style={{ fontSize: 12, color: '#6B7280', fontWeight: '600' }}>{d}</Text>
              </View>
            ))}
          </View>
          {/* Month grid */}
          <View style={{ backgroundColor: '#FFFFFF', paddingHorizontal: 8, paddingBottom: 8, borderBottomLeftRadius: 12, borderBottomRightRadius: 12 }}>
            {Array.from({ length: 6 }).map((_, weekIdx) => {
              const days = monthDays.slice(weekIdx * 7, weekIdx * 7 + 7);
              return (
                <View key={weekIdx} style={{ flexDirection: 'row', paddingVertical: 8 }}>
                  {days.map(day => {
                    const inMonth = isSameMonth(day, currentMonthDate);
                    const today = isSameDay(day, new Date());
                    const selected = isSameDay(day, selectedDate);
                    const dayEvents = events.filter(e => isSameDay(new Date(e.startDate), day));
                    return (
                      <DayCell
                        key={day.toISOString()}
                        day={day}
                        inMonth={inMonth}
                        isToday={today}
                        isSelected={selected}
                        dayEvents={dayEvents}
                        onPressDay={handleDateClick}
                        onPressEvent={handleEventClick}
                      />
                    );
                  })}
                </View>
              );
            })}
          </View>
        </View>

      </ScrollView>

      {/* Events List Drawer */}
      <Modal visible={showEventsDrawer} transparent animationType="slide" onRequestClose={() => setShowEventsDrawer(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: '#FFFFFF', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 20, maxHeight: '70%' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: '#111827' }}>
                {selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
              </Text>
              <TouchableOpacity onPress={() => setShowEventsDrawer(false)} style={{ padding: 8 }}>
                <IconMC name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Create/Edit Event Drawer */}
      <Modal visible={showCreateEventDrawer || showEventDetailDrawer} transparent animationType="slide" onRequestClose={() => {
        setShowCreateEventDrawer(false);
        setShowEventDetailDrawer(false);
        setSelectedEvent(null);
      }}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: '#FFFFFF', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 20, maxHeight: '80%' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: '#111827' }}>
                {selectedEvent ? 'Edit Event' : 'Create Event'}
              </Text>
              <TouchableOpacity onPress={() => {
                setShowCreateEventDrawer(false);
                setShowEventDetailDrawer(false);
                setSelectedEvent(null);
              }} style={{ padding: 8 }}>
                <IconMC name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );

  if (embedded) return inner;

  return (
    <MainScreenLayout
      selectedFamily={selectedFamily}
      onToggleFamilyDropdown={() => setShowFamilyDropdown(!showFamilyDropdown)}
      showFamilyDropdown={showFamilyDropdown}
      cardMarginTopAnim={cardMarginTopAnim}
      cardOpacityAnim={cardOpacityAnim}
    >
      {inner}
    </MainScreenLayout>
  );
};

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  mainContentCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    paddingVertical: 16,
    paddingHorizontal: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 182, 193, 0.2)',
  },
});

export default CalendarScreen;
