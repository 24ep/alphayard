import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { UnifiedSettingsPage } from '../../components/settings/UnifiedSettingsPage';
import { useAuth } from '../../hooks/useAuth';

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { logout } = useAuth();

  const handleBack = () => {
    navigation.goBack();
  };

  const handleLogout = async () => {
    try {
      await logout();
      // Navigation will be handled by the auth context
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleDeleteAccount = () => {
    // In a real app, this would trigger account deletion flow
    console.log('Delete account requested');
  };

  return (
    <UnifiedSettingsPage
      onBack={handleBack}
      onLogout={handleLogout}
      onDeleteAccount={handleDeleteAccount}
    />
  );
};

export default SettingsScreen;
