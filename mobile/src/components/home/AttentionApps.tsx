import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';
import { homeStyles } from '../../styles/homeStyles';
import { AttentionApp } from '../../types/home';

interface AttentionAppsProps {
  apps: AttentionApp[];
  onAppPress: (app: AttentionApp) => void;
}

const AttentionApps: React.FC<AttentionAppsProps> = ({
  apps,
  onAppPress,
}) => {
  return (
    <View style={homeStyles.attentionApplicationsContainer}>
      {apps.map((app) => (
        <TouchableOpacity
          key={app.id}
          style={homeStyles.attentionAppItem}
          onPress={() => onAppPress(app)}
        >
          <View style={homeStyles.attentionAppHeader}>
            <View
              style={[
                homeStyles.attentionAppIcon,
                { backgroundColor: app.color },
              ]}
            >
              <IconMC name={app.icon} size={20} color="#FFFFFF" />
            </View>
            <View style={homeStyles.attentionAppInfo}>
              <Text style={homeStyles.attentionAppName}>{app.name}</Text>
              <View style={homeStyles.dueDateInfo}>
                <Text style={homeStyles.dueDateText}>
                  {app.isUrgent ? 'Urgent' : 'Due soon'}
                </Text>
                <Text
                  style={[
                    homeStyles.daysLeftText,
                    { color: app.isUrgent ? '#FF5A5A' : '#666666' },
                  ]}
                >
                  {app.notifications} items
                </Text>
              </View>
            </View>
            {app.notifications > 0 && (
              <View style={homeStyles.appNotificationBadge}>
                <Text style={homeStyles.appNotificationText}>
                  {app.notifications > 99 ? '99+' : app.notifications}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default AttentionApps;
