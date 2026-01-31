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

const IconMC = MaterialCommunityIcons as any;

interface CircleSettingsModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (settings: CircleSettings) => Promise<void>;
}

interface CircleSettings {
  locationSharing: boolean;
  circleChat: boolean;
  emergencyAlerts: boolean;
  circleCalendar: boolean;
  circleExpenses: boolean;
  circleShopping: boolean;
  circleHealth: boolean;
  circleEntertainment: boolean;
}

export const CircleSettingsModal: React.FC<CircleSettingsModalProps> = ({
  visible,
  onClose,
  onSave,
}) => {
  const { t } = useTranslation();
  
  const [settings, setSettings] = useState<CircleSettings>({
    locationSharing: true,
    circleChat: true,
    emergencyAlerts: true,
    circleCalendar: true,
    circleExpenses: false,
    circleShopping: true,
    circleHealth: false,
    circleEntertainment: true,
  });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    try {
      setLoading(true);
      await onSave(settings);
      onClose();
      Alert.alert(t('success'), t('profile.circleSettingsSaved'));
    } catch (error) {
      console.error('Error saving circle settings:', error);
      Alert.alert(t('error'), t('profile.circleSettingsError'));
    } finally {
      setLoading(false);
    }
  };

  const toggleSetting = (key: keyof CircleSettings) => {
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
        <IconMC name={icon as any} size={24} color={colors.gray[600]} style={{ marginRight: 12 }} />
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
          <Text style={styles.title}>{t('profile.circleSettings')}</Text>
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
          <Text style={styles.sectionTitle}>{t('profile.circleSharing')}</Text>
          
          <SettingItem
            title={t('profile.locationSharing')}
            description={t('profile.locationSharingDesc')}
            value={settings.locationSharing}
            onToggle={() => toggleSetting('locationSharing')}
            icon="map-marker"
          />

          <SettingItem
            title={t('profile.circleChat')}
            description={t('profile.circleChatDesc')}
            value={settings.circleChat}
            onToggle={() => toggleSetting('circleChat')}
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
            title={t('profile.circleCalendar')}
            description={t('profile.circleCalendarDesc')}
            value={settings.circleCalendar}
            onToggle={() => toggleSetting('circleCalendar')}
            icon="calendar"
          />

          <Text style={styles.sectionTitle}>{t('profile.circleFeatures')}</Text>

          <SettingItem
            title={t('profile.circleExpenses')}
            description={t('profile.circleExpensesDesc')}
            value={settings.circleExpenses}
            onToggle={() => toggleSetting('circleExpenses')}
            icon="cash"
          />

          <SettingItem
            title={t('profile.circleShopping')}
            description={t('profile.circleShoppingDesc')}
            value={settings.circleShopping}
            onToggle={() => toggleSetting('circleShopping')}
            icon="cart"
          />

          <SettingItem
            title={t('profile.circleHealth')}
            description={t('profile.circleHealthDesc')}
            value={settings.circleHealth}
            onToggle={() => toggleSetting('circleHealth')}
            icon="hospital"
          />

          <SettingItem
            title={t('profile.circleEntertainment')}
            description={t('profile.circleEntertainmentDesc')}
            value={settings.circleEntertainment}
            onToggle={() => toggleSetting('circleEntertainment')}
            icon="gamepad-variant"
          />

          <View style={styles.infoContainer}>
            <Text style={styles.infoTitle}>{t('profile.privacyNote')}</Text>
            <Text style={styles.infoText}>
              {t('profile.circleSettingsPrivacyNote')}
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
    backgroundColor: colors.white[50], // Use appropriate white
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
