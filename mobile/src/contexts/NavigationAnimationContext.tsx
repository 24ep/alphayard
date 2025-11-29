import React, { createContext, useContext, useRef, ReactNode } from 'react';
import { Animated } from 'react-native';

interface NavigationAnimationContextType {
  // Card animations
  cardScaleAnim: Animated.Value;
  cardOpacityAnim: Animated.Value;
  cardMarginTopAnim: Animated.Value;
  
  // Header animations
  familyNameScaleAnim: Animated.Value;
  welcomeOpacityAnim: Animated.Value;
  chatOpacityAnim: Animated.Value;
  
  // Animation methods
  animateToGallery: () => void;
  animateToHome: () => void;
}

const NavigationAnimationContext = createContext<NavigationAnimationContextType | undefined>(undefined);

export const useNavigationAnimation = () => {
  const context = useContext(NavigationAnimationContext);
  if (!context) {
    throw new Error('useNavigationAnimation must be used within NavigationAnimationProvider');
  }
  return context;
};

interface NavigationAnimationProviderProps {
  children: ReactNode;
}

export const NavigationAnimationProvider: React.FC<NavigationAnimationProviderProps> = ({ children }) => {
  // Animation values
  const cardScaleAnim = useRef(new Animated.Value(1)).current;
  const cardOpacityAnim = useRef(new Animated.Value(1)).current;
  const cardMarginTopAnim = useRef(new Animated.Value(16)).current;
  
  const familyNameScaleAnim = useRef(new Animated.Value(1)).current;
  const welcomeOpacityAnim = useRef(new Animated.Value(1)).current;
  const chatOpacityAnim = useRef(new Animated.Value(1)).current;

  const animateToGallery = () => {
    Animated.parallel([
      // Card animations - only move up (no scale)
      Animated.timing(cardMarginTopAnim, {
        toValue: 40,
        duration: 600,
        useNativeDriver: false,
      }),
      // hourse name scale down
      Animated.timing(familyNameScaleAnim, {
        toValue: 0.8,
        duration: 600,
        useNativeDriver: true,
      }),
      // Hide welcome text
      Animated.timing(welcomeOpacityAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      // Hide chat
      Animated.timing(chatOpacityAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animateToHome = () => {
    Animated.parallel([
      // Card animations - return to normal (no scale)
      Animated.timing(cardMarginTopAnim, {
        toValue: 16,
        duration: 600,
        useNativeDriver: false,
      }),
      // hourse name scale back to normal
      Animated.timing(familyNameScaleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      // Show welcome text
      Animated.timing(welcomeOpacityAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      // Show chat
      Animated.timing(chatOpacityAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const value: NavigationAnimationContextType = {
    cardScaleAnim,
    cardOpacityAnim,
    cardMarginTopAnim,
    familyNameScaleAnim,
    welcomeOpacityAnim,
    chatOpacityAnim,
    animateToGallery,
    animateToHome,
  };

  return (
    <NavigationAnimationContext.Provider value={value}>
      {children}
    </NavigationAnimationContext.Provider>
  );
};
