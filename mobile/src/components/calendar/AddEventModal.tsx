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
import { useBranding } from '../../contexts/BrandingContext';
import { DateTimePickerDrawer } from './DateTimePickerDrawer';

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
  const { categories } = useBranding();
  
  // Get Date/Time Picker Config
  const pickerConfigSettings = React.useMemo(() => {
    if (!categories) return null;
    for (const cat of categories) {
      if (cat.id === 'advanced-inputs') { // category id
        const found = cat.components.find(c => c.id === 'datetime-picker');
        if (found) return found.config;
      }
    }
    return null;
  }, [categories]);

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


  const [pickerConfig, setPickerConfig] = useState<{
    visible: boolean;
    mode: 'start' | 'end';
    currentDate: Date;
  }>({
    visible: false,
    mode: 'start',
    currentDate: new Date(),
  });

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
    } else if (visible && !selectedDate && !formData.startDate) {
      // Initialize with current time if no date selected
      const now = new Date();
      const startDate = now.toISOString();
      const endDate = new Date(now.getTime() + 60 * 60 * 1000).toISOString();
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
      Circle: '#EF4444',
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

  const formatWithPattern = (date: Date, pattern: string) => {
    const map: Record<string, string> = {
      YYYY: date.getFullYear().toString(),
      MM: (date.getMonth() + 1).toString().padStart(2, '0'),
      MMM: date.toLocaleString('en-US', { month: 'short' }),
      MMMM: date.toLocaleString('en-US', { month: 'long' }),
      DD: date.getDate().toString().padStart(2, '0'),
      HH: date.getHours().toString().padStart(2, '0'),
      h: (date.getHours() % 12 || 12).toString(),
      mm: date.getMinutes().toString().padStart(2, '0'),
      ss: date.getSeconds().toString().padStart(2, '0'),
      A: date.getHours() >= 12 ? 'PM' : 'AM',
    };
    return pattern.replace(/YYYY|MMMM|MMM|MM|DD|HH|h|mm|ss|A/g, matched => map[matched]);
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    
    // Use configured format or fallback
    const displayFormat = pickerConfigSettings?.displayFormat || 'MMM DD, YYYY h:mm A';
    
    try {
      return formatWithPattern(date, displayFormat);
    } catch (e) {
      return date.toLocaleString();
    }
  };

  const openPicker = (mode: 'start' | 'end') => {
    const dateStr = mode === 'start' ? formData.startDate : formData.endDate;
    const date = dateStr ? new Date(dateStr) : new Date();
    setPickerConfig({
      visible: true,
      mode,
      currentDate: date,
    });
  };

  const handlePickerConfirm = (date: Date) => {
    if (pickerConfig.mode === 'start') {
      const newStart = date.toISOString();
      // If end date is before new start date, push end date to start + 1h
      const currentEnd = formData.endDate ? new Date(formData.endDate) : null;
      let newEnd = formData.endDate;
      
      if (!currentEnd || currentEnd <= date) {
        newEnd = new Date(date.getTime() + 60 * 60 * 1000).toISOString();
      }
      
      setFormData(prev => ({
        ...prev,
        startDate: newStart,
        endDate: newEnd,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        endDate: date.toISOString(),
      }));
    }
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
              {(['Circle', 'personal', 'work', 'school', 'medical', 'other'] as const).map((type) => (
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
            <TouchableOpacity onPress={() => openPicker('start')}>
              <View style={[styles.input, { justifyContent: 'center' }]}>
                <Text style={{ color: formData.startDate ? colors.gray[700] : colors.gray[400], fontSize: 16 }}>
                  {formData.startDate ? formatDateTime(formData.startDate) : t('calendar.startDatePlaceholder')}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* End Date/Time */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>{t('calendar.endDate')} *</Text>
            <TouchableOpacity onPress={() => openPicker('end')}>
              <View style={[styles.input, { justifyContent: 'center' }]}>
                <Text style={{ color: formData.endDate ? colors.gray[700] : colors.gray[400], fontSize: 16 }}>
                  {formData.endDate ? formatDateTime(formData.endDate) : t('calendar.endDatePlaceholder')}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <DateTimePickerDrawer
          visible={pickerConfig.visible}
          onClose={() => setPickerConfig(prev => ({ ...prev, visible: false }))}
          onConfirm={handlePickerConfirm}
          initialDate={pickerConfig.currentDate}
          title={pickerConfig.mode === 'start' ? t('calendar.startDate') : t('calendar.endDate')}
        />
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
