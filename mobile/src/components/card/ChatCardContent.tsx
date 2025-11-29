import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import CoolIcon from '../common/CoolIcon';
import SegmentedTabs from '../common/SegmentedTabs';

interface ChatMember {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
  isGroup: boolean;
}

interface ChatCardContentProps {
  familyMembers?: any[];
}

type ChatCategory = 'family' | 'workplace' | 'hometown' | 'commercial' | 'other';

export const ChatCardContent: React.FC<ChatCardContentProps> = ({ familyMembers = [] }) => {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<ChatCategory>('family');

  // Generate chat list from real family data
  const generateChatList = (): ChatMember[] => {
    const chatList: ChatMember[] = [];
    
    // Add family group chat if there are multiple members
    if (familyMembers.length > 1) {
      chatList.push({
        id: 'family-group',
        name: 'Family Group',
        avatar: '👨‍👩‍👧‍👦',
        lastMessage: 'No recent messages',
        lastMessageTime: 'No activity',
        unreadCount: 0,
        isOnline: familyMembers.some(member => member.status === 'online'),
        isGroup: true,
      });
    }
    
    // Add individual family members
    familyMembers.forEach((member) => {
      chatList.push({
        id: member.id || `member-${member.name}`,
        name: member.name || 'Family Member',
        avatar: member.avatar || '👤',
        lastMessage: 'No recent messages',
        lastMessageTime: 'No activity',
        unreadCount: 0,
        isOnline: member.status === 'online',
        isGroup: false,
      });
    });
    
    return chatList;
  };

  const chatList = generateChatList();

  const handleChatPress = (chat: ChatMember) => {
    setSelectedChat(chat.id);
    // In a real app, this would navigate to the chat conversation
    Alert.alert('Chat', `Opening chat with ${chat.name}`);
  };

  const getStatusColor = (isOnline: boolean) => {
    return isOnline ? '#10B981' : '#6B7280';
  };

  const formatUnreadCount = (count: number) => {
    return count > 99 ? '99+' : count.toString();
  };

  return (
    <View style={styles.container}>
      {/* Category Tabs */}
      <SegmentedTabs
        tabs={[
          { id: 'family', label: 'Family', icon: 'home' },
          { id: 'workplace', label: 'Workplace', icon: 'briefcase' },
          { id: 'hometown', label: 'Hometown', icon: 'map-marker' },
          { id: 'commercial', label: 'Commercial', icon: 'store' },
          { id: 'other', label: 'Other', icon: 'dots-horizontal' },
        ]}
        activeId={activeCategory}
        onChange={(id) => setActiveCategory(id as ChatCategory)}
      />

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <CoolIcon name="search" size={20} color="#6B7280" />
          <Text style={styles.searchPlaceholder}>Search chats...</Text>
        </View>
      </View>

      {/* Chat List */}
      <ScrollView style={styles.chatList} showsVerticalScrollIndicator={false}>
        {chatList.length === 0 ? (
          <View style={styles.emptyState}>
            <CoolIcon name="chat" size={48} color="#D1D5DB" />
            <Text style={styles.emptyStateTitle}>No chats available</Text>
            <Text style={styles.emptyStateSubtitle}>
              Start a conversation with your family members.
            </Text>
          </View>
        ) : (
          chatList.map((chat) => (
            <TouchableOpacity
              key={chat.id}
              style={[
                styles.chatItem,
                selectedChat === chat.id && styles.chatItemSelected
              ]}
              onPress={() => handleChatPress(chat)}
              activeOpacity={0.7}
            >
              {/* Avatar */}
              <View style={styles.avatarContainer}>
                <View style={[
                  styles.avatar,
                  { backgroundColor: chat.isGroup ? '#FFB6C1' : '#E5E7EB' }
                ]}>
                  {chat.isGroup ? (
                    <CoolIcon name="house-03" size={24} color="#FFFFFF" />
                  ) : (
                    <Text style={styles.avatarText}>{chat.avatar}</Text>
                  )}
                </View>
                {!chat.isGroup && (
                  <View style={[
                    styles.onlineIndicator,
                    { backgroundColor: getStatusColor(chat.isOnline) }
                  ]} />
                )}
              </View>

              {/* Chat Info */}
              <View style={styles.chatInfo}>
                <View style={styles.chatHeader}>
                  <Text style={styles.chatName}>{chat.name}</Text>
                  <Text style={styles.lastMessageTime}>{chat.lastMessageTime}</Text>
                </View>
                <View style={styles.chatFooter}>
                  <Text style={styles.lastMessage} numberOfLines={1}>
                    {chat.lastMessage}
                  </Text>
                  {chat.unreadCount > 0 && (
                    <View style={styles.unreadBadge}>
                      <Text style={styles.unreadText}>
                        {formatUnreadCount(chat.unreadCount)}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchPlaceholder: {
    marginLeft: 8,
    fontSize: 16,
    color: '#6B7280',
  },
  chatList: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  chatItemSelected: {
    backgroundColor: '#FEF7F7',
    borderRadius: 8,
    marginHorizontal: -8,
    paddingHorizontal: 8,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  chatInfo: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  lastMessageTime: {
    fontSize: 12,
    color: '#6B7280',
  },
  chatFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    flex: 1,
    fontSize: 14,
    color: '#6B7280',
    marginRight: 8,
  },
  unreadBadge: {
    backgroundColor: '#FF6B6B',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default ChatCardContent;

