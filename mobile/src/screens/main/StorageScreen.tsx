import React, { useRef, useState, useEffect } from 'react';
import { Animated, View } from 'react-native';
import MainScreenLayout from '../../components/layout/MainScreenLayout';
import StorageApp from '../../components/apps/StorageApp';
import { useNavigationAnimation } from '../../contexts/NavigationAnimationContext';

const StorageScreen: React.FC = () => {
  const { cardMarginTopAnim } = useNavigationAnimation();

  const [showCircleDropdown, setShowCircleDropdown] = useState(false);
  const [selectedCircle, setSelectedCircle] = useState('Smith Circle');
  const [circleMembers] = useState<any[]>([]);

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
      selectedCircle={selectedCircle}
      onToggleCircleDropdown={() => setShowCircleDropdown(!showCircleDropdown)}
      showCircleDropdown={showCircleDropdown}
      circleMembers={circleMembers}
      cardMarginTopAnim={cardMarginTopAnim}
      cardOpacityAnim={cardOpacityAnim}
    >
      <View style={{ flex: 1 }}>
        <StorageApp circleId={selectedCircle} />
      </View>
    </MainScreenLayout>
  );
};

export default StorageScreen;



