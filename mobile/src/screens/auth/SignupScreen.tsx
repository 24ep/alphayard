import React, { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';

interface SignupScreenProps {
  navigation: any;
}

const SignupScreen: React.FC<SignupScreenProps> = () => {
  const navigation = useNavigation();

  useEffect(() => {
    // Redirect to the new multi-step signup flow
    navigation.replace('Step1Username');
  }, [navigation]);

  return null; // This screen will immediately redirect
};

export default SignupScreen;
