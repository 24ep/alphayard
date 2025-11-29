import React, { useRef, useState, useEffect } from 'react';
import { Animated, View } from 'react-native';
import MainScreenLayout from '../../components/layout/MainScreenLayout';
import StorageApp from '../../components/apps/StorageApp';
import { useNavigationAnimation } from '../../contexts/NavigationAnimationContext';

const StorageScreen: React.FC = () => {
  const { cardMarginTopAnim } = useNavigationAnimation();

  const [showFamilyDropdown, setShowFamilyDropdown] = useState(false);
  const [selectedFamily, setSelectedFamily] = useState('Smith Family');
  const [familyMembers] = useState<any[]>([]);

  const cardOpacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(cardOpacityAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <MainScreenLayout
      selectedFamily={selectedFamily}
      onToggleFamilyDropdown={() => setShowFamilyDropdown(!showFamilyDropdown)}
      showFamilyDropdown={showFamilyDropdown}
      familyMembers={familyMembers}
      cardMarginTopAnim={cardMarginTopAnim}
      cardOpacityAnim={cardOpacityAnim}
    >
      <View style={{ flex: 1 }}>
        <StorageApp familyId={selectedFamily} />
      </View>
    </MainScreenLayout>
  );
};

export default StorageScreen;


