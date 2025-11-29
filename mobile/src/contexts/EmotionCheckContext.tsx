import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useNavigationState } from '@react-navigation/native';
import { emotionService } from '../services/emotionService';
import TemperatureCheckModal from '../components/TemperatureCheckModal';

interface EmotionCheckContextType {
  showEmotionCheck: () => void;
  hideEmotionCheck: () => void;
  isModalVisible: boolean;
}

const EmotionCheckContext = createContext<EmotionCheckContextType | undefined>(undefined);

interface EmotionCheckProviderProps {
  children: ReactNode;
}

export const EmotionCheckProvider: React.FC<EmotionCheckProviderProps> = ({ children }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [hasCheckedToday, setHasCheckedToday] = useState(false);
  
  // Get current route to check if user is on home screen
  const navigationState = useNavigationState(state => state);
  const isOnHomeScreen = navigationState?.routes?.[navigationState.index]?.name === 'Home';

  useEffect(() => {
    // Check if user has already done emotion check today when app starts
    checkEmotionStatus();

    // Listen for app state changes to check when app becomes active
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        checkEmotionStatus();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription?.remove();
    };
  }, [isOnHomeScreen]); // Re-check when navigation state changes

  const checkEmotionStatus = async () => {
    try {
      const hasChecked = await emotionService.hasCheckedToday();
      setHasCheckedToday(hasChecked);
      
      // Show modal only if user hasn't checked today, it's not already visible, and user is on home screen
      if (!hasChecked && !isModalVisible && isOnHomeScreen) {
        // Add a small delay to ensure the app is fully loaded
        setTimeout(() => {
          setIsModalVisible(true);
        }, 1000);
      }
    } catch (error) {
      console.error('Error checking emotion status:', error);
    }
  };

  const showEmotionCheck = () => {
    setIsModalVisible(true);
  };

  const hideEmotionCheck = () => {
    setIsModalVisible(false);
  };

  const handleEmotionSubmit = async (emotion: number) => {
    try {
      await emotionService.submitEmotionCheck(emotion);
      setHasCheckedToday(true);
      console.log('Emotion check submitted successfully');
    } catch (error) {
      console.error('Error submitting emotion check:', error);
      throw error;
    }
  };

  const contextValue: EmotionCheckContextType = {
    showEmotionCheck,
    hideEmotionCheck,
    isModalVisible,
  };

  return (
    <EmotionCheckContext.Provider value={contextValue}>
      {children}
      <TemperatureCheckModal
        visible={isModalVisible}
        onClose={hideEmotionCheck}
        onSubmit={handleEmotionSubmit}
      />
    </EmotionCheckContext.Provider>
  );
};

export const useEmotionCheck = (): EmotionCheckContextType => {
  const context = useContext(EmotionCheckContext);
  if (context === undefined) {
    throw new Error('useEmotionCheck must be used within an EmotionCheckProvider');
  }
  return context;
};
