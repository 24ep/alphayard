import React, { useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, RefreshControl, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { brandColors } from '../../theme/colors';

export type CommonCalendarEvent = {
  id: string;
  title: string;
  description?: string;
  startDate: string; // ISO
  endDate: string;   // ISO
  allDay?: boolean;
  location?: string;
  color?: string;
};

type ViewMode = 'month' | 'week' | 'day';
type RangeMode = 'all' | 'week' | 'month' | 'custom';

interface CommonCalendarProps {
  events: CommonCalendarEvent[];
  onRefresh?: () => Promise<void>;
  loading?: boolean;
  onCreatePress?: () => void;
}

export const CommonCalendar: React.FC<CommonCalendarProps> = ({ events, onRefresh, loading, onCreatePress }) => {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (!onRefresh) return;
    setRefreshing(true);
    try { await onRefresh(); } finally { setRefreshing(false); }
  };

  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  }, [events]);

  return (
    <View style={styles.container}>
      <LinearGradient colors={[brandColors.primary, brandColors.secondary]} style={styles.headerGradient}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Icon name="calendar" size={22} color="#fff" />
            <Text style={styles.headerTitle}>Calendar</Text>
          </View>
          <TouchableOpacity style={styles.addButton} onPress={onCreatePress} activeOpacity={0.8}>
            <Icon name="plus" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={{ flex: 1 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}>
        <View style={styles.section}>
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Events</Text>
              <Text style={styles.eventCount}>{sortedEvents.length}</Text>
            </View>
            {sortedEvents.length === 0 ? (
              <View style={styles.emptyState}>
                <Icon name="calendar-blank" size={40} color="#bbb" />
                <Text style={styles.emptyText}>No events</Text>
              </View>
            ) : (
              <View style={{ gap: 12 }}>
                {sortedEvents.map(ev => (
                  <View key={ev.id} style={styles.eventRow}>
                    <View style={[styles.eventDot, { backgroundColor: ev.color || '#4F46E5' }]} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.eventTitle}>{ev.title}</Text>
                      <Text style={styles.eventMeta}>
                        {new Date(ev.startDate).toLocaleDateString()} • {new Date(ev.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </View>
                    <TouchableOpacity style={styles.eventAction}><Icon name="dots-vertical" size={18} color="#6B7280" /></TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>

      <TouchableOpacity activeOpacity={0.9} style={styles.fab} onPress={onCreatePress}>
        <Icon name="plus" size={24} color="#1F2937" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  headerGradient: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  headerContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '700' },
  addButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  // Simplified: no chips
  section: { paddingHorizontal: 20, marginTop: 12 },
  sectionCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  eventCount: { fontSize: 12, color: '#6B7280', backgroundColor: '#F3F4F6', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 9999 },
  emptyState: { alignItems: 'center', paddingVertical: 16 },
  emptyText: { marginTop: 8, color: '#6B7280' },
  eventRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  eventDot: { width: 10, height: 10, borderRadius: 5 },
  eventTitle: { fontSize: 14, fontWeight: '600', color: '#111827' },
  eventMeta: { fontSize: 12, color: '#6B7280' },
  fab: { position: 'absolute', right: 20, bottom: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: '#FFB6C1', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
});

export default CommonCalendar;


