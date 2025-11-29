import { useState, useRef, useEffect } from 'react';
import { Alert, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useToast } from 'native-base';
import { useAuth } from '../../../contexts/AuthContext';
import { LoginFormState, LoginHandlers } from '../types';

export const useLoginScreen = () => {
  const navigation = useNavigation();
  const authContext = useAuth();
  const toast = useToast();
  const { login, loginWithSSO, devBypassLogin, isLoading, user, isAuthenticated } = authContext;
  
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSSOLoading, setIsSSOLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isFormValid, setIsFormValid] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const formOpacity = useRef(new Animated.Value(0)).current;

  // Animation effects
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(formOpacity, {
        toValue: 1,
        duration: 1000,
        delay: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Form validation
  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmailValid = emailRegex.test(email);
    const isPasswordValid = password.length >= 6;
    
    setEmailError(isEmailValid || email === '' ? '' : 'Please enter a valid email address');
    setPasswordError(isPasswordValid || password === '' ? '' : 'Password must be at least 6 characters');
    setIsFormValid(isEmailValid && isPasswordValid);
  }, [email, password]);

  // Debug: Log auth state (development only)
  if (__DEV__) {
    console.log('LoginScreen:', isAuthenticated ? 'authenticated' : 'not authenticated');
  }

  const handleEmailLogin = async () => {
    if (!isFormValid) {
      toast.show({
        title: 'Invalid Form',
        description: 'Please check your email and password',
        duration: 3000,
      });
      return;
    }

    try {
      await login(email, password);
      toast.show({
        title: 'Welcome back!',
        description: 'Successfully logged in',
        duration: 2000,
      });
    } catch (error: any) {
      toast.show({
        title: 'Login Failed',
        description: error.message || 'Please check your credentials',
        duration: 4000,
      });
    }
  };

  const handleDevBypass = async () => {
    console.log('🚀 Simple bypass button clicked - using auth bypass');
    
    try {
      if (authContext.devBypassLogin) {
        console.log('🚀 Calling devBypassLogin...');
        await authContext.devBypassLogin();
        console.log('Dev bypass completed');
        
        toast.show({
          title: 'Development Bypass',
          description: 'Successfully bypassed to home screen',
          duration: 2000,
        });
      } else {
        console.log('❌ devBypassLogin not available');
        Alert.alert('Error', 'Development bypass not available');
      }
    } catch (error: any) {
      console.log('❌ Dev bypass failed:', error);
      toast.show({
        title: 'Bypass Failed',
        description: error.message || 'Failed to bypass authentication',
        duration: 3000,
      });
    }
  };

  const handleSSOLogin = async (provider: 'google' | 'facebook' | 'apple') => {
    try {
      setIsSSOLoading(true);
      await loginWithSSO(provider);
      toast.show({
        title: 'Welcome!',
        description: `Successfully logged in with ${provider}`,
        duration: 2000,
      });
    } catch (error: any) {
      toast.show({
        title: 'SSO Login Failed',
        description: error.message || 'Please try again',
        duration: 4000,
      });
    } finally {
      setIsSSOLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  const handleSignup = () => {
    navigation.navigate('Signup');
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return {
    // State
    email,
    password,
    showPassword,
    isSSOLoading,
    emailError,
    passwordError,
    isFormValid,
    isLoading,
    user,
    isAuthenticated,
    fadeAnim,
    slideAnim,
    formOpacity,
    
    // Setters
    setEmail,
    setPassword,
    setShowPassword,
    setIsSSOLoading,
    setEmailError,
    setPasswordError,
    setIsFormValid,
    
    // Handlers
    handleEmailLogin,
    handleDevBypass,
    handleSSOLogin,
    handleForgotPassword,
    handleSignup,
    toggleShowPassword,
  };
};
