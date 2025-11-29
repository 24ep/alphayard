import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';

type CategoryKey = 'hourse' | 'workplace' | 'hometown' | 'commercial' | 'other';

interface ChatHomeTabProps {
  category: CategoryKey;
  onOpenChatList?: (category: CategoryKey) => void;
}

const CATEGORY_LABELS: Record<CategoryKey, string> = {
  hourse: 'hourse',
  workplace: 'Workplace',
  hometown: 'Hometown',
  commercial: 'Commercial',
  other: 'Other',
};

export const ChatHomeTab: React.FC<ChatHomeTabProps> = ({ category, onOpenChatList }) => {
  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentInner}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.header}>Chats · {CATEGORY_LABELS[category]}</Text>
        <Text style={styles.subheader}>No recent messages in {CATEGORY_LABELS[category]} yet.</Text>
        <TouchableOpacity
          style={styles.cta}
          onPress={() => onOpenChatList && onOpenChatList(category)}
        >
          <Text style={styles.ctaText}>Open chat list</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  contentInner: {
    paddingVertical: 8,
  },
  header: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 6,
  },
  subheader: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  cta: {
    backgroundColor: '#FFE0E0',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  ctaText: {
    color: '#B71C1C',
    fontWeight: '700',
  },
});

export default ChatHomeTab;


