import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { chatApi } from '../../services/api/chat';

interface ThreadMessage {
  id: string;
  senderId: string;
  senderName?: string;
  content: string;
  createdAt: string;
}

interface ThreadViewProps {
  threadId: string;
  chatRoomId: string;
  parentMessage: {
    id: string;
    content: string;
    senderName: string;
    createdAt: string;
  };
  onClose: () => void;
  currentUserId: string;
}

export const ThreadView: React.FC<ThreadViewProps> = ({
  threadId,
  chatRoomId,
  parentMessage,
  onClose,
  currentUserId,
}) => {
  const [replies, setReplies] = useState<ThreadMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    loadReplies();
  }, [threadId]);

  const loadReplies = async () => {
    try {
      setLoading(true);
      const response = await chatApi.getThreadReplies(threadId);
      if (response.success) {
        setReplies(response.replies || []);
      }
    } catch (error) {
      console.error('Error loading thread replies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendReply = async () => {
    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);
      const response = await chatApi.replyToThread(threadId, chatRoomId, newMessage.trim());
      if (response.success) {
        setReplies([...replies, response.reply]);
        setNewMessage('');
        flatListRef.current?.scrollToEnd();
      }
    } catch (error) {
      console.error('Error sending reply:', error);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Thread</Text>
          <Text style={styles.replyCount}>{replies.length} replies</Text>
        </View>
      </View>

      {/* Parent Message */}
      <View style={styles.parentMessage}>
        <View style={styles.parentHeader}>
          <Text style={styles.parentSender}>{parentMessage.senderName}</Text>
          <Text style={styles.parentTime}>{formatTime(parentMessage.createdAt)}</Text>
        </View>
        <Text style={styles.parentContent}>{parentMessage.content}</Text>
        <View style={styles.threadLine} />
      </View>

      {/* Replies */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={replies}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={[
              styles.replyBubble,
              item.senderId === currentUserId && styles.ownReplyBubble
            ]}>
              {item.senderId !== currentUserId && (
                <Text style={styles.replySender}>{item.senderName}</Text>
              )}
              <Text style={[
                styles.replyContent,
                item.senderId === currentUserId && styles.ownReplyContent
              ]}>
                {item.content}
              </Text>
              <Text style={[
                styles.replyTime,
                item.senderId === currentUserId && styles.ownReplyTime
              ]}>
                {formatTime(item.createdAt)}
              </Text>
            </View>
          )}
          contentContainerStyle={styles.repliesList}
          ListEmptyComponent={
            <View style={styles.emptyReplies}>
              <Text style={styles.emptyText}>No replies yet</Text>
              <Text style={styles.emptySubtext}>Be the first to reply</Text>
            </View>
          }
        />
      )}

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Reply in thread..."
          value={newMessage}
          onChangeText={setNewMessage}
          multiline
          maxLength={1000}
        />
        <TouchableOpacity
          onPress={handleSendReply}
          disabled={!newMessage.trim() || sending}
          style={[styles.sendButton, (!newMessage.trim() || sending) && styles.sendButtonDisabled]}
        >
          {sending ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Ionicons name="send" size={20} color="#FFFFFF" />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

// Thread preview shown on parent message
interface ThreadPreviewProps {
  threadId: string;
  replyCount: number;
  lastReplyAt?: string;
  participants: Array<{ displayName: string }>;
  onPress: () => void;
}

export const ThreadPreview: React.FC<ThreadPreviewProps> = ({
  threadId,
  replyCount,
  lastReplyAt,
  participants,
  onPress,
}) => {
  if (replyCount === 0) return null;

  const formatTimeAgo = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
    return `${Math.floor(minutes / 1440)}d ago`;
  };

  return (
    <TouchableOpacity style={styles.threadPreview} onPress={onPress}>
      <View style={styles.threadAvatars}>
        {participants.slice(0, 3).map((p, i) => (
          <View key={i} style={[styles.threadAvatar, { marginLeft: i > 0 ? -8 : 0 }]}>
            <Text style={styles.threadAvatarText}>{p.displayName.charAt(0)}</Text>
          </View>
        ))}
      </View>
      <Text style={styles.threadPreviewText}>
        {replyCount} {replyCount === 1 ? 'reply' : 'replies'}
      </Text>
      {lastReplyAt && (
        <Text style={styles.threadPreviewTime}>{formatTimeAgo(lastReplyAt)}</Text>
      )}
      <Ionicons name="chevron-forward" size={16} color="#6B7280" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    padding: 4,
  },
  headerContent: {
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  replyCount: {
    fontSize: 13,
    color: '#6B7280',
  },
  parentMessage: {
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  parentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  parentSender: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  parentTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  parentContent: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
  },
  threadLine: {
    position: 'absolute',
    left: 28,
    bottom: 0,
    width: 2,
    height: 16,
    backgroundColor: '#D1D5DB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  repliesList: {
    padding: 16,
    paddingBottom: 100,
  },
  replyBubble: {
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    maxWidth: '80%',
    alignSelf: 'flex-start',
  },
  ownReplyBubble: {
    backgroundColor: '#3B82F6',
    alignSelf: 'flex-end',
  },
  replySender: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  replyContent: {
    fontSize: 15,
    color: '#1F2937',
  },
  ownReplyContent: {
    color: '#FFFFFF',
  },
  replyTime: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  ownReplyTime: {
    color: 'rgba(255,255,255,0.7)',
  },
  emptyReplies: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
  },
  input: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: '#3B82F6',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  // Thread preview
  threadPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 8,
  },
  threadAvatars: {
    flexDirection: 'row',
  },
  threadAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  threadAvatarText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  threadPreviewText: {
    fontSize: 13,
    color: '#3B82F6',
    fontWeight: '500',
  },
  threadPreviewTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});

export default ThreadView;
