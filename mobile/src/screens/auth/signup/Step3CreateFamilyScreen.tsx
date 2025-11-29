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

interface Step3CreateFamilyScreenProps {
  navigation: any;
  route: any;
}

const Step3CreateFamilyScreen: React.FC<Step3CreateFamilyScreenProps> = ({ navigation, route }) => {
  const { email, password } = route.params;
  const [familyName, setFamilyName] = useState('');
  const [familyType, setFamilyType] = useState('');
  const [errors, setErrors] = useState<{ familyName?: string; familyType?: string }>({});

  const familyTypes = [
    { id: 'hourse', label: 'hourse', icon: 'home-heart' },
    { id: 'friends', label: 'Friends', icon: 'account-group' },
    { id: 'sharehouse', label: 'Sharehouse', icon: 'home-city' },
  ];

  const handleNext = () => {
    const newErrors: { familyName?: string; familyType?: string } = {};

    if (!familyName.trim()) {
      newErrors.familyName = 'hourse name is required';
    } else if (familyName.length < 2) {
      newErrors.familyName = 'hourse name must be at least 2 characters';
    } else if (familyName.length > 50) {
      newErrors.familyName = 'hourse name must be less than 50 characters';
    }

    if (!familyType) {
      newErrors.familyType = 'Please select a hourse type';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      navigation.navigate('Step4InviteFamily', { 
        email, 
        password, 
        familyOption: 'create',
        familyName: familyName.trim(),
        familyType: familyType,
        familyDescription: `${familyName.trim()} hourse group`
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
              <Text style={styles.title}>Create Your hourse</Text>
              <Text style={styles.subtitle}>Give your hourse a name and select the type</Text>
            </View>

            {/* Form */}
            <View style={styles.form}>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>hourse Name *</Text>
                <TextInput
                  style={[styles.input, styles.largeInput, errors.familyName && styles.inputError]}
                  value={familyName}
                  onChangeText={(text) => {
                    setFamilyName(text);
                    if (errors.familyName) {
                      setErrors({ ...errors, familyName: undefined });
                    }
                  }}
                  placeholder="e.g., The Smith hourse, Johnson Household"
                  placeholderTextColor="rgba(255, 255, 255, 0.7)"
                  autoCapitalize="words"
                  autoCorrect={false}
                  maxLength={50}
                />
                {errors.familyName && <Text style={styles.errorText}>{errors.familyName}</Text>}
                <Text style={styles.characterCount}>{familyName.length}/50</Text>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>hourse Type *</Text>
                <View style={styles.typeSelector}>
                  {familyTypes.map((type) => (
                    <TouchableOpacity
                      key={type.id}
                      style={[
                        styles.typeOption,
                        familyType === type.id && styles.typeOptionSelected
                      ]}
                      onPress={() => {
                        setFamilyType(type.id);
                        if (errors.familyType) {
                          setErrors({ ...errors, familyType: undefined });
                        }
                      }}
                    >
                      <Icon 
                        name={type.icon} 
                        size={24} 
                        color={familyType === type.id ? '#bf4342' : '#FFFFFF'} 
                      />
                      <Text style={[
                        styles.typeOptionText,
                        familyType === type.id && styles.typeOptionTextSelected
                      ]}>
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {errors.familyType && <Text style={styles.errorText}>{errors.familyType}</Text>}
              </View>


            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                <Icon name="arrow-left" size={20} color="#FFFFFF" />
                <Text style={styles.backButtonText}>Back to Options</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                <Text style={styles.nextButtonText}>Create hourse</Text>
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

export default Step3CreateFamilyScreen;
