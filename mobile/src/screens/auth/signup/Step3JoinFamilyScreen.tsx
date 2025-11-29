import React, { useState, useRef } from 'react';
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

interface Step3JoinFamilyScreenProps {
  navigation: any;
  route: any;
}

const Step3JoinFamilyScreen: React.FC<Step3JoinFamilyScreenProps> = ({ navigation, route }) => {
  const { email, password } = route.params;
  const [pinCode, setPinCode] = useState(['', '', '', '', '', '']);
  const [errors, setErrors] = useState<{ pinCode?: string }>({});
  const inputRefs = useRef<TextInput[]>([]);

  const handlePinChange = (value: string, index: number) => {
    if (value.length > 1) return; // Only allow single digit
    
    const newPinCode = [...pinCode];
    newPinCode[index] = value;
    setPinCode(newPinCode);

    // Clear error when user starts typing
    if (errors.pinCode) {
      setErrors({ ...errors, pinCode: undefined });
    }

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !pinCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const validatePinCode = () => {
    const pinString = pinCode.join('');
    
    if (pinString.length !== 6) {
      setErrors({ pinCode: 'Please enter a complete 6-digit PIN code' });
      return false;
    }

    if (!/^\d{6}$/.test(pinString)) {
      setErrors({ pinCode: 'PIN code must contain only numbers' });
      return false;
    }

    return true;
  };

  const handleNext = () => {
    if (!validatePinCode()) return;

    const pinString = pinCode.join('');
    
    // Navigate to name step with PIN code
    navigation.navigate('Step4Name', { 
      email, 
      password, 
      familyOption: 'join',
      familyCode: pinString
    });
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
              <View style={styles.iconContainer}>
                <Icon name="key" size={48} color="#FFFFFF" />
              </View>
              <Text style={styles.title}>Enter hourse PIN</Text>
              <Text style={styles.subtitle}>Enter the 6-digit PIN code to join the hourse</Text>
            </View>

            {/* PIN Input */}
            <View style={styles.form}>
              <View style={styles.pinContainer}>
                <Text style={styles.pinLabel}>hourse PIN Code *</Text>
                <View style={styles.pinInputs}>
                  {pinCode.map((digit, index) => (
                    <TextInput
                      key={index}
                      ref={(ref) => {
                        if (ref) inputRefs.current[index] = ref;
                      }}
                      style={[
                        styles.pinInput,
                        digit && styles.pinInputFilled,
                        errors.pinCode && styles.pinInputError
                      ]}
                      value={digit}
                      onChangeText={(value) => handlePinChange(value, index)}
                      onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                      keyboardType="numeric"
                      maxLength={1}
                      textAlign="center"
                      autoFocus={index === 0}
                      selectTextOnFocus
                    />
                  ))}
                </View>
                {errors.pinCode && <Text style={styles.errorText}>{errors.pinCode}</Text>}
              </View>

              {/* Info Card */}
              <View style={styles.infoCard}>
                <Icon name="information" size={24} color="#bf4342" />
                <View style={styles.infoText}>
                  <Text style={styles.infoTitle}>How to get the PIN?</Text>
                  <Text style={styles.infoDescription}>
                    Ask the hourse admin to share the 6-digit PIN code. 
                    This code is used to securely join the hourse group.
                  </Text>
                </View>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                <Icon name="arrow-left" size={20} color="#FFFFFF" />
                <Text style={styles.backButtonText}>Back to Options</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                <Text style={styles.nextButtonText}>Join hourse</Text>
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
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
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
    textAlign: 'center',
  },
  form: {
    flex: 1,
  },
  pinContainer: {
    marginBottom: 32,
  },
  pinLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
    fontFamily: FONT_STYLES.englishSemiBold,
  },
  pinInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  pinInput: {
    width: 50,
    height: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: FONT_STYLES.englishSemiBold,
  },
  pinInputFilled: {
    borderColor: '#FFFFFF',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  pinInputError: {
    borderColor: '#FFE5E5',
    backgroundColor: 'rgba(255, 229, 229, 0.2)',
  },
  errorText: {
    color: '#FFE5E5',
    fontSize: 14,
    fontFamily: FONT_STYLES.englishBody,
    textAlign: 'center',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    padding: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
    backdropFilter: 'blur(10px)',
  },
  infoText: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
    fontFamily: FONT_STYLES.englishSemiBold,
  },
  infoDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
    fontFamily: FONT_STYLES.englishBody,
  },
  actionButtons: {
    gap: 12,
    marginBottom: 20,
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
});

export default Step3JoinFamilyScreen;
