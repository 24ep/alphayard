import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';
import { useTranslation } from 'react-i18next';
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
  type: 'hourse' | 'personal' | 'work' | 'school' | 'medical' | 'other';
  color: string;
  attendees: string[];
  createdBy: string;
  familyId?: string;
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

interface AddEventModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (eventData: Partial<Event>) => Promise<void>;
  selectedDate?: string;
}

export const AddEventModal: React.FC<AddEventModalProps> = ({
  visible,
  onClose,
  onAdd,
  selectedDate,
}) => {
  const { t } = useTranslation();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    type: 'personal' as Event['type'],
    allDay: false,
    startDate: '',
    endDate: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedDate && visible) {
      const date = new Date(selectedDate);
      const startDate = date.toISOString();
      const endDate = new Date(date.getTime() + 60 * 60 * 1000).toISOString(); // +1 hour
      
      setFormData(prev => ({
        ...prev,
        startDate,
        endDate,
      }));
    }
  }, [selectedDate, visible]);

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      location: '',
      type: 'personal',
      allDay: false,
      startDate: '',
      endDate: '',
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      Alert.alert(t('error'), t('calendar.eventTitleRequired'));
      return false;
    }

    if (!formData.startDate || !formData.endDate) {
      Alert.alert(t('error'), t('calendar.eventDatesRequired'));
      return false;
    }

    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);

    if (end <= start) {
      Alert.alert(t('error'), t('calendar.endDateMustBeAfterStart'));
      return false;
    }

    return true;
  };

  const handleAdd = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      await onAdd({
        ...formData,
        color: getEventTypeColor(formData.type),
        attendees: [],
        reminders: [],
      });
      handleClose();
    } catch (error) {
      console.error('Error adding event:', error);
      Alert.alert(t('error'), t('calendar.addEventError'));
    } finally {
      setLoading(false);
    }
  };

  const getEventTypeColor = (type: string) => {
    const colors = {
      hourse: '#EF4444',
      personal: '#3B82F6',
      work: '#10B981',
      school: '#F59E0B',
      medical: '#8B5CF6',
      other: '#6B7280',
    };
    return colors[type as keyof typeof colors] || colors.other;
  };

  const updateField = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.cancelButton}>
            <Text style={styles.cancelText}>{t('cancel')}</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{t('calendar.addEvent')}</Text>
          <TouchableOpacity 
            onPress={handleAdd} 
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            disabled={loading}
          >
            <Text style={[styles.saveText, loading && styles.saveTextDisabled]}>
              {loading ? t('loading') : t('add')}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Title */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>{t('calendar.eventTitle')} *</Text>
            <TextInput
              style={styles.input}
              value={formData.title}
              onChangeText={(value) => updateField('title', value)}
              placeholder={t('calendar.eventTitlePlaceholder')}
              placeholderTextColor={colors.gray[400]}
            />
          </View>

          {/* Description */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>{t('calendar.eventDescription')}</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.description}
              onChangeText={(value) => updateField('description', value)}
              placeholder={t('calendar.eventDescriptionPlaceholder')}
              placeholderTextColor={colors.gray[400]}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Location */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>{t('calendar.eventLocation')}</Text>
            <TextInput
              style={styles.input}
              value={formData.location}
              onChangeText={(value) => updateField('location', value)}
              placeholder={t('calendar.eventLocationPlaceholder')}
              placeholderTextColor={colors.gray[400]}
            />
          </View>

          {/* Event Type */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>{t('calendar.eventType')}</Text>
            <View style={styles.typeContainer}>
              {(['hourse', 'personal', 'work', 'school', 'medical', 'other'] as const).map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeButton,
                    formData.type === type && { backgroundColor: getEventTypeColor(type) }
                  ]}
                  onPress={() => updateField('type', type)}
                >
                  <Text style={[
                    styles.typeButtonText,
                    formData.type === type && styles.typeButtonTextActive
                  ]}>
                    {t(`calendar.${type}`)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* All Day Toggle */}
          <View style={styles.fieldGroup}>
            <View style={styles.toggleContainer}>
              <Text style={styles.label}>{t('calendar.allDay')}</Text>
              <Switch
                value={formData.allDay}
                onValueChange={(value) => updateField('allDay', value)}
                trackColor={{ false: '#E5E7EB', true: '#4CAF50' }}
                thumbColor={formData.allDay ? '#FFFFFF' : '#FFFFFF'}
              />
            </View>
          </View>

          {/* Start Date/Time */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>{t('calendar.startDate')} *</Text>
            <TextInput
              style={styles.input}
              value={formatDateTime(formData.startDate)}
              placeholder={t('calendar.startDatePlaceholder')}
              placeholderTextColor={colors.gray[400]}
              editable={false}
            />
          </View>

          {/* End Date/Time */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>{t('calendar.endDate')} *</Text>
            <TextInput
              style={styles.input}
              value={formatDateTime(formData.endDate)}
              placeholder={t('calendar.endDatePlaceholder')}
              placeholderTextColor={colors.gray[400]}
              editable={false}
            />
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
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  cancelText: {
    fontSize: 16,
    color: colors.gray[600],
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray[700],
  },
  saveButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: colors.primary[500],
    borderRadius: 8,
  },
  saveButtonDisabled: {
    backgroundColor: colors.gray[300],
  },
  saveText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white[500],
  },
  saveTextDisabled: {
    color: colors.gray[500],
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  fieldGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.gray[700],
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.gray[700],
    backgroundColor: colors.white[500],
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: colors.gray[100],
    borderWidth: 1,
    borderColor: colors.gray[300],
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray[700],
  },
  typeButtonTextActive: {
    color: colors.white[500],
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

export default AddEventModal; 