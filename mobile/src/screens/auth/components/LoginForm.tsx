import React from 'react';
import {
  Box,
  VStack,
  Button,
  Pressable,
  useColorModeValue,
} from 'native-base';
import { Text } from 'native-base';
import { colors } from '../../../theme/colors';
import { textStyles } from '../../../theme/typography';
import AuthInput from '../../../components/auth/AuthInput';
import { LoginFormProps } from '../types';

const LoginForm: React.FC<LoginFormProps> = ({
  email,
  password,
  showPassword,
  emailError,
  passwordError,
  isFormValid,
  isLoading,
  onEmailChange,
  onPasswordChange,
  onShowPasswordToggle,
  onLogin,
  onForgotPassword,
  onDevBypass,
}) => {
  const cardBgColor = useColorModeValue(colors.white[500], colors.gray[800]);
  const borderColor = useColorModeValue(colors.gray[200], colors.gray[700]);

  return (
    <Box
      bg={cardBgColor}
      borderRadius={24}
      p={6}
      shadow={8}
      borderWidth={1}
      borderColor={borderColor}
    >
      <VStack space={5}>
        {/* Email Input */}
        <AuthInput
          label="Email Address"
          value={email}
          onChangeText={onEmailChange}
          placeholder="Enter your email"
          type="email"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          error={emailError}
          leftIcon="email-outline"
          testID="email-input"
        />

        {/* Password Input */}
        <AuthInput
          label="Password"
          value={password}
          onChangeText={onPasswordChange}
          placeholder="Enter your password"
          type={showPassword ? 'text' : 'password'}
          error={passwordError}
          leftIcon="lock-outline"
          rightIcon={showPassword ? 'eye-off' : 'eye'}
          onRightIconPress={onShowPasswordToggle}
          testID="password-input"
        />

        {/* Forgot Password */}
        <Pressable onPress={onForgotPassword} alignSelf="flex-end">
          <Text
            style={[textStyles.body2 as any, { color: colors.primary[500], fontWeight: '500' }]}
          >
            Forgot Password?
          </Text>
        </Pressable>

        {/* Sign In Button */}
        <Button
          onPress={onLogin}
          isLoading={isLoading}
          isDisabled={!isFormValid}
          bg={isFormValid ? colors.primary[500] : colors.gray[400]}
          _pressed={{ 
            bg: isFormValid ? colors.primary[600] : colors.gray[500] 
          }}
          size="lg"
          borderRadius={16}
          shadow={3}
          py={4}
          accessibilityLabel="Sign in"
          accessibilityHint="Sign in to your account"
          accessibilityRole="button"
          accessibilityState={{ 
            disabled: !isFormValid,
            busy: isLoading 
          }}
          testID="sign-in-button"
        >
          <Text 
            style={[textStyles.h4 as any, { color: colors.white[500], fontWeight: '600' }]}
          >
            Sign In
          </Text>
        </Button>

        {/* Development Bypass Button */}
        {__DEV__ && onDevBypass && (
          <Button
            onPress={onDevBypass}
            variant="outline"
            borderColor={colors.secondary[400]}
            bg="transparent"
            _pressed={{ bg: colors.secondary[50] }}
            size="sm"
            borderRadius={12}
            mt={2}
          >
            <Text
              style={[textStyles.caption1 as any, { color: colors.secondary[600], fontWeight: '600' }]}
            >
              Skip to Home
            </Text>
          </Button>
        )}
      </VStack>
    </Box>
  );
};

export default LoginForm;
