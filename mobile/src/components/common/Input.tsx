import React, { useState, forwardRef } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInputProps,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors } from '../../theme/colors';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  errorStyle?: TextStyle;
  helperStyle?: TextStyle;
  required?: boolean;
  disabled?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  testID?: string;
}

export const Input = forwardRef<TextInput, InputProps>(({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  inputStyle,
  labelStyle,
  errorStyle,
  helperStyle,
  required = false,
  disabled = false,
  multiline = false,
  numberOfLines = 1,
  testID,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    props.onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    props.onBlur?.(e);
  };

  const inputContainerStyle = [
    styles.inputContainer,
    isFocused && styles.inputContainerFocused,
    error && styles.inputContainerError,
    disabled && styles.inputContainerDisabled,
    containerStyle,
  ];

  const inputStyleArray = [
    styles.input,
    multiline && styles.inputMultiline,
    inputStyle,
  ];

  const labelStyleArray = [
    styles.label,
    required && styles.labelRequired,
    disabled && styles.labelDisabled,
    labelStyle,
  ];

  return (
    <View style={styles.container}>
      {label && (
        <Text style={labelStyleArray}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}
      
      <View style={inputContainerStyle}>
        {leftIcon && (
          <Text style={[styles.icon, styles.leftIcon]}>{leftIcon}</Text>
        )}
        
        <TextInput
          ref={ref}
          style={inputStyleArray}
          placeholderTextColor={colors.gray[400]}
          editable={!disabled}
          multiline={multiline}
          numberOfLines={numberOfLines}
          onFocus={handleFocus}
          onBlur={handleBlur}
          testID={testID}
          {...props}
        />
        
        {rightIcon && (
          <TouchableOpacity
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
            style={styles.rightIconContainer}
          >
            <Text style={styles.icon}>{rightIcon}</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {error && (
        <Text style={[styles.error, errorStyle]}>{error}</Text>
      )}
      
      {helperText && !error && (
        <Text style={[styles.helper, helperStyle]}>{helperText}</Text>
      )}
    </View>
  );
});

Input.displayName = 'Input';

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.gray[700],
    marginBottom: 8,
  },
  labelRequired: {
    color: colors.error[500],
  },
  labelDisabled: {
    color: colors.gray[400],
  },
  required: {
    color: colors.error,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    backgroundColor: colors.white[500],
    paddingHorizontal: 12,
    minHeight: 48,
  },
  inputContainerFocused: {
    borderColor: colors.primary[500],
    borderWidth: 2,
  },
  inputContainerError: {
    borderColor: colors.error,
    borderWidth: 2,
  },
  inputContainerDisabled: {
    backgroundColor: colors.gray[100],
    borderColor: colors.gray[200],
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.gray[700],
    paddingVertical: 0,
  },
  inputMultiline: {
    textAlignVertical: 'top',
    paddingTop: 12,
    paddingBottom: 12,
  },
  icon: {
    fontSize: 18,
    color: colors.gray[500],
    marginHorizontal: 8,
  },
  leftIcon: {
    marginLeft: 0,
  },
  rightIconContainer: {
    marginLeft: 8,
  },
  error: {
    fontSize: 12,
    color: colors.error,
    marginTop: 4,
  },
  helper: {
    fontSize: 12,
    color: colors.gray[500],
    marginTop: 4,
  },
}); 