import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonActions } from '@react-navigation/native';

// Conditional imports for optional dependencies
let GoogleSignin: any;
let LoginManager: any, AccessToken: any;
let appleAuth: any;

try {
  GoogleSignin = require('@react-native-google-signin/google-signin').GoogleSignin;
} catch (error) {
  console.warn('Google Sign-In not available:', error);
  GoogleSignin = null;
}

try {
  const fbModule = require('react-native-fbsdk-next');
  LoginManager = fbModule.LoginManager;
  AccessToken = fbModule.AccessToken;
} catch (error) {
  console.warn('Facebook SDK not available:', error);
}

// Apple Authentication is optional and not installed
appleAuth = null;

import { api } from '../services/api';
import { logger } from '../utils/logger';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  phone?: string;
  dateOfBirth?: Date;
  userType: 'hourse' | 'children' | 'seniors';
  subscriptionTier: 'free' | 'premium' | 'elite';
  familyIds: string[];
  isOnboardingComplete: boolean;
  preferences: {
    notifications: boolean;
    locationSharing: boolean;
    popupSettings: {
      enabled: boolean;
      frequency: 'daily' | 'weekly' | 'monthly';
      maxPerDay: number;
      categories: string[];
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isOnboardingComplete: boolean;
  forceUpdate: number;
  login: (email: string, password: string) => Promise<void>;
  loginWithSSO: (provider: 'google' | 'facebook' | 'apple') => Promise<void>;
  signup: (userData: SignupData) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  completeOnboarding: () => Promise<void>;
  devBypassLogin?: () => Promise<void>;
  // Direct dev functions
  _devSetUser?: (user: User) => void;
  _devSetOnboarding?: (complete: boolean) => void;
  // Navigation reference for forced navigation
  setNavigationRef?: (ref: any) => void;
}

interface SignupData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  dateOfBirth?: Date;
  userType: 'hourse' | 'children' | 'seniors';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  try {
    const context = useContext(AuthContext);
    if (!context) {
      console.error('useAuth must be used within an AuthProvider');
      // Return a fallback context to prevent crashes
      return {
        user: null,
        isAuthenticated: false,
        isLoading: false,
        isOnboardingComplete: false,
        forceUpdate: 0,
        login: async () => { throw new Error('Auth context not available'); },
        loginWithSSO: async () => { throw new Error('Auth context not available'); },
        signup: async () => { throw new Error('Auth context not available'); },
        logout: async () => { throw new Error('Auth context not available'); },
        refreshToken: async () => { throw new Error('Auth context not available'); },
        updateUser: async () => { throw new Error('Auth context not available'); },
        completeOnboarding: async () => { throw new Error('Auth context not available'); },
        devBypassLogin: undefined,
        _devSetUser: undefined,
        _devSetOnboarding: undefined,
        setNavigationRef: undefined,
      };
    }
    return context;
  } catch (error) {
    console.error('Error accessing auth context:', error);
    // Return a fallback context to prevent crashes
    return {
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isOnboardingComplete: false,
      forceUpdate: 0,
      login: async () => { throw new Error('Auth context not available'); },
      loginWithSSO: async () => { throw new Error('Auth context not available'); },
      signup: async () => { throw new Error('Auth context not available'); },
      logout: async () => { throw new Error('Auth context not available'); },
      refreshToken: async () => { throw new Error('Auth context not available'); },
      updateUser: async () => { throw new Error('Auth context not available'); },
      completeOnboarding: async () => { throw new Error('Auth context not available'); },
      devBypassLogin: undefined,
      _devSetUser: undefined,
      _devSetOnboarding: undefined,
      setNavigationRef: undefined,
    };
  }
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  console.log('🔧 AuthProvider rendering...');
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);
  const navigationRef = useRef<any>(null);
  
  console.log('🔧 AuthProvider - Initial state:', { user: !!user, isLoading, isOnboardingComplete, forceUpdate });

  // Initialize Google Sign-In only if available
  useEffect(() => {
    if (GoogleSignin) {
      try {
        GoogleSignin.configure({
          webClientId: process.env.GOOGLE_WEB_CLIENT_ID,
          offlineAccess: true,
        });
      } catch (error) {
        console.warn('Failed to configure Google Sign-In:', error);
      }
    }
  }, []);

  // Check for existing session on app start
  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      setIsLoading(true);
      console.log('[AUTH] Checking auth state...');
      
      // Check for existing tokens first
      const accessToken = await AsyncStorage.getItem('accessToken');
      console.log('[AUTH] Existing token found:', !!accessToken);
      
      if (accessToken && !__DEV__) {
        // In production, try to validate token
        console.log('[AUTH] Production mode - validating token');
        // Add token validation logic here if needed
      }
      
      // Check if user has valid authentication
      if (accessToken) {
        try {
          // Try to validate the token by making a request to get user profile
          const response = await api.get('/auth/me');
          if (response.data && response.data.user) {
            setUser(response.data.user);
            setIsOnboardingComplete(response.data.user.isOnboardingComplete || false);
            console.log('[AUTH] Valid token found - user authenticated');
          } else {
            // Invalid token, clear it
            await AsyncStorage.removeItem('accessToken');
            await AsyncStorage.removeItem('refreshToken');
            console.log('[AUTH] Invalid token - cleared and staying logged out');
          }
        } catch (error) {
          // Token validation failed, clear tokens
          console.log('[AUTH] Token validation failed:', error);
          try {
            await AsyncStorage.removeItem('accessToken');
            await AsyncStorage.removeItem('refreshToken');
          } catch (clearError) {
            console.error('Failed to clear tokens:', clearError);
          }
          console.log('[AUTH] Token validation failed - cleared and staying logged out');
        }
      } else {
        console.log('[AUTH] No token found - staying logged out');
      }
      
    } catch (error) {
      console.error('Auth state check failed:', error);
      console.log('❌ Auth state check failed - staying logged out');
    } finally {
      console.log('[AUTH] checkAuthState completed - setting loading to false');
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      const response = await api.post('/auth/login', {
        email,
        password,
      });
      
      const { user: userData, token, accessToken, refreshToken } = response.data as any;
      // Backend returns `token` (access token) + `refreshToken`. Support both shapes.
      const resolvedAccessToken = accessToken || token;
      
      // Store tokens
      await AsyncStorage.multiSet([
        ['accessToken', resolvedAccessToken],
        ['refreshToken', refreshToken],
      ]);
      
      // Set token in API headers
      api.defaults.headers.common['Authorization'] = `Bearer ${resolvedAccessToken}`;
      
      // Transform user data to match our interface
      const transformedUser: User = {
        id: userData.id,
        email: userData.email,
        firstName: userData.firstName || userData.first_name,
        lastName: userData.lastName || userData.last_name,
        avatar: userData.avatarUrl || userData.avatar,
        phone: userData.phoneNumber || userData.phone,
        dateOfBirth: userData.dateOfBirth ? new Date(userData.dateOfBirth) : undefined,
        userType: 'hourse',
        subscriptionTier: 'free',
        familyIds: userData.families?.map((f: any) => f.id) || (userData.familyIds || []),
        isOnboardingComplete: userData.isOnboardingComplete ?? true,
        preferences: userData.preferences || {
          notifications: true,
          locationSharing: true,
          popupSettings: {
            enabled: true,
            frequency: 'daily',
            maxPerDay: 3,
            categories: ['announcement', 'promotion'],
          },
        },
        createdAt: userData.createdAt ? new Date(userData.createdAt) : new Date(),
        updatedAt: userData.updatedAt ? new Date(userData.updatedAt) : new Date(),
      };
      
      setUser(transformedUser);
      setIsOnboardingComplete(userData.isOnboardingComplete);
      
      logger.info('User logged in successfully:', userData.email);
    } catch (error) {
      logger.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const devBypassLogin = async () => {
    console.log('🔧 devBypassLogin called!');
    if (!__DEV__) {
      throw new Error('Development bypass is only available in development mode');
    }

    console.log('🔧 devBypassLogin - Creating mock user...');
    const mockUser: User = {
      id: 'dev-user-123',
      email: 'dev@bondarys.com',
      firstName: 'Developer',
      lastName: 'User',
      avatar: 'https://via.placeholder.com/150',
      phone: '+1234567890',
      userType: 'hourse',
      subscriptionTier: 'premium',
      familyIds: ['dev-hourse-123'],
      isOnboardingComplete: true,
      preferences: {
        notifications: true,
        locationSharing: true,
        popupSettings: {
          enabled: true,
          frequency: 'daily',
          maxPerDay: 5,
          categories: ['news', 'entertainment', 'health'],
        },
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    console.log('🔧 devBypassLogin - Setting user state...');
    setUser(mockUser);
    console.log('🔧 devBypassLogin - Setting onboarding complete...');
    setIsOnboardingComplete(true);
    console.log('🔧 devBypassLogin - Setting loading to false...');
    setIsLoading(false);
    
    console.log('🔧 devBypassLogin - Force updating context...');
    // Force context update to ensure RootNavigator re-renders
    setForceUpdate(prev => {
      const newValue = prev + 1;
      console.log('🔧 devBypassLogin - forceUpdate from', prev, 'to', newValue);
      return newValue;
    });
    console.log('🔧 devBypassLogin - All state changes completed!');
    
    // Force immediate navigation using a different approach
    setTimeout(() => {
      console.log('🔧 devBypassLogin - Attempting direct navigation...');
      if (navigationRef.current) {
        console.log('🔧 devBypassLogin - Navigation ref available, navigating...');
        try {
          navigationRef.current.reset({
            index: 0,
            routes: [{ name: 'MainApp' }],
          });
          console.log('🔧 devBypassLogin - Direct navigation successful!');
        } catch (error) {
          console.error('🔧 devBypassLogin - Direct navigation failed:', error);
        }
      } else {
        console.log('🔧 devBypassLogin - Navigation ref not available');
      }
    }, 100);
  };

  const loginWithSSO = async (provider: 'google' | 'facebook' | 'apple') => {
    try {
      setIsLoading(true);
      
      let ssoData: any = {};
      
      switch (provider) {
        case 'google':
          if (!GoogleSignin) {
            throw new Error('Google Sign-In is not available in this environment');
          }
          ssoData = await handleGoogleSignIn();
          break;
        case 'facebook':
          if (!LoginManager || !AccessToken) {
            throw new Error('Facebook Sign-In is not available in this environment');
          }
          ssoData = await handleFacebookSignIn();
          break;
        case 'apple':
          if (!appleAuth) {
            throw new Error('Apple Sign-In is not available in this environment');
          }
          ssoData = await handleAppleSignIn();
          break;
      }
      
      // Send SSO data to backend
      const response = await api.post('/auth/sso', {
        provider,
        ...ssoData,
      });
      
      const { user: userData, accessToken, refreshToken } = response.data;
      
      // Store tokens
      await AsyncStorage.multiSet([
        ['accessToken', accessToken],
        ['refreshToken', refreshToken],
      ]);
      
      // Set token in API headers
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      
      setUser(userData);
      setIsOnboardingComplete(userData.isOnboardingComplete);
      
      logger.info('SSO login successful:', provider);
    } catch (error) {
      logger.error('SSO login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!GoogleSignin) {
      throw new Error('Google Sign-In not available');
    }

    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      
      return {
        idToken: userInfo.idToken,
        accessToken: userInfo.accessToken,
        email: userInfo.user.email,
        firstName: userInfo.user.givenName,
        lastName: userInfo.user.familyName,
        avatar: userInfo.user.photo,
      };
    } catch (error) {
      logger.error('Google sign-in failed:', error);
      throw new Error('Google sign-in failed');
    }
  };

  const handleFacebookSignIn = async () => {
    if (!LoginManager || !AccessToken) {
      throw new Error('Facebook Sign-In not available');
    }

    try {
      const result = await LoginManager.logInWithPermissions(['public_profile', 'email']);
      
      if (result.isCancelled) {
        throw new Error('Facebook sign-in was cancelled');
      }
      
      const data = await AccessToken.getCurrentAccessToken();
      
      return {
        accessToken: data.accessToken,
        userId: data.userID,
      };
    } catch (error) {
      logger.error('Facebook sign-in failed:', error);
      throw new Error('Facebook sign-in failed');
    }
  };

  const handleAppleSignIn = async () => {
    if (!appleAuth) {
      throw new Error('Apple Authentication not available');
    }
    
    try {
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
      });
      
      const { identityToken, authorizationCode, fullName } = appleAuthRequestResponse;
      
      if (!identityToken) {
        throw new Error('Apple sign-in failed: No identity token');
      }
      
      return {
        identityToken,
        authorizationCode,
        email: fullName?.emailAddress,
        firstName: fullName?.givenName,
        lastName: fullName?.familyName,
      };
    } catch (error) {
      logger.error('Apple sign-in failed:', error);
      throw new Error('Apple sign-in failed');
    }
  };

  const signup = async (userData: SignupData) => {
    try {
      setIsLoading(true);
      
      // Validate required fields
      if (!userData.email || !userData.password || !userData.firstName || !userData.lastName) {
        throw new Error('Email, password, first name, and last name are required');
      }
      
      // Transform data to match backend expectations
      const backendData = {
        email: userData.email,
        password: userData.password,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phoneNumber: userData.phone, // Backend expects phoneNumber, not phone
        dateOfBirth: userData.dateOfBirth,
        // Include additional fields that might be expected
        ...(userData as any)
      };
      
      console.log('🔧 Signup data being sent:', JSON.stringify(backendData, null, 2));
      
      const response = await api.post('/auth/register', backendData);
      
      const { user: newUser, accessToken, refreshToken } = response.data;
      
      // Store tokens
      await AsyncStorage.multiSet([
        ['accessToken', accessToken],
        ['refreshToken', refreshToken],
      ]);
      
      // Set token in API headers
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      
      // Transform user data to match our interface
      const transformedUser: User = {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        avatar: newUser.avatarUrl,
        phone: newUser.phoneNumber,
        dateOfBirth: newUser.dateOfBirth ? new Date(newUser.dateOfBirth) : undefined,
        userType: userData.userType,
        subscriptionTier: 'free',
        familyIds: [],
        isOnboardingComplete: newUser.isOnboardingComplete,
        preferences: newUser.preferences || {
          notifications: true,
          locationSharing: true,
          popupSettings: {
            enabled: true,
            frequency: 'daily',
            maxPerDay: 3,
            categories: ['announcement', 'promotion'],
          },
        },
        createdAt: new Date(newUser.createdAt),
        updatedAt: new Date(newUser.updatedAt),
      };
      
      setUser(transformedUser);
      setIsOnboardingComplete(newUser.isOnboardingComplete);
      
      logger.info('User signed up successfully:', newUser.email);
    } catch (error: any) {
      console.error('🔧 Signup error details:', error.response?.data || error.message);
      logger.error('Signup failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Call logout endpoint
      await api.post('/auth/logout');
    } catch (error) {
      logger.error('Logout API call failed:', error);
    } finally {
      // Clear local data
      await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
      api.defaults.headers.common['Authorization'] = '';
      
      setUser(null);
      setIsOnboardingComplete(false);
      
      logger.info('User logged out');
    }
  };

  const refreshToken = async () => {
    try {
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      
      const response = await api.post('/auth/refresh', {
        refreshToken,
      });
      
      const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;
      
      // Update stored tokens
      await AsyncStorage.multiSet([
        ['accessToken', newAccessToken],
        ['refreshToken', newRefreshToken],
      ]);
      
      // Update API headers
      api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
      
      logger.info('Token refreshed successfully');
    } catch (error) {
      logger.error('Token refresh failed:', error);
      // If refresh fails, logout user
      await logout();
      throw error;
    }
  };

  const updateUser = async (updates: Partial<User>) => {
    try {
      const response = await api.put('/auth/profile', updates);
      const updatedUser = response.data.user;
      
      setUser(updatedUser);
      setIsOnboardingComplete(updatedUser.isOnboardingComplete);
      
      logger.info('User profile updated');
    } catch (error) {
      logger.error('Profile update failed:', error);
      throw error;
    }
  };

  const completeOnboarding = async () => {
    try {
      const response = await api.post('/auth/onboarding/complete');
      const updatedUser = response.data.user;
      
      setUser(updatedUser);
      setIsOnboardingComplete(true);
      
      logger.info('Onboarding completed');
    } catch (error) {
      logger.error('Onboarding completion failed:', error);
      throw error;
    }
  };

  // Create fresh context value for each render to ensure updates propagate
  console.log('🔧 Creating context value - user:', !!user, 'isAuthenticated:', !!user, 'forceUpdate:', forceUpdate);
  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    isOnboardingComplete,
    forceUpdate,
    login,
    loginWithSSO,
    signup,
    logout,
    refreshToken,
    updateUser,
    completeOnboarding,
    devBypassLogin: __DEV__ ? devBypassLogin : undefined,
    _devSetUser: __DEV__ ? (user: User) => {
      console.log('🔧 _devSetUser called with:', user?.email);
      setUser(user);
      setForceUpdate(prev => prev + 1);
    } : undefined,
    _devSetOnboarding: __DEV__ ? (complete: boolean) => {
      console.log('🔧 _devSetOnboarding called with:', complete);
      setIsOnboardingComplete(complete);
      setForceUpdate(prev => prev + 1);
    } : undefined,
    setNavigationRef: (ref: any) => {
      console.log('🔧 Setting navigation ref:', !!ref);
      console.log('🔧 Navigation ref object:', ref);
      navigationRef.current = ref;
      console.log('🔧 Navigation ref set to:', !!navigationRef.current);
    },
  };

  // Simple auth state logging
  if (__DEV__) {
    console.log('Auth state:', !!user ? 'authenticated' : 'not authenticated');
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 