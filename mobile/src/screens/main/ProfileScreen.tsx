import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Image,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../hooks/useAuth';
import { useFamily } from '../../hooks/useFamily';
import { userService } from '../../services/user/UserService';
import ProfileHeaderNew from '../../components/profile/ProfileHeaderNew';
import ProfileStatsNew from '../../components/profile/ProfileStatsNew';
import ProfileActionsNew from '../../components/profile/ProfileActionsNew';
import ProfileSettingsNew from '../../components/profile/ProfileSettingsNew';
import { FamilyCard } from '../../components/profile/FamilyCard';
import { EmergencyContactsCard } from '../../components/profile/EmergencyContactsCard';
import { EditProfileModal } from '../../components/profile/EditProfileModal';
import { ChangePasswordModal } from '../../components/profile/ChangePasswordModal';
import { FamilySettingsModal } from '../../components/profile/FamilySettingsModal';
import { NotificationSettingsModal } from '../../components/profile/NotificationSettingsModal';
import { PrivacySettingsModal } from '../../components/profile/PrivacySettingsModal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { colors } from '../../theme/colors';

const { width, height } = Dimensions.get('window');

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  avatar?: string;
  dateOfBirth?: string;
  gender?: string;
  bio?: string;
  preferences: {
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
    hourse: {
      autoJoin: boolean;
      locationUpdates: boolean;
      eventReminders: boolean;
    };
  };
  subscription?: {
    plan: string;
    status: string;
    expiresAt: string;
  };
  emergencyContacts: Array<{
    id: string;
    name: string;
    phoneNumber: string;
    relationship: string;
    isPrimary: boolean;
  }>;
  createdAt: string;
  lastActiveAt: string;
}

const ProfileScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { user, logout } = useAuth();
  const { currentFamily, leaveFamily } = useFamily();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'settings'>('overview');
  
  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showFamilyModal, setShowFamilyModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await userService.getProfile();
      setProfile(response.data);
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert(t('error'), t('profile.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProfile();
    setRefreshing(false);
  };

  const handleUpdateProfile = async (updatedData: Partial<UserProfile>) => {
    try {
      const response = await userService.updateProfile(updatedData);
      setProfile(response.data);
      setShowEditModal(false);
      Alert.alert(t('success'), t('profile.updateSuccess'));
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert(t('error'), t('profile.updateError'));
    }
  };

  const handleChangePassword = async (currentPassword: string, newPassword: string) => {
    try {
      await userService.changePassword(currentPassword, newPassword);
      setShowPasswordModal(false);
      Alert.alert(t('success'), t('profile.passwordChanged'));
    } catch (error) {
      console.error('Error changing password:', error);
      Alert.alert(t('error'), t('profile.passwordError'));
    }
  };

  const handleUpdatePreferences = async (preferences: any) => {
    try {
      const response = await userService.updatePreferences(preferences);
      setProfile(prev => prev ? { ...prev, preferences: response.data } : null);
      Alert.alert(t('success'), t('profile.preferencesUpdated'));
    } catch (error) {
      console.error('Error updating preferences:', error);
      Alert.alert(t('error'), t('profile.preferencesError'));
    }
  };

  const handleLogout = () => {
    Alert.alert(
      t('profile.logoutConfirmTitle'),
      t('profile.logoutConfirmMessage'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('logout'),
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (error) {
              console.error('Logout error:', error);
            }
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      t('profile.deleteAccountTitle'),
      t('profile.deleteAccountMessage'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await userService.deleteAccount();
              await logout();
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (error) {
              console.error('Delete account error:', error);
              Alert.alert(t('error'), t('profile.deleteAccountError'));
            }
          },
        },
      ]
    );
  };

  const handleLeaveFamily = () => {
    if (!currentFamily) return;

    Alert.alert(
      t('profile.leaveFamilyTitle'),
      t('profile.leaveFamilyMessage'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('leave'),
          style: 'destructive',
          onPress: async () => {
            try {
              await leaveFamily(currentFamily.id);
              Alert.alert(t('success'), t('profile.familyLeft'));
            } catch (error) {
              console.error('Leave hourse error:', error);
              Alert.alert(t('error'), t('profile.leaveFamilyError'));
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner size="large" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="account-alert" size={64} color={colors.gray} />
        <Text style={styles.errorText}>{t('profile.loadError')}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadProfile}>
          <Text style={styles.retryButtonText}>{t('retry')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={['#FA7272', '#FFBBB4']} // Clean gradient
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        accessible={true}
        accessibilityLabel={t('profile.scrollableContent')}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor="#D4A574"
            colors={['#D4A574']}
            accessibilityLabel={t('profile.pullToRefresh')}
          />
        }
      >
        {/* New Profile Header */}
        <ProfileHeaderNew
          profile={{
            ...profile,
            stats: {
              posts: 156,
              followers: 234,
              following: 89,
            },
            badges: ['Early Adopter', 'Community Helper'],
            isOnline: true,
            lastSeen: '2 minutes ago',
          }}
          onEditPress={() => setShowEditModal(true)}
          onSettingsPress={() => setActiveTab('settings')}
          onSharePress={() => console.log('Share pressed')}
          onFollowPress={() => console.log('Follow pressed')}
          onMessagePress={() => console.log('Message pressed')}
        />

        {/* New Profile Stats */}
        <ProfileStatsNew
          postsCount={156}
          familyMembers={currentFamily?.members?.length || 0}
          emergencyContacts={profile.emergencyContacts.length}
          accountAge={new Date(profile.createdAt)}
          onStatPress={(statId) => console.log('Stat pressed:', statId)}
        />

        {/* New Profile Actions */}
        <ProfileActionsNew
          onEditProfile={() => setShowEditModal(true)}
          onChangePassword={() => setShowPasswordModal(true)}
          onEmergencyContacts={() => navigation.navigate('EmergencyContactsScreen' as never)}
          onFamilySettings={() => setShowFamilyModal(true)}
          onBackupData={() => console.log('Backup data')}
          onExportData={() => console.log('Export data')}
          onShareProfile={() => console.log('Share profile')}
          onInviteFriends={() => console.log('Invite friends')}
          onHelpSupport={() => console.log('Help support')}
          onFeedback={() => console.log('Feedback')}
        />

        {/* hourse Card */}
        {currentFamily && (
          <FamilyCard
            hourse={currentFamily}
            onViewFamily={() => navigation.navigate('FamilyDetail' as never, { familyId: currentFamily.id } as never)}
            onLeaveFamily={handleLeaveFamily}
          />
        )}

        {/* Emergency Contacts Card */}
        <EmergencyContactsCard
          contacts={profile.emergencyContacts}
          onManageContacts={() => navigation.navigate('EmergencyContactsScreen' as never)}
        />

        {/* New Profile Settings */}
        <ProfileSettingsNew
          preferences={profile.preferences}
          subscription={profile.subscription}
          onNotificationSettings={() => setShowNotificationModal(true)}
          onPrivacySettings={() => setShowPrivacyModal(true)}
          onSubscriptionSettings={() => navigation.navigate('BillingScreen' as never)}
          onLogout={handleLogout}
          onDeleteAccount={handleDeleteAccount}
          onLanguageChange={() => console.log('Language change')}
          onThemeChange={() => console.log('Theme change')}
          onBackupSettings={() => console.log('Backup settings')}
          onSecuritySettings={() => console.log('Security settings')}
        />
      </ScrollView>

      {/* Modals */}
      <EditProfileModal
        visible={showEditModal}
        profile={profile}
        onClose={() => setShowEditModal(false)}
        onSave={handleUpdateProfile}
      />

      <ChangePasswordModal
        visible={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onSave={handleChangePassword}
      />

      <FamilySettingsModal
        visible={showFamilyModal}
        preferences={profile.preferences.hourse}
        onClose={() => setShowFamilyModal(false)}
        onSave={(familyPrefs) => handleUpdatePreferences({ ...profile.preferences, hourse: familyPrefs })}
      />

      <NotificationSettingsModal
        visible={showNotificationModal}
        preferences={profile.preferences.notifications}
        onClose={() => setShowNotificationModal(false)}
        onSave={(notificationPrefs) => handleUpdatePreferences({ ...profile.preferences, notifications: notificationPrefs })}
      />

      <PrivacySettingsModal
        visible={showPrivacyModal}
        preferences={profile.preferences.privacy}
        onClose={() => setShowPrivacyModal(false)}
        onSave={(privacyPrefs) => handleUpdatePreferences({ ...profile.preferences, privacy: privacyPrefs })}
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FDF2F8',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FDF2F8',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#D4A574',
    textAlign: 'center',
    marginVertical: 20,
  },
  retryButton: {
    backgroundColor: '#D4A574',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProfileScreen;