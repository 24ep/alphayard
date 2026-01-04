import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { FONT_STYLES } from '../../../utils/fontUtils';

interface Step3FamilyScreenProps {
  navigation: any;
  route: any;
}

const Step3FamilyScreen: React.FC<Step3FamilyScreenProps> = ({ navigation, route }) => {
  const { email, phone, password } = route.params;
  const [familyOption, setFamilyOption] = useState<'create' | 'join' | null>(null);
  const [familyCode, setFamilyCode] = useState('');
  const [errors, setErrors] = useState<{ familyCode?: string }>({});

  const handleCreateFamily = () => {
    setFamilyOption('create');
    setFamilyCode('');
    setErrors({});
    // Automatically navigate to the next screen
    navigation.navigate('Step3CreateFamily', {
      email,
      phone,
      password
    });
  };

  const handleJoinFamily = () => {
    setFamilyOption('join');
    setErrors({});
  };

  const handleNext = () => {
    if (familyOption !== 'join') {
      Alert.alert('Selection Required', 'Please choose to join an existing hourse.');
      return;
    }

    const newErrors: { familyCode?: string } = {};

    if (!familyCode.trim()) {
      newErrors.familyCode = 'hourse code is required';
    } else if (familyCode.length < 6) {
      newErrors.familyCode = 'hourse code must be at least 6 characters';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      navigation.navigate('Step3JoinFamily', {
        email,
        phone,
        password,
        familyOption: 'join'
      });
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
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}
        >
          <ScrollView style={styles.scrollContent} contentContainerStyle={styles.scrollContentContainer} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                <Icon name="arrow-left" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <View style={styles.stepIndicator}>
                <Text style={styles.stepText}>Step 1 of 4</Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: '25%' }]} />
                </View>
              </View>
            </View>

            {/* Title */}
            <View style={styles.titleContainer}>
              <Text style={styles.title}>Welcome!</Text>
              <Text style={styles.subtitle}>
                It looks like you're new here. Let's get your account set up, starting with your family connection.
              </Text>
            </View>

            {/* hourse Options */}
            <View style={styles.form}>
              <View style={styles.optionsContainer}>
                <TouchableOpacity
                  style={[styles.optionCard, familyOption === 'create' && styles.optionCardSelected]}
                  onPress={handleCreateFamily}
                >
                  <View style={styles.optionIcon}>
                    <Icon name="home-plus" size={32} color={familyOption === 'create' ? '#bf4342' : 'rgba(255, 255, 255, 0.6)'} />
                  </View>
                  <Text style={[styles.optionTitle, familyOption === 'create' && styles.optionTitleSelected]}>
                    Create New hourse
                  </Text>
                  <Text style={[styles.optionDescription, familyOption === 'create' && styles.optionDescriptionSelected]}>
                    Start a new hourse group and invite members
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.optionCard, familyOption === 'join' && styles.optionCardSelected]}
                  onPress={handleJoinFamily}
                >
                  <View style={styles.optionIcon}>
                    <Icon name="account-plus" size={32} color={familyOption === 'join' ? '#bf4342' : 'rgba(255, 255, 255, 0.6)'} />
                  </View>
                  <Text style={[styles.optionTitle, familyOption === 'join' && styles.optionTitleSelected]}>
                    Join Existing hourse
                  </Text>
                  <Text style={[styles.optionDescription, familyOption === 'join' && styles.optionDescriptionSelected]}>
                    Enter a hourse code to join an existing group
                  </Text>
                </TouchableOpacity>
              </View>

              {/* hourse Code Input */}
              {familyOption === 'join' && (
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>hourse Code</Text>
                  <TextInput
                    style={[styles.input, errors.familyCode && styles.inputError]}
                    value={familyCode}
                    onChangeText={(text) => {
                      setFamilyCode(text.toUpperCase());
                      if (errors.familyCode) {
                        setErrors({ ...errors, familyCode: undefined });
                      }
                    }}
                    placeholder="Enter hourse code"
                    placeholderTextColor="#999"
                    autoCapitalize="characters"
                    autoCorrect={false}
                    maxLength={10}
                  />
                  {errors.familyCode && <Text style={styles.errorText}>{errors.familyCode}</Text>}
                </View>
              )}

            </View>

            {/* Next Button - Only show for Join hourse option */}
            {familyOption === 'join' && (
              <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                <Text style={styles.nextButtonText}>Next</Text>
                <Icon name="arrow-right" size={20} color="#bf4342" />
              </TouchableOpacity>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
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
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
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
    fontFamily: FONT_STYLES.englishMedium,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#ff4d6d',
    borderRadius: 2,
  },
  titleContainer: {
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    fontFamily: FONT_STYLES.englishHeading,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontFamily: FONT_STYLES.englishBody,
  },
  form: {
    flex: 1,
  },
  optionsContainer: {
    marginBottom: 24,
  },
  optionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  optionCardSelected: {
    borderColor: 'rgba(255, 255, 255, 0.4)',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    shadowColor: '#ff4d6d',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  optionIcon: {
    marginBottom: 12,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: FONT_STYLES.englishSemiBold,
  },
  optionTitleSelected: {
    color: '#bf4342',
  },
  optionDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 20,
    fontFamily: FONT_STYLES.englishBody,
  },
  optionDescriptionSelected: {
    color: '#bf4342',
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
    fontFamily: FONT_STYLES.englishSemiBold,
  },
  input: {
    backgroundColor: 'transparent',
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(255, 255, 255, 0.5)',
    paddingHorizontal: 0,
    paddingVertical: 16,
    fontSize: 16,
    color: '#FFFFFF',
  },
  inputError: {
    // No border styling for error state
  },
  errorText: {
    color: '#FFE5E5',
    fontSize: 14,
    marginTop: 8,
    fontFamily: FONT_STYLES.englishBody,
  },
  nextButton: {
    backgroundColor: '#ff4d6d',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
    fontFamily: FONT_STYLES.englishSemiBold,
  },
});

export default Step3FamilyScreen;
