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
import { useAuth } from '../../../contexts/AuthContext';

interface Step1UsernameScreenProps {
  navigation: any;
  route: any;
}

const Step1UsernameScreen: React.FC<Step1UsernameScreenProps> = ({ navigation, route }) => {
  const { loginWithSSO } = useAuth();
  const [email, setEmail] = useState(route?.params?.email || '');
  const [signupMethod, setSignupMethod] = useState<'email' | 'social' | null>(null);
  const [errors, setErrors] = useState<{ email?: string }>({});

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailSignup = () => {
    setSignupMethod('email');
  };

  const handleSocialSignup = async (provider: 'google' | 'facebook' | 'line') => {
    try {
      setSignupMethod('social');
      await loginWithSSO(provider);
      // Navigation will be handled by AuthContext
    } catch (error: any) {
      console.error(`${provider} signup error:`, error);
      Alert.alert(
        'Signup Failed',
        error.message || `Failed to signup with ${provider}. Please try again.`,
        [{ text: 'OK' }]
      );
      setSignupMethod(null);
    }
  };

  const handleNext = () => {
    const newErrors: { email?: string } = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      navigation.navigate('Step2Password', { email });
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
                <Icon name="arrow-left" size={24} color="#ffffff" />
              </TouchableOpacity>
              <View style={styles.stepIndicator}>
                <Text style={styles.stepText}>Step 1 of 6</Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: '16.67%' }]} />
                </View>
              </View>
            </View>

            {/* Title */}
            <View style={styles.titleContainer}>
              <Text style={styles.title}>Create Your Account</Text>
              <Text style={styles.subtitle}>Choose how you'd like to sign up</Text>
            </View>

            {/* Signup Options */}
            <View style={styles.form}>
              {!signupMethod ? (
                <>
                  {/* Social Signup Options */}
                  <View style={styles.socialOptionsContainer}>
                    <Text style={styles.sectionTitle}>Quick Signup</Text>
                    <View style={styles.socialButtons}>
                      <TouchableOpacity
                        style={[styles.socialButton, styles.googleButton]}
                        onPress={() => handleSocialSignup('google')}
                      >
                        <Icon name="google" size={20} color="#FFFFFF" />
                        <Text style={styles.socialButtonText}>Continue with Google</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.socialButton, styles.facebookButton]}
                        onPress={() => handleSocialSignup('facebook')}
                      >
                        <Icon name="facebook" size={20} color="#FFFFFF" />
                        <Text style={styles.socialButtonText}>Continue with Facebook</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.socialButton, styles.lineButton]}
                        onPress={() => handleSocialSignup('line')}
                      >
                        <Icon name="chat" size={20} color="#FFFFFF" />
                        <Text style={styles.socialButtonText}>Continue with LINE</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Divider */}
                  <View style={styles.divider}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>OR</Text>
                    <View style={styles.dividerLine} />
                  </View>

                  {/* Email Signup Option */}
                  <TouchableOpacity style={styles.emailSignupButton} onPress={handleEmailSignup}>
                    <Icon name="email" size={20} color="#FF5A5A" />
                    <Text style={styles.emailSignupButtonText}>Sign up with Email</Text>
                  </TouchableOpacity>
                </>
              ) : signupMethod === 'email' ? (
                <>
                  {/* Email Form */}
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Email Address</Text>
                    <TextInput
                      style={[styles.input, errors.email && styles.inputError]}
                      value={email}
                      onChangeText={(text) => {
                        setEmail(text);
                        if (errors.email) {
                          setErrors({ ...errors, email: undefined });
                        }
                      }}
                      placeholder="Enter your email"
                      placeholderTextColor="rgba(255, 255, 255, 0.7)"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      underlineColorAndroid="transparent"
                    />
                    {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
                  </View>

                </>
              ) : null}
            </View>

            {/* Action Buttons - Only show for email signup */}
            {signupMethod === 'email' && (
              <View style={styles.actionButtonsContainer}>
                {/* Back to Options Button */}
                <TouchableOpacity style={styles.backToOptionsButton} onPress={() => setSignupMethod(null)}>
                  <Icon name="arrow-left" size={16} color="rgba(255, 255, 255, 0.8)" />
                  <Text style={styles.backToOptionsText}>Back to options</Text>
                </TouchableOpacity>

                {/* Next Button */}
                <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                  <Text style={styles.nextButtonText}>Next</Text>
                  <Icon name="arrow-right" size={20} color="#bf4342" />
                </TouchableOpacity>
              </View>
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
    color: '#f5f3f4',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    fontFamily: FONT_STYLES.englishMedium,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(211, 211, 211, 0.3)',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#bf4342',
    borderRadius: 2,
  },
  titleContainer: {
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    fontFamily: FONT_STYLES.englishHeading,
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: FONT_STYLES.englishBody,
    color: 'rgba(255, 255, 255, 0.9)',
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
    color: '#ffffff',
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
    color: '#ffffff',
  },
  inputError: {
    // No border styling for error state
  },
  errorText: {
    color: '#ffffff',
    fontSize: 14,
    marginTop: 8,
    fontFamily: FONT_STYLES.englishBody,
  },
  actionButtonsContainer: {
    flexDirection: 'column',
    gap: 12,
    marginBottom: 20,
  },
  nextButton: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 2,
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
  socialOptionsContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
    textAlign: 'center',
    fontFamily: FONT_STYLES.englishSemiBold,
  },
  socialButtons: {
    gap: 12,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    height: 50,
    gap: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    backdropFilter: 'blur(10px)',
  },
  googleButton: {
    backgroundColor: 'rgba(219, 68, 55, 0.8)',
    backdropFilter: 'blur(10px)',
  },
  facebookButton: {
    backgroundColor: 'rgba(66, 103, 178, 0.8)',
    backdropFilter: 'blur(10px)',
  },
  lineButton: {
    backgroundColor: 'rgba(0, 195, 0, 0.8)',
    backdropFilter: 'blur(10px)',
  },
  socialButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    fontFamily: FONT_STYLES.englishMedium,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  dividerText: {
    color: '#ffffff',
    fontSize: 14,
    marginHorizontal: 16,
    fontFamily: FONT_STYLES.englishBody,
  },
  emailSignupButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    backdropFilter: 'blur(10px)',
  },
  emailSignupButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: FONT_STYLES.englishSemiBold,
  },
  backToOptionsButton: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    gap: 8,
  },
  backToOptionsText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontWeight: '500',
    fontFamily: FONT_STYLES.englishMedium,
  },
});

export default Step1UsernameScreen;
