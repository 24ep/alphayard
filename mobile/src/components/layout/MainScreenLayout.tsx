import React, { ReactNode, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Animated, View } from 'react-native';
import { WelcomeSection } from '../home/WelcomeSection';

interface MainScreenLayoutProps {
  selectedFamily: string;
  showFamilyDropdown: boolean;
  onToggleFamilyDropdown: () => void;
  familyMembers?: any[];
  cardMarginTopAnim?: Animated.AnimatedInterpolation<string | number> | Animated.Value;
  cardOpacityAnim?: Animated.Value;
  children: ReactNode;
}

export const MainScreenLayout: React.FC<MainScreenLayoutProps> = ({
  selectedFamily,
  showFamilyDropdown,
  onToggleFamilyDropdown,
  familyMembers = [],
  cardMarginTopAnim,
  cardOpacityAnim,
  children,
}) => {
  return (
    <LinearGradient
      colors={['#FA7272', '#FFBBB4']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <WelcomeSection
          selectedFamily={selectedFamily}
          onFamilyDropdownPress={onToggleFamilyDropdown}
          showFamilyDropdown={showFamilyDropdown}
          familyMembers={familyMembers}
        />

        <Animated.View
          style={{
            flex: 1,
            backgroundColor: '#FFFFFF',
            borderTopLeftRadius: 32,
            borderTopRightRadius: 32,
            marginTop: cardMarginTopAnim || 0,
            opacity: cardOpacityAnim || 1,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 8,
          }}
        >
          {children}
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default MainScreenLayout;


