import React, { memo } from 'react';
import { Button, HStack, Icon, Text, useColorModeValue } from 'native-base';
import { MaterialCommunityIcons as IconMC } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { textStyles } from '../../theme/typography';

interface SocialLoginButtonProps {
  provider: 'google' | 'facebook' | 'apple';
  onPress: () => void;
  isLoading?: boolean;
  isDisabled?: boolean;
}

const SocialLoginButton: React.FC<SocialLoginButtonProps> = memo(({
  provider,
  onPress,
  isLoading = false,
  isDisabled = false,
}) => {
  const borderColor = useColorModeValue(colors.gray[200], colors.gray[700]);

  const getProviderConfig = () => {
    switch (provider) {
      case 'google':
        return {
          icon: 'google',
          iconColor: '#DB4437',
          bgColor: colors.white[500],
          textColor: colors.gray[700],
          pressedBg: colors.gray[100],
          text: 'Continue with Google',
        };
      case 'facebook':
        return {
          icon: 'facebook',
          iconColor: colors.white[500],
          bgColor: '#1877F2',
          textColor: colors.white[500],
          pressedBg: '#166FE5',
          text: 'Continue with Facebook',
        };
      case 'apple':
        return {
          icon: 'apple',
          iconColor: colors.white[500],
          bgColor: colors.gray[900],
          textColor: colors.white[500],
          pressedBg: colors.gray[800],
          text: 'Continue with Apple',
        };
      default:
        return {
          icon: 'account',
          iconColor: colors.gray[500],
          bgColor: colors.gray[300],
          textColor: colors.gray[700],
          pressedBg: colors.gray[400],
          text: 'Continue',
        };
    }
  };

  const config = getProviderConfig();

  return (
    <Button
      onPress={onPress}
      isLoading={isLoading}
      isDisabled={isDisabled}
      bg={config.bgColor}
      borderWidth={provider === 'google' ? 1 : 0}
      borderColor={provider === 'google' ? borderColor : undefined}
      _pressed={{ bg: config.pressedBg }}
      size="lg"
      borderRadius={16}
      shadow={2}
      py={4}
      accessibilityLabel={config.text}
      accessibilityHint={`Sign in using your ${provider} account`}
      accessibilityRole="button"
      accessibilityState={{ 
        disabled: isDisabled,
        busy: isLoading 
      }}
    >
      <HStack space={3} alignItems="center">
        <Icon
          as={IconMC}
          name={config.icon}
          size={6}
          color={config.iconColor}
          accessibilityLabel={`${provider} icon`}
        />
        <Text 
          style={[textStyles.h5, { color: config.textColor }]} 
          fontWeight="500"
        >
          {config.text}
        </Text>
      </HStack>
    </Button>
  );
});

SocialLoginButton.displayName = 'SocialLoginButton';

export default SocialLoginButton;
