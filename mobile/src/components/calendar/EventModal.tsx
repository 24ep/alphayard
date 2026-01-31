import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Switch,
  Alert,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import IconIon from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
// Use platform-specific wrappers
import DateTimePicker from './DateTimePicker';
import { brandColors } from '../../theme/colors';
import { Event } from './EventCard';

const { height } = Dimensions.get('window');

interface EventModalProps {
  visible: boolean;
  event?: Event | null;
  onClose: () => void;
  onSave: (eventData: Partial<Event>) => void;
  onDelete?: (eventId: string) => void;
  mode: 'create' | 'edit' | 'view';
}

export const EventModal: React.FC<EventModalProps> = ({
  visible,
  event,
  onClose,
  onSave,
  onDelete,
  mode,
}) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(height));
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: new Date(),
    endDate: new Date(),
    allDay: false,
    location: '',
    type: 'personal' as Event['type'],
    priority: 'medium' as Event['priority'],
    attendees: [] as string[],
    reminders: [] as Event['reminders'],
  });
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: height,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  useEffect(() => {
    if (event && mode !== 'create') {
      setFormData({
        title: event.title,
        description: event.description || '',
        startDate: new Date(event.startDate),
        endDate: new Date(event.endDate),
        allDay: event.allDay,
        location: event.location || '',
        type: event.type,
        priority: event.priority,
        attendees: event.attendees,
        reminders: event.reminders,
      });
    } else if (mode === 'create') {
      setFormData({
        title: '',
        description: '',
        startDate: new Date(),
        endDate: new Date(Date.now() + 60 * 60 * 1000), // 1 hour later
        allDay: false,
        location: '',
        type: 'personal',
        priority: 'medium',
        attendees: [],
        reminders: [],
      });
    }
  }, [event, mode]);

  const handleSave = () => {
    if (!formData.title.trim()) {
      Alert.alert('Error', 'Please enter a title for the event');
      return;
    }

    const eventData: Partial<Event> = {
      ...formData,
      startDate: formData.startDate.toISOString(),
      endDate: formData.endDate.toISOString(),
    };

    onSave(eventData);
    onClose();
  };

  const handleDelete = () => {
    if (event?.id) {
      Alert.alert(
        'Delete Event',
        'Are you sure you want to delete this event?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => {
              onDelete?.(event.id);
              onClose();
            },
          },
        ]
      );
    }
  };

  const eventTypes = [
    { key: 'personal', label: 'Personal', icon: 'person-outline', color: '#4caf50' },
    { key: 'Circle', label: 'Circle', icon: 'people-outline', color: '#e91e63' },
    { key: 'work', label: 'Work', icon: 'briefcase-outline', color: '#2196f3' },
    { key: 'school', label: 'School', icon: 'school-outline', color: '#9c27b0' },
    { key: 'medical', label: 'Medical', icon: 'medical-outline', color: '#f44336' },
    { key: 'other', label: 'Other', icon: 'calendar-outline', color: '#666' },
  ] as const;

  const priorityLevels = [
    { key: 'low', label: 'Low', color: '#10b981' },
    { key: 'medium', label: 'Medium', color: '#f59e0b' },
    { key: 'high', label: 'High', color: '#ef4444' },
  ] as const;

  const formatDateTime = (date: Date) => {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <LinearGradient
        colors={[brandColors.primary, brandColors.secondary]}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <IconIon name="close" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {mode === 'create' ? 'New Event' : mode === 'edit' ? 'Edit Event' : 'Event Details'}
          </Text>
          {mode !== 'view' && (
            <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>
    </View>
  );

  const renderFormField = (label: string, children: React.ReactNode) => (
    <View style={styles.formField}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );

  const renderTypeSelector = () => (
    <View style={styles.typeSelector}>
      {eventTypes.map((type) => (
        <TouchableOpacity
          key={type.key}
          style={[
            styles.typeOption,
            formData.type === type.key && styles.selectedTypeOption,
          ]}
          onPress={() => setFormData({ ...formData, type: type.key })}
          activeOpacity={0.7}
        >
          <IconIon
            name={type.icon}
            size={20}
            color={formData.type === type.key ? '#ffffff' : type.color}
          />
          <Text
            style={[
              styles.typeOptionText,
              formData.type === type.key && styles.selectedTypeOptionText,
            ]}
          >
            {type.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderPrioritySelector = () => (
    <View style={styles.prioritySelector}>
      {priorityLevels.map((priority) => (
        <TouchableOpacity
          key={priority.key}
          style={[
            styles.priorityOption,
            formData.priority === priority.key && styles.selectedPriorityOption,
          ]}
          onPress={() => setFormData({ ...formData, priority: priority.key })}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.priorityDot,
              { backgroundColor: priority.color },
            ]}
          />
          <Text
            style={[
              styles.priorityOptionText,
              formData.priority === priority.key && styles.selectedPriorityOptionText,
            ]}
          >
            {priority.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent
      onRequestClose={onClose}
    >
      <Animated.View
        style={[
          styles.overlay,
          { opacity: fadeAnim },
        ]}
      >
        <Animated.View
          style={[
            styles.modalContainer,
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          {renderHeader()}
          
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {renderFormField(
              'Title',
              <TextInput
                style={styles.textInput}
                value={formData.title}
                onChangeText={(text) => setFormData({ ...formData, title: text })}
                placeholder="Event title"
                editable={mode !== 'view'}
              />
            )}

            {renderFormField(
              'Description',
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                placeholder="Event description"
                multiline
                numberOfLines={3}
                editable={mode !== 'view'}
              />
            )}

            {renderFormField(
              'All Day',
              <View style={styles.switchContainer}>
                <Switch
                  value={formData.allDay}
                  onValueChange={(value) => setFormData({ ...formData, allDay: value })}
                  trackColor={{ false: '#e0e0e0', true: brandColors.primary }}
                  thumbColor={formData.allDay ? '#ffffff' : '#f4f3f4'}
                  disabled={mode === 'view'}
                />
              </View>
            )}

            {renderFormField(
              'Start Date & Time',
              <View>
                <TouchableOpacity
                  style={styles.dateTimeButton}
                  onPress={() => setShowStartDatePicker(true)}
                  disabled={mode === 'view'}
                >
                  <IconIon name="calendar-outline" size={20} color="#666" />
                  <Text style={styles.dateTimeText}>
                    {formData.startDate.toLocaleDateString()}
                  </Text>
                </TouchableOpacity>
                {!formData.allDay && (
                  <TouchableOpacity
                    style={styles.dateTimeButton}
                    onPress={() => setShowStartTimePicker(true)}
                    disabled={mode === 'view'}
                  >
                    <IconIon name="time-outline" size={20} color="#666" />
                    <Text style={styles.dateTimeText}>
                      {formData.startDate.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {renderFormField(
              'End Date & Time',
              <View>
                <TouchableOpacity
                  style={styles.dateTimeButton}
                  onPress={() => setShowEndDatePicker(true)}
                  disabled={mode === 'view'}
                >
                  <IconIon name="calendar-outline" size={20} color="#666" />
                  <Text style={styles.dateTimeText}>
                    {formData.endDate.toLocaleDateString()}
                  </Text>
                </TouchableOpacity>
                {!formData.allDay && (
                  <TouchableOpacity
                    style={styles.dateTimeButton}
                    onPress={() => setShowEndTimePicker(true)}
                    disabled={mode === 'view'}
                  >
                    <IconIon name="time-outline" size={20} color="#666" />
                    <Text style={styles.dateTimeText}>
                      {formData.endDate.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {renderFormField(
              'Location',
              <TextInput
                style={styles.textInput}
                value={formData.location}
                onChangeText={(text) => setFormData({ ...formData, location: text })}
                placeholder="Event location"
                editable={mode !== 'view'}
              />
            )}

            {renderFormField('Event Type', renderTypeSelector())}
            {renderFormField('Priority', renderPrioritySelector())}

            {mode === 'edit' && onDelete && (
              <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                <IconIon name="trash-outline" size={20} color="#ef4444" />
                <Text style={styles.deleteButtonText}>Delete Event</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </Animated.View>
      </Animated.View>

      {/* Date/Time Pickers */}
      {DateTimePicker && showStartDatePicker && (
        <DateTimePicker
          value={formData.startDate}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowStartDatePicker(false);
            if (selectedDate) {
              setFormData({ ...formData, startDate: selectedDate });
            }
          }}
        />
      )}

      {DateTimePicker && showEndDatePicker && (
        <DateTimePicker
          value={formData.endDate}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowEndDatePicker(false);
            if (selectedDate) {
              setFormData({ ...formData, endDate: selectedDate });
            }
          }}
        />
      )}

      {DateTimePicker && showStartTimePicker && (
        <DateTimePicker
          value={formData.startDate}
          mode="time"
          display="default"
          onChange={(event, selectedTime) => {
            setShowStartTimePicker(false);
            if (selectedTime) {
              setFormData({ ...formData, startDate: selectedTime });
            }
          }}
        />
      )}

      {DateTimePicker && showEndTimePicker && (
        <DateTimePicker
          value={formData.endDate}
          mode="time"
          display="default"
          onChange={(event, selectedTime) => {
            setShowEndTimePicker(false);
            if (selectedTime) {
              setFormData({ ...formData, endDate: selectedTime });
            }
          }}
        />
      )}
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: height * 0.9,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  headerGradient: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    padding: 20,
  },
  formField: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#f9f9f9',
    marginBottom: 8,
    gap: 12,
  },
  dateTimeText: {
    fontSize: 16,
    color: '#333',
  },
  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#f9f9f9',
    gap: 8,
  },
  selectedTypeOption: {
    backgroundColor: brandColors.primary,
    borderColor: brandColors.primary,
  },
  typeOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  selectedTypeOptionText: {
    color: '#ffffff',
  },
  prioritySelector: {
    flexDirection: 'row',
    gap: 12,
  },
  priorityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#f9f9f9',
    gap: 8,
  },
  selectedPriorityOption: {
    backgroundColor: brandColors.primary,
    borderColor: brandColors.primary,
  },
  priorityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  priorityOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  selectedPriorityOptionText: {
    color: '#ffffff',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
    gap: 8,
    marginTop: 20,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
  },
});

