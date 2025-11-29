import React, { memo } from 'react';
import { FormControl, Input, Icon, IconButton, Text, useColorModeValue } from 'native-base';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../theme/colors';
import { textStyles } from '../../theme/typography';

interface AuthInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  type?: 'text' | 'password' | 'email';
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  error?: string;
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  isDisabled?: boolean;
  testID?: string;
}

const AuthInput: React.FC<AuthInputProps> = memo(({
  label,
  value,
  onChangeText,
  placeholder,
  type = 'text',
  keyboardType = 'default',
  autoCapitalize = 'none',
  autoCorrect = false,
  error,
  leftIcon,
  rightIcon,
  onRightIconPress,
  isDisabled = false,
  testID,
}) => {
  const textColor = useColorModeValue(colors.gray[800], colors.white[500]);
  const borderColor = useColorModeValue(colors.gray[200], colors.gray[700]);
  const inputBg = useColorModeValue(colors.gray[50], colors.gray[800]);
  const focusBg = useColorModeValue(colors.white[500], colors.gray[700]);

  return (
    <FormControl isInvalid={!!error} isDisabled={isDisabled}>
      <FormControl.Label>
        <Text style={[textStyles.h5, { color: textColor }]}>
          {label}
        </Text>
      </FormControl.Label>
      <Input
        testID={testID}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        type={type}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        size="lg"
        borderRadius={16}
        borderColor={error ? colors.error : borderColor}
        bg={inputBg}
        accessibilityLabel={label}
        accessibilityHint={`Enter your ${label.toLowerCase()}`}
        accessibilityState={{ 
          disabled: isDisabled,
          invalid: !!error 
        }}
        _focus={{
          borderColor: colors.primary[500],
          bg: focusBg,
        }}
        InputLeftElement={
          leftIcon ? (
            <Icon
              as={IconMC}
              name={leftIcon}
              size={5}
              ml={4}
              color={colors.gray[500]}
              accessibilityLabel={`${leftIcon} icon`}
            />
          ) : undefined
        }
        InputRightElement={
          rightIcon ? (
            <IconButton
              icon={
                <Icon
                  as={IconMC}
                  name={rightIcon}
                  size={5}
                  color={colors.gray[500]}
                />
              }
              onPress={onRightIconPress}
              variant="ghost"
              size="sm"
              mr={2}
              accessibilityLabel={`Toggle ${rightIcon === 'eye' ? 'show' : 'hide'} password`}
              accessibilityRole="button"
            />
          ) : undefined
        }
      />
      {error && (
        <FormControl.ErrorMessage>
          {error}
        </FormControl.ErrorMessage>
      )}
    </FormControl>
  );
});

AuthInput.displayName = 'AuthInput';

export default AuthInput;
