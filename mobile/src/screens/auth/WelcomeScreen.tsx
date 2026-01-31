import React, { useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../contexts/AuthContext';
import { useBranding } from '../../contexts/BrandingContext';
import { ScreenBackground } from '../../components/ScreenBackground';
import { mapScreenConfigToBackground } from '../../utils/brandingUtils';
import { FONT_STYLES } from '../../utils/fontUtils';

interface WelcomeScreenProps {
  navigation: any;
  route: any;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  const { user, isAuthenticated } = useAuth();
  const { screens } = useBranding();
  
  // Find configuration for this screen
  const screenConfig = useMemo(() => {
    return screens?.find(s => s.id.toLowerCase() === 'welcome') || screens?.find(s => s.id.toLowerCase() === 'onboarding');
  }, [screens]);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const iconRotateAnim = useRef(new Animated.Value(0)).current;
  const checkmarkScaleAnim = useRef(new Animated.Value(0)).current;

  // Convert ColorValue to BackgroundConfig for DynamicBackground
  const backgroundConfig = useMemo(() => {
    return mapScreenConfigToBackground(screenConfig);
  }, [screenConfig]);

  useEffect(() => {
    // Start animations
    startAnimations();

    // Navigate to home screen after 5 seconds
    const timer = setTimeout(() => {
      // The RootNavigator will automatically switch to App navigator
      // when isAuthenticated becomes true
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigation]);

  // If user becomes authenticated before the 5 seconds, we can show a success message
  useEffect(() => {
    if (isAuthenticated && user) {
      // User is now authenticated, the RootNavigator will handle the transition
      console.log('User authenticated, transitioning to main app...');
    }
  }, [isAuthenticated, user]);

  const startAnimations = () => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Scale animation for main content
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();

    // Slide up animation
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Icon rotation animation
    Animated.timing(iconRotateAnim, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: true,
    }).start();

    // Checkmark animation (delayed)
    setTimeout(() => {
      Animated.spring(checkmarkScaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 3,
        useNativeDriver: true,
      }).start();
    }, 800);
  };

  const iconRotation = iconRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const getWelcomeMessage = () => {
    if (user?.firstName) {
      return `Welcome, ${user.firstName}!`;
    }
    return screenConfig?.name ? `${screenConfig.name}` : 'Welcome to Bondarys!';
  };

  const getSubMessage = () => {
    if (screenConfig?.description) {
        return screenConfig.description;
    }
    if (user?.firstName) {
      return `Your Circle is ready to stay connected`;
    }
    return 'Your Circle connection journey begins now';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScreenBackground background={backgroundConfig} style={styles.background}>
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [
                { scale: scaleAnim },
                { translateY: slideAnim },
              ],
            },
          ]}
        >
          {/* Main Icon */}
          <Animated.View
            style={[
              styles.iconContainer,
              {
                transform: [{ rotate: iconRotation }],
              },
            ]}
          >
            <Icon name="house-03" size={80} color="#FFFFFF" />
          </Animated.View>

          {/* Checkmark */}
          <Animated.View
            style={[
              styles.checkmarkContainer,
              {
                transform: [{ scale: checkmarkScaleAnim }],
              },
            ]}
          >
            <Icon name="check-circle" size={40} color="#10B981" />
          </Animated.View>

          {/* Welcome Text */}
          <View style={styles.textContainer}>
            <Text style={styles.welcomeTitle}>{getWelcomeMessage()}</Text>
            <Text style={styles.welcomeSubtitle}>{getSubMessage()}</Text>
          </View>

          {/* Features List */}
          <View style={styles.featuresContainer}>
            <View style={styles.featureItem}>
              <Icon name="house-03" size={24} color="#FFFFFF" />
              <Text style={styles.featureText}>Circle Connected</Text>
            </View>
            <View style={styles.featureItem}>
              <Icon name="shield-check" size={24} color="#FFFFFF" />
              <Text style={styles.featureText}>Safety First</Text>
            </View>
            <View style={styles.featureItem}>
              <Icon name="map-marker" size={24} color="#FFFFFF" />
              <Text style={styles.featureText}>Location Sharing</Text>
            </View>
          </View>

          {/* Loading Indicator */}
          <View style={styles.loadingContainer}>
            <View style={styles.loadingBar}>
              <Animated.View
                style={[
                  styles.loadingProgress,
                  {
                    width: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    }),
                  },
                ]}
              />
            </View>
            <Text style={styles.loadingText}>Setting up your account...</Text>
          </View>
        </Animated.View>
      </ScreenBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 40,
    width: '100%',
  },
  iconContainer: {
    marginBottom: 30,
    position: 'relative',
  },
  checkmarkContainer: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 4,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
    fontFamily: FONT_STYLES.englishHeading,
  },
  welcomeSubtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 24,
    fontFamily: FONT_STYLES.englishBody,
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 60,
  },
  featureItem: {
    alignItems: 'center',
    flex: 1,
  },
  featureText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '500',
  },
  loadingContainer: {
    alignItems: 'center',
    width: '100%',
  },
  loadingBar: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    marginBottom: 16,
    overflow: 'hidden',
  },
  loadingProgress: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  loadingText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
});

export default WelcomeScreen;


