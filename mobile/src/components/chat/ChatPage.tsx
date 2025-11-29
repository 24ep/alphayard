import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import CoolIcon from '../common/CoolIcon';
import { GroupManagement } from './GroupManagement';
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

interface ChatPageProps {
  onClose: () => void;
  onNavigateToChat: (chatId: string, chatName: string) => void;
  familyMembers?: any[];
}

type ChatCategory = 'hourse' | 'workplace' | 'hometown' | 'commercial' | 'other';

export const ChatPage: React.FC<ChatPageProps> = ({ onClose, onNavigateToChat, familyMembers = [] }) => {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [showGroupManagement, setShowGroupManagement] = useState(false);
  const [groupManagementMode, setGroupManagementMode] = useState<'create' | 'manage'>('create');
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [selectedGroupName, setSelectedGroupName] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<ChatCategory>('hourse');

  // Generate chat list from real hourse data
  const generateChatList = (): ChatMember[] => {
    const chatList: ChatMember[] = [];
    
    // Add hourse group chat if there are multiple members
    if (familyMembers.length > 1) {
      chatList.push({
        id: 'hourse-group',
        name: 'hourse Group',
        avatar: '👨‍👩‍👧‍👦',
        lastMessage: 'No recent messages',
        lastMessageTime: 'No activity',
        unreadCount: 0,
        isOnline: familyMembers.some(member => member.status === 'online'),
        isGroup: true,
      });
    }
    
    // Add individual hourse members
    familyMembers.forEach((member) => {
      chatList.push({
        id: member.id || `member-${member.name}`,
        name: member.name || 'hourse Member',
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
    onNavigateToChat(chat.id, chat.name);
  };

  const handleCreateGroup = () => {
    setGroupManagementMode('create');
    setShowGroupManagement(true);
  };

  const handleManageGroup = (groupId: string, groupName: string) => {
    setSelectedGroupId(groupId);
    setSelectedGroupName(groupName);
    setGroupManagementMode('manage');
    setShowGroupManagement(true);
  };

  const handleCreateNewGroup = (groupName: string, selectedMembers: string[]) => {
    // In a real app, this would create a group via API
    Alert.alert('Success', `Group "${groupName}" created with ${selectedMembers.length} members!`);
    // Refresh chat list or add new group to list
  };

  const handleInviteMembers = (groupId: string, memberIds: string[]) => {
    // In a real app, this would invite members via API
    Alert.alert('Success', `${memberIds.length} members invited to the group!`);
  };

  const handleRemoveMember = (groupId: string, memberId: string) => {
    // In a real app, this would remove member via API
    Alert.alert('Success', 'Member removed from the group!');
  };

  const handleLeaveGroup = (groupId: string) => {
    // In a real app, this would leave group via API
    Alert.alert('Success', 'You have left the group!');
  };

  const getStatusColor = (isOnline: boolean) => {
    return isOnline ? '#10B981' : '#6B7280';
  };

  const formatUnreadCount = (count: number) => {
    return count > 99 ? '99+' : count.toString();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onClose}>
          <CoolIcon name="arrow-left" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chats</Text>
        <TouchableOpacity style={styles.newChatButton} onPress={handleCreateGroup}>
          <CoolIcon name="plus" size={24} color="#1F2937" />
        </TouchableOpacity>
      </View>

      {/* Category Tabs */}
      <SegmentedTabs
        tabs={[
          { id: 'hourse', label: 'hourse', icon: 'home' },
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
        {chatList.map((chat) => (
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
                <View style={styles.chatHeaderRight}>
                  {chat.isGroup && (
                    <TouchableOpacity
                      style={styles.groupManageButton}
                      onPress={() => handleManageGroup(chat.id, chat.name)}
                    >
                      <CoolIcon name="house-03" size={16} color="#6B7280" />
                    </TouchableOpacity>
                  )}
                  <Text style={styles.lastMessageTime}>{chat.lastMessageTime}</Text>
                </View>
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
        ))}
      </ScrollView>

      {/* Group Management Modal */}
      <GroupManagement
        visible={showGroupManagement}
        onClose={() => setShowGroupManagement(false)}
        groupId={groupManagementMode === 'manage' ? selectedGroupId : undefined}
        groupName={groupManagementMode === 'manage' ? selectedGroupName : undefined}
        members={[]} // In a real app, this would be the actual group members
        allFamilyMembers={familyMembers}
        onCreateGroup={handleCreateNewGroup}
        onInviteMembers={handleInviteMembers}
        onRemoveMember={handleRemoveMember}
        onLeaveGroup={handleLeaveGroup}
      />
    </View>
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 182, 193, 0.1)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  newChatButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 182, 193, 0.1)',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
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
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  chatItemSelected: {
    backgroundColor: '#FEF7F7',
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
  chatHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  groupManageButton: {
    padding: 4,
    marginRight: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 182, 193, 0.1)',
  },
});
