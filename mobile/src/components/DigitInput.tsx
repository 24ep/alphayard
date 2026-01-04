import React, { useRef, useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, NativeSyntheticEvent, TextInputKeyPressEventData, Platform } from 'react-native';

interface DigitInputProps {
    length?: number;
    value: string;
    onChange: (value: string) => void;
    error?: boolean;
}

export const DigitInput: React.FC<DigitInputProps> = ({ length = 10, value, onChange, error }) => {
    const inputs = useRef<Array<TextInput | null>>([]);
    const [focusedIndex, setFocusedIndex] = useState<number>(-1);

    // Sync internal focus if value updates externally (optional, mainly for initial render)

    const handleChange = (text: string, index: number) => {
        // Allow only numbers
        const cleaned = text.replace(/[^0-9]/g, '');
        if (!cleaned) {
            // Handle deletion if empty passed (though usually handled by backspace)
            return;
        }

        const valArr = value.padEnd(length, ' ').split('');

        // If user pasted a long string (e.g. "123456")
        if (cleaned.length > 1) {
            const newValue = cleaned.slice(0, length);
            onChange(newValue);
            // Focus last filled
            const nextIndex = Math.min(newValue.length, length - 1);
            inputs.current[nextIndex]?.focus();
            return;
        }

        // Single digit entry
        valArr[index] = cleaned[0]; // Take first char if multiple somehow
        const newValue = valArr.join('').trim();
        onChange(newValue);

        // Auto focus next
        if (index < length - 1) {
            inputs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (e: NativeSyntheticEvent<TextInputKeyPressEventData>, index: number) => {
        if (e.nativeEvent.key === 'Backspace') {
            const valArr = value.padEnd(length, ' ').split('');

            // If current box has a value, clear it. If empty, move back and clear previous.
            // Actually, standard behavior:
            // If cursor at filled box: Clear box, keep focus? Or clear and move back?
            // Usually: Backspace on empty box -> Move focus back. Backspace on filled -> Clear.

            const currentChar = valArr[index];

            if (currentChar && currentChar !== ' ') {
                valArr[index] = ' '; // Clear
                onChange(valArr.join('').trim());
            } else {
                // Empty box, move back
                if (index > 0) {
                    const prevIndex = index - 1;
                    valArr[prevIndex] = ' ';
                    onChange(valArr.join('').trim());
                    inputs.current[prevIndex]?.focus();
                }
            }
        }
    };

    const getParams = (index: number) => {
        const char = value[index] || '';
        return char;
    };

    return (
        <View style={styles.container}>
            {Array.from({ length }).map((_, index) => (
                <TextInput
                    key={index}
                    ref={(ref) => (inputs.current[index] = ref)}
                    style={[
                        styles.box,
                        focusedIndex === index && styles.boxFocused,
                        error && styles.boxError,
                    ]}
                    value={getParams(index)}
                    onChangeText={(text) => handleChange(text, index)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    onFocus={() => setFocusedIndex(index)}
                    onBlur={() => setFocusedIndex(-1)}
                    keyboardType="number-pad"
                    maxLength={Platform.OS === 'ios' ? 1 : undefined} // Android sometimes bugs with maxLength 1 + onChange
                    selectTextOnFocus={true}
                    caretHidden={true} // Hide cursor for cleaner look?
                    contextMenuHidden={true}
                />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between', // Distribute evenly
        gap: 4, // Minimal gap
        width: '100%',
    },
    box: {
        flex: 1, // Grow to fill width
        aspectRatio: 0.8, // Taller than wide
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        textAlign: 'center',
        fontSize: 18,
        color: '#333',
        backgroundColor: '#FAFAFA',
        padding: 0,
        // Max width to prevent looking huge on large screens?
        maxWidth: 40,
        height: 48,
    },
    boxFocused: {
        borderColor: '#FA7272',
        backgroundColor: '#FFF',
        borderWidth: 2,
    },
    boxError: {
        borderColor: 'red',
    },
});
