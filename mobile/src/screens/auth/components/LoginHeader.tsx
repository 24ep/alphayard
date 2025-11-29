import React from 'react';
import { VStack, Text } from 'native-base';
import { colors } from '../../../theme/colors';
import { textStyles } from '../../../theme/typography';
import AnimatedLogo from '../../../components/auth/AnimatedLogo';
import { LoginHeaderProps } from '../types';

const LoginHeader: React.FC<LoginHeaderProps> = ({ fadeAnim, slideAnim }) => {
  return (
    <VStack flex={0.4} justifyContent="center" alignItems="center" px={8}>
      <AnimatedLogo size={100} delay={0} />
      
      <VStack space={2} alignItems="center">
        <Text 
          style={[textStyles.h1, { color: colors.white[500] }]} 
          textAlign="center"
          fontWeight="bold"
        >
          Welcome Back
        </Text>
        <Text 
          style={[textStyles.body1, { color: colors.white[500], opacity: 0.9 }]} 
          textAlign="center"
        >
          Sign in to continue your hourse journey
        </Text>
      </VStack>
    </VStack>
  );
};

export default LoginHeader;
