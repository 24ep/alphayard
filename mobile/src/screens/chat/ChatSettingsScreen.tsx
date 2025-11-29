import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Box, HStack, VStack, Avatar, Divider, Icon, Badge } from 'native-base';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { chatService } from '../../services/chat/ChatService';
import { analyticsService } from '../../services/analytics/AnalyticsService';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

interface ChatSettings {
  id: string;
  name: string;
  type: 'individual' | 'group' | 'hourse';
  avatar?: string;
  isMuted: boolean;
  isPinned: boolean;
  notifications: boolean;
  autoDelete: boolean;
  autoDeleteDays: number;
  theme: 'default' | 'dark' | 'custom';
  members: {
    id: string;
    name: string;
    avatar?: string;
    role: 'admin' | 'member';
    isOnline: boolean;
  }[];
  createdAt: number;
  lastActivity: number;
}

interface ChatSettingsScreenProps {
  route: {
    params: {
      chatId: string;
    };
  };
}

const ChatSettingsScreen: React.FC<ChatSettingsScreenProps> = ({ route }) => {
  const navigation = useNavigation();
  const { chatId } = route.params;
  const [settings, setSettings] = useState<ChatSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadChatSettings();
  }, [chatId]);

  const loadChatSettings = async () => {
    try {
      setLoading(true);
      const chatSettings = await chatService.getChatSettings(chatId);
      setSettings(chatSettings);
    } catch (error) {
      console.error('Failed to load chat settings:', error);
      Alert.alert('Error', 'Failed to load chat settings');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleMute = async () => {
    if (!settings) return;

    try {
      setUpdating(true);
      const updatedSettings = await chatService.updateChatSettings(chatId, {
        isMuted: !settings.isMuted,
      });
      setSettings(updatedSettings);
      
      analyticsService.trackEvent('chat_muted_toggled', {
        chatId,
        isMuted: updatedSettings.isMuted,
      });
    } catch (error) {
      console.error('Failed to toggle mute:', error);
      Alert.alert('Error', 'Failed to update settings');
    } finally {
      setUpdating(false);
    }
  };

  const handleTogglePin = async () => {
    if (!settings) return;

    try {
      setUpdating(true);
      const updatedSettings = await chatService.updateChatSettings(chatId, {
        isPinned: !settings.isPinned,
      });
      setSettings(updatedSettings);
      
      analyticsService.trackEvent('chat_pinned_toggled', {
        chatId,
        isPinned: updatedSettings.isPinned,
      });
    } catch (error) {
      console.error('Failed to toggle pin:', error);
      Alert.alert('Error', 'Failed to update settings');
    } finally {
      setUpdating(false);
    }
  };

  const handleToggleNotifications = async () => {
    if (!settings) return;

    try {
      setUpdating(true);
      const updatedSettings = await chatService.updateChatSettings(chatId, {
        notifications: !settings.notifications,
      });
      setSettings(updatedSettings);
      
      analyticsService.trackEvent('chat_notifications_toggled', {
        chatId,
        notifications: updatedSettings.notifications,
      });
    } catch (error) {
      console.error('Failed to toggle notifications:', error);
      Alert.alert('Error', 'Failed to update settings');
    } finally {
      setUpdating(false);
    }
  };

  const handleToggleAutoDelete = async () => {
    if (!settings) return;

    try {
      setUpdating(true);
      const updatedSettings = await chatService.updateChatSettings(chatId, {
        autoDelete: !settings.autoDelete,
      });
      setSettings(updatedSettings);
      
      analyticsService.trackEvent('chat_auto_delete_toggled', {
        chatId,
        autoDelete: updatedSettings.autoDelete,
      });
    } catch (error) {
      console.error('Failed to toggle auto delete:', error);
      Alert.alert('Error', 'Failed to update settings');
    } finally {
      setUpdating(false);
    }
  };

  const handleClearChat = () => {
    Alert.alert(
      'Clear Chat',
      'Are you sure you want to clear all messages? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await chatService.clearChat(chatId);
              Alert.alert('Success', 'Chat cleared successfully');
              
              analyticsService.trackEvent('chat_cleared', {
                chatId,
              });
            } catch (error) {
              console.error('Failed to clear chat:', error);
              Alert.alert('Error', 'Failed to clear chat');
            }
          },
        },
      ]
    );
  };

  const handleDeleteChat = () => {
    Alert.alert(
      'Delete Chat',
      'Are you sure you want to delete this chat? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await chatService.deleteChat(chatId);
              navigation.goBack();
              
              analyticsService.trackEvent('chat_deleted', {
                chatId,
              });
            } catch (error) {
              console.error('Failed to delete chat:', error);
              Alert.alert('Error', 'Failed to delete chat');
            }
          },
        },
      ]
    );
  };

  const handleEditChat = () => {
    navigation.navigate('EditChat', { chatId });
  };

  const handleViewMedia = () => {
    navigation.navigate('ChatMedia', { chatId });
  };

  const handleViewFiles = () => {
    navigation.navigate('ChatFiles', { chatId });
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner fullScreen />
      </SafeAreaView>
    );
  }

  if (!settings) {
    return (
      <SafeAreaView style={styles.container}>
        <Box style={styles.errorContainer}>
          <Text style={styles.errorText}>Chat not found</Text>
        </Box>
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
          <Text style={styles.title}>Chat Settings</Text>
        </HStack>
      </Box>

      {/* Chat Info */}
      <Box style={styles.chatInfo}>
        <HStack space={3} alignItems="center">
          <Avatar
            size="lg"
            source={{ uri: settings.avatar }}
            bg="primary.500"
          >
            {settings.name.charAt(0)}
          </Avatar>
          <VStack flex={1}>
            <Text style={styles.chatName}>{settings.name}</Text>
            <Text style={styles.chatType}>
              {settings.type.charAt(0).toUpperCase() + settings.type.slice(1)} Chat
            </Text>
            <Text style={styles.chatMembers}>
              {settings.members.length} member{settings.members.length !== 1 ? 's' : ''}
            </Text>
          </VStack>
        </HStack>
      </Box>

      {/* Quick Actions */}
      <Box style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <VStack space={2}>
          <TouchableOpacity style={styles.actionItem} onPress={handleViewMedia}>
            <HStack space={3} alignItems="center">
              <Icon as={MaterialCommunityIcons} name="image" size="md" color="primary.500" />
              <Text style={styles.actionText}>View Media</Text>
            </HStack>
            <Icon as={MaterialCommunityIcons} name="chevron-right" size="md" color="gray.400" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem} onPress={handleViewFiles}>
            <HStack space={3} alignItems="center">
              <Icon as={MaterialCommunityIcons} name="file" size="md" color="primary.500" />
              <Text style={styles.actionText}>View Files</Text>
            </HStack>
            <Icon as={MaterialCommunityIcons} name="chevron-right" size="md" color="gray.400" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem} onPress={handleEditChat}>
            <HStack space={3} alignItems="center">
              <Icon as={MaterialCommunityIcons} name="pencil" size="md" color="primary.500" />
              <Text style={styles.actionText}>Edit Chat</Text>
            </HStack>
            <Icon as={MaterialCommunityIcons} name="chevron-right" size="md" color="gray.400" />
          </TouchableOpacity>
        </VStack>
      </Box>

      {/* Chat Settings */}
      <Box style={styles.section}>
        <Text style={styles.sectionTitle}>Chat Settings</Text>
        <VStack space={2}>
          <HStack space={3} alignItems="center" justifyContent="space-between">
            <HStack space={3} alignItems="center">
              <Icon as={MaterialCommunityIcons} name="volume-off" size="md" color="gray.500" />
              <Text style={styles.settingText}>Mute Chat</Text>
            </HStack>
            <Switch
              value={settings.isMuted}
              onValueChange={handleToggleMute}
              disabled={updating}
              trackColor={{ false: '#E5E7EB', true: '#4CAF50' }}
              thumbColor={settings.isMuted ? '#FFFFFF' : '#FFFFFF'}
            />
          </HStack>

          <HStack space={3} alignItems="center" justifyContent="space-between">
            <HStack space={3} alignItems="center">
              <Icon as={MaterialCommunityIcons} name="pin" size="md" color="gray.500" />
              <Text style={styles.settingText}>Pin Chat</Text>
            </HStack>
            <Switch
              value={settings.isPinned}
              onValueChange={handleTogglePin}
              disabled={updating}
              trackColor={{ false: '#E5E7EB', true: '#4CAF50' }}
              thumbColor={settings.isPinned ? '#FFFFFF' : '#FFFFFF'}
            />
          </HStack>

          <HStack space={3} alignItems="center" justifyContent="space-between">
            <HStack space={3} alignItems="center">
              <Icon as={MaterialCommunityIcons} name="bell" size="md" color="gray.500" />
              <Text style={styles.settingText}>Notifications</Text>
            </HStack>
            <Switch
              value={settings.notifications}
              onValueChange={handleToggleNotifications}
              disabled={updating}
              trackColor={{ false: '#E5E7EB', true: '#4CAF50' }}
              thumbColor={settings.notifications ? '#FFFFFF' : '#FFFFFF'}
            />
          </HStack>

          <HStack space={3} alignItems="center" justifyContent="space-between">
            <HStack space={3} alignItems="center">
              <Icon as={MaterialCommunityIcons} name="delete-clock" size="md" color="gray.500" />
              <Text style={styles.settingText}>Auto Delete</Text>
            </HStack>
            <Switch
              value={settings.autoDelete}
              onValueChange={handleToggleAutoDelete}
              disabled={updating}
              trackColor={{ false: '#E5E7EB', true: '#4CAF50' }}
              thumbColor={settings.autoDelete ? '#FFFFFF' : '#FFFFFF'}
            />
          </HStack>
        </VStack>
      </Box>

      {/* Chat Members */}
      <Box style={styles.section}>
        <Text style={styles.sectionTitle}>Members</Text>
        <VStack space={2}>
          {settings.members.map((member) => (
            <HStack key={member.id} space={3} alignItems="center">
              <Box position="relative">
                <Avatar
                  size="sm"
                  source={{ uri: member.avatar }}
                  bg="primary.500"
                >
                  {member.name.charAt(0)}
                </Avatar>
                {member.isOnline && (
                  <Box
                    position="absolute"
                    bottom={0}
                    right={0}
                    w={2}
                    h={2}
                    bg="green.500"
                    borderRadius="full"
                    borderWidth={1}
                    borderColor="white"
                  />
                )}
              </Box>
              <VStack flex={1}>
                <Text style={styles.memberName}>{member.name}</Text>
                <HStack space={2} alignItems="center">
                  <Badge
                    colorScheme={member.role === 'admin' ? 'red' : 'blue'}
                    rounded="full"
                    variant="subtle"
                  >
                    {member.role}
                  </Badge>
                  {member.isOnline && (
                    <Text style={styles.onlineStatus}>Online</Text>
                  )}
                </HStack>
              </VStack>
            </HStack>
          ))}
        </VStack>
      </Box>

      {/* Danger Zone */}
      <Box style={styles.section}>
        <Text style={styles.sectionTitle}>Danger Zone</Text>
        <VStack space={2}>
          <TouchableOpacity style={styles.dangerItem} onPress={handleClearChat}>
            <HStack space={3} alignItems="center">
              <Icon as={MaterialCommunityIcons} name="delete-sweep" size="md" color="orange.500" />
              <Text style={styles.dangerText}>Clear Chat</Text>
            </HStack>
          </TouchableOpacity>

          <TouchableOpacity style={styles.dangerItem} onPress={handleDeleteChat}>
            <HStack space={3} alignItems="center">
              <Icon as={MaterialCommunityIcons} name="delete" size="md" color="red.500" />
              <Text style={styles.dangerText}>Delete Chat</Text>
            </HStack>
          </TouchableOpacity>
        </VStack>
      </Box>

      {/* Chat Info */}
      <Box style={styles.section}>
        <Text style={styles.sectionTitle}>Chat Information</Text>
        <VStack space={2}>
          <HStack justifyContent="space-between">
            <Text style={styles.infoLabel}>Created</Text>
            <Text style={styles.infoValue}>{formatDate(settings.createdAt)}</Text>
          </HStack>
          <HStack justifyContent="space-between">
            <Text style={styles.infoLabel}>Last Activity</Text>
            <Text style={styles.infoValue}>{formatDate(settings.lastActivity)}</Text>
          </HStack>
        </VStack>
      </Box>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#666666',
  },
  chatInfo: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  chatName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  chatType: {
    fontSize: 14,
    color: '#666666',
  },
  chatMembers: {
    fontSize: 14,
    color: '#666666',
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  actionText: {
    fontSize: 16,
    color: '#333333',
  },
  settingText: {
    fontSize: 16,
    color: '#333333',
  },
  memberName: {
    fontSize: 16,
    color: '#333333',
  },
  onlineStatus: {
    fontSize: 12,
    color: '#4CAF50',
  },
  dangerItem: {
    paddingVertical: 8,
  },
  dangerText: {
    fontSize: 16,
    color: '#F44336',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666666',
  },
  infoValue: {
    fontSize: 14,
    color: '#333333',
  },
});

export default ChatSettingsScreen; 