import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import DateTimePicker from '@react-native-community/datetimepicker';
import IconIon from 'react-native-vector-icons/Ionicons';
import { brandColors } from '../../theme/colors';

const SCREEN_HEIGHT = Dimensions.get('window').height;

interface DateTimePickerDrawerProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (date: Date) => void;
  initialDate?: Date;
  title?: string;
  mode?: 'datetime' | 'date' | 'time'; // Support different modes if needed
}

export const DateTimePickerDrawer: React.FC<DateTimePickerDrawerProps> = ({
  visible,
  onClose,
  onConfirm,
  initialDate = new Date(),
  title = 'Select Date & Time',
}) => {
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [activeTab, setActiveTab] = useState<'date' | 'time'>('date');
  
  // Animation values
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Sync state with props when opening
  useEffect(() => {
    if (visible) {
      setSelectedDate(initialDate);
      setActiveTab('date'); // Default to date tab
      
      // Animate In
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animate Out
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, initialDate]);

  const handleDayPress = (day: DateData) => {
    const newDate = new Date(selectedDate);
    // Keep the time, change the date (offset by timezone if necessary, but DateData is usually YYYY-MM-DD)
    // Create date from string to avoid timezone issues initially
    const [year, month, d] = day.dateString.split('-').map(Number);
    newDate.setFullYear(year);
    newDate.setMonth(month - 1);
    newDate.setDate(d);
    
    setSelectedDate(newDate);
  };

  const handleTimeChange = (_: any, date?: Date) => {
    if (date) {
      const newDate = new Date(selectedDate);
      newDate.setHours(date.getHours());
      newDate.setMinutes(date.getMinutes());
      setSelectedDate(newDate);
    }
  };

  const handleConfirm = () => {
    onConfirm(selectedDate);
    onClose();
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!visible && Number(JSON.stringify(fadeAnim)) === 0) return null; // Optimization? Actually just rely on visible prop for rendering or Portal

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlayContainer}>
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
          <TouchableOpacity style={styles.backdropTouchable} onPress={onClose} activeOpacity={1} />
        </Animated.View>

        <Animated.View
          style={[
            styles.drawer,
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{title}</Text>
            <TouchableOpacity onPress={handleConfirm} style={styles.confirmButton}>
              <Text style={styles.confirmText}>Done</Text>
            </TouchableOpacity>
          </View>

          {/* Current Selection Display */}
          <View style={styles.selectionDisplay}>
            <View style={styles.selectionRow}>
              <Text style={styles.selectionLabel}>Date:</Text>
              <Text style={styles.selectionValue}>{formatDate(selectedDate)}</Text>
            </View>
            <View style={styles.selectionRow}>
              <Text style={styles.selectionLabel}>Time:</Text>
              <Text style={styles.selectionValue}>{formatTime(selectedDate)}</Text>
            </View>
          </View>

          {/* Tabs */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'date' && styles.activeTab]}
              onPress={() => setActiveTab('date')}
            >
              <IconIon 
                name="calendar-outline" 
                size={20} 
                color={activeTab === 'date' ? brandColors.primary : '#6B7280'} 
              />
              <Text style={[styles.tabText, activeTab === 'date' && styles.activeTabText]}>
                Date
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'time' && styles.activeTab]}
              onPress={() => setActiveTab('time')}
            >
              <IconIon 
                name="time-outline" 
                size={20} 
                color={activeTab === 'time' ? brandColors.primary : '#6B7280'} 
              />
              <Text style={[styles.tabText, activeTab === 'time' && styles.activeTabText]}>
                Time
              </Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.contentContainer}>
            {activeTab === 'date' ? (
              <Calendar
                current={selectedDate.toISOString().split('T')[0]}
                onDayPress={handleDayPress}
                markedDates={{
                  [selectedDate.toISOString().split('T')[0]]: {
                    selected: true,
                    selectedColor: brandColors.primary,
                  },
                }}
                theme={{
                  todayTextColor: brandColors.primary,
                  arrowColor: brandColors.primary,
                  textDayFontWeight: '500',
                  textMonthFontWeight: 'bold',
                  textDayHeaderFontWeight: '500',
                  selectedDayBackgroundColor: brandColors.primary,
                  selectedDayTextColor: '#ffffff',
                }}
              />
            ) : (
              <View style={styles.timePickerContainer}>
                {Platform.OS === 'ios' ? (
                  <DateTimePicker
                    value={selectedDate}
                    mode="time"
                    display="spinner"
                    onChange={handleTimeChange}
                    style={styles.iosDatePicker}
                    textColor="#000000"
                  />
                ) : (
                  <View style={styles.androidTimeContainer}>
                     <TouchableOpacity 
                        style={styles.androidTimeButton}
                        onPress={() => {
                            // On Android, we just need to trigger the date picker via a button or similar
                            // Actually, DateTimePicker on Android opens a dialog immediately when rendered if display is default
                            // But here we want it embedded? No, on Android it is always a dialog.
                            // So we render it conditionally or just have a button to "Open Time Picker"
                        }}
                     >
                         <Text style={styles.androidTimeButtonText}>Select Time</Text>
                         {/* We will render the picker conditionally for Android when this is clicked, 
                             or strictly speaking, we might just keep it simple and render it invisible 
                             or use a different UI pattern. 
                             Correction: Using display="spinner" on Android is possible in recent versions, 
                             but often it's safer to just let it be a dialog.
                             Let's try rendering it directly.
                         */}
                    </TouchableOpacity>
                    <DateTimePicker
                        value={selectedDate}
                        mode="time"
                        display="spinner" // Try spinner for Android
                        onChange={handleTimeChange}
                    />
                  </View>
                )}
              </View>
            )}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    zIndex: 1000,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdropTouchable: {
    flex: 1,
  },
  drawer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  cancelButton: {
    padding: 8,
  },
  cancelText: {
    fontSize: 16,
    color: '#6B7280',
  },
  confirmButton: {
    padding: 8,
  },
  confirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: brandColors.primary,
  },
  selectionDisplay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  selectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  selectionLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  selectionValue: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  activeTab: {
    backgroundColor: '#EEF2FF', // Light indigo/primary tint
    borderColor: brandColors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeTabText: {
    color: brandColors.primary,
  },
  contentContainer: {
    padding: 20,
    minHeight: 350, // Ensure enough height for calendar
  },
  timePickerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iosDatePicker: {
    width: '100%',
    height: 200,
  },
  androidTimeContainer: {
      width: '100%',
      alignItems: 'center',
      paddingVertical: 20,
  },
  androidTimeButton: {
      display: 'none', // Hide the manual button if we are showing the spinner directly, or use it if spinner fails
  },
  androidTimeButtonText: {
      color: brandColors.primary,
      fontSize: 16,
  }
});
