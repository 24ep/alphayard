import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CircleMoodSummary } from './CircleMoodSummary';
import { CircleSelectionTabs } from '../common/CircleSelectionTabs';
import { useBranding } from '../../contexts/BrandingContext';
import { Activity } from 'lucide-react-native';

const ActivityIcon = Activity as any;

interface CircleHealthTabProps {
  emotionData: any[];
}

export const CircleHealthTab: React.FC<CircleHealthTabProps> = ({ emotionData }) => {
  const [activeTab, setActiveTab] = useState('common');
  const { categories } = useBranding();

  // Fetch configuration for health tabs from branding (admin config)
  const healthTabsConfig = useMemo(() => {
    if (!categories) return null;
    for (const cat of categories) {
      const comp = cat.components.find(c => c.id === 'health-selection-tabs');
      if (comp) return comp;
    }
    return null;
  }, [categories]);

  const config = healthTabsConfig?.config || {};

  const tabs = [
      { id: 'common', label: 'Common', icon: 'emoticon-happy' }, // Using lucide name equivalent if possible, or mapping
      { id: 'metrics', label: 'Metrics', icon: 'chart-line' }
  ];

  // Map icon names to Lucide components if needed, or CircleSelectionTabs handles it?
  // CircleSelectionTabs usually takes a string icon name and renders dynamic icon or standard mapping.
  // Let's assume standard mapping or passing component if supported. 
  // For now, passing ID/Label is key.
  
  const renderContent = () => {
    switch (activeTab) {
      case 'common':
        return (
          <View style={[styles.sectionPadding, styles.card, { marginTop: 12 }]}>
               <Text style={[styles.sectionTitle, { marginBottom: 12 }]}>Circle Mood</Text>
               <CircleMoodSummary
                  onPress={() => console.log("Go to Mood Analyst")}
                  emotionData={emotionData}
              />
          </View>
        );
      case 'metrics':
        return (
          <View style={[styles.sectionPadding, styles.card, { marginTop: 12 }]}>
              <Text style={[styles.sectionTitle, { marginBottom: 12 }]}>Health Metrics</Text>
              <View style={styles.placeholderContainer}>
                  <ActivityIcon size={32} color="#9CA3AF" />
                  <Text style={styles.placeholderText}>Health metrics coming soon</Text>
              </View>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
        <View style={styles.tabsContainer}>
            <CircleSelectionTabs
                tabs={tabs}
                activeTab={activeTab}
                onTabPress={setActiveTab}
                activeColor={config.activeColor || "#1d1515ff"}
                inactiveColor={config.inactiveColor || "#F3F4F6"}
                activeTextColor={config.activeTextColor || "#fcfcfcff"}
                inactiveTextColor={config.inactiveTextColor || "#6B7280"}
                activeIconColor={config.activeIconColor || "#FFFFFF"}
                inactiveIconColor={config.inactiveIconColor || "#6B7280"}
                menuBackgroundColor={config.menuBackgroundColor || 'transparent'}
                fit={true}
                menuShowShadow={config.menuShowShadow}
                activeShowShadow={config.activeShowShadow}
                inactiveShowShadow={config.inactiveShowShadow}
            />
        </View>
        {renderContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabsContainer: {
      paddingHorizontal: 0,
      marginBottom: 0,
  },
  card: {
    backgroundColor: 'transparent',
    borderRadius: 0, 
  },
  sectionPadding: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    fontFamily: 'Outfit-Bold', // Assuming Outfit font used
  },
  placeholderContainer: {
    minHeight: 120,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  placeholderText: {
    marginTop: 8,
    color: '#9CA3AF',
    fontSize: 13,
  }
});
