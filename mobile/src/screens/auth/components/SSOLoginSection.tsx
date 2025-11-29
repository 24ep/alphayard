import React from 'react';
import { Platform } from 'react-native';
import {
  VStack,
  HStack,
  Text,
  Divider,
  useColorModeValue,
} from 'native-base';
import { colors } from '../../../theme/colors';
import { textStyles } from '../../../theme/typography';
import SocialLoginButton from '../../../components/auth/SocialLoginButton';
import { SSOLoginSectionProps } from '../types';

const SSOLoginSection: React.FC<SSOLoginSectionProps> = ({
  isSSOLoading,
  onSSOLogin,
}) => {
  const borderColor = useColorModeValue(colors.gray[200], colors.gray[700]);

  return (
    <>
      {/* Divider */}
      <HStack space={4} alignItems="center">
        <Divider flex={1} bg={borderColor} />
        <Text style={[textStyles.caption1 as any, { color: colors.gray[500] }]}>
          OR
        </Text>
        <Divider flex={1} bg={borderColor} />
      </HStack>

      {/* SSO Buttons */}
      <VStack space={3}>
        <SocialLoginButton
          provider="google"
          onPress={() => onSSOLogin('google')}
          isLoading={isSSOLoading}
        />

        <SocialLoginButton
          provider="facebook"
          onPress={() => onSSOLogin('facebook')}
          isLoading={isSSOLoading}
        />

        {Platform.OS === 'ios' && (
          <SocialLoginButton
            provider="apple"
            onPress={() => onSSOLogin('apple')}
            isLoading={isSSOLoading}
          />
        )}
      </VStack>
    </>
  );
};

export default SSOLoginSection;
