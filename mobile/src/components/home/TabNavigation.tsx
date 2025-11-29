import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import CoolIcon from '../common/CoolIcon';
import { homeStyles } from '../../styles/homeStyles';

interface TabNavigationProps {
  activeTab: string;
  onTabPress: (tabId: string) => void;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  onTabPress,
}) => {
  const tabs = [
    { id: 'you', label: 'You', icon: 'account' },
    { id: 'financial', label: 'Financial', icon: 'analytics' },
    { id: 'social', label: 'Social', icon: 'account-multiple' }
  ];

  return (
    <View style={homeStyles.tabsContainer}>
      {tabs.map((tab) => 
        activeTab === tab.id ? (
          <LinearGradient
            key={tab.id}
            colors={['#FFB6C1', '#FF6B6B', '#E5E7EB']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={homeStyles.activeTabGradient}
          >
            <TouchableOpacity
              style={homeStyles.activeTabTouchable}
              onPress={() => onTabPress(tab.id)}
            >
              <CoolIcon
                name={tab.icon}
                size={20}
                color="#FFFFFF"
              />
              <Text style={homeStyles.activeTabText}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          </LinearGradient>
        ) : (
          <TouchableOpacity
            key={tab.id}
            style={homeStyles.tab}
            onPress={() => onTabPress(tab.id)}
          >
            <CoolIcon
              name={tab.icon}
              size={20}
              color="#666666"
            />
            <Text style={homeStyles.tabText}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        )
      )}
    </View>
  );
};
