import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Switch,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { colors, textColors } from '../../theme/colors';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface NotificationPreferences {
  push: boolean;
  email: boolean;
  sms: boolean;
  hourse?: {
    locationUpdates: boolean;
    emergencyAlerts: boolean;
    eventReminders: boolean;
    chatMessages: boolean;
  };
  safety?: {
    emergencyAlerts: boolean;
    geofenceAlerts: boolean;
    sosActivation: boolean;
  };
  social?: {
    newFollowers: boolean;
    likes: boolean;
    comments: boolean;
    mentions: boolean;
  };
  system?: {
    securityAlerts: boolean;
    accountUpdates: boolean;
    appUpdates: boolean;
    maintenance: boolean;
  };
}

interface NotificationSettingsModalProps {
  visible: boolean;
  preferences: NotificationPreferences;
  onClose: () => void;
  onSave: (preferences: NotificationPreferences) => Promise<void>;
}

export const NotificationSettingsModal: React.FC<NotificationSettingsModalProps> = ({
  visible,
  preferences,
  onClose,
  onSave,
}) => {
  const { t } = useTranslation();
  
  const [localPreferences, setLocalPreferences] = useState<NotificationPreferences>(preferences);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      setLocalPreferences({
        ...preferences,
        hourse: {
          locationUpdates: true,
          emergencyAlerts: true,
          eventReminders: true,
          chatMessages: true,
          ...preferences.hourse,
        },
        safety: {
          emergencyAlerts: true,
          geofenceAlerts: true,
          sosActivation: true,
          ...preferences.safety,
        },
        social: {
          newFollowers: true,
          likes: false,
          comments: true,
          mentions: true,
          ...preferences.social,
        },
        system: {
          securityAlerts: true,
          accountUpdates: true,
          appUpdates: false,
          maintenance: false,
          ...preferences.system,
        },
      });
    }
  }, [visible, preferences]);

  const updatePreference = (category: keyof NotificationPreferences, key: string, value: boolean) => {
    if (category === 'push' || category === 'email' || category === 'sms') {
      setLocalPreferences(prev => ({
        ...prev,
        [category]: value,
      }));
    } else {
      setLocalPreferences(prev => ({
        ...prev,
        [category]: {
          ...prev[category],
          [key]: value,
        },
      }));
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await onSave(localPreferences);
      onClose();
    } catch (error) {
      console.error('Error saving notification preferences:', error);
      Alert.alert(t('error'), t('profile.notificationSaveError'));
    } finally {
      setLoading(false);
    }
  };

  const handleMasterToggle = (type: 'push' | 'email' | 'sms', value: boolean) => {
    if (!value) {
      Alert.alert(
        t('notifications.disableWarning'),
        t(`notifications.disable${type.charAt(0).toUpperCase() + type.slice(1)}Warning`),
        [
          { text: t('cancel'), style: 'cancel' },
          { text: t('disable'), onPress: () => updatePreference(type, '', value) },
        ]
      );
    } else {
      updatePreference(type, '', value);
    }
  };

  const renderSectionHeader = (title: string, icon: string, description?: string) => (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionTitleContainer}>
        <Icon name={icon} size={24} color={colors.primary} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {description && (
        <Text style={styles.sectionDescription}>{description}</Text>
      )}
    </View>
  );

  const renderToggleItem = (
    title: string,
    subtitle: string,
    value: boolean,
    onValueChange: (value: boolean) => void,
    isImportant?: boolean
  ) => (
    <View style={styles.toggleItem}>
      <View style={styles.toggleContent}>
        <Text style={[styles.toggleTitle, isImportant && styles.importantToggle]}>{title}</Text>
        <Text style={styles.toggleSubtitle}>{subtitle}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.border, true: colors.primary }}
        thumbColor="#FFFFFF"
        ios_backgroundColor={colors.border}
      />
    </View>
  );

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
          <TouchableOpacity onPress={onClose} style={styles.headerButton}>
            <Icon name="close" size={24} color={textColors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('profile.notificationSettings')}</Text>
          <TouchableOpacity
            onPress={handleSave}
            style={[styles.headerButton, styles.saveButton]}
            disabled={loading}
          >
            {loading ? (
              <LoadingSpinner size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>{t('save')}</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Master Controls */}
          <View style={styles.section}>
            {renderSectionHeader(
              t('notifications.masterControls'),
              'bell-ring',
              t('notifications.masterControlsDesc')
            )}
            
            <View style={styles.sectionContent}>
              {renderToggleItem(
                t('notifications.pushNotifications'),
                t('notifications.pushNotificationsDesc'),
                localPreferences.push,
                (value) => handleMasterToggle('push', value)
              )}
              
              {renderToggleItem(
                t('notifications.emailNotifications'),
                t('notifications.emailNotificationsDesc'),
                localPreferences.email,
                (value) => handleMasterToggle('email', value)
              )}
              
              {renderToggleItem(
                t('notifications.smsNotifications'),
                t('notifications.smsNotificationsDesc'),
                localPreferences.sms,
                (value) => handleMasterToggle('sms', value)
              )}
            </View>
          </View>

          {/* hourse Notifications */}
          <View style={styles.section}>
            {renderSectionHeader(
              t('notifications.hourse'),
              'account-group',
              t('notifications.familyDesc')
            )}
            
            <View style={styles.sectionContent}>
              {renderToggleItem(
                t('notifications.locationUpdates'),
                t('notifications.locationUpdatesDesc'),
                localPreferences.hourse?.locationUpdates || false,
                (value) => updatePreference('hourse', 'locationUpdates', value)
              )}
              
              {renderToggleItem(
                t('notifications.emergencyAlerts'),
                t('notifications.emergencyAlertsDesc'),
                localPreferences.hourse?.emergencyAlerts || false,
                (value) => updatePreference('hourse', 'emergencyAlerts', value),
                true
              )}
              
              {renderToggleItem(
                t('notifications.eventReminders'),
                t('notifications.eventRemindersDesc'),
                localPreferences.hourse?.eventReminders || false,
                (value) => updatePreference('hourse', 'eventReminders', value)
              )}
              
              {renderToggleItem(
                t('notifications.chatMessages'),
                t('notifications.chatMessagesDesc'),
                localPreferences.hourse?.chatMessages || false,
                (value) => updatePreference('hourse', 'chatMessages', value)
              )}
            </View>
          </View>

          {/* Safety Notifications */}
          <View style={styles.section}>
            {renderSectionHeader(
              t('notifications.safety'),
              'shield-alert',
              t('notifications.safetyDesc')
            )}
            
            <View style={styles.sectionContent}>
              {renderToggleItem(
                t('notifications.safetyEmergencyAlerts'),
                t('notifications.safetyEmergencyAlertsDesc'),
                localPreferences.safety?.emergencyAlerts || false,
                (value) => updatePreference('safety', 'emergencyAlerts', value),
                true
              )}
              
              {renderToggleItem(
                t('notifications.geofenceAlerts'),
                t('notifications.geofenceAlertsDesc'),
                localPreferences.safety?.geofenceAlerts || false,
                (value) => updatePreference('safety', 'geofenceAlerts', value)
              )}
              
              {renderToggleItem(
                t('notifications.sosActivation'),
                t('notifications.sosActivationDesc'),
                localPreferences.safety?.sosActivation || false,
                (value) => updatePreference('safety', 'sosActivation', value),
                true
              )}
            </View>
          </View>

          {/* Social Notifications */}
          <View style={styles.section}>
            {renderSectionHeader(
              t('notifications.social'),
              'account-heart',
              t('notifications.socialDesc')
            )}
            
            <View style={styles.sectionContent}>
              {renderToggleItem(
                t('notifications.newFollowers'),
                t('notifications.newFollowersDesc'),
                localPreferences.social?.newFollowers || false,
                (value) => updatePreference('social', 'newFollowers', value)
              )}
              
              {renderToggleItem(
                t('notifications.likes'),
                t('notifications.likesDesc'),
                localPreferences.social?.likes || false,
                (value) => updatePreference('social', 'likes', value)
              )}
              
              {renderToggleItem(
                t('notifications.comments'),
                t('notifications.commentsDesc'),
                localPreferences.social?.comments || false,
                (value) => updatePreference('social', 'comments', value)
              )}
              
              {renderToggleItem(
                t('notifications.mentions'),
                t('notifications.mentionsDesc'),
                localPreferences.social?.mentions || false,
                (value) => updatePreference('social', 'mentions', value)
              )}
            </View>
          </View>

          {/* System Notifications */}
          <View style={styles.section}>
            {renderSectionHeader(
              t('notifications.system'),
              'cog',
              t('notifications.systemDesc')
            )}
            
            <View style={styles.sectionContent}>
              {renderToggleItem(
                t('notifications.securityAlerts'),
                t('notifications.securityAlertsDesc'),
                localPreferences.system?.securityAlerts || false,
                (value) => updatePreference('system', 'securityAlerts', value),
                true
              )}
              
              {renderToggleItem(
                t('notifications.accountUpdates'),
                t('notifications.accountUpdatesDesc'),
                localPreferences.system?.accountUpdates || false,
                (value) => updatePreference('system', 'accountUpdates', value)
              )}
              
              {renderToggleItem(
                t('notifications.appUpdates'),
                t('notifications.appUpdatesDesc'),
                localPreferences.system?.appUpdates || false,
                (value) => updatePreference('system', 'appUpdates', value)
              )}
              
              {renderToggleItem(
                t('notifications.maintenance'),
                t('notifications.maintenanceDesc'),
                localPreferences.system?.maintenance || false,
                (value) => updatePreference('system', 'maintenance', value)
              )}
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: '#FFFFFF',
  },
  headerButton: {
    padding: 8,
    minWidth: 60,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: textColors.primary,
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 8,
  },
  sectionHeader: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: textColors.primary,
    marginLeft: 12,
  },
  sectionDescription: {
    fontSize: 13,
    color: textColors.primarySecondary,
    lineHeight: 18,
  },
  sectionContent: {
    backgroundColor: '#FFFFFF',
  },
  toggleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  toggleContent: {
    flex: 1,
    marginRight: 16,
  },
  toggleTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: textColors.primary,
    marginBottom: 2,
  },
  importantToggle: {
    color: colors.primary,
    fontWeight: '600',
  },
  toggleSubtitle: {
    fontSize: 13,
    color: textColors.primarySecondary,
    lineHeight: 18,
  },
});

export default NotificationSettingsModal;