import React from 'react';
import { HStack, Text, Pressable } from 'native-base';
import { colors } from '../../../theme/colors';
import { textStyles } from '../../../theme/typography';
import { LoginFooterProps } from '../types';

const LoginFooter: React.FC<LoginFooterProps> = ({ onSignup }) => {
  return (
    <HStack space={1} justifyContent="center" mt={4}>
      <Text style={[textStyles.body1 as any, { color: colors.gray[600] }]}>
        Don't have an account?
      </Text>
      <Pressable onPress={onSignup}>
        <Text
          style={[textStyles.body1 as any, { color: colors.primary[500], fontWeight: '600' }]}
        >
          Sign Up
        </Text>
      </Pressable>
    </HStack>
  );
};

export default LoginFooter;
