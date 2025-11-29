import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Box, HStack, VStack, Avatar, Input, Icon, Checkbox, Badge } from 'native-base';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { familyService } from '../../services/hourse/FamilyService';
import { chatService } from '../../services/chat/ChatService';
import { analyticsService } from '../../services/analytics/AnalyticsService';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';

interface FamilyMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'parent' | 'child' | 'guardian';
  isOnline: boolean;
  lastSeen: number;
  phone?: string;
}

interface NewChatScreenProps {
  route?: {
    params?: {
      preselectedMembers?: string[];
    };
  };
}

const NewChatScreen: React.FC<NewChatScreenProps> = ({ route }) => {
  const navigation = useNavigation();
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>(
    route?.params?.preselectedMembers || []
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadFamilyMembers();
  }, []);

  const loadFamilyMembers = async () => {
    try {
      setLoading(true);
      const members = await familyService.getFamilyMembers();
      setFamilyMembers(members);
    } catch (error) {
      console.error('Failed to load hourse members:', error);
      Alert.alert('Error', 'Failed to load hourse members');
    } finally {
      setLoading(false);
    }
  };

  const handleMemberToggle = (memberId: string) => {
    setSelectedMembers(prev => {
      if (prev.includes(memberId)) {
        return prev.filter(id => id !== memberId);
      } else {
        return [...prev, memberId];
      }
    });
  };

  const handleCreateChat = async () => {
    if (selectedMembers.length === 0) {
      Alert.alert('Error', 'Please select at least one hourse member');
      return;
    }

    try {
      setCreating(true);
      const chat = await chatService.createChat({
        type: selectedMembers.length === 1 ? 'individual' : 'group',
        members: selectedMembers,
        name: selectedMembers.length === 1 
          ? familyMembers.find(m => m.id === selectedMembers[0])?.name || 'Chat'
          : 'Group Chat',
      });

      analyticsService.trackEvent('chat_created', {
        chatType: chat.type,
        memberCount: selectedMembers.length,
      });

      navigation.navigate('ChatRoom', {
        chatId: chat.id,
        chatName: chat.name,
      });
    } catch (error) {
      console.error('Failed to create chat:', error);
      Alert.alert('Error', 'Failed to create chat');
    } finally {
      setCreating(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const filteredMembers = familyMembers.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getSelectedMembersNames = () => {
    return selectedMembers
      .map(id => familyMembers.find(m => m.id === id)?.name)
      .filter(Boolean)
      .join(', ');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner fullScreen />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Box style={styles.header}>
        <HStack space={3} alignItems="center" flex={1}>
          <Icon
            as={MaterialCommunityIcons}
            name="arrow-left"
            size="lg"
            color="primary.500"
            onPress={() => navigation.goBack()}
          />
          <VStack flex={1}>
            <Text style={styles.title}>New Chat</Text>
            <Text style={styles.subtitle}>
              {selectedMembers.length} member{selectedMembers.length !== 1 ? 's' : ''} selected
            </Text>
          </VStack>
        </HStack>
        <TouchableOpacity
          style={[
            styles.createButton,
            selectedMembers.length === 0 && styles.createButtonDisabled,
          ]}
          onPress={handleCreateChat}
          disabled={selectedMembers.length === 0 || creating}
        >
          {creating ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.createButtonText}>Create</Text>
          )}
        </TouchableOpacity>
      </Box>

      <Box style={styles.searchContainer}>
        <Input
          placeholder="Search hourse members..."
          value={searchQuery}
          onChangeText={handleSearch}
          InputLeftElement={
            <Icon
              as={MaterialCommunityIcons}
              name="magnify"
              size="sm"
              color="gray.400"
              ml={2}
            />
          }
          InputRightElement={
            searchQuery ? (
              <Icon
                as={MaterialCommunityIcons}
                name="close"
                size="sm"
                color="gray.400"
                mr={2}
                onPress={() => setSearchQuery('')}
              />
            ) : undefined
          }
          style={styles.searchInput}
        />
      </Box>

      {selectedMembers.length > 0 && (
        <Box style={styles.selectedContainer}>
          <Text style={styles.selectedTitle}>Selected Members:</Text>
          <Text style={styles.selectedNames} numberOfLines={2}>
            {getSelectedMembersNames()}
          </Text>
        </Box>
      )}

      {filteredMembers.length === 0 ? (
        <EmptyState
          icon="account-group-outline"
          title="No hourse members found"
          subtitle="Add hourse members to start chatting"
          actionText="Add Member"
          onAction={() => navigation.navigate('FamilySetup')}
        />
      ) : (
        <FlatList
          data={filteredMembers}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.memberItem}
              onPress={() => handleMemberToggle(item.id)}
            >
              <HStack space={3} alignItems="center" flex={1}>
                <Box position="relative">
                  <Avatar
                    size="md"
                    source={{ uri: item.avatar }}
                    bg="primary.500"
                  >
                    {item.name.charAt(0)}
                  </Avatar>
                  {item.isOnline && (
                    <Box
                      position="absolute"
                      bottom={0}
                      right={0}
                      w={3}
                      h={3}
                      bg="green.500"
                      borderRadius="full"
                      borderWidth={2}
                      borderColor="white"
                    />
                  )}
                </Box>

                <VStack flex={1}>
                  <Text style={styles.memberName}>{item.name}</Text>
                  <Text style={styles.memberEmail}>{item.email}</Text>
                  <HStack space={2} alignItems="center">
                    <Badge
                      colorScheme={
                        item.role === 'parent' ? 'blue' :
                        item.role === 'child' ? 'green' : 'purple'
                      }
                      rounded="full"
                      variant="subtle"
                    >
                      {item.role}
                    </Badge>
                    {item.isOnline && (
                      <Text style={styles.onlineStatus}>Online</Text>
                    )}
                  </HStack>
                </VStack>

                <Checkbox
                  value={item.id}
                  isChecked={selectedMembers.includes(item.id)}
                  onChange={() => handleMemberToggle(item.id)}
                  colorScheme="success"
                />
              </HStack>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id}
          style={styles.memberList}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
  },
  createButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  createButtonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
  },
  selectedContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  selectedTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  selectedNames: {
    fontSize: 14,
    color: '#666666',
  },
  memberList: {
    flex: 1,
  },
  memberItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  memberEmail: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  onlineStatus: {
    fontSize: 12,
    color: '#4CAF50',
  },
});

export default NewChatScreen; 