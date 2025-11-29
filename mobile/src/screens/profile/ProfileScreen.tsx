import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

// Import redesigned components
import ProfileHeader from '../../components/profile/ProfileHeader';
import ProfileStats from '../../components/profile/ProfileStats';
import ProfileSettings from '../../components/profile/ProfileSettings';
import ProfileActions from '../../components/profile/ProfileActions';
import FamilyCard from '../../components/profile/FamilyCard';
import EmergencyContactsCard from '../../components/profile/EmergencyContactsCard';

// Import modals
import EditProfileModal from '../../components/profile/EditProfileModal';
import ChangePasswordModal from '../../components/profile/ChangePasswordModal';
import NotificationSettingsModal from '../../components/profile/NotificationSettingsModal';
import PrivacySettingsModal from '../../components/profile/PrivacySettingsModal';
import FamilySettingsModal from '../../components/profile/FamilySettingsModal';

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  bio?: string;
  subscription?: {
    plan: string;
    status: string;
  };
}

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

interface hourse {
  id: string;
  name: string;
  members?: Array<{
    id: string;
    name: string;
    role: 'admin' | 'member';
  }>;
}

interface EmergencyContact {
  id: string;
  name: string;
  phoneNumber: string;
  relationship: string;
  isPrimary: boolean;
}

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  
  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    bio: 'Passionate about technology and innovation. Love sharing knowledge and connecting with like-minded people.',
    subscription: {
      plan: 'premium',
      status: 'active',
    },
  });

  const [preferences, setPreferences] = useState<Preferences>({
    language: 'en',
    theme: 'light',
    notifications: {
      push: true,
      email: true,
      sms: false,
    },
    privacy: {
      locationSharing: true,
      profileVisibility: 'hourse',
      dataSharing: false,
    },
  });

  const [hourse, setFamily] = useState<hourse>({
    id: '1',
    name: 'The Doe hourse',
    members: [
      { id: '1', name: 'John Doe', role: 'admin' },
      { id: '2', name: 'Jane Doe', role: 'member' },
      { id: '3', name: 'Jack Doe', role: 'member' },
      { id: '4', name: 'Jill Doe', role: 'member' },
    ],
  });

  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([
    {
      id: '1',
      name: 'Jane Doe',
      phoneNumber: '+1-555-0123',
      relationship: 'spouse',
      isPrimary: true,
    },
    {
      id: '2',
      name: 'Dr. Smith',
      phoneNumber: '+1-555-0456',
      relationship: 'doctor',
      isPrimary: false,
    },
  ]);

  // Modal states
  const [editProfileModalVisible, setEditProfileModalVisible] = useState(false);
  const [changePasswordModalVisible, setChangePasswordModalVisible] = useState(false);
  const [notificationSettingsModalVisible, setNotificationSettingsModalVisible] = useState(false);
  const [privacySettingsModalVisible, setPrivacySettingsModalVisible] = useState(false);
  const [familySettingsModalVisible, setFamilySettingsModalVisible] = useState(false);

  // Mock data for stats
  const profileStats = {
    postsCount: 156,
    familyMembers: hourse.members?.length || 0,
    emergencyContacts: emergencyContacts.length,
    accountAge: new Date('2023-03-15'),
  };

  // Handlers
  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  const handleEditProfile = () => {
    setEditProfileModalVisible(true);
  };

  const handleSettingsPress = () => {
    // Navigate to settings or show settings modal
    console.log('Settings pressed');
  };

  const handleChangePassword = () => {
    setChangePasswordModalVisible(true);
  };

  const handleEmergencyContacts = () => {
    // Navigate to emergency contacts management
    console.log('Emergency contacts pressed');
  };

  const handleFamilySettings = () => {
    setFamilySettingsModalVisible(true);
  };

  const handleNotificationSettings = () => {
    setNotificationSettingsModalVisible(true);
  };

  const handlePrivacySettings = () => {
    setPrivacySettingsModalVisible(true);
  };

  const handleSubscriptionSettings = () => {
    // Navigate to subscription settings
    console.log('Subscription settings pressed');
  };

  const handleLogout = () => {
    // Handle logout
    console.log('Logout pressed');
  };

  const handleDeleteAccount = () => {
    // Handle delete account
    console.log('Delete account pressed');
  };

  const handleViewFamily = () => {
    // Navigate to hourse detail screen
    console.log('View hourse pressed');
  };

  const handleLeaveFamily = () => {
    // Handle leave hourse
    console.log('Leave hourse pressed');
  };

  const handleManageContacts = () => {
    // Navigate to emergency contacts management
    console.log('Manage contacts pressed');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#E8B4A1" />
      
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#FFFFFF"
            colors={['#FFFFFF']}
          />
        }
      >
        {/* Profile Header */}
        <ProfileHeader
          profile={profile}
          onEditPress={handleEditProfile}
          onSettingsPress={handleSettingsPress}
        />

        {/* Profile Stats */}
        <ProfileStats
          postsCount={profileStats.postsCount}
          familyMembers={profileStats.familyMembers}
          emergencyContacts={profileStats.emergencyContacts}
          accountAge={profileStats.accountAge}
        />

        {/* Quick Actions */}
        <ProfileActions
          onEditProfile={handleEditProfile}
          onChangePassword={handleChangePassword}
          onEmergencyContacts={handleEmergencyContacts}
          onFamilySettings={handleFamilySettings}
        />

        {/* hourse Card */}
        <FamilyCard
          hourse={hourse}
          onViewFamily={handleViewFamily}
          onLeaveFamily={handleLeaveFamily}
        />

        {/* Emergency Contacts Card */}
        <EmergencyContactsCard
          contacts={emergencyContacts}
          onManageContacts={handleManageContacts}
        />

        {/* Profile Settings */}
        <ProfileSettings
          preferences={preferences}
          subscription={profile.subscription}
          onNotificationSettings={handleNotificationSettings}
          onPrivacySettings={handlePrivacySettings}
          onSubscriptionSettings={handleSubscriptionSettings}
          onLogout={handleLogout}
          onDeleteAccount={handleDeleteAccount}
        />
      </ScrollView>

      {/* Modals */}
      <EditProfileModal
        visible={editProfileModalVisible}
        onClose={() => setEditProfileModalVisible(false)}
        profile={profile}
        onSave={(updatedProfile) => setProfile(updatedProfile)}
      />

      <ChangePasswordModal
        visible={changePasswordModalVisible}
        onClose={() => setChangePasswordModalVisible(false)}
        onSave={() => console.log('Password changed')}
      />

      <NotificationSettingsModal
        visible={notificationSettingsModalVisible}
        onClose={() => setNotificationSettingsModalVisible(false)}
        preferences={preferences}
        onSave={(updatedPreferences) => setPreferences(updatedPreferences)}
      />

      <PrivacySettingsModal
        visible={privacySettingsModalVisible}
        onClose={() => setPrivacySettingsModalVisible(false)}
        preferences={preferences}
        onSave={(updatedPreferences) => setPreferences(updatedPreferences)}
      />

      <FamilySettingsModal
        visible={familySettingsModalVisible}
        onClose={() => setFamilySettingsModalVisible(false)}
        hourse={hourse}
        onSave={(updatedFamily) => setFamily(updatedFamily)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
});

export default ProfileScreen;
