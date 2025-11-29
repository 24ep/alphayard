import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../contexts/AuthContext';

const { width, height } = Dimensions.get('window');

interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  icon: string;
  color: string;
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: 1,
    title: 'Welcome to Bondarys',
    description: 'Your hourse\'s digital home for staying connected, safe, and organized.',
    icon: 'heart',
    color: '#FF5A5A',
  },
  {
    id: 2,
    title: 'Stay Connected',
    description: 'Share moments, chat with hourse members, and stay updated with everyone\'s activities.',
    icon: 'account-group',
    color: '#4CAF50',
  },
  {
    id: 3,
    title: 'Safety First',
    description: 'Location sharing, emergency alerts, and safety checks to keep your hourse protected.',
    icon: 'shield-check',
    color: '#2196F3',
  },
  {
    id: 4,
    title: 'Organize Together',
    description: 'Manage hourse calendar, tasks, expenses, and important documents in one place.',
    icon: 'calendar-check',
    color: '#FF9800',
  },
];

const OnboardingScreen: React.FC = () => {
  const { completeOnboarding } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = async () => {
    setIsCompleting(true);
    try {
      await completeOnboarding();
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      // Still proceed even if API call fails
      setIsCompleting(false);
    }
  };

  const currentStepData = onboardingSteps[currentStep];
  const isLastStep = currentStep === onboardingSteps.length - 1;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[currentStepData.color, '#E8B4A1']}
        style={styles.gradient}
      >
        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            {onboardingSteps.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.progressDot,
                  index <= currentStep && styles.progressDotActive,
                ]}
              />
            ))}
          </View>
          <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            {/* Icon */}
            <View style={[styles.iconContainer, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
              <Icon name={currentStepData.icon} size={80} color="#FFFFFF" />
            </View>

            {/* Title */}
            <Text style={styles.title}>{currentStepData.title}</Text>

            {/* Description */}
            <Text style={styles.description}>{currentStepData.description}</Text>

            {/* Features List for specific steps */}
            {currentStep === 1 && (
              <View style={styles.featuresList}>
                <View style={styles.featureItem}>
                  <Icon name="check-circle" size={20} color="#FFFFFF" />
                  <Text style={styles.featureText}>hourse chat and messaging</Text>
                </View>
                <View style={styles.featureItem}>
                  <Icon name="check-circle" size={20} color="#FFFFFF" />
                  <Text style={styles.featureText}>Photo and memory sharing</Text>
                </View>
                <View style={styles.featureItem}>
                  <Icon name="check-circle" size={20} color="#FFFFFF" />
                  <Text style={styles.featureText}>Real-time location tracking</Text>
                </View>
                <View style={styles.featureItem}>
                  <Icon name="check-circle" size={20} color="#FFFFFF" />
                  <Text style={styles.featureText}>hourse calendar and events</Text>
                </View>
              </View>
            )}

            {currentStep === 2 && (
              <View style={styles.featuresList}>
                <View style={styles.featureItem}>
                  <Icon name="check-circle" size={20} color="#FFFFFF" />
                  <Text style={styles.featureText}>Group and private messaging</Text>
                </View>
                <View style={styles.featureItem}>
                  <Icon name="check-circle" size={20} color="#FFFFFF" />
                  <Text style={styles.featureText}>Photo and video sharing</Text>
                </View>
                <View style={styles.featureItem}>
                  <Icon name="check-circle" size={20} color="#FFFFFF" />
                  <Text style={styles.featureText}>hourse status updates</Text>
                </View>
                <View style={styles.featureItem}>
                  <Icon name="check-circle" size={20} color="#FFFFFF" />
                  <Text style={styles.featureText}>Push notifications</Text>
                </View>
              </View>
            )}

            {currentStep === 3 && (
              <View style={styles.featuresList}>
                <View style={styles.featureItem}>
                  <Icon name="check-circle" size={20} color="#FFFFFF" />
                  <Text style={styles.featureText}>Real-time location sharing</Text>
                </View>
                <View style={styles.featureItem}>
                  <Icon name="check-circle" size={20} color="#FFFFFF" />
                  <Text style={styles.featureText}>Emergency alert system</Text>
                </View>
                <View style={styles.featureItem}>
                  <Icon name="check-circle" size={20} color="#FFFFFF" />
                  <Text style={styles.featureText}>Safety check-ins</Text>
                </View>
                <View style={styles.featureItem}>
                  <Icon name="check-circle" size={20} color="#FFFFFF" />
                  <Text style={styles.featureText}>Geofencing alerts</Text>
                </View>
              </View>
            )}

            {currentStep === 4 && (
              <View style={styles.featuresList}>
                <View style={styles.featureItem}>
                  <Icon name="check-circle" size={20} color="#FFFFFF" />
                  <Text style={styles.featureText}>Shared hourse calendar</Text>
                </View>
                <View style={styles.featureItem}>
                  <Icon name="check-circle" size={20} color="#FFFFFF" />
                  <Text style={styles.featureText}>Task and chore management</Text>
                </View>
                <View style={styles.featureItem}>
                  <Icon name="check-circle" size={20} color="#FFFFFF" />
                  <Text style={styles.featureText}>Expense tracking</Text>
                </View>
                <View style={styles.featureItem}>
                  <Icon name="check-circle" size={20} color="#FFFFFF" />
                  <Text style={styles.featureText}>Document storage</Text>
                </View>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Navigation Buttons */}
        <View style={styles.navigationContainer}>
          <View style={styles.buttonRow}>
            {currentStep > 0 && (
              <TouchableOpacity
                style={styles.previousButton}
                onPress={handlePrevious}
              >
                <Icon name="arrow-left" size={20} color="#FFFFFF" />
                <Text style={styles.previousButtonText}>Previous</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.nextButton, isCompleting && styles.nextButtonDisabled]}
              onPress={handleNext}
              disabled={isCompleting}
            >
              <Text style={styles.nextButtonText}>
                {isLastStep ? 'Get Started' : 'Next'}
              </Text>
              {!isLastStep && <Icon name="arrow-right" size={20} color="#FFFFFF" />}
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 10,
  },
  progressBar: {
    flexDirection: 'row',
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  progressDotActive: {
    backgroundColor: '#FFFFFF',
  },
  skipButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  skipText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 30,
  },
  featuresList: {
    width: '100%',
    maxWidth: 300,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
  },
  navigationContainer: {
    paddingHorizontal: 24,
    paddingBottom: 30,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  previousButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 25,
    gap: 8,
  },
  previousButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 25,
    gap: 8,
  },
  nextButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  nextButtonText: {
    color: '#FF5A5A',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default OnboardingScreen;
