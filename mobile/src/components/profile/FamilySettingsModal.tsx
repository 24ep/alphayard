import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

interface FamilySettingsModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (settings: FamilySettings) => Promise<void>;
}

interface FamilySettings {
  locationSharing: boolean;
  familyChat: boolean;
  emergencyAlerts: boolean;
  familyCalendar: boolean;
  familyExpenses: boolean;
  familyShopping: boolean;
  familyHealth: boolean;
  familyEntertainment: boolean;
}

export const FamilySettingsModal: React.FC<FamilySettingsModalProps> = ({
  visible,
  onClose,
  onSave,
}) => {
  const { t } = useTranslation();
  
  const [settings, setSettings] = useState<FamilySettings>({
    locationSharing: true,
    familyChat: true,
    emergencyAlerts: true,
    familyCalendar: true,
    familyExpenses: false,
    familyShopping: true,
    familyHealth: false,
    familyEntertainment: true,
  });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    try {
      setLoading(true);
      await onSave(settings);
      onClose();
      Alert.alert(t('success'), t('profile.familySettingsSaved'));
    } catch (error) {
      console.error('Error saving hourse settings:', error);
      Alert.alert(t('error'), t('profile.familySettingsError'));
    } finally {
      setLoading(false);
    }
  };

  const toggleSetting = (key: keyof FamilySettings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const SettingItem: React.FC<{
    title: string;
    description: string;
    value: boolean;
    onToggle: () => void;
    icon: string;
  }> = ({ title, description, value, onToggle, icon }) => (
    <View style={styles.settingItem}>
      <View style={styles.settingHeader}>
        <MaterialCommunityIcons name={icon as any} size={24} color={colors.gray[600]} style={{ marginRight: 12 }} />
        <View style={styles.settingContent}>
          <Text style={styles.settingTitle}>{title}</Text>
          <Text style={styles.settingDescription}>{description}</Text>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#E5E7EB', true: '#4CAF50' }}
        thumbColor={value ? '#FFFFFF' : '#FFFFFF'}
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
          <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
            <Text style={styles.cancelText}>{t('cancel')}</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{t('profile.familySettings')}</Text>
          <TouchableOpacity 
            onPress={handleSave} 
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            disabled={loading}
          >
            <Text style={[styles.saveText, loading && styles.saveTextDisabled]}>
              {loading ? t('loading') : t('save')}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>{t('profile.familySharing')}</Text>
          
          <SettingItem
            title={t('profile.locationSharing')}
            description={t('profile.locationSharingDesc')}
            value={settings.locationSharing}
            onToggle={() => toggleSetting('locationSharing')}
            icon="map-marker"
          />

          <SettingItem
            title={t('profile.familyChat')}
            description={t('profile.familyChatDesc')}
            value={settings.familyChat}
            onToggle={() => toggleSetting('familyChat')}
            icon="chat"
          />

          <SettingItem
            title={t('profile.emergencyAlerts')}
            description={t('profile.emergencyAlertsDesc')}
            value={settings.emergencyAlerts}
            onToggle={() => toggleSetting('emergencyAlerts')}
            icon="alarm-light"
          />

          <SettingItem
            title={t('profile.familyCalendar')}
            description={t('profile.familyCalendarDesc')}
            value={settings.familyCalendar}
            onToggle={() => toggleSetting('familyCalendar')}
            icon="calendar"
          />

          <Text style={styles.sectionTitle}>{t('profile.familyFeatures')}</Text>

          <SettingItem
            title={t('profile.familyExpenses')}
            description={t('profile.familyExpensesDesc')}
            value={settings.familyExpenses}
            onToggle={() => toggleSetting('familyExpenses')}
            icon="cash"
          />

          <SettingItem
            title={t('profile.familyShopping')}
            description={t('profile.familyShoppingDesc')}
            value={settings.familyShopping}
            onToggle={() => toggleSetting('familyShopping')}
            icon="cart"
          />

          <SettingItem
            title={t('profile.familyHealth')}
            description={t('profile.familyHealthDesc')}
            value={settings.familyHealth}
            onToggle={() => toggleSetting('familyHealth')}
            icon="hospital"
          />

          <SettingItem
            title={t('profile.familyEntertainment')}
            description={t('profile.familyEntertainmentDesc')}
            value={settings.familyEntertainment}
            onToggle={() => toggleSetting('familyEntertainment')}
            icon="gamepad-variant"
          />

          <View style={styles.infoContainer}>
            <Text style={styles.infoTitle}>{t('profile.privacyNote')}</Text>
            <Text style={styles.infoText}>
              {t('profile.familySettingsPrivacyNote')}
            </Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray[700],
    marginBottom: 16,
    marginTop: 24,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 16,
  },
  settingIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.gray[700],
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: colors.gray[500],
    lineHeight: 18,
  },
  infoContainer: {
    backgroundColor: colors.gray[50],
    padding: 16,
    borderRadius: 8,
    marginTop: 24,
    marginBottom: 30,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.info,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    color: colors.gray[600],
    lineHeight: 16,
  },
});

export default FamilySettingsModal; 