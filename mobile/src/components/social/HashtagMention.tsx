import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { socialApi } from '../../services/api/social';

// ========================================
// Hashtag Components
// ========================================

interface TrendingHashtagsProps {
  onHashtagPress?: (hashtag: string) => void;
  limit?: number;
}

export const TrendingHashtags: React.FC<TrendingHashtagsProps> = ({
  onHashtagPress,
  limit = 10,
}) => {
  const [hashtags, setHashtags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrendingHashtags();
  }, [limit]);

  const loadTrendingHashtags = async () => {
    try {
      setLoading(true);
      const response = await socialApi.getTrendingHashtags(limit);
      if (response.success) {
        setHashtags(response.hashtags || []);
      }
    } catch (error) {
      console.error('Error loading trending hashtags:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#3B82F6" />
      </View>
    );
  }

  if (hashtags.length === 0) {
    return null;
  }

  return (
    <View style={styles.trendingContainer}>
      <View style={styles.sectionHeader}>
        <Ionicons name="trending-up" size={20} color="#3B82F6" />
        <Text style={styles.sectionTitle}>Trending</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.hashtagScroll}
      >
        {hashtags.map((hashtag, index) => (
          <TouchableOpacity
            key={hashtag.id || index}
            style={styles.hashtagChip}
            onPress={() => onHashtagPress?.(hashtag.tag)}
          >
            <Text style={styles.hashtagText}>#{hashtag.tag}</Text>
            <Text style={styles.hashtagCount}>{formatCount(hashtag.usageCount)}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

// Hashtag Search Component
interface HashtagSearchProps {
  query: string;
  onHashtagPress?: (hashtag: string) => void;
}

export const HashtagSearch: React.FC<HashtagSearchProps> = ({
  query,
  onHashtagPress,
}) => {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.length >= 2) {
      searchHashtags();
    } else {
      setResults([]);
    }
  }, [query]);

  const searchHashtags = async () => {
    try {
      setLoading(true);
      const response = await socialApi.searchHashtags(query);
      if (response.success) {
        setResults(response.hashtags || []);
      }
    } catch (error) {
      console.error('Error searching hashtags:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#3B82F6" />
      </View>
    );
  }

  return (
    <FlatList
      data={results}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.searchResultItem}
          onPress={() => onHashtagPress?.(item.tag)}
        >
          <View style={styles.hashtagIcon}>
            <Text style={styles.hashtagSymbol}>#</Text>
          </View>
          <View style={styles.hashtagInfo}>
            <Text style={styles.hashtagName}>{item.tag}</Text>
            <Text style={styles.hashtagStats}>{formatCount(item.usageCount)} posts</Text>
          </View>
        </TouchableOpacity>
      )}
      ListEmptyComponent={
        query.length >= 2 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hashtags found</Text>
          </View>
        ) : null
      }
    />
  );
};

// Inline Hashtag (for rendering in text)
interface InlineHashtagProps {
  tag: string;
  onPress?: (tag: string) => void;
}

export const InlineHashtag: React.FC<InlineHashtagProps> = ({ tag, onPress }) => {
  return (
    <Text style={styles.inlineHashtag} onPress={() => onPress?.(tag)}>
      #{tag}
    </Text>
  );
};

// ========================================
// Mention Components
// ========================================

interface MentionsListProps {
  onMentionPress?: (mentionId: string, postId?: string) => void;
  showUnreadOnly?: boolean;
}

export const MentionsList: React.FC<MentionsListProps> = ({
  onMentionPress,
  showUnreadOnly = false,
}) => {
  const [mentions, setMentions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadMentions();
  }, [showUnreadOnly]);

  const loadMentions = async () => {
    try {
      setLoading(true);
      const response = showUnreadOnly
        ? await socialApi.getUnreadMentions()
        : await socialApi.getAllMentions();
      if (response.success) {
        setMentions(response.mentions || []);
      }
    } catch (error) {
      console.error('Error loading mentions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadMentions();
    setRefreshing(false);
  };

  const handleMentionPress = async (mention: any) => {
    // Mark as read
    if (!mention.readAt) {
      try {
        await socialApi.markMentionAsRead(mention.id);
        setMentions(mentions.map(m =>
          m.id === mention.id ? { ...m, readAt: new Date().toISOString() } : m
        ));
      } catch (error) {
        console.error('Error marking mention as read:', error);
      }
    }
    onMentionPress?.(mention.id, mention.postId);
  };

  const handleMarkAllRead = async () => {
    try {
      await socialApi.markAllMentionsAsRead();
      setMentions(mentions.map(m => ({ ...m, readAt: new Date().toISOString() })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  const unreadCount = mentions.filter(m => !m.readAt).length;

  return (
    <View style={styles.mentionsContainer}>
      {unreadCount > 0 && (
        <View style={styles.unreadHeader}>
          <Text style={styles.unreadText}>{unreadCount} unread mentions</Text>
          <TouchableOpacity onPress={handleMarkAllRead}>
            <Text style={styles.markAllRead}>Mark all read</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={mentions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MentionItem
            mention={item}
            onPress={() => handleMentionPress(item)}
          />
        )}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="at-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No mentions</Text>
            <Text style={styles.emptyText}>
              When someone mentions you, it will appear here
            </Text>
          </View>
        }
      />
    </View>
  );
};

// Individual Mention Item
interface MentionItemProps {
  mention: any;
  onPress: () => void;
}

const MentionItem: React.FC<MentionItemProps> = ({ mention, onPress }) => {
  const isUnread = !mention.readAt;
  
  return (
    <TouchableOpacity
      style={[styles.mentionItem, isUnread && styles.unreadMentionItem]}
      onPress={onPress}
    >
      {isUnread && <View style={styles.unreadDot} />}
      <View style={styles.mentionAvatar}>
        <Text style={styles.avatarText}>
          {mention.mentioner?.displayName?.charAt(0).toUpperCase() || 'U'}
        </Text>
      </View>
      <View style={styles.mentionContent}>
        <Text style={styles.mentionHeader}>
          <Text style={styles.mentionerName}>
            {mention.mentioner?.displayName || 'Someone'}
          </Text>
          <Text style={styles.mentionAction}>
            {mention.commentId ? ' mentioned you in a comment' : ' mentioned you in a post'}
          </Text>
        </Text>
        {mention.context && (
          <Text style={styles.mentionContext} numberOfLines={2}>
            {mention.context}
          </Text>
        )}
        <Text style={styles.mentionTime}>{formatTimeAgo(mention.createdAt)}</Text>
      </View>
    </TouchableOpacity>
  );
};

// Inline Mention (for rendering in text)
interface InlineMentionProps {
  username: string;
  userId?: string;
  onPress?: (userId: string) => void;
}

export const InlineMention: React.FC<InlineMentionProps> = ({
  username,
  userId,
  onPress,
}) => {
  return (
    <Text
      style={styles.inlineMention}
      onPress={() => userId && onPress?.(userId)}
    >
      @{username}
    </Text>
  );
};

// ========================================
// Text Parser (parses text for hashtags and mentions)
// ========================================

interface ParsedTextProps {
  text: string;
  onHashtagPress?: (hashtag: string) => void;
  onMentionPress?: (userId: string) => void;
  style?: any;
}

export const ParsedText: React.FC<ParsedTextProps> = ({
  text,
  onHashtagPress,
  onMentionPress,
  style,
}) => {
  const parts = parseText(text);

  return (
    <Text style={style}>
      {parts.map((part, index) => {
        if (part.type === 'hashtag') {
          return (
            <InlineHashtag
              key={index}
              tag={part.value}
              onPress={onHashtagPress}
            />
          );
        } else if (part.type === 'mention') {
          return (
            <InlineMention
              key={index}
              username={part.value}
              userId={part.userId}
              onPress={onMentionPress}
            />
          );
        }
        return <Text key={index}>{part.value}</Text>;
      })}
    </Text>
  );
};

// Parse text into parts
type TextPart = {
  type: 'text' | 'hashtag' | 'mention';
  value: string;
  userId?: string;
};

const parseText = (text: string): TextPart[] => {
  const parts: TextPart[] = [];
  const regex = /(#[\w\u00C0-\u024F]+)|(@[\w\u00C0-\u024F]+)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Add text before match
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        value: text.slice(lastIndex, match.index),
      });
    }

    // Add hashtag or mention
    if (match[1]) {
      parts.push({
        type: 'hashtag',
        value: match[1].slice(1), // Remove #
      });
    } else if (match[2]) {
      parts.push({
        type: 'mention',
        value: match[2].slice(1), // Remove @
      });
    }

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push({
      type: 'text',
      value: text.slice(lastIndex),
    });
  }

  return parts;
};

// ========================================
// Mention Input Component (for composing)
// ========================================

interface MentionInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onMentionSelect?: (user: any) => void;
  placeholder?: string;
  style?: any;
}

export const MentionInput: React.FC<MentionInputProps> = ({
  value,
  onChangeText,
  onMentionSelect,
  placeholder,
  style,
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTextChange = (text: string) => {
    onChangeText(text);
    
    // Check if user is typing a mention
    const mentionMatch = text.match(/@(\w*)$/);
    if (mentionMatch) {
      setSearchQuery(mentionMatch[1]);
      setShowSuggestions(true);
      searchUsers(mentionMatch[1]);
    } else {
      setShowSuggestions(false);
    }
  };

  const searchUsers = async (query: string) => {
    if (query.length < 1) {
      setSuggestions([]);
      return;
    }
    
    try {
      setLoading(true);
      // This would call a user search API
      // For now, we'll use an empty array
      setSuggestions([]);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUser = (user: any) => {
    const newText = value.replace(/@\w*$/, `@${user.username} `);
    onChangeText(newText);
    setShowSuggestions(false);
    onMentionSelect?.(user);
  };

  return (
    <View style={styles.mentionInputContainer}>
      <TextInput
        value={value}
        onChangeText={handleTextChange}
        placeholder={placeholder}
        style={[styles.mentionInput, style]}
        multiline
      />
      
      {showSuggestions && (
        <View style={styles.suggestionsContainer}>
          {loading ? (
            <ActivityIndicator size="small" color="#3B82F6" />
          ) : suggestions.length > 0 ? (
            suggestions.map((user) => (
              <TouchableOpacity
                key={user.id}
                style={styles.suggestionItem}
                onPress={() => handleSelectUser(user)}
              >
                <View style={styles.suggestionAvatar}>
                  <Text style={styles.avatarText}>
                    {user.displayName?.charAt(0).toUpperCase() || 'U'}
                  </Text>
                </View>
                <View style={styles.suggestionInfo}>
                  <Text style={styles.suggestionName}>{user.displayName}</Text>
                  <Text style={styles.suggestionUsername}>@{user.username}</Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.noSuggestionsText}>No users found</Text>
          )}
        </View>
      )}
    </View>
  );
};

// ========================================
// Helper Functions
// ========================================

const formatCount = (count: number): string => {
  if (count >= 1000000) {
    return (count / 1000000).toFixed(1) + 'M';
  } else if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'K';
  }
  return count.toString();
};

const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  
  return date.toLocaleDateString();
};

// ========================================
// Styles
// ========================================

const styles = StyleSheet.create({
  loadingContainer: {
    padding: 24,
    alignItems: 'center',
  },
  // Trending Hashtags
  trendingContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  hashtagScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  hashtagChip: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  hashtagText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3B82F6',
  },
  hashtagCount: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
    textAlign: 'center',
  },
  // Hashtag Search
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  hashtagIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  hashtagSymbol: {
    fontSize: 20,
    fontWeight: '600',
    color: '#3B82F6',
  },
  hashtagInfo: {
    flex: 1,
  },
  hashtagName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  hashtagStats: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  // Inline
  inlineHashtag: {
    color: '#3B82F6',
    fontWeight: '500',
  },
  inlineMention: {
    color: '#3B82F6',
    fontWeight: '500',
  },
  // Mentions
  mentionsContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  unreadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  unreadText: {
    fontSize: 14,
    color: '#6B7280',
  },
  markAllRead: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  mentionItem: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  unreadMentionItem: {
    backgroundColor: '#EFF6FF',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B82F6',
    position: 'absolute',
    left: 4,
    top: 20,
  },
  mentionAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4B5563',
  },
  mentionContent: {
    flex: 1,
  },
  mentionHeader: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  mentionerName: {
    fontWeight: '600',
    color: '#1F2937',
  },
  mentionAction: {
    color: '#6B7280',
  },
  mentionContext: {
    fontSize: 14,
    color: '#374151',
    marginTop: 4,
    lineHeight: 20,
  },
  mentionTime: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  // Empty state
  emptyContainer: {
    padding: 48,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'center',
  },
  // Mention Input
  mentionInputContainer: {
    position: 'relative',
  },
  mentionInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  suggestionsContainer: {
    position: 'absolute',
    bottom: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    maxHeight: 200,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  suggestionAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  suggestionInfo: {
    flex: 1,
  },
  suggestionName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  suggestionUsername: {
    fontSize: 12,
    color: '#6B7280',
  },
  noSuggestionsText: {
    padding: 16,
    textAlign: 'center',
    color: '#9CA3AF',
  },
});

export default TrendingHashtags;
