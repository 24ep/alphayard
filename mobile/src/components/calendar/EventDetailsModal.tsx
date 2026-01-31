import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

interface Event {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  allDay: boolean;
  location?: string;
  type: 'Circle' | 'personal' | 'work' | 'school' | 'medical' | 'other';
  color: string;
  attendees: string[];
  createdBy: string;
  circleId?: string;
  recurring?: {
    type: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    endDate?: string;
  };
  reminders: {
    type: 'push' | 'email' | 'sms';
    time: number;
  }[];
}

interface EventDetailsModalProps {
  visible: boolean;
  event: Event | null;
  onClose: () => void;
  onUpdate: (eventId: string, eventData: Partial<Event>) => Promise<void>;
  onDelete: (eventId: string) => Promise<void>;
}

export const EventDetailsModal: React.FC<EventDetailsModalProps> = ({
  visible,
  event,
  onClose,
  onUpdate,
  onDelete,
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  if (!event) return null;

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getEventTypeColor = (type: string) => {
    const colors = {
      Circle: '#EF4444',
      personal: '#3B82F6',
      work: '#10B981',
      school: '#F59E0B',
      medical: '#8B5CF6',
      other: '#6B7280',
    };
    return colors[type as keyof typeof colors] || colors.other;
  };

  const getEventTypeLabel = (type: string) => {
    return t(`calendar.${type}`);
  };

  const handleDelete = () => {
    Alert.alert(
      t('calendar.deleteEvent'),
      t('calendar.deleteEventConfirm'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await onDelete(event.id);
              onClose();
            } catch (error) {
              console.error('Error deleting event:', error);
              Alert.alert(t('error'), t('calendar.deleteEventError'));
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleEdit = () => {
    // This would typically open an edit modal
    // For now, we'll just close this modal
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={handleEdit} style={styles.editButton}>
              <Text style={styles.editText}>{t('edit')}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={handleDelete} 
              style={[styles.deleteButton, loading && styles.deleteButtonDisabled]}
              disabled={loading}
            >
              <Text style={[styles.deleteText, loading && styles.deleteTextDisabled]}>
                {loading ? t('loading') : t('delete')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Event Type Badge */}
          <View style={styles.typeContainer}>
            <View style={[styles.typeBadge, { backgroundColor: getEventTypeColor(event.type) }]}>
              <Text style={styles.typeText}>{getEventTypeLabel(event.type)}</Text>
            </View>
          </View>

          {/* Title */}
          <Text style={styles.title}>{event.title}</Text>

          {/* Description */}
          {event.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('calendar.description')}</Text>
              <Text style={styles.description}>{event.description}</Text>
            </View>
          )}

          {/* Date & Time */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('calendar.dateTime')}</Text>
            <View style={styles.dateTimeContainer}>
              <View style={styles.dateTimeItem}>
                <Text style={styles.dateTimeLabel}>{t('calendar.start')}:</Text>
                <Text style={styles.dateTimeValue}>
                  {event.allDay ? formatDateTime(event.startDate) : formatTime(event.startDate)}
                </Text>
              </View>
              <View style={styles.dateTimeItem}>
                <Text style={styles.dateTimeLabel}>{t('calendar.end')}:</Text>
                <Text style={styles.dateTimeValue}>
                  {event.allDay ? formatDateTime(event.endDate) : formatTime(event.endDate)}
                </Text>
              </View>
              {event.allDay && (
                <View style={styles.allDayBadge}>
                  <Text style={styles.allDayText}>{t('calendar.allDay')}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Location */}
          {event.location && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('calendar.location')}</Text>
              <View style={styles.locationContainer}>
                <MaterialCommunityIcons name="map-marker" size={16} color={colors.gray[600]} />
                <Text style={styles.locationText}>{event.location}</Text>
              </View>
            </View>
          )}

          {/* Attendees */}
          {event.attendees.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {t('calendar.attendees')} ({event.attendees.length})
              </Text>
              <View style={styles.attendeesContainer}>
                {event.attendees.map((attendee, index) => (
                  <View key={index} style={styles.attendeeItem}>
                    <Text style={styles.attendeeText}>{attendee}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Recurring */}
          {event.recurring && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('calendar.recurring')}</Text>
              <View style={styles.recurringContainer}>
                <MaterialCommunityIcons name="repeat" size={16} color={colors.gray[600]} />
                <Text style={styles.recurringText}>
                  {t(`calendar.recurring.${event.recurring.type}`)} - {event.recurring.interval}
                </Text>
              </View>
            </View>
          )}

          {/* Reminders */}
          {event.reminders.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('calendar.reminders')}</Text>
              <View style={styles.remindersContainer}>
                {event.reminders.map((reminder, index) => (
                  <View key={index} style={styles.reminderItem}>
                    <Text style={styles.reminderText}>
                      {t(`calendar.reminder.${reminder.type}`)} - {reminder.time} {t('calendar.minutes')}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Created By */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('calendar.createdBy')}</Text>
            <Text style={styles.createdByText}>{event.createdBy}</Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white[500],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  closeButton: {
    padding: 8,
  },
  closeText: {
    fontSize: 20,
    color: colors.gray[600],
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  editButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: colors.primary[500],
    borderRadius: 8,
  },
  editText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white[500],
  },
  deleteButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: colors.error[500],
    borderRadius: 8,
  },
  deleteButtonDisabled: {
    backgroundColor: colors.gray[300],
  },
  deleteText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white[500],
  },
  deleteTextDisabled: {
    color: colors.gray[500],
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  typeContainer: {
    marginBottom: 16,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.white[500],
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.gray[800],
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[700],
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: colors.gray[600],
    lineHeight: 24,
  },
  dateTimeContainer: {
    gap: 8,
  },
  dateTimeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateTimeLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray[600],
  },
  dateTimeValue: {
    fontSize: 14,
    color: colors.gray[800],
  },
  allDayBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary[100],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  allDayText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary[700],
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationIcon: {
    fontSize: 16,
    color: colors.gray[600],
  },
  locationText: {
    fontSize: 14,
    color: colors.gray[600],
    flex: 1,
  },
  attendeesContainer: {
    gap: 8,
  },
  attendeeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  attendeeAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.gray[300],
  },
  attendeeName: {
    fontSize: 14,
    color: colors.gray[700],
  },
  recurringContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  recurringIcon: {
    fontSize: 16,
    color: colors.gray[600],
  },
  recurringText: {
    fontSize: 14,
    color: colors.gray[600],
  },
  remindersContainer: {
    gap: 8,
  },
  reminderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reminderIcon: {
    fontSize: 16,
    color: colors.gray[600],
  },
  reminderText: {
    fontSize: 14,
    color: colors.gray[600],
  },
  createdByText: {
    fontSize: 16,
    color: colors.gray[700],
    fontStyle: 'italic',
  },
});

export default EventDetailsModal; 
