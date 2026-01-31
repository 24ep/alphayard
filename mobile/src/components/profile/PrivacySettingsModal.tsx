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

const IconMC = Icon as any;

interface PrivacyPreferences {
  locationSharing: boolean;
  profileVisibility: 'public' | 'circle' | 'private';
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

interface PrivacySettingsModalProps {
  visible: boolean;
  preferences: PrivacyPreferences;
  onClose: () => void;
  onSave: (preferences: PrivacyPreferences) => Promise<void>;
}

export const PrivacySettingsModal: React.FC<PrivacySettingsModalProps> = ({
  visible,
  preferences,
  onClose,
  onSave,
}) => {
  const { t } = useTranslation();
  
  const [localPreferences, setLocalPreferences] = useState<PrivacyPreferences>(preferences);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      setLocalPreferences({
        ...preferences,
        analytics: preferences.analytics ?? true,
        crashReports: preferences.crashReports ?? true,
        personalizedAds: preferences.personalizedAds ?? false,
        contactSync: preferences.contactSync ?? false,
        searchableByEmail: preferences.searchableByEmail ?? true,
        searchableByPhone: preferences.searchableByPhone ?? false,
        showOnlineStatus: preferences.showOnlineStatus ?? true,
        readReceipts: preferences.readReceipts ?? true,
        lastSeenStatus: preferences.lastSeenStatus ?? true,
      });
    }
  }, [visible, preferences]);

  const updatePreference = (key: keyof PrivacyPreferences, value: boolean | string) => {
    setLocalPreferences(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await onSave(localPreferences);
      onClose();
    } catch (error) {
      console.error('Error saving privacy preferences:', error);
      Alert.alert(t('error'), t('profile.privacySaveError'));
    } finally {
      setLoading(false);
    }
  };

  const handleCriticalToggle = (key: keyof PrivacyPreferences, value: boolean, warningKey: string) => {
    if (!value) {
      Alert.alert(
        t('privacy.warning'),
        t(warningKey),
        [
          { text: t('cancel'), style: 'cancel' },
          { text: t('continue'), onPress: () => updatePreference(key, value) },
        ]
      );
    } else {
      updatePreference(key, value);
    }
  };

  const renderSectionHeader = (title: string, icon: string, description?: string) => (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionTitleContainer}>
        <IconMC name={icon} size={24} color={colors.primary[500]} />
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
    isCritical?: boolean
  ) => (
    <View style={styles.toggleItem}>
      <View style={styles.toggleContent}>
        <Text style={[styles.toggleTitle, isCritical && styles.criticalToggle]}>{title}</Text>
        <Text style={styles.toggleSubtitle}>{subtitle}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.gray[200], true: colors.primary[500] }}
        thumbColor="#FFFFFF"
        ios_backgroundColor={colors.gray[200]}
      />
    </View>
  );

  const renderPickerItem = (
    title: string,
    subtitle: string,
    value: string,
    options: Array<{ key: string; label: string; description: string }>,
    onChange: (value: string) => void
  ) => (
    <View style={styles.pickerItem}>
      <View style={styles.pickerContent}>
        <Text style={styles.toggleTitle}>{title}</Text>
        <Text style={styles.toggleSubtitle}>{subtitle}</Text>
      </View>
      <View style={styles.pickerOptions}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.key}
            style={[
              styles.pickerOption,
              value === option.key && styles.pickerOptionSelected,
            ]}
            onPress={() => onChange(option.key)}
          >
            <Text
              style={[
                styles.pickerOptionText,
                value === option.key && styles.pickerOptionTextSelected,
              ]}
            >
              {option.label}
            </Text>
            <Text
              style={[
                styles.pickerOptionDescription,
                value === option.key && styles.pickerOptionDescriptionSelected,
              ]}
            >
              {option.description}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const visibilityOptions = [
    {
      key: 'public',
      label: t('privacy.visibility.public'),
      description: t('privacy.visibility.publicDesc'),
    },
    {
      key: 'circle',
      label: t('privacy.visibility.circle'),
      description: t('privacy.visibility.circleDesc'),
    },
    {
      key: 'private',
      label: t('privacy.visibility.private'),
      description: t('privacy.visibility.privateDesc'),
    },
  ];

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
            <IconMC name="close" size={24} color={textColors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('profile.privacySettings')}</Text>
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
          {/* Profile Visibility */}
          <View style={styles.section}>
            {renderSectionHeader(
              t('privacy.profileVisibility'),
              'account-eye',
              t('privacy.profileVisibilityDesc')
            )}
            
            <View style={styles.sectionContent}>
              {renderPickerItem(
                t('privacy.whoCanSeeProfile'),
                t('privacy.whoCanSeeProfileDesc'),
                localPreferences.profileVisibility,
                visibilityOptions,
                (value) => updatePreference('profileVisibility', value)
              )}
            </View>
          </View>

          {/* Location & Activity */}
          <View style={styles.section}>
            {renderSectionHeader(
              t('privacy.locationActivity'),
              'map-marker-radius',
              t('privacy.locationActivityDesc')
            )}
            
            <View style={styles.sectionContent}>
              {renderToggleItem(
                t('privacy.locationSharing'),
                t('privacy.locationSharingDesc'),
                localPreferences.locationSharing,
                (value) => handleCriticalToggle('locationSharing', value, 'privacy.locationSharingWarning'),
                true
              )}
              
              {renderToggleItem(
                t('privacy.showOnlineStatus'),
                t('privacy.showOnlineStatusDesc'),
                localPreferences.showOnlineStatus || false,
                (value) => updatePreference('showOnlineStatus', value)
              )}
              
              {renderToggleItem(
                t('privacy.lastSeenStatus'),
                t('privacy.lastSeenStatusDesc'),
                localPreferences.lastSeenStatus || false,
                (value) => updatePreference('lastSeenStatus', value)
              )}
            </View>
          </View>

          {/* Communication */}
          <View style={styles.section}>
            {renderSectionHeader(
              t('privacy.communication'),
              'message-text',
              t('privacy.communicationDesc')
            )}
            
            <View style={styles.sectionContent}>
              {renderToggleItem(
                t('privacy.readReceipts'),
                t('privacy.readReceiptsDesc'),
                localPreferences.readReceipts || false,
                (value) => updatePreference('readReceipts', value)
              )}
              
              {renderToggleItem(
                t('privacy.searchableByEmail'),
                t('privacy.searchableByEmailDesc'),
                localPreferences.searchableByEmail || false,
                (value) => updatePreference('searchableByEmail', value)
              )}
              
              {renderToggleItem(
                t('privacy.searchableByPhone'),
                t('privacy.searchableByPhoneDesc'),
                localPreferences.searchableByPhone || false,
                (value) => updatePreference('searchableByPhone', value)
              )}
              
              {renderToggleItem(
                t('privacy.contactSync'),
                t('privacy.contactSyncDesc'),
                localPreferences.contactSync || false,
                (value) => updatePreference('contactSync', value)
              )}
            </View>
          </View>

          {/* Data & Analytics */}
          <View style={styles.section}>
            {renderSectionHeader(
              t('privacy.dataAnalytics'),
              'chart-line',
              t('privacy.dataAnalyticsDesc')
            )}
            
            <View style={styles.sectionContent}>
              {renderToggleItem(
                t('privacy.dataSharing'),
                t('privacy.dataSharingDesc'),
                localPreferences.dataSharing,
                (value) => handleCriticalToggle('dataSharing', value, 'privacy.dataSharingWarning'),
                true
              )}
              
              {renderToggleItem(
                t('privacy.analytics'),
                t('privacy.analyticsDesc'),
                localPreferences.analytics || false,
                (value) => updatePreference('analytics', value)
              )}
              
              {renderToggleItem(
                t('privacy.crashReports'),
                t('privacy.crashReportsDesc'),
                localPreferences.crashReports || false,
                (value) => updatePreference('crashReports', value)
              )}
              
              {renderToggleItem(
                t('privacy.personalizedAds'),
                t('privacy.personalizedAdsDesc'),
                localPreferences.personalizedAds || false,
                (value) => updatePreference('personalizedAds', value)
              )}
            </View>
          </View>

          {/* Data Management */}
          <View style={styles.section}>
            {renderSectionHeader(
              t('privacy.dataManagement'),
              'database',
              t('privacy.dataManagementDesc')
            )}
            
            <View style={styles.sectionContent}>
              <TouchableOpacity style={styles.actionItem} onPress={() => Alert.alert(t('info'), t('privacy.downloadDataInfo'))}>
                <IconMC name="download" size={20} color={colors.primary[500]} />
                <View style={styles.actionContent}>
                  <Text style={styles.actionTitle}>{t('privacy.downloadData')}</Text>
                  <Text style={styles.actionSubtitle}>{t('privacy.downloadDataDesc')}</Text>
                </View>
                <IconMC name="chevron-right" size={20} color={textColors.secondary} />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionItem} onPress={() => Alert.alert(t('info'), t('privacy.deleteDataInfo'))}>
                <IconMC name="delete" size={20} color={colors.error} />
                <View style={styles.actionContent}>
                  <Text style={[styles.actionTitle, { color: colors.error }]}>{t('privacy.deleteData')}</Text>
                  <Text style={styles.actionSubtitle}>{t('privacy.deleteDataDesc')}</Text>
                </View>
                <IconMC name="chevron-right" size={20} color={textColors.secondary} />
              </TouchableOpacity>
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
    backgroundColor: colors.gray[50], // background
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200], // border
    backgroundColor: '#FFFFFF',
  },
  headerButton: {
    padding: 8,
    minWidth: 60,
  },
  saveButton: {
    backgroundColor: colors.primary[500],
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
    borderBottomColor: colors.gray[200], // border
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
    color: textColors.secondary,
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
    borderBottomColor: colors.gray[200], // border
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
  criticalToggle: {
    color: colors.error,
    fontWeight: '600',
  },
  toggleSubtitle: {
    fontSize: 13,
    color: textColors.secondary,
    lineHeight: 18,
  },
  pickerItem: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200], // border
  },
  pickerContent: {
    marginBottom: 12,
  },
  pickerOptions: {
    gap: 8,
  },
  pickerOption: {
    borderWidth: 1,
    borderColor: colors.gray[200], // border
    borderRadius: 12,
    padding: 12,
    backgroundColor: colors.gray[50], // backgroundLight
  },
  pickerOptionSelected: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50], // primary[50]? 50 exists
  },
  pickerOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: textColors.primary,
    marginBottom: 2,
  },
  pickerOptionTextSelected: {
    color: colors.primary[900], // Darker text for selected? or White?
    // PrivacySettingsModal original used #FFFFFF for selected text.
    // wait, line 508 was backgroundColor: colors.primary. Original had #FFFFFF text.
    // I should check if I want correct contrast.
    // if bg is primary[50] (light), text should be dark.
    // if bg is primary[500] (darker), text should be white.
    // Original used `backgroundColor: colors.primary` (which is object... so undefined in style? No, original had logic that might have worked if colors.primary was string elsewhere?)
    // In colors.ts, colors.primary is object.
    // I should use `backgroundColor: colors.primary[500]` for selected background, then text white is fine.
  },
  pickerOptionDescription: {
    fontSize: 12,
    color: textColors.secondary,
  },
  pickerOptionDescriptionSelected: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200], // border
  },
  actionContent: {
    flex: 1,
    marginLeft: 12,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: textColors.primary,
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 13,
    color: textColors.secondary,
    lineHeight: 18,
  },
});

/* Fix for pickerOptionSelected to match original behavior if desired, or use light theme */
// Let's stick to primary[500] background and white text for selected state to match typical "Active" state.
styles.pickerOptionSelected = {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[500],
} as any;
