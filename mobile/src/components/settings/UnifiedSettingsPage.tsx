import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Modal,
  Platform,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { colors } from '../../theme/colors';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { NotificationSettingsModal } from '../profile/NotificationSettingsModal';
import { PrivacySettingsModal } from '../profile/PrivacySettingsModal';
import { FamilySettingsModal } from '../profile/FamilySettingsModal';
import LanguageSettings from './LanguageSettings';
import TranslationKeysViewer from './TranslationKeysViewer';

// Types for all settings
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

interface PrivacyPreferences {
  locationSharing: boolean;
  profileVisibility: 'public' | 'hourse' | 'private';
  dataSharing: boolean;
  analytics?: boolean;
  crashReports?: boolean;
  personalizedAds?: boolean;
  contactSync?: boolean;
  searchableByEmail?: boolean;
  searchableByPhone?: boolean;
  showOnlineStatus?: boolean;
  readReceipts?: boolean;
  lastSeenStatus?: boolean;
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

interface AppPreferences {
  language: string;
  theme: 'light' | 'dark' | 'auto';
  fontSize: 'small' | 'medium' | 'large';
  hapticFeedback: boolean;
  soundEffects: boolean;
  autoBackup: boolean;
  dataUsage: 'low' | 'medium' | 'high';
}

interface Subscription {
  plan: string;
  status: string;
  expiresAt: string;
}

interface UnifiedSettingsPageProps {
  onBack?: () => void;
  onLogout?: () => void;
  onDeleteAccount?: () => void;
}

export const UnifiedSettingsPage: React.FC<UnifiedSettingsPageProps> = ({
  onBack,
  onLogout,
  onDeleteAccount,
}) => {
  const { t } = useTranslation();
  
  // State for all settings
  const [notificationSettings, setNotificationSettings] = useState<NotificationPreferences>({
    push: true,
    email: true,
    sms: false,
    hourse: {
      locationUpdates: true,
      emergencyAlerts: true,
      eventReminders: true,
      chatMessages: true,
    },
    safety: {
      emergencyAlerts: true,
      geofenceAlerts: true,
      sosActivation: true,
    },
    social: {
      newFollowers: true,
      likes: false,
      comments: true,
      mentions: true,
    },
    system: {
      securityAlerts: true,
      accountUpdates: true,
      appUpdates: false,
      maintenance: false,
    },
  });

  const [privacySettings, setPrivacySettings] = useState<PrivacyPreferences>({
    locationSharing: true,
    profileVisibility: 'hourse',
    dataSharing: true,
    analytics: true,
    crashReports: true,
    personalizedAds: false,
    contactSync: false,
    searchableByEmail: true,
    searchableByPhone: false,
    showOnlineStatus: true,
    readReceipts: true,
    lastSeenStatus: true,
  });

  const [familySettings, setFamilySettings] = useState<FamilySettings>({
    locationSharing: true,
    familyChat: true,
    emergencyAlerts: true,
    familyCalendar: true,
    familyExpenses: false,
    familyShopping: true,
    familyHealth: false,
    familyEntertainment: true,
  });

  const [appPreferences, setAppPreferences] = useState<AppPreferences>({
    language: 'en',
    theme: 'auto',
    fontSize: 'medium',
    hapticFeedback: true,
    soundEffects: true,
    autoBackup: true,
    dataUsage: 'medium',
  });

  const [subscription, setSubscription] = useState<Subscription>({
    plan: 'free',
    status: 'active',
    expiresAt: '2024-12-31',
  });

  // Modal states
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showFamilyModal, setShowFamilyModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showTranslationKeysModal, setShowTranslationKeysModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      // In a real app, load from storage/API
      // For now, using default values
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (settingsType: string, settings: any) => {
    try {
      setLoading(true);
      // In a real app, save to storage/API
      console.log(`Saving ${settingsType}:`, settings);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    } catch (error) {
      console.error(`Error saving ${settingsType}:`, error);
      Alert.alert(t('error'), t('settings.saveError'));
    } finally {
      setLoading(false);
    }
  };

  const getSubscriptionStatus = () => {
    switch (subscription.plan) {
      case 'premium':
        return { text: t('subscription.premium'), color: '#FFD700' };
      case 'hourse':
        return { text: t('subscription.hourse'), color: '#FF6B6B' };
      case 'basic':
        return { text: t('subscription.basic'), color: '#4ECDC4' };
      default:
        return { text: t('subscription.free'), color: colors.gray[500] };
    }
  };

  const subscriptionStatus = getSubscriptionStatus();

  const handleLogout = () => {
    Alert.alert(
      t('profile.logout'),
      t('profile.logoutConfirm'),
      [
        { text: t('cancel'), style: 'cancel' },
        { text: t('logout'), onPress: onLogout, style: 'destructive' },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      t('profile.deleteAccount'),
      t('profile.deleteAccountConfirm'),
      [
        { text: t('cancel'), style: 'cancel' },
        { text: t('delete'), onPress: onDeleteAccount, style: 'destructive' },
      ]
    );
  };

  const renderSectionHeader = (title: string, icon: string) => (
    <View style={styles.sectionHeader}>
      <Icon name={icon} size={20} color={colors.primary[500]} />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );

  const renderSettingItem = (
    icon: string,
    title: string,
    subtitle?: string,
    onPress?: () => void,
    hasSwitch?: boolean,
    switchValue?: boolean,
    onSwitchChange?: (value: boolean) => void,
    isDestructive?: boolean,
    textColor?: string
  ) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress && !hasSwitch}
    >
      <View style={[
        styles.iconContainer,
        isDestructive && styles.destructiveIcon
      ]}>
        <Icon
          name={icon}
          size={20}
          color={isDestructive ? colors.error : colors.gray[500]}
        />
      </View>
      
      <View style={styles.settingContent}>
        <Text style={[
          styles.settingTitle,
          isDestructive && styles.destructiveText
        ]}>
          {title}
        </Text>
        {subtitle && (
          <Text style={[
            styles.settingSubtitle,
            textColor && { color: textColor }
          ]}>
            {subtitle}
          </Text>
        )}
      </View>
      
      {hasSwitch ? (
        <Switch
          value={switchValue}
          onValueChange={onSwitchChange}
          trackColor={{ false: colors.gray[200], true: colors.primary[500] }}
          thumbColor="#FFFFFF"
        />
      ) : (
        <View style={styles.chevronContainer}>
          <Icon name="chevron-right" size={16} color={colors.gray[500]} />
        </View>
      )}
    </TouchableOpacity>
  );

  const renderSettingsSection = (title: string, icon: string, items: any[]) => (
    <View style={styles.section}>
      {renderSectionHeader(title, icon)}
      <View style={styles.settingsCard}>
        {items.map((item, index) => (
          <View key={index}>
            {renderSettingItem(
              item.icon,
              item.title,
              item.subtitle,
              item.onPress,
              item.hasSwitch,
              item.switchValue,
              item.onSwitchChange,
              item.isDestructive,
              item.textColor
            )}
            {index < items.length - 1 && <View style={styles.separator} />}
          </View>
        ))}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner size="large" color={colors.primary[500]} />
        <Text style={styles.loadingText}>{t('settings.loading')}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color={colors.gray[800]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('settings.title')}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Personalize */}
        {renderSettingsSection(
          t('settings.personalize') || 'Personalize',
          'tune-variant',
          [
            {
              icon: 'view-dashboard-outline',
              title: 'Homepage widgets & order',
              subtitle: 'Choose and reorder home widgets',
              onPress: () => Alert.alert(t('info'), 'Customize homepage widgets coming soon'),
            },
            {
              icon: 'account-group',
              title: 'hourse settings',
              subtitle: 'Open hourse settings',
              onPress: () => setShowFamilyModal(true),
            },
            {
              icon: 'map-marker',
              title: 'Location badges',
              subtitle: 'Workplace, hometown, etc.',
              onPress: () => Alert.alert(t('info'), 'Set your location badges coming soon'),
            },
          ]
        )}
        {/* Account Settings */}
        {renderSettingsSection(
          t('settings.account'),
          'account-circle',
          [
            {
              icon: 'bell-outline',
              title: t('profile.notifications'),
              subtitle: notificationSettings.push ? t('enabled') : t('disabled'),
              onPress: () => setShowNotificationModal(true),
            },
            {
              icon: 'shield-account-outline',
              title: t('profile.privacy'),
              subtitle: t(`privacy.${privacySettings.profileVisibility}`),
              onPress: () => setShowPrivacyModal(true),
            },
            {
              icon: 'account-group',
              title: t('profile.familySettings'),
              subtitle: t('profile.familySettingsDesc'),
              onPress: () => setShowFamilyModal(true),
            },
            {
              icon: 'crown-outline',
              title: t('profile.subscription'),
              subtitle: subscriptionStatus.text,
              onPress: () => Alert.alert(t('info'), t('profile.subscriptionInfo')),
              textColor: subscriptionStatus.color,
            },
          ]
        )}

        {/* App Preferences */}
        {renderSettingsSection(
          t('settings.preferences'),
          'tune',
          [
            {
              icon: 'account-box-outline',
              title: 'Personal information',
              subtitle: 'Name, birthday, contacts',
              onPress: () => Alert.alert(t('info'), 'Edit personal information coming soon'),
            },
            {
              icon: 'translate',
              title: t('profile.language'),
              subtitle: appPreferences.language.toUpperCase(),
              onPress: () => setShowLanguageModal(true),
            },
            {
              icon: 'key-variant',
              title: t('settings.translationKeys'),
              subtitle: t('settings.viewAllTranslationKeys'),
              onPress: () => setShowTranslationKeysModal(true),
            },
            {
              icon: 'theme-light-dark',
              title: t('profile.theme'),
              subtitle: t(`theme.${appPreferences.theme}`),
              onPress: () => Alert.alert(t('info'), t('profile.themeChangeInfo')),
            },
            {
              icon: 'format-size',
              title: t('settings.fontSize'),
              subtitle: t(`settings.fontSize.${appPreferences.fontSize}`),
              onPress: () => Alert.alert(t('info'), t('settings.fontSizeInfo')),
            },
            {
              icon: 'vibrate',
              title: t('settings.hapticFeedback'),
              subtitle: t('settings.hapticFeedbackDesc'),
              hasSwitch: true,
              switchValue: appPreferences.hapticFeedback,
              onSwitchChange: (value) => setAppPreferences(prev => ({ ...prev, hapticFeedback: value })),
            },
            {
              icon: 'volume-high',
              title: t('settings.soundEffects'),
              subtitle: t('settings.soundEffectsDesc'),
              hasSwitch: true,
              switchValue: appPreferences.soundEffects,
              onSwitchChange: (value) => setAppPreferences(prev => ({ ...prev, soundEffects: value })),
            },
            {
              icon: 'cellphone-cog',
              title: 'Device logins',
              subtitle: 'Manage devices logged into your account',
              onPress: () => Alert.alert(t('info'), 'Device login management coming soon'),
            },
          ]
        )}

        {/* Data & Storage */}
        {renderSettingsSection(
          t('settings.dataStorage'),
          'database',
          [
            {
              icon: 'cloud-upload',
              title: t('settings.autoBackup'),
              subtitle: t('settings.autoBackupDesc'),
              hasSwitch: true,
              switchValue: appPreferences.autoBackup,
              onSwitchChange: (value) => setAppPreferences(prev => ({ ...prev, autoBackup: value })),
            },
            {
              icon: 'sync',
              title: 'Backup & sync now',
              subtitle: 'Run a manual backup and sync',
              onPress: () => Alert.alert(t('info'), 'Manual backup initiated (demo)'),
            },
            {
              icon: 'network',
              title: t('settings.dataUsage'),
              subtitle: t(`settings.dataUsage.${appPreferences.dataUsage}`),
              onPress: () => Alert.alert(t('info'), t('settings.dataUsageInfo')),
            },
            {
              icon: 'download',
              title: t('settings.downloadData'),
              subtitle: t('settings.downloadDataDesc'),
              onPress: () => Alert.alert(t('info'), t('settings.downloadDataInfo')),
            },
            {
              icon: 'delete',
              title: t('settings.clearCache'),
              subtitle: t('settings.clearCacheDesc'),
              onPress: () => Alert.alert(t('info'), t('settings.clearCacheInfo')),
            },
          ]
        )}

        {/* Support & Help */}
        {renderSettingsSection(
          t('settings.support'),
          'help-circle',
          [
            {
              icon: 'help-circle-outline',
              title: t('profile.help'),
              subtitle: t('profile.helpDesc'),
              onPress: () => Alert.alert(t('info'), t('profile.helpInfo')),
            },
            {
              icon: 'information-outline',
              title: t('profile.about'),
              subtitle: t('profile.aboutDesc'),
              onPress: () => Alert.alert(t('info'), t('profile.aboutInfo')),
            },
            {
              icon: 'star-outline',
              title: t('profile.rateApp'),
              subtitle: t('profile.rateAppDesc'),
              onPress: () => Alert.alert(t('info'), t('profile.rateAppInfo')),
            },
            {
              icon: 'bug',
              title: t('settings.reportBug'),
              subtitle: t('settings.reportBugDesc'),
              onPress: () => Alert.alert(t('info'), t('settings.reportBugInfo')),
            },
            {
              icon: 'book-open-variant',
              title: 'FAQ',
              subtitle: 'Frequently asked questions',
              onPress: () => Alert.alert(t('info'), 'FAQ coming soon'),
            },
            {
              icon: 'file-document-outline',
              title: 'Terms & policy',
              subtitle: 'View terms of service and privacy policy',
              onPress: () => Alert.alert(t('info'), 'Terms & policy coming soon'),
            },
          ]
        )}

        {/* Account Actions */}
        {renderSettingsSection(
          t('settings.accountActions'),
          'account-cog',
          [
            {
              icon: 'logout',
              title: t('profile.logout'),
              subtitle: t('profile.logoutDesc'),
              onPress: handleLogout,
              isDestructive: false,
            },
            {
              icon: 'delete-outline',
              title: t('profile.deleteAccount'),
              subtitle: t('profile.deleteAccountDesc'),
              onPress: handleDeleteAccount,
              isDestructive: true,
            },
            {
              icon: 'shield-lock-outline',
              title: 'Security',
              subtitle: 'Password, 2FA, recovery',
              onPress: () => Alert.alert(t('info'), 'Security settings coming soon'),
            },
            {
              icon: 'account-heart-outline',
              title: 'Emergency contact',
              subtitle: 'Add and manage emergency contacts',
              onPress: () => Alert.alert(t('info'), 'Emergency contacts coming soon'),
            },
          ]
        )}

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>
            {t('settings.version')} 1.0.0
          </Text>
        </View>
      </ScrollView>

      {/* Modals */}
      <NotificationSettingsModal
        visible={showNotificationModal}
        preferences={notificationSettings}
        onClose={() => setShowNotificationModal(false)}
        onSave={async (preferences) => {
          setNotificationSettings(preferences);
          await saveSettings('notifications', preferences);
        }}
      />

      <PrivacySettingsModal
        visible={showPrivacyModal}
        preferences={privacySettings}
        onClose={() => setShowPrivacyModal(false)}
        onSave={async (preferences) => {
          setPrivacySettings(preferences);
          await saveSettings('privacy', preferences);
        }}
      />

      <FamilySettingsModal
        visible={showFamilyModal}
        onClose={() => setShowFamilyModal(false)}
        onSave={async (settings) => {
          setFamilySettings(settings);
          await saveSettings('hourse', settings);
        }}
      />

      <Modal
        visible={showLanguageModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setShowLanguageModal(false)}
              style={styles.modalCloseButton}
            >
              <Icon name="close" size={24} color={colors.gray[800]} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{t('profile.language')}</Text>
            <View style={styles.modalSpacer} />
          </View>
          <View style={styles.modalContent}>
            <LanguageSettings
              onLanguageChange={(languageCode) => {
                setAppPreferences(prev => ({ ...prev, language: languageCode }));
                setShowLanguageModal(false);
              }}
            />
          </View>
        </View>
      </Modal>

      {/* Translation Keys Viewer Modal */}
      <Modal
        visible={showTranslationKeysModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowTranslationKeysModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowTranslationKeysModal(false)}
            >
              <Icon name="close" size={24} color={colors.gray[800]} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{t('settings.translationKeys')}</Text>
            <View style={styles.modalSpacer} />
          </View>
          <View style={styles.modalContent}>
            <TranslationKeysViewer
              onLanguageChange={(languageCode) => {
                setAppPreferences(prev => ({ ...prev, language: languageCode }));
                setShowTranslationKeysModal(false);
              }}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white[500],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white[500],
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.gray[500],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray[800],
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[500],
    marginLeft: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white[500],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  destructiveIcon: {
    backgroundColor: '#FFEBEE',
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.gray[800],
    marginBottom: 2,
  },
  destructiveText: {
    color: colors.error,
  },
  settingSubtitle: {
    fontSize: 13,
    color: colors.gray[500],
  },
  chevronContainer: {
    marginLeft: 8,
  },
  separator: {
    height: 1,
    backgroundColor: colors.gray[200],
    marginLeft: 72,
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  versionText: {
    fontSize: 12,
    color: colors.gray[500],
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.white[500],
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
    backgroundColor: '#FFFFFF',
  },
  modalCloseButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray[800],
    flex: 1,
    textAlign: 'center',
  },
  modalSpacer: {
    width: 40,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
});

export default UnifiedSettingsPage;
