import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from '../../components/common/BlurView';
import CoolIcon from '../../components/common/CoolIcon';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { styles } from './LoginScreen.styles';

interface LoginFormData {
  email: string;
  password: string;
}

const LoginScreen: React.FC = () => {
  const navigation = useNavigation();
  const { login, loginWithSSO, isLoading, isAuthenticated, user } = useAuth();
  
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  
  const [errors, setErrors] = useState<Partial<LoginFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  
  // Animation values
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(30)).current;
  const cardScaleAnim = React.useRef(new Animated.Value(0.95)).current;

  // Monitor authentication state changes
  useEffect(() => {
    console.log('[LoginScreen] Auth state changed - isAuthenticated:', isAuthenticated, 'user:', !!user);
    if (isAuthenticated && user) {
      console.log('[LoginScreen] User is authenticated, should navigate to main app');
    }
  }, [isAuthenticated, user]);

  // Entrance animations
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(cardScaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleEmailChange = (text: string) => {
    console.log('Email input changed:', text);
    setFormData(prev => ({ ...prev, email: text }));
    if (errors.email) {
      setErrors(prev => ({ ...prev, email: undefined }));
    }
    if (apiError) {
      setApiError(null);
    }
  };

  const handlePasswordChange = (text: string) => {
    setFormData(prev => ({ ...prev, password: text }));
    if (errors.password) {
      setErrors(prev => ({ ...prev, password: undefined }));
    }
    if (apiError) {
      setApiError(null);
    }
  };

  const validateForm = () => {
    const newErrors: Partial<LoginFormData> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      setApiError(null);
      await login(formData.email, formData.password);
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error.message || 'Invalid email or password. Please try again.';
      setApiError(errorMessage);
      
      // Set specific field errors based on error message
      if (errorMessage.toLowerCase().includes('password')) {
        setErrors(prev => ({ ...prev, password: errorMessage }));
      } else if (errorMessage.toLowerCase().includes('email')) {
        setErrors(prev => ({ ...prev, email: errorMessage }));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSSOLogin = async (provider: 'google' | 'facebook' | 'apple') => {
    try {
      await loginWithSSO(provider);
    } catch (error: any) {
      console.error(`${provider} login error:`, error);
      Alert.alert(
        'Login Failed',
        error.message || `Failed to login with ${provider}. Please try again.`,
        [{ text: 'OK' }]
      );
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  const handleSignup = () => {
    navigation.navigate('Signup');
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#FA7272', '#FFBBB4']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.background}
      >
        {/* Subtle overlay for depth */}
        <View style={styles.backgroundOverlay} />
        
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}
        >
          <Animated.View 
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* Header */}
            <Animated.View 
              style={[
                styles.header,
                {
                  transform: [{ scale: cardScaleAnim }],
                },
              ]}
            >
              <View style={styles.logoContainer}>
                <View style={styles.logoIconWrapper}>
                  <CoolIcon name="house-03" size={28} color="#FFFFFF" />
                </View>
                <Text style={styles.logoText}>Bondarys</Text>
              </View>
            </Animated.View>

            {/* Login Form */}
            <Animated.View 
              style={[
                styles.formContainer,
                {
                  transform: [{ scale: cardScaleAnim }],
                },
              ]}
            >
              <BlurView intensity={80} tint="light" style={styles.formCard}>
                <View style={styles.formCardInner}>
                  <Text style={styles.formTitle}>Sign In</Text>
                  <Text style={styles.formSubtitle}>Welcome back</Text>

                  {/* General API Error Banner */}
                  {apiError && (
                    <Animated.View style={styles.apiErrorBanner}>
                      <CoolIcon name="alert-circle" size={18} color="#FFFFFF" style={styles.apiErrorIcon} />
                      <Text style={styles.apiErrorText}>{apiError}</Text>
                    </Animated.View>
                  )}

                  {/* Email Input */}
                  <View style={styles.inputContainer}>
                    <View 
                      style={[
                        styles.inputWrapper, 
                        emailFocused && styles.inputWrapperFocused,
                        errors.email && styles.inputError
                      ]}
                    >
                      <CoolIcon 
                        name="email-plus" 
                        size={18} 
                        color={emailFocused ? "#FFFFFF" : "rgba(255, 255, 255, 0.7)"} 
                        style={styles.inputIcon} 
                      />
                      <TextInput
                        style={styles.textInput}
                        placeholder="Email"
                        placeholderTextColor="rgba(255, 255, 255, 0.7)"
                        value={formData.email}
                        onChangeText={handleEmailChange}
                        onFocus={() => setEmailFocused(true)}
                        onBlur={() => setEmailFocused(false)}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        autoComplete="email"
                        underlineColorAndroid="transparent"
                        testID="email-input"
                      />
                    </View>
                    {errors.email && (
                      <Animated.View style={styles.errorContainer}>
                        <Text style={styles.errorText}>{errors.email}</Text>
                      </Animated.View>
                    )}
                  </View>

                  {/* Password Input */}
                  <View style={styles.inputContainer}>
                    <View 
                      style={[
                        styles.inputWrapper, 
                        passwordFocused && styles.inputWrapperFocused,
                        errors.password && styles.inputError
                      ]}
                    >
                      <CoolIcon 
                        name="lock" 
                        size={18} 
                        color={passwordFocused ? "#FFFFFF" : "rgba(255, 255, 255, 0.7)"} 
                        style={styles.inputIcon} 
                      />
                      <TextInput
                        style={styles.textInput}
                        placeholder="Password"
                        placeholderTextColor="rgba(255, 255, 255, 0.7)"
                        value={formData.password}
                        onChangeText={handlePasswordChange}
                        onFocus={() => setPasswordFocused(true)}
                        onBlur={() => setPasswordFocused(false)}
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                        autoCorrect={false}
                        underlineColorAndroid="transparent"
                      />
                      <TouchableOpacity
                        style={styles.eyeIcon}
                        onPress={() => setShowPassword(!showPassword)}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <CoolIcon 
                          name={showPassword ? "close" : "eye"} 
                          size={18} 
                          color={passwordFocused ? "#FFFFFF" : "rgba(255, 255, 255, 0.7)"} 
                        />
                      </TouchableOpacity>
                    </View>
                    {errors.password && (
                      <Animated.View style={styles.errorContainer}>
                        <Text style={styles.errorText}>{errors.password}</Text>
                      </Animated.View>
                    )}
                  </View>

                  {/* Forgot Password */}
                  <TouchableOpacity 
                    style={styles.forgotPassword} 
                    onPress={handleForgotPassword}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                  </TouchableOpacity>

                  {/* Login Button */}
                  <TouchableOpacity
                    style={[
                      styles.loginButton, 
                      (isLoading || isSubmitting) && styles.loginButtonDisabled
                    ]}
                    onPress={handleLogin}
                    disabled={isLoading || isSubmitting}
                    activeOpacity={0.8}
                  >
                    {isLoading || isSubmitting ? (
                      <ActivityIndicator color="#bf4342" size="small" />
                    ) : (
                      <Text style={styles.loginButtonText}>Sign In</Text>
                    )}
                  </TouchableOpacity>

                  {/* Divider */}
                  <View style={styles.divider}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>or continue with</Text>
                    <View style={styles.dividerLine} />
                  </View>

                  {/* Social Login Buttons */}
                  <View style={styles.socialButtons}>
                    <TouchableOpacity
                      style={[styles.socialButton, styles.googleButton]}
                      onPress={() => handleSSOLogin('google')}
                      disabled={isLoading}
                      activeOpacity={0.7}
                    >
                      <CoolIcon name="apps" size={20} color="#FFFFFF" />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.socialButton, styles.facebookButton]}
                      onPress={() => handleSSOLogin('facebook')}
                      disabled={isLoading}
                      activeOpacity={0.7}
                    >
                      <CoolIcon name="apps" size={20} color="#FFFFFF" />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.socialButton, styles.appleButton]}
                      onPress={() => handleSSOLogin('apple')}
                      disabled={isLoading}
                      activeOpacity={0.7}
                    >
                      <CoolIcon name="apps" size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>

                  {/* Sign Up Link */}
                  <View style={styles.signupContainer}>
                    <Text style={styles.signupText}>Don't have an account? </Text>
                    <TouchableOpacity onPress={handleSignup} hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}>
                      <Text style={styles.signupLink}>Sign Up</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </BlurView>
            </Animated.View>
          </Animated.View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
};


export default LoginScreen;