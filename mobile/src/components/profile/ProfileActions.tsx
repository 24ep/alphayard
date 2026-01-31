import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { colors, textColors } from '../../theme/colors';

interface ProfileActionsProps {
  onEditProfile: () => void;
  onChangePassword: () => void;
  onEmergencyContacts: () => void;
  onCircleSettings: () => void;
}

export const ProfileActions: React.FC<ProfileActionsProps> = ({
  onEditProfile,
  onChangePassword,
  onEmergencyContacts,
  onCircleSettings,
}) => {
  const { t } = useTranslation();

  const actions = [
    {
      icon: 'account-edit',
      title: t('profile.editProfile'),
      subtitle: t('profile.editProfileDesc'),
      onPress: onEditProfile,
      color: '#667eea',
    },
    {
      icon: 'lock-reset',
      title: t('profile.changePassword'),
      subtitle: t('profile.changePasswordDesc'),
      onPress: onChangePassword,
      color: '#f093fb',
    },
    {
      icon: 'phone-alert',
      title: t('profile.emergencyContacts'),
      subtitle: t('profile.emergencyContactsDesc'),
      onPress: onEmergencyContacts,
      color: '#FF6B6B',
    },
    {
      icon: 'account-group-outline',
      title: t('profile.circleSettings'),
      subtitle: t('profile.circleSettingsDesc'),
      onPress: onCircleSettings,
      color: '#4ECDC4',
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>{t('profile.quickActions')}</Text>
      
      <View style={styles.actionsGrid}>
        {actions.map((action, index) => (
          <TouchableOpacity
            key={index}
            style={styles.actionCard}
            onPress={action.onPress}
            activeOpacity={0.7}
            accessible={true}
            accessibilityLabel={action.title}
            accessibilityHint={action.subtitle}
            accessibilityRole="button"
          >
            <View style={[styles.iconContainer, { backgroundColor: action.color }]}>
              <Icon name={action.icon} size={24} color="#FFFFFF" />
            </View>
            
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle} accessible={false}>{action.title}</Text>
              <Text style={styles.actionSubtitle} accessible={false}>{action.subtitle}</Text>
            </View>
            
            <View style={styles.chevronContainer}>
              <Icon name="chevron-right" size={20} color={textColors.primarySecondary} />
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: textColors.primary,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  actionsGrid: {
    gap: 12,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: textColors.primary,
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 13,
    color: textColors.primarySecondary,
    lineHeight: 18,
  },
  chevronContainer: {
    marginLeft: 8,
  },
});

export default ProfileActions;
