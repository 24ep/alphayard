import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../contexts/AuthContext';
import MarketingScreen from '../screens/auth/MarketingScreen';
import GetStartScreen from '../screens/auth/GetStartScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import MarketMenuScreen from '../screens/auth/MarketMenuScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

import TwoFactorMethodScreen from '../screens/auth/TwoFactorMethodScreen';
import TwoFactorVerifyScreen from '../screens/auth/TwoFactorVerifyScreen';
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import SSOLoginScreen from '../screens/auth/SSOLoginScreen';
import PinSetupScreen from '../screens/auth/PinSetupScreen';

// Signup Flow Screens
import Step1UsernameScreen from '../screens/auth/signup/Step1UsernameScreen';
import Step2PasswordScreen from '../screens/auth/signup/Step2PasswordScreen';
import Step3CircleScreen from '../screens/auth/signup/Step3CircleScreen';
import Step3CreateCircleScreen from '../screens/auth/signup/Step3CreateCircleScreen';
import Step3JoinCircleScreen from '../screens/auth/signup/Step3JoinCircleScreen';
import Step4InviteCircleScreen from '../screens/auth/signup/Step4InviteCircleScreen';
import Step4NameScreen from '../screens/auth/signup/Step4NameScreen';
import Step5PersonalInfoScreen from '../screens/auth/signup/Step5PersonalInfoScreen';
import Step6SurveyScreen from '../screens/auth/signup/Step6SurveyScreen';

export type AuthStackParamList = {
  GetStart: undefined;
  Marketing: undefined;
  MarketMenu: undefined;
  Login: undefined;
  Register: undefined;
  Signup: { email?: string; phone?: string };
  Step1Username: { email?: string; phone?: string };
  Step2Password: { email?: string; phone?: string };
  Step3Circle: { email?: string; phone?: string; password: string };
  Step3CreateCircle: { email?: string; phone?: string; password: string; circleOption: string };
  Step3JoinCircle: { email?: string; phone?: string; password: string; circleOption: string };
  Step4InviteCircle: { 
    email?: string; 
    phone?: string;
    password: string; 
    circleOption: string; 
    circleCode?: string; 
    circleName?: string;
    circleDescription?: string;
  };
  Step4Name: { 
    email?: string; 
    phone?: string;
    password: string; 
    circleOption: string; 
    circleCode?: string; 
    circleName?: string;
    circleDescription?: string;
    inviteEmails?: string[];
  };
  Step5PersonalInfo: { 
    email?: string; 
    phone?: string;
    password: string; 
    circleOption: string; 
    circleCode?: string; 
    circleName?: string;
    circleDescription?: string;
    inviteEmails?: string[];
    firstName: string;
    lastName: string;
  };
  Step6Survey: { 
    email?: string; 
    phone?: string;
    password: string; 
    circleOption: string; 
    circleCode?: string; 
    circleName?: string;
    circleDescription?: string;
    inviteEmails?: string[];
    firstName: string;
    lastName: string;
    personalInfo?: any;
  };
  SSOLogin: { provider: string };
  TwoFactorMethod: { identifier: string; mode: 'login' | 'signup' };
  TwoFactorVerify: { identifier: string; mode: 'login' | 'signup'; channel: 'email' | 'sms' | 'authenticator' };
  ForgotPassword: undefined;

  Welcome: undefined;
  SetupPin: { email: string; isNewUser?: boolean };
  WorkplaceInfo: undefined;
};

const Stack = createStackNavigator<AuthStackParamList>();

const AuthNavigator: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  // CRITICAL: If somehow this navigator is rendered when authenticated, return null immediately
  // Don't even render the error screen - just return null to prevent any rendering
  if (isAuthenticated && user) {
    console.error('[AuthNavigator] ⚠️ CRITICAL ERROR: AuthNavigator rendered when user is authenticated!');
    console.error('[AuthNavigator] User:', user.email);
    console.error('[AuthNavigator] This should NEVER happen - RootNavigator should prevent this');
    console.error('[AuthNavigator] Returning null to prevent rendering');
    return null;
  }

  return (
    <Stack.Navigator
      initialRouteName="GetStart"
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        animationEnabled: false,
        cardStyleInterpolator: ({ current, layouts }) => {
          return {
            cardStyle: {
              transform: [
                {
                  translateX: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [layouts.screen.width, 0],
                  }),
                },
              ],
            },
          };
        },
      }}
    >
      <Stack.Screen name="GetStart" component={GetStartScreen} />
      <Stack.Screen name="Marketing" component={MarketingScreen} />
      <Stack.Screen name="MarketMenu" component={MarketMenuScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="SSOLogin" component={SSOLoginScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />

      {/* Signup Steps */}
      <Stack.Screen name="Step1Username" component={Step1UsernameScreen} />
      <Stack.Screen name="Step2Password" component={Step2PasswordScreen} />
      <Stack.Screen name="Step3Circle" component={Step3CircleScreen} />
      <Stack.Screen name="Step3CreateCircle" component={Step3CreateCircleScreen} />
      <Stack.Screen name="Step3JoinCircle" component={Step3JoinCircleScreen} />
      <Stack.Screen name="Step4InviteCircle" component={Step4InviteCircleScreen} />
      <Stack.Screen name="Step4Name" component={Step4NameScreen} />
      <Stack.Screen name="Step5PersonalInfo" component={Step5PersonalInfoScreen} />
      <Stack.Screen name="Step6Survey" component={Step6SurveyScreen} />

      <Stack.Screen name="TwoFactorMethod" component={TwoFactorMethodScreen} />
      <Stack.Screen name="TwoFactorVerify" component={TwoFactorVerifyScreen} />
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="SetupPin" component={PinSetupScreen} />
      <Stack.Screen name="WorkplaceInfo" component={require('../screens/auth/WorkplaceInfoScreen').default} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
