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

interface Step3CreateCircleScreenProps {
  navigation: any;
  route: any;
}

const Step3CreateCircleScreen: React.FC<Step3CreateCircleScreenProps> = ({ navigation, route }) => {
  const { email, phone, password } = route.params;
  const [CircleName, setCircleName] = useState('');
  const [CircleType, setCircleType] = useState('');
  const [errors, setErrors] = useState<{ CircleName?: string; CircleType?: string }>({});

  const CircleTypes = [
    { id: 'circle', label: 'circle', icon: 'home-heart' },
    { id: 'friends', label: 'Friends', icon: 'account-group' },
    { id: 'sharehouse', label: 'Sharehouse', icon: 'home-city' },
  ];

  const handleNext = () => {
    const newErrors: { CircleName?: string; CircleType?: string } = {};

    if (!CircleName.trim()) {
      newErrors.CircleName = 'circle name is required';
    } else if (CircleName.length < 2) {
      newErrors.CircleName = 'circle name must be at least 2 characters';
    } else if (CircleName.length > 50) {
      newErrors.CircleName = 'circle name must be less than 50 characters';
    }

    if (!CircleType) {
      newErrors.CircleType = 'Please select a circle type';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      navigation.navigate('Step4InviteCircle', { 
        email, 
        password, 
        CircleOption: 'create',
        CircleName: CircleName.trim(),
        CircleType: CircleType,
        CircleDescription: `${CircleName.trim()} circle group`
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
              <View style={styles.stepIndicator}>
                <Text style={styles.stepText}>Step 3 of 6</Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: '50%' }]} />
                </View>
              </View>
            </View>

            {/* Title */}
            <View style={styles.titleContainer}>
              <Text style={styles.title}>Create Your circle</Text>
              <Text style={styles.subtitle}>Give your circle a name and select the type</Text>
            </View>

            {/* Form */}
            <View style={styles.form}>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>circle Name *</Text>
                <TextInput
                  style={[styles.input, styles.largeInput, errors.CircleName && styles.inputError]}
                  value={CircleName}
                  onChangeText={(text) => {
                    setCircleName(text);
                    if (errors.CircleName) {
                      setErrors({ ...errors, CircleName: undefined });
                    }
                  }}
                  placeholder="e.g., The Smith circle, Johnson Household"
                  placeholderTextColor="rgba(255, 255, 255, 0.7)"
                  autoCapitalize="words"
                  autoCorrect={false}
                  maxLength={50}
                />
                {errors.CircleName && <Text style={styles.errorText}>{errors.CircleName}</Text>}
                <Text style={styles.characterCount}>{CircleName.length}/50</Text>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>circle Type *</Text>
                <View style={styles.typeSelector}>
                  {CircleTypes.map((type) => (
                    <TouchableOpacity
                      key={type.id}
                      style={[
                        styles.typeOption,
                        CircleType === type.id && styles.typeOptionSelected
                      ]}
                      onPress={() => {
                        setCircleType(type.id);
                        if (errors.CircleType) {
                          setErrors({ ...errors, CircleType: undefined });
                        }
                      }}
                    >
                      <Icon 
                        name={type.icon} 
                        size={24} 
                        color={CircleType === type.id ? '#bf4342' : '#FFFFFF'} 
                      />
                      <Text style={[
                        styles.typeOptionText,
                        CircleType === type.id && styles.typeOptionTextSelected
                      ]}>
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {errors.CircleType && <Text style={styles.errorText}>{errors.CircleType}</Text>}
              </View>


            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                <Icon name="arrow-left" size={20} color="#FFFFFF" />
                <Text style={styles.backButtonText}>Back to Options</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                <Text style={styles.nextButtonText}>Create circle</Text>
                <Icon name="arrow-right" size={20} color="#bf4342" />
              </TouchableOpacity>
            </View>
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
    position: 'relative',
  },
  keyboardAvoidingView: {
    flex: 1,
    zIndex: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    zIndex: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    gap: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    fontFamily: FONT_STYLES.englishMedium,
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
  largeInput: {
    fontSize: 20,
    paddingVertical: 20,
    fontWeight: '500',
    fontFamily: FONT_STYLES.englishMedium,
  },
  textArea: {
    height: 100,
    paddingTop: 16,
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
  characterCount: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'right',
    fontFamily: FONT_STYLES.englishBody,
  },
  actionButtons: {
    gap: 12,
    marginBottom: 20,
  },
  nextButton: {
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
  nextButtonText: {
    color: '#bf4342',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: FONT_STYLES.englishSemiBold,
  },
  typeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  typeOption: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  typeOptionSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderColor: '#FFFFFF',
  },
  typeOptionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
    textAlign: 'center',
    fontFamily: FONT_STYLES.englishMedium,
  },
  typeOptionTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontFamily: FONT_STYLES.englishSemiBold,
  },
});

export default Step3CreateCircleScreen;
