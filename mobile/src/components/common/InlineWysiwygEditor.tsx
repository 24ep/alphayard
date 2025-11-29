import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';

interface InlineWysiwygEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
  maxHeight?: number;
  showToolbar?: boolean;
  editable?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
}

interface FormatState {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strikethrough: boolean;
}

export const InlineWysiwygEditor: React.FC<InlineWysiwygEditorProps> = ({
  value,
  onChange,
  placeholder = "Start typing...",
  minHeight = 120,
  maxHeight = 300,
  showToolbar = true,
  editable = true,
  onFocus,
  onBlur,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [formatState, setFormatState] = useState<FormatState>({
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
  });
  const textInputRef = useRef<TextInput>(null);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    onFocus?.();
  }, [onFocus]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    onBlur?.();
  }, [onBlur]);

  const handleTextChange = useCallback((text: string) => {
    onChange(text);
  }, [onChange]);

  const toggleFormat = useCallback((format: keyof FormatState) => {
    setFormatState(prev => ({
      ...prev,
      [format]: !prev[format]
    }));
  }, []);

  const insertEmoji = useCallback((emoji: string) => {
    const currentText = value;
    const newText = currentText + emoji;
    onChange(newText);
  }, [value, onChange]);

  const clearText = useCallback(() => {
    Alert.alert(
      'Clear Text',
      'Are you sure you want to clear all text?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: () => onChange('') }
      ]
    );
  }, [onChange]);

  const getTextStyle = () => {
    const styles: any = {};
    if (formatState.bold) styles.fontWeight = 'bold';
    if (formatState.italic) styles.fontStyle = 'italic';
    if (formatState.underline) styles.textDecorationLine = 'underline';
    if (formatState.strikethrough) styles.textDecorationLine = 'line-through';
    return styles;
  };

  const emojis = ['😊', '❤️', '🎉', '🌟', '💕', '🎂', '🏠', '👨‍👩‍👧‍👦'];

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      {/* Toolbar */}
      {showToolbar && isFocused && (
        <View style={styles.toolbar}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.toolbarScroll}
          >
            {/* Text Formatting */}
            <View style={styles.toolbarGroup}>
              <TouchableOpacity
                style={[styles.toolbarButton, formatState.bold && styles.toolbarButtonActive]}
                onPress={() => toggleFormat('bold')}
              >
                <IconMC name="format-bold" size={18} color={formatState.bold ? '#FFFFFF' : '#6B7280'} />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.toolbarButton, formatState.italic && styles.toolbarButtonActive]}
                onPress={() => toggleFormat('italic')}
              >
                <IconMC name="format-italic" size={18} color={formatState.italic ? '#FFFFFF' : '#6B7280'} />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.toolbarButton, formatState.underline && styles.toolbarButtonActive]}
                onPress={() => toggleFormat('underline')}
              >
                <IconMC name="format-underline" size={18} color={formatState.underline ? '#FFFFFF' : '#6B7280'} />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.toolbarButton, formatState.strikethrough && styles.toolbarButtonActive]}
                onPress={() => toggleFormat('strikethrough')}
              >
                <IconMC name="format-strikethrough" size={18} color={formatState.strikethrough ? '#FFFFFF' : '#6B7280'} />
              </TouchableOpacity>
            </View>

            {/* Divider */}
            <View style={styles.toolbarDivider} />

            {/* Emojis */}
            <View style={styles.toolbarGroup}>
              {emojis.map((emoji, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.emojiButton}
                  onPress={() => insertEmoji(emoji)}
                >
                  <Text style={styles.emojiText}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Divider */}
            <View style={styles.toolbarDivider} />

            {/* Actions */}
            <View style={styles.toolbarGroup}>
              <TouchableOpacity
                style={styles.toolbarButton}
                onPress={clearText}
              >
                <IconMC name="format-clear" size={18} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      )}

      {/* Editor */}
      <View style={[
        styles.editorContainer,
        isFocused && styles.editorContainerFocused,
        { minHeight, maxHeight }
      ]}>
        <TextInput
          ref={textInputRef}
          style={[
            styles.textInput,
            getTextStyle()
          ]}
          value={value}
          onChangeText={handleTextChange}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          multiline
          textAlignVertical="top"
          editable={editable}
          onFocus={handleFocus}
          onBlur={handleBlur}
          scrollEnabled={true}
        />
      </View>

      {/* Character Count */}
      {isFocused && (
        <View style={styles.footer}>
          <Text style={styles.characterCount}>
            {value.length} characters
          </Text>
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  toolbar: {
    backgroundColor: '#F9FAFB',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 8,
  },
  toolbarScroll: {
    flexGrow: 0,
  },
  toolbarGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  toolbarButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 2,
  },
  toolbarButtonActive: {
    backgroundColor: '#3B82F6',
  },
  emojiButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 2,
  },
  emojiText: {
    fontSize: 18,
  },
  toolbarDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 8,
  },
  editorContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    margin: 8,
  },
  editorContainerFocused: {
    borderColor: '#3B82F6',
    borderWidth: 2,
  },
  textInput: {
    fontSize: 16,
    lineHeight: 24,
    color: '#1F2937',
    flex: 1,
    textAlignVertical: 'top',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  characterCount: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});












