import React, { useState, useRef } from 'react';
import {
  View,
  Dimensions,
  FlatList,
  Animated,
} from 'react-native';
import {
  Box,
  Text,
  VStack,
  HStack,
  Button,
  Icon,
  useToast,
} from 'native-base';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

const { width: screenWidth } = Dimensions.get('window');

interface OnboardingItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
}

const onboardingData: OnboardingItem[] = [
  {
    id: '1',
    title: 'Welcome to Bondarys',
    description: 'Connect with your hourse and stay safe together with our comprehensive hourse safety app.',
    icon: 'home-heart',
    color: '#4A90E2',
  },
  {
    id: '2',
    title: 'Real-time Location',
    description: 'Know where your hourse members are and get notified when they arrive safely.',
    icon: 'map-marker-radius',
    color: '#7ED321',
  },
  {
    id: '3',
    title: 'Emergency Alerts',
    description: 'Send instant alerts to hourse members in case of emergencies.',
    icon: 'alert-circle',
    color: '#D0021B',
  },
  {
    id: '4',
    title: 'hourse Communication',
    description: 'Stay connected with group chats, voice calls, and hourse events.',
    icon: 'message-text',
    color: '#F5A623',
  },
];

const OnboardingScreen: React.FC = () => {
  const navigation = useNavigation();
  const toast = useToast();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false }
  );

  const handleViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      handleGetStarted();
    }
  };

  const handleSkip = () => {
    handleGetStarted();
  };

  const handleGetStarted = async () => {
    setLoading(true);
    try {
      // Navigate to hourse setup
      navigation.navigate('FamilySetup' as never);
    } catch (error) {
      console.error('Navigation error:', error);
      toast.show({
        description: 'An error occurred. Please try again.',
        status: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const renderOnboardingItem = ({ item }: { item: OnboardingItem }) => {
    return (
      <Box width={screenWidth} px={6} py={8}>
        <VStack space={8} flex={1} alignItems="center" justifyContent="center">
          {/* Icon */}
          <Box
            w={120}
            h={120}
            borderRadius="full"
            bg={`${item.color}20`}
            alignItems="center"
            justifyContent="center"
          >
            <Icon
              as={MaterialCommunityIcons}
              name={item.icon as any}
              size="4xl"
              color={item.color}
            />
          </Box>

          {/* Content */}
          <VStack space={4} alignItems="center" maxW="80%">
            <Text fontSize="2xl" fontWeight="bold" color="gray.800" textAlign="center">
              {item.title}
            </Text>
            <Text fontSize="md" color="gray.600" textAlign="center" lineHeight="lg">
              {item.description}
            </Text>
          </VStack>
        </VStack>
      </Box>
    );
  };

  const renderDots = () => {
    return (
      <HStack space={2} justifyContent="center" mt={8}>
        {onboardingData.map((_, index) => {
          const inputRange = [
            (index - 1) * screenWidth,
            index * screenWidth,
            (index + 1) * screenWidth,
          ];

          const scale = scrollX.interpolate({
            inputRange,
            outputRange: [0.8, 1.2, 0.8],
            extrapolate: 'clamp',
          });

          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.4, 1, 0.4],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              key={index}
              style={{
                transform: [{ scale }],
                opacity,
              }}
            >
              <Box
                w={3}
                h={3}
                borderRadius="full"
                bg={index === currentIndex ? 'primary.500' : 'gray.300'}
              />
            </Animated.View>
          );
        })}
      </HStack>
    );
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <Box flex={1} bg="white">
      {/* Skip Button */}
      <Box position="absolute" top={12} right={6} zIndex={1}>
        <Button
          variant="ghost"
          size="sm"
          onPress={handleSkip}
          _text={{ color: 'gray.500' }}
        >
          Skip
        </Button>
      </Box>

      {/* Onboarding Content */}
      <FlatList
        ref={flatListRef}
        data={onboardingData}
        renderItem={renderOnboardingItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        scrollEventThrottle={16}
      />

      {/* Bottom Section */}
      <Box px={6} pb={8}>
        {renderDots()}

        <VStack space={4} mt={8}>
          <Button
            size="lg"
            onPress={handleNext}
          >
            {currentIndex === onboardingData.length - 1 ? 'Get Started' : 'Next'}
          </Button>

          {currentIndex < onboardingData.length - 1 && (
            <Button
              variant="ghost"
              size="lg"
              onPress={handleSkip}
            >
              Skip
            </Button>
          )}
        </VStack>
      </Box>
    </Box>
  );
};

export default OnboardingScreen; 