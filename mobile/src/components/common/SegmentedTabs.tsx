import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';

const IconMC_Wrapped = IconMC as any;

export interface SegmentedTabItem {
  id: string;
  label: string;
  icon?: any;
}

import { useBranding } from '../../contexts/BrandingContext';

interface SegmentedTabsProps {
  tabs: SegmentedTabItem[];
  activeId: string;
  onChange: (id: string) => void;
  containerStyle?: any;
}

const resolveColor = (colorValue: any, defaultColor: string) => {
  if (!colorValue) return defaultColor;
  return colorValue.solid || defaultColor;
};

const SegmentedTabs: React.FC<SegmentedTabsProps> = ({ tabs, activeId, onChange, containerStyle }) => {
  const { categories } = useBranding();

  // Extract config
  const componentConfig = React.useMemo(() => {
    if (!categories) return null;
    for (const cat of categories) {
        const comp = cat.components.find(c => c.id === 'segmented-control');
        if (comp) return comp;
    }
    return null;
  }, [categories]);

  const brandingStyles = componentConfig?.styles;
  const config = componentConfig?.config || {};

  const activeColor = resolveColor(brandingStyles?.backgroundColor, '#FA7272'); // Use style bg as active? Or config?
  // Actually style bg usually means container bg. But here config overrides specifically.
  // Let's use config priorities.
  const effectiveActiveColor = config.activeColor || '#FA7272';
  const effectiveInactiveColor = config.inactiveColor || '#F3F4F6';
  const effectiveActiveFullColor = config.activeTextColor || '#FFFFFF';
  const effectiveInactiveFullColor = config.inactiveTextColor || '#6B7280';
  const radius = config.cornerRadius ?? 24;

  return (
    <View style={[styles.container, containerStyle]}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {tabs.map(tab => {
            const isActive = activeId === tab.id;
            const Icon = tab.icon;
            
            const bgColor = isActive ? effectiveActiveColor : effectiveInactiveColor;
            const fgColor = isActive ? effectiveActiveFullColor : effectiveInactiveFullColor;

            return (
              <TouchableOpacity
                key={tab.id}
                onPress={() => onChange(tab.id)}
                style={[
                    styles.tab, 
                    { 
                        backgroundColor: bgColor,
                        borderRadius: radius
                    },
                    isActive && styles.activeTab // keep default padding overrides if exist
                ]}
              >
                {Icon && (
                  typeof Icon === 'string' ? (
                    <IconMC_Wrapped name={Icon} size={22} color={fgColor} />
                  ) : (
                    <Icon size={22} color={fgColor} />
                  )
                )}
                <Text style={[styles.label, { color: fgColor, fontWeight: '600', fontSize: 16 }]}>{tab.label}</Text>
              </TouchableOpacity>
            );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 0,
    paddingVertical: 0,
  },
  scrollContent: {
    paddingHorizontal: 0, 
    gap: 24, 
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 24,
    gap: 8,
  },
  activeTab: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  activeLabel: {
    color: '#FFFFFF',
  },
});

export default SegmentedTabs;
