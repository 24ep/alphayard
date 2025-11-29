import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';

export interface SegmentedTabItem {
  id: string;
  label: string;
  icon?: string;
}

interface SegmentedTabsProps {
  tabs: SegmentedTabItem[];
  activeId: string;
  onChange: (id: string) => void;
}

const SegmentedTabs: React.FC<SegmentedTabsProps> = ({ tabs, activeId, onChange }) => {
  return (
    <View style={styles.container}>
      {tabs.map(tab => (
        <TouchableOpacity
          key={tab.id}
          onPress={() => onChange(tab.id)}
          style={[styles.tab, activeId === tab.id && styles.activeTab]}
        >
          {tab.icon && (
            <IconMC name={tab.icon} size={16} color={activeId === tab.id ? '#FFB6C1' : '#9CA3AF'} />
          )}
          <Text style={[styles.label, activeId === tab.id && styles.activeLabel]}>{tab.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 28,
    paddingVertical: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    gap: 6,
  },
  activeTab: {
    borderBottomColor: '#FFB6C1',
  },
  label: {
    marginLeft: 4,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  activeLabel: {
    color: '#FFB6C1',
  },
});

export default SegmentedTabs;


