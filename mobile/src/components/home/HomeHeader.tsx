import React from 'react';
import { View, Text } from 'react-native';
import CoolIcon from '../common/CoolIcon';
import { homeStyles } from '../../styles/homeStyles';
import { ScalePressable } from '../common/ScalePressable';

interface HomeHeaderProps {
  onNotificationPress: () => void;
  onAssignedTaskPress: () => void;
  _onCustomizePress?: () => void;
  _onCreateCirclePress?: () => void;
  notificationCount: number;
}

const HomeHeader: React.FC<HomeHeaderProps> = ({
  onNotificationPress,
  onAssignedTaskPress,
  _onCustomizePress,
  _onCreateCirclePress,
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
        <ScalePressable
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
        </ScalePressable>

        <ScalePressable
          style={homeStyles.phoneButton}
          onPress={onAssignedTaskPress}
        >
          <CoolIcon name="phone" size={24} color="#FFFFFF" />
        </ScalePressable>
      </View>
    </View>
  );
};

export default HomeHeader;

