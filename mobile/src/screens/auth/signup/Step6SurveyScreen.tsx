import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { FONT_STYLES } from '../../../utils/fontUtils';
import { useAuth } from '../../../contexts/AuthContext';
import { useBranding } from '../../../contexts/BrandingContext';
import { SurveySlide, SurveyConfig } from '../../../services/api/branding';

interface Step6SurveyScreenProps {
  navigation: any;
  route: any;
}

// Default fallback questions if no admin config
const DEFAULT_SURVEY_SLIDES: SurveySlide[] = [
  {
    id: 'interests',
    question: 'What are you interested in?',
    type: 'multiple_choice',
    icon: 'star',
    options: [
      'Circle Activities', 'Health & Wellness', 'Safety & Security', 
      'Financial Planning', 'Education', 'Travel', 'Technology', 
      'Cooking', 'Sports', 'Entertainment'
    ]
  },
  {
    id: 'personality',
    question: 'What describes you best?',
    type: 'multiple_choice',
    icon: 'account',
    options: [
      'Outgoing & Social', 'Analytical & Detail-oriented', 'Creative & Artistic',
      'Organized & Structured', 'Adventurous & Spontaneous', 'Caring & Empathetic',
      'Practical & Down-to-earth', 'Ambitious & Goal-oriented'
    ]
  },
  {
    id: 'expectations',
    question: 'What do you expect from this app?',
    type: 'multiple_choice',
    icon: 'target',
    options: [
      'Better Circle Connection', 'Safety & Peace of Mind', 'Better Organization',
      'Improved Communication', 'Circle Coordination', 'Emergency Support',
      'Memory & Photo Sharing', 'Schedule Management'
    ]
  },
  {
    id: 'howDidYouHear',
    question: 'How did you hear about us?',
    type: 'single_choice',
    icon: 'bullhorn',
    options: [
      'Social Media', 'Friend or Circle', 'App Store Search',
      'Google Search', 'Advertisement', 'Blog or Article', 'Podcast', 'Other'
    ]
  }
];

// Icon mapping for options (used for visual display)
const OPTION_ICONS: Record<string, string> = {
  'Circle Activities': 'account-group',
  'Health & Wellness': 'heart-pulse',
  'Safety & Security': 'shield-check',
  'Financial Planning': 'chart-line',
  'Education': 'school',
  'Travel': 'airplane',
  'Technology': 'laptop',
  'Cooking': 'chef-hat',
  'Sports': 'soccer',
  'Entertainment': 'movie',
  'Outgoing & Social': 'account-group',
  'Analytical & Detail-oriented': 'chart-line',
  'Creative & Artistic': 'palette',
  'Organized & Structured': 'calendar-check',
  'Adventurous & Spontaneous': 'compass',
  'Caring & Empathetic': 'heart',
  'Practical & Down-to-earth': 'tools',
  'Ambitious & Goal-oriented': 'target',
  'Better Circle Connection': 'heart-pulse',
  'Safety & Peace of Mind': 'shield-check',
  'Better Organization': 'calendar-check',
  'Improved Communication': 'message-text',
  'Circle Coordination': 'account-group',
  'Emergency Support': 'phone-alert',
  'Memory & Photo Sharing': 'camera',
  'Schedule Management': 'clock',
  'Social Media': 'share-variant',
  'Friend or Circle': 'account-heart',
  'App Store Search': 'store',
  'Google Search': 'google',
  'Advertisement': 'bullhorn',
  'Blog or Article': 'newspaper',
  'Podcast': 'podcast',
  'Other': 'dots-horizontal',
};

const Step6SurveyScreen: React.FC<Step6SurveyScreenProps> = ({ navigation, route }) => {
  const { signup } = useAuth();
  const { flows, isLoaded: brandingLoaded } = useBranding();
  
  // Store answers as a map of questionId -> selected options
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get survey config from admin or use defaults
  const surveyConfig = useMemo((): SurveyConfig => {
    if (flows?.survey?.enabled && flows?.survey?.slides?.length > 0) {
      return flows.survey;
    }
    return {
      enabled: true,
      trigger: 'after_onboarding',
      slides: DEFAULT_SURVEY_SLIDES
    };
  }, [flows?.survey]);

  const surveySlides = surveyConfig.slides;


  // Toggle option for a specific question
  const toggleOption = (questionId: string, option: string, type: 'single_choice' | 'multiple_choice' | 'text') => {
    setAnswers(prev => {
      const current = prev[questionId] || [];
      
      if (type === 'single_choice') {
        // Single choice: replace with new selection
        return { ...prev, [questionId]: [option] };
      } else {
        // Multiple choice: toggle the option
        if (current.includes(option)) {
          return { ...prev, [questionId]: current.filter(o => o !== option) };
        } else {
          return { ...prev, [questionId]: [...current, option] };
        }
      }
    });
  };

  // Check if an option is selected for a question
  const isOptionSelected = (questionId: string, option: string): boolean => {
    return answers[questionId]?.includes(option) || false;
  };

  // Get icon for an option
  const getOptionIcon = (option: string): string => {
    return OPTION_ICONS[option] || 'checkbox-blank-circle-outline';
  };


  const handleComplete = async () => {
    try {
      setIsSubmitting(true);
      
      // Transform answers to a more structured format for backend
      const surveyResponses = surveySlides.map(slide => ({
        questionId: slide.id,
        question: slide.question,
        type: slide.type,
        answers: answers[slide.id] || []
      }));

      // Prepare signup data
      const signupData = {
        email: route.params.email,
        password: route.params.password,
        firstName: route.params.firstName || '',
        lastName: route.params.lastName || '',
        phone: route.params.phoneNumber || '',
        dateOfBirth: route.params.dateOfBirth || '',
        userType: route.params.userType || 'circle',
        CircleOption: route.params.CircleOption,
        CircleCode: route.params.CircleCode || '',
        CircleName: route.params.CircleName || '',
        CircleType: route.params.CircleType || '',
        inviteEmails: route.params.inviteEmails || [],
        // Include both legacy format (for backward compatibility) and new format
        interests: answers['interests'] || [],
        personalityTraits: answers['personality'] || [],
        expectations: answers['expectations'] || [],
        howDidYouHear: answers['howDidYouHear']?.[0] || '',
        // New structured survey responses
        surveyResponses,
      };

      await signup(signupData);
      
      // Navigate to welcome screen
      navigation.navigate('Welcome');
    } catch (error: any) {
      console.error('Signup error:', error);
      Alert.alert(
        'Signup Failed',
        error.message || 'Failed to create account. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = async () => {
    try {
      setIsSubmitting(true);
      
      // Prepare signup data with empty survey responses
      const signupData = {
        email: route.params.email,
        password: route.params.password,
        firstName: route.params.firstName || '',
        lastName: route.params.lastName || '',
        phone: route.params.phoneNumber || '',
        dateOfBirth: route.params.dateOfBirth || '',
        userType: route.params.userType || 'circle',
        CircleOption: route.params.CircleOption,
        CircleCode: route.params.CircleCode || '',
        CircleName: route.params.CircleName || '',
        CircleType: route.params.CircleType || '',
        inviteEmails: route.params.inviteEmails || [],
        interests: [],
        personalityTraits: [],
        expectations: [],
        howDidYouHear: '',
        surveyResponses: [],
      };

      await signup(signupData);
      
      // Navigate to welcome screen
      navigation.navigate('Welcome');
    } catch (error: any) {
      console.error('Signup error:', error);
      Alert.alert(
        'Signup Failed',
        error.message || 'Failed to create account. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#FA7272', '#FFBBB4']}
        style={styles.gradient}
      >
        <ScrollView 
          style={styles.content} 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Icon name="arrow-left" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.stepIndicator}>
              <Text style={styles.stepText}>Step 6 of 6</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '100%' }]} />
              </View>
            </View>
          </View>

          {/* Title */}
          <View style={styles.titleContainer}>
            <View style={styles.titleIconContainer}>
              <Icon name="chart-line" size={32} color="#FFFFFF" />
            </View>
            <Text style={styles.title}>Almost Done!</Text>
            <Text style={styles.subtitle}>Help us personalize your experience with a quick survey</Text>
          </View>

          {/* Dynamic Survey Form */}
          <View style={styles.form}>
            {surveySlides.map((slide, index) => (
              <View key={slide.id} style={styles.section}>
                <Text style={styles.sectionTitle}>{slide.question}</Text>
                <Text style={styles.sectionDescription}>
                  {slide.type === 'single_choice' 
                    ? 'Select one option (optional)' 
                    : slide.type === 'multiple_choice'
                    ? 'Select all that apply (optional)'
                    : 'Enter your answer (optional)'}
                </Text>
                
                {slide.type === 'single_choice' ? (
                  // Single choice - radio button style
                  <View style={styles.howDidYouHearContainer}>
                    {slide.options.map((option) => (
                      <TouchableOpacity
                        key={option}
                        style={[
                          styles.howDidYouHearOption,
                          isOptionSelected(slide.id, option) && styles.howDidYouHearOptionSelected
                        ]}
                        onPress={() => toggleOption(slide.id, option, slide.type)}
                      >
                        <Icon 
                          name={getOptionIcon(option)} 
                          size={20} 
                          color={isOptionSelected(slide.id, option) ? '#bf4342' : '#FFFFFF'} 
                        />
                        <Text style={[
                          styles.howDidYouHearText,
                          isOptionSelected(slide.id, option) && styles.howDidYouHearTextSelected
                        ]}>
                          {option}
                        </Text>
                        <View style={[
                          styles.radioButton,
                          isOptionSelected(slide.id, option) && styles.radioButtonSelected
                        ]}>
                          {isOptionSelected(slide.id, option) && (
                            <Icon name="check" size={16} color="#FFFFFF" />
                          )}
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : slide.type === 'multiple_choice' ? (
                  // Multiple choice - chip style
                  <View style={styles.interestsGrid}>
                    {slide.options.map((option) => (
                      <TouchableOpacity
                        key={option}
                        style={[
                          styles.interestChip,
                          isOptionSelected(slide.id, option) && styles.interestChipSelected
                        ]}
                        onPress={() => toggleOption(slide.id, option, slide.type)}
                      >
                        <Icon 
                          name={getOptionIcon(option)} 
                          size={16} 
                          color={isOptionSelected(slide.id, option) ? '#bf4342' : 'rgba(255, 255, 255, 0.8)'} 
                        />
                        <Text style={[
                          styles.interestChipText,
                          isOptionSelected(slide.id, option) && styles.interestChipTextSelected
                        ]}>
                          {option}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : (
                  // Text input type (for future use)
                  <View style={styles.textInputContainer}>
                    <Text style={styles.textInputPlaceholder}>Text input coming soon...</Text>
                  </View>
                )}
              </View>
            ))}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.skipButton} 
              onPress={handleSkip}
              disabled={isSubmitting}
            >
              <Text style={styles.skipButtonText}>Skip & Complete</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.completeButton, isSubmitting && styles.completeButtonDisabled]} 
              onPress={handleComplete}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Text style={styles.completeButtonText}>Creating Account...</Text>
              ) : (
                <>
                  <Text style={styles.completeButtonText}>Complete Signup</Text>
                  <Icon name="check" size={20} color="#FFFFFF" />
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
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
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  stepIndicator: {
    flex: 1,
  },
  stepText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  titleContainer: {
    marginBottom: 40,
    alignItems: 'flex-start',
  },
  titleIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    fontFamily: FONT_STYLES.englishHeading,
    textAlign: 'left',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontFamily: FONT_STYLES.englishBody,
    textAlign: 'left',
  },
  form: {
    // Removed flex: 1 to allow proper scrolling
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
    fontFamily: FONT_STYLES.englishSemiBold,
  },
  sectionDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 16,
    fontFamily: FONT_STYLES.englishBody,
  },
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 2,
    borderColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  interestChipSelected: {
    backgroundColor: '#FFFFFF',
    borderColor: '#bf4342',
  },
  interestChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: FONT_STYLES.englishMedium,
  },
  interestChipTextSelected: {
    color: '#bf4342',
  },
  notificationsContainer: {
    gap: 12,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  notificationInfo: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
    fontFamily: FONT_STYLES.englishSemiBold,
  },
  notificationDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 18,
    fontFamily: FONT_STYLES.englishBody,
  },
  toggle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: '#bf4342',
    borderColor: '#bf4342',
  },
  actionButtons: {
    gap: 12,
    marginBottom: 20,
  },
  skipButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  skipButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: FONT_STYLES.englishSemiBold,
  },
  completeButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  completeButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  completeButtonText: {
    color: '#bf4342',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: FONT_STYLES.englishSemiBold,
  },
  // Personality Traits Styles
  personalityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  personalityChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 25,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 2,
    borderColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: '45%',
  },
  personalityChipSelected: {
    backgroundColor: '#FFFFFF',
    borderColor: '#bf4342',
  },
  personalityChipText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: FONT_STYLES.englishMedium,
    flex: 1,
  },
  personalityChipTextSelected: {
    color: '#bf4342',
  },
  // Expectation Styles
  expectationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  expectationChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 25,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 2,
    borderColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: '45%',
  },
  expectationChipSelected: {
    backgroundColor: '#FFFFFF',
    borderColor: '#bf4342',
  },
  expectationChipText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: FONT_STYLES.englishMedium,
    flex: 1,
  },
  expectationChipTextSelected: {
    color: '#bf4342',
  },
  // How Did You Hear Styles
  howDidYouHearContainer: {
    gap: 12,
  },
  howDidYouHearOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  howDidYouHearOptionSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderColor: '#FFFFFF',
  },
  howDidYouHearText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: FONT_STYLES.englishMedium,
    flex: 1,
  },
  howDidYouHearTextSelected: {
    color: '#FFFFFF',
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    backgroundColor: '#bf4342',
    borderColor: '#bf4342',
  },
  textInputContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  textInputPlaceholder: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    fontFamily: FONT_STYLES.englishBody,
    fontStyle: 'italic',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 12,
    fontFamily: FONT_STYLES.englishBody,
  },
});

export default Step6SurveyScreen;
