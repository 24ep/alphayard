import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { colors, textColors } from '../../theme/colors';

interface Preferences {
  language: string;
  theme: 'light' | 'dark' | 'auto';
  notifications: {
    push: boolean;
    email: boolean;
    sms: boolean;
  };
  privacy: {
    locationSharing: boolean;
    profileVisibility: 'public' | 'hourse' | 'private';
    dataSharing: boolean;
  };
}

interface Subscription {
  plan: string;
  status: string;
  expiresAt: string;
}

interface ProfileSettingsProps {
  preferences: Preferences;
  subscription?: Subscription;
  onNotificationSettings: () => void;
  onPrivacySettings: () => void;
  onSubscriptionSettings: () => void;
  onLogout: () => void;
  onDeleteAccount: () => void;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({
  preferences,
  subscription,
  onNotificationSettings,
  onPrivacySettings,
  onSubscriptionSettings,
  onLogout,
  onDeleteAccount,
}) => {
  const { t } = useTranslation();

  const getSubscriptionStatus = () => {
    if (!subscription) return { text: t('subscription.free'), color: textColors.secondary };
    
    switch (subscription.plan) {
      case 'premium':
        return { text: t('subscription.premium'), color: '#FFD700' };
      case 'hourse':
        return { text: t('subscription.hourse'), color: '#FF6B6B' };
      case 'basic':
        return { text: t('subscription.basic'), color: '#4ECDC4' };
      default:
        return { text: t('subscription.free'), color: textColors.secondary };
    }
  };

  const subscriptionStatus = getSubscriptionStatus();

  const settingsSections = [
    {
      title: t('profile.account'),
      icon: 'account-cog',
      color: '#667eea',
      items: [
        {
          icon: 'bell-outline',
          title: t('profile.notifications'),
          subtitle: preferences.notifications.push ? t('enabled') : t('disabled'),
          onPress: onNotificationSettings,
          hasSwitch: false,
          gradient: ['#667eea', '#764ba2'],
        },
        {
          icon: 'shield-account-outline',
          title: t('profile.privacy'),
          subtitle: t(`privacy.${preferences.privacy.profileVisibility}`),
          onPress: onPrivacySettings,
          hasSwitch: false,
          gradient: ['#f093fb', '#f5576c'],
        },
        {
          icon: 'crown-outline',
          title: t('profile.subscription'),
          subtitle: subscriptionStatus.text,
          onPress: onSubscriptionSettings,
          hasSwitch: false,
          textColor: subscriptionStatus.color,
          gradient: ['#4facfe', '#00f2fe'],
        },
      ],
    },
    {
      title: t('profile.preferences'),
      icon: 'tune',
      color: '#4ECDC4',
      items: [
        {
          icon: 'translate',
          title: t('profile.language'),
          subtitle: preferences.language.toUpperCase(),
          onPress: () => Alert.alert(t('info'), t('profile.languageChangeInfo')),
          hasSwitch: false,
          gradient: ['#4ECDC4', '#44A08D'],
        },
        {
          icon: 'theme-light-dark',
          title: t('profile.theme'),
          subtitle: t(`theme.${preferences.theme}`),
          onPress: () => Alert.alert(t('info'), t('profile.themeChangeInfo')),
          hasSwitch: false,
          gradient: ['#FF6B6B', '#FF8E8E'],
        },
        {
          icon: 'map-marker-outline',
          title: t('profile.locationSharing'),
          subtitle: '',
          onPress: () => {},
          hasSwitch: true,
          switchValue: preferences.privacy.locationSharing,
          onSwitchChange: (value: boolean) => {
            Alert.alert(t('info'), t('profile.locationSharingInfo'));
          },
          gradient: ['#96CEB4', '#A8D5C4'],
        },
      ],
    },
    {
      title: t('profile.support'),
      icon: 'help-circle',
      color: '#45B7D1',
      items: [
        {
          icon: 'help-circle-outline',
          title: t('profile.help'),
          subtitle: t('profile.helpDesc'),
          onPress: () => Alert.alert(t('info'), t('profile.helpInfo')),
          hasSwitch: false,
          gradient: ['#45B7D1', '#6BC5D1'],
        },
        {
          icon: 'information-outline',
          title: t('profile.about'),
          subtitle: t('profile.aboutDesc'),
          onPress: () => Alert.alert(t('info'), t('profile.aboutInfo')),
          hasSwitch: false,
          gradient: ['#FFD700', '#FFA500'],
        },
        {
          icon: 'star-outline',
          title: t('profile.rateApp'),
          subtitle: t('profile.rateAppDesc'),
          onPress: () => Alert.alert(t('info'), t('profile.rateAppInfo')),
          hasSwitch: false,
          gradient: ['#FF9A9E', '#FECFEF'],
        },
      ],
    },
    {
      title: t('profile.account'),
      icon: 'account-remove',
      color: '#FF6B6B',
      items: [
        {
          icon: 'logout',
          title: t('profile.logout'),
          subtitle: t('profile.logoutDesc'),
          onPress: onLogout,
          hasSwitch: false,
          isDestructive: false,
          gradient: ['#FF6B6B', '#FF8E8E'],
        },
        {
          icon: 'delete-outline',
          title: t('profile.deleteAccount'),
          subtitle: t('profile.deleteAccountDesc'),
          onPress: onDeleteAccount,
          hasSwitch: false,
          isDestructive: true,
          gradient: ['#FF4757', '#FF6B7A'],
        },
      ],
    },
  ];

  return (
    <View style={styles.container}>
      {settingsSections.map((section, sectionIndex) => (
        <View key={sectionIndex} style={styles.section}>
          {/* Section Header */}
          <Text style={styles.sectionTitle}>{section.title}</Text>
          
          {/* Settings List */}
          <View style={styles.settingsCard}>
            {section.items.map((item, itemIndex) => (
              <View key={itemIndex}>
                <TouchableOpacity
                  style={styles.settingItem}
                  onPress={item.onPress}
                  activeOpacity={0.7}
                >
                  <View style={styles.settingContent}>
                    <View style={styles.iconContainer}>
                      <Icon
                        name={item.icon}
                        size={20}
                        color={item.isDestructive ? '#FF4757' : '#666666'}
                      />
                    </View>
                    
                    <View style={styles.settingInfo}>
                      <Text style={[
                        styles.settingTitle,
                        item.isDestructive && styles.destructiveText
                      ]}>
                        {item.title}
                      </Text>
                      {item.subtitle && (
                        <Text style={styles.settingSubtitle}>
                          {item.subtitle}
                        </Text>
                      )}
                    </View>
                    
                    {item.hasSwitch ? (
                      <Switch
                        value={item.switchValue}
                        onValueChange={item.onSwitchChange}
                        trackColor={{ false: '#E0E0E0', true: '#E8B4A1' }}
                        thumbColor="#FFFFFF"
                      />
                    ) : (
                      <Icon name="chevron-right" size={16} color="#CCCCCC" />
                    )}
                  </View>
                </TouchableOpacity>
                
                {itemIndex < section.items.length - 1 && (
                  <View style={styles.separator} />
                )}
              </View>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#D4A574', // Medium luxury rose gold
    marginBottom: 12,
    paddingHorizontal: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#D4A574',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(212, 165, 116, 0.3)',
  },
  settingItem: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(212, 165, 116, 0.15)', // Light luxury rose gold background
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 165, 116, 0.3)',
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#B8860B', // Deep luxury rose gold
    marginBottom: 2,
  },
  destructiveText: {
    color: '#D4A574', // Luxury rose gold for destructive actions
  },
  settingSubtitle: {
    fontSize: 13,
    color: '#D4A574', // Medium luxury rose gold
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(212, 165, 116, 0.3)', // Luxury rose gold separator
    marginLeft: 72,
  },
});

export default ProfileSettings;