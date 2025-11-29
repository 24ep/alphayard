import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import CoolIcon from '../common/CoolIcon';
import { homeStyles } from '../../styles/homeStyles';

interface HomeHeaderProps {
  onNotificationPress: () => void;
  onAssignedTaskPress: () => void;
  onCustomizePress?: () => void;
  onCreateFamilyPress?: () => void;
  notificationCount: number;
}

const HomeHeader: React.FC<HomeHeaderProps> = ({
  onNotificationPress,
  onAssignedTaskPress,
  onCustomizePress,
  onCreateFamilyPress,
  notificationCount,
}) => {
  return (
    <View style={homeStyles.header}>
      {/* Left side - Bondarys Logo */}
      <View style={homeStyles.headerLeft}>
        <Text style={homeStyles.headerLogo}>🔴 Bondarys</Text>
      </View>
      
      {/* Right side - Notification and Phone buttons */}
      <View style={homeStyles.headerButtons}>
        <TouchableOpacity
          style={homeStyles.notificationButton}
          onPress={onNotificationPress}
        >
          <CoolIcon name="bell" size={28} color="#FFFFFF" />
          {notificationCount > 0 && (
            <View style={homeStyles.notificationBadge}>
              <Text style={homeStyles.notificationText}>
                {notificationCount > 99 ? '99+' : notificationCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity
          style={homeStyles.phoneButton}
          onPress={onAssignedTaskPress}
        >
          <CoolIcon name="phone" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default HomeHeader;
