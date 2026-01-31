import React, { useRef, useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, NativeSyntheticEvent, TextInputKeyPressEventData, Platform } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface DigitInputProps {
    length?: number;
    value: string;
    onChange: (value: string) => void;
    error?: boolean;
}

export const DigitInput: React.FC<DigitInputProps> = ({ length = 10, value, onChange, error }) => {
    const { theme } = useTheme();
    const inputs = useRef<Array<TextInput | null>>([]);
    const [focusedIndex, setFocusedIndex] = useState<number>(-1);

    // ... (logic remains same)
    const handleChange = (text: string, index: number) => {
        const cleaned = text.replace(/[^0-9]/g, '');
        if (!cleaned) return;

        const valArr = value.padEnd(length, ' ').split('');

        if (cleaned.length > 1) {
            const newValue = cleaned.slice(0, length);
            onChange(newValue);
            const nextIndex = Math.min(newValue.length, length - 1);
            inputs.current[nextIndex]?.focus();
            return;
        }

        valArr[index] = cleaned[0];
        const newValue = valArr.join('').trim();
        onChange(newValue);

        if (index < length - 1) {
            inputs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (e: NativeSyntheticEvent<TextInputKeyPressEventData>, index: number) => {
        if (e.nativeEvent.key === 'Backspace') {
            const valArr = value.padEnd(length, ' ').split('');
            const currentChar = valArr[index];

            if (currentChar && currentChar !== ' ') {
                valArr[index] = ' ';
                onChange(valArr.join('').trim());
            } else {
                if (index > 0) {
                    const prevIndex = index - 1;
                    valArr[prevIndex] = ' ';
                    onChange(valArr.join('').trim());
                    inputs.current[prevIndex]?.focus();
                }
            }
        }
    };

    const getParams = (index: number) => value[index] || '';

    return (
        <View style={styles.container}>
            {Array.from({ length }).map((_, index) => (
                <TextInput
                    key={index}
                    ref={(ref) => (inputs.current[index] = ref)}
                    style={[
                        styles.box,
                        {
                            borderColor: theme.colors.border,
                            borderRadius: theme.radius.input,
                            backgroundColor: theme.colors.inputBackground,
                        },
                        focusedIndex === index && {
                            borderColor: theme.colors.primary,
                            backgroundColor: '#FFF',
                            borderWidth: 2,
                        },
                        error && {
                            borderColor: theme.colors.error,
                        },
                    ]}
                    value={getParams(index)}
                    onChangeText={(text) => handleChange(text, index)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    onFocus={() => setFocusedIndex(index)}
                    onBlur={() => setFocusedIndex(-1)}
                    keyboardType="number-pad"
                    maxLength={Platform.OS === 'ios' ? 1 : undefined}
                    selectTextOnFocus={true}
                    caretHidden={true}
                    contextMenuHidden={true}
                />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 4,
        width: '100%',
    },
    box: {
        flex: 1,
        aspectRatio: 0.8,
        borderWidth: 1,
        textAlign: 'center',
        fontSize: 18,
        color: '#333',
        padding: 0,
        maxWidth: 40,
        height: 48,
    },
});
