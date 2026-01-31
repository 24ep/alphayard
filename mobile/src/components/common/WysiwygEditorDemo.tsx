import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { InlineWysiwygEditor } from './InlineWysiwygEditor';

export const WysiwygEditorDemo: React.FC = () => {
  const [story, setStory] = useState('');

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.title}>Circle Story Editor</Text>
        <Text style={styles.subtitle}>
          Create rich, formatted Circle stories with our inline WYSIWYG editor
        </Text>
        
        <InlineWysiwygEditor
          value={story}
          onChange={setStory}
          placeholder="Share your Circle's story... Use the toolbar to format text and add emojis!"
          minHeight={200}
          maxHeight={400}
          showToolbar={true}
          editable={true}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>Preview</Text>
        <View style={styles.previewContainer}>
          <Text style={styles.previewText}>
            {story || 'Your formatted story will appear here...'}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  section: {
    margin: 16,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  previewContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
  },
  previewText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
});








