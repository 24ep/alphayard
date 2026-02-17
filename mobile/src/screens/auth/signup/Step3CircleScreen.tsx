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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { FONT_STYLES } from '../../../utils/fontUtils';

interface Step3CircleScreenProps {
  navigation: any;
  route: any;
}

const Step3CircleScreen: React.FC<Step3CircleScreenProps> = ({ navigation, route }) => {
  const { email, phone, password } = route.params;
  const [CircleOption, setCircleOption] = useState<'create' | 'join' | null>(null);
  const [CircleCode, setCircleCode] = useState('');
  const [errors, setErrors] = useState<{ CircleCode?: string }>({});

  const handleCreateCircle = () => {
    setCircleOption('create');
    setCircleCode('');
    setErrors({});
    // Automatically navigate to the next screen
    navigation.navigate('Step3CreateCircle', { 
      email, 
      password
    });
  };

  const handleJoinCircle = () => {
    setCircleOption('join');
    setErrors({});
  };

  const handleNext = () => {
    if (CircleOption !== 'join') {
      Alert.alert('Selection Required', 'Please choose to join an existing circle.');
      return;
    }

    const newErrors: { CircleCode?: string } = {};

    if (!CircleCode.trim()) {
      newErrors.CircleCode = 'circle code is required';
    } else if (CircleCode.length < 6) {
      newErrors.CircleCode = 'circle code must be at least 6 characters';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      navigation.navigate('Step3JoinCircle', { 
        email, 
        password, 
        CircleOption: 'join'
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
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                <Icon name="arrow-left" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <View style={styles.stepIndicator}>
                <Text style={styles.stepText}>Step 3 of 6</Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: '50%' }]} />
                </View>
              </View>
            </View>

            {/* Title */}
            <View style={styles.titleContainer}>
              <Text style={styles.title}>circle Setup</Text>
              <Text style={styles.subtitle}>Create a new circle or join an existing one</Text>
            </View>

            {/* circle Options */}
            <View style={styles.form}>
              <View style={styles.optionsContainer}>
                <TouchableOpacity
                  style={[styles.optionCard, CircleOption === 'create' && styles.optionCardSelected]}
                  onPress={handleCreateCircle}
                >
                  <View style={styles.optionIcon}>
                    <Icon name="home-plus" size={32} color={CircleOption === 'create' ? '#bf4342' : 'rgba(255, 255, 255, 0.6)'} />
                  </View>
                  <Text style={[styles.optionTitle, CircleOption === 'create' && styles.optionTitleSelected]}>
                    Create New circle
                  </Text>
                  <Text style={[styles.optionDescription, CircleOption === 'create' && styles.optionDescriptionSelected]}>
                    Start a new circle group and invite members
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.optionCard, CircleOption === 'join' && styles.optionCardSelected]}
                  onPress={handleJoinCircle}
                >
                  <View style={styles.optionIcon}>
                    <Icon name="account-plus" size={32} color={CircleOption === 'join' ? '#bf4342' : 'rgba(255, 255, 255, 0.6)'} />
                  </View>
                  <Text style={[styles.optionTitle, CircleOption === 'join' && styles.optionTitleSelected]}>
                    Join Existing circle
                  </Text>
                  <Text style={[styles.optionDescription, CircleOption === 'join' && styles.optionDescriptionSelected]}>
                    Enter a circle code to join an existing group
                  </Text>
                </TouchableOpacity>
              </View>

              {/* circle Code Input */}
              {CircleOption === 'join' && (
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>circle Code</Text>
                  <TextInput
                    style={[styles.input, errors.CircleCode && styles.inputError]}
                    value={CircleCode}
                    onChangeText={(text) => {
                      setCircleCode(text.toUpperCase());
                      if (errors.CircleCode) {
                        setErrors({ ...errors, CircleCode: undefined });
                      }
                    }}
                    placeholder="Enter circle code"
                    placeholderTextColor="#999"
                    autoCapitalize="characters"
                    autoCorrect={false}
                    maxLength={10}
                  />
                  {errors.CircleCode && <Text style={styles.errorText}>{errors.CircleCode}</Text>}
                </View>
              )}

            </View>

            {/* Next Button - Only show for Join circle option */}
            {CircleOption === 'join' && (
              <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                <Text style={styles.nextButtonText}>Next</Text>
                <Icon name="arrow-right" size={20} color="#bf4342" />
              </TouchableOpacity>
            )}
          </View>
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
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
    backdropFilter: 'blur(10px)',
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

export default Step3CircleScreen;
