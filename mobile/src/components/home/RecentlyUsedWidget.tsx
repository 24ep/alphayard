import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';
import { homeStyles } from '../../styles/homeStyles';
import { RecentlyUsedApp } from '../../types/home';

interface RecentlyUsedWidgetProps {
  apps: RecentlyUsedApp[];
  onAppPress: (app: RecentlyUsedApp) => void;
}

const RecentlyUsedWidget: React.FC<RecentlyUsedWidgetProps> = ({
  apps,
  onAppPress,
}) => {
  const getAppIcon = (iconName: string) => {
    switch (iconName) {
      case 'image':
        return 'image';
      case 'calendar':
        return 'calendar';
      case 'folder':
        return 'folder';
      case 'note':
        return 'note-text';
      case 'game':
        return 'gamepad-variant';
      default:
        return 'application';
    }
  };

  return (
    <View style={homeStyles.widgetContainer}>
      <View style={homeStyles.widgetHeader}>
        <Text style={homeStyles.widgetTitle}>Recently Used</Text>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={homeStyles.widgetScrollContent}
      >
        {apps.map((app) => (
          <TouchableOpacity
            key={app.id}
            style={homeStyles.recentAppCard}
            onPress={() => onAppPress(app)}
          >
            <View style={homeStyles.recentAppIcon}>
              <IconMC name={getAppIcon(app.icon)} size={24} color="#4F46E5" />
            </View>
            
            <Text style={homeStyles.recentAppName}>{app.name}</Text>
            <Text style={homeStyles.recentAppLastUsed}>{app.lastUsed}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default RecentlyUsedWidget;
