import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import CoolIcon from '../common/CoolIcon';
import { homeStyles } from '../../styles/homeStyles';

interface Tab {
  id: string;
  name: string;
  icon: string;
  enabled: boolean;
}

interface HomeTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabPress: (tabId: string) => void;
}

const HomeTabs: React.FC<HomeTabsProps> = ({
  tabs,
  activeTab,
  onTabPress,
}) => {
  return (
    <View style={homeStyles.tabsContainer}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={[
            homeStyles.tab,
            activeTab === tab.id && homeStyles.activeTab,
          ]}
          onPress={() => onTabPress(tab.id)}
          disabled={!tab.enabled}
        >
          <CoolIcon 
            name={tab.icon} 
            size={20} 
            color={activeTab === tab.id ? '#FFFFFF' : '#666666'} 
          />
          <Text
            style={[
              homeStyles.tabText,
              activeTab === tab.id && homeStyles.activeTabText,
            ]}
          >
            {tab.name}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default HomeTabs;
