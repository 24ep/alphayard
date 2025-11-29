import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Box, HStack, VStack, Avatar, Input, IconButton, Menu, Divider } from 'native-base';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { chatService } from '../../services/chat/ChatService';
import { analyticsService } from '../../services/analytics/AnalyticsService';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import MainScreenLayout from '../../components/layout/MainScreenLayout';
import { FamilyDropdown } from '../../components/home/FamilyDropdown';

interface Message {
  id: string;
  text: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
  };
  timestamp: number;
  type: 'text' | 'image' | 'file' | 'location' | 'voice';
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  isOwn: boolean;
  replyTo?: {
    id: string;
    text: string;
    sender: string;
  };
  reactions?: {
    emoji: string;
    users: string[];
  }[];
}

interface ChatRoomScreenProps {
  route: {
    params: {
      chatId: string;
      chatName: string;
    };
  };
}

const ChatRoomScreen: React.FC<ChatRoomScreenProps> = ({ route }) => {
  const navigation = useNavigation();
  const { chatId, chatName } = route.params;
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const [showFamilyDropdown, setShowFamilyDropdown] = useState(false);
  const [selectedFamily, setSelectedFamily] = useState('Smith hourse');

  useEffect(() => {
    loadMessages();
    setupMessageListener();
  }, [chatId]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const chatMessages = await chatService.getMessages(chatId);
      setMessages(chatMessages);
    } catch (error) {
      console.error('Failed to load messages:', error);
      Alert.alert('Error', 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const setupMessageListener = () => {
    // Setup real-time message listener
    chatService.onMessageReceived(chatId, (message: Message) => {
      setMessages(prev => [...prev, message]);
      scrollToBottom();
    });
  };

  const sendMessage = async () => {
    if (!messageText.trim()) return;

    try {
      setSending(true);
      const newMessage = await chatService.sendMessage(chatId, {
        text: messageText.trim(),
        type: 'text',
      });
      
      setMessages(prev => [...prev, newMessage]);
      setMessageText('');
      scrollToBottom();
      
      analyticsService.trackEvent('message_sent', {
        chatId,
        messageType: 'text',
        messageLength: messageText.length,
      });
    } catch (error) {
      console.error('Failed to send message:', error);
      Alert.alert('Error', 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleAttachment = () => {
    setShowMenu(true);
  };

  const handleImagePicker = async () => {
    setShowMenu(false);
    try {
      const image = await chatService.pickImage();
      if (image) {
        await chatService.sendMessage(chatId, {
          type: 'image',
          imageUri: image.uri,
        });
      }
    } catch (error) {
      console.error('Failed to send image:', error);
      Alert.alert('Error', 'Failed to send image');
    }
  };

  const handleFilePicker = async () => {
    setShowMenu(false);
    try {
      const file = await chatService.pickFile();
      if (file) {
        await chatService.sendMessage(chatId, {
          type: 'file',
          fileUri: file.uri,
          fileName: file.name,
        });
      }
    } catch (error) {
      console.error('Failed to send file:', error);
      Alert.alert('Error', 'Failed to send file');
    }
  };

  const handleLocationShare = async () => {
    setShowMenu(false);
    try {
      const location = await chatService.getCurrentLocation();
      if (location) {
        await chatService.sendMessage(chatId, {
          type: 'location',
          latitude: location.latitude,
          longitude: location.longitude,
        });
      }
    } catch (error) {
      console.error('Failed to share location:', error);
      Alert.alert('Error', 'Failed to share location');
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getMessageStatusIcon = (status: string) => {
    switch (status) {
      case 'sending':
        return 'clock-outline';
      case 'sent':
        return 'check';
      case 'delivered':
        return 'check-all';
      case 'read':
        return 'check-all';
      case 'failed':
        return 'alert-circle';
      default:
        return 'clock-outline';
    }
  };

  const getMessageStatusColor = (status: string) => {
    switch (status) {
      case 'sending':
        return '#9E9E9E';
      case 'sent':
        return '#9E9E9E';
      case 'delivered':
        return '#4CAF50';
      case 'read':
        return '#2196F3';
      case 'failed':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <Box
      style={[
        styles.messageContainer,
        item.isOwn ? styles.ownMessage : styles.otherMessage,
      ]}
    >
      <HStack 
        space={3} 
        alignItems="flex-end"
        flexDirection={item.isOwn ? 'row-reverse' : 'row'}
      >
        {/* Left Avatar for other messages */}
        {!item.isOwn && (
          <Box position="relative">
            <Avatar
              size="md"
              source={{ uri: item.sender.avatar }}
              bg="primary.500"
              borderWidth={2}
              borderColor="white"
              shadow={2}
            >
              {item.sender.name.charAt(0).toUpperCase()}
            </Avatar>
            {/* Online indicator */}
            <Box
              position="absolute"
              bottom={0}
              right={0}
              w={3}
              h={3}
              borderRadius="full"
              bg="green.500"
              borderWidth={2}
              borderColor="white"
            />
          </Box>
        )}

        <VStack space={1} flex={1}>
          {!item.isOwn && (
            <Text style={styles.senderName} ml={1}>{item.sender.name}</Text>
          )}

          <Box
            style={[
              styles.messageBubble,
              item.isOwn ? styles.ownBubble : styles.otherBubble,
            ]}
          >
            {item.replyTo && (
              <Box style={styles.replyContainer}>
                <Text style={styles.replyText} numberOfLines={1}>
                  {item.replyTo.sender}: {item.replyTo.text}
                </Text>
              </Box>
            )}

            {item.type === 'text' && (
              <Text style={styles.messageText}>{item.text}</Text>
            )}

            {item.type === 'image' && (
              <Box style={styles.imageContainer}>
                <Text style={styles.imageText}>📷 Image</Text>
              </Box>
            )}

            {item.type === 'file' && (
              <Box style={styles.fileContainer}>
                <Text style={styles.fileText}>File</Text>
              </Box>
            )}

            {item.type === 'location' && (
              <Box style={styles.locationContainer}>
                <Text style={styles.locationText}>📍 Location</Text>
              </Box>
            )}

            {item.type === 'voice' && (
              <Box style={styles.voiceContainer}>
                <Text style={styles.voiceText}>🎤 Voice message</Text>
              </Box>
            )}

            <HStack space={1} alignItems="center" justifyContent="flex-end">
              <Text style={styles.messageTime}>
                {formatTime(item.timestamp)}
              </Text>
              {item.isOwn && (
                <Icon
                  as={MaterialCommunityIcons}
                  name={getMessageStatusIcon(item.status)}
                  size="xs"
                  color={getMessageStatusColor(item.status)}
                />
              )}
            </HStack>
          </Box>
        </VStack>

        {/* Right Avatar for own messages */}
        {item.isOwn && (
          <Box position="relative">
            <Avatar
              size="md"
              source={{ uri: item.sender.avatar }}
              bg="gray.500"
              borderWidth={2}
              borderColor="white"
              shadow={2}
            >
              {item.sender.name.charAt(0).toUpperCase()}
            </Avatar>
            {/* Online indicator for own messages */}
            <Box
              position="absolute"
              bottom={0}
              right={0}
              w={3}
              h={3}
              borderRadius="full"
              bg="green.500"
              borderWidth={2}
              borderColor="white"
            />
          </Box>
        )}
      </HStack>
    </Box>
  );

  if (loading) {
    return (
      <MainScreenLayout
        selectedFamily={selectedFamily}
        showFamilyDropdown={showFamilyDropdown}
        onToggleFamilyDropdown={() => setShowFamilyDropdown(!showFamilyDropdown)}
      >
        <LoadingSpinner fullScreen />
      </MainScreenLayout>
    );
  }

  return (
    <MainScreenLayout
      selectedFamily={selectedFamily}
      showFamilyDropdown={showFamilyDropdown}
      onToggleFamilyDropdown={() => setShowFamilyDropdown(!showFamilyDropdown)}
    >
      <Box style={styles.header}>
        <HStack space={3} alignItems="center" flex={1}>
          <IconButton
            icon={<Icon as={MaterialCommunityIcons} name="arrow-left" />}
            onPress={() => navigation.goBack()}
            variant="ghost"
            colorScheme="primary"
          />
          <Avatar
            size="sm"
            bg="primary.500"
            style={styles.headerAvatar}
          >
            {chatName.charAt(0)}
          </Avatar>
          <VStack flex={1}>
            <Text style={styles.headerTitle}>{chatName}</Text>
            <Text style={styles.headerSubtitle}>Online</Text>
          </VStack>
        </HStack>
        <IconButton
          icon={<Icon as={MaterialCommunityIcons} name="dots-vertical" />}
          onPress={() => navigation.navigate('ChatSettings', { chatId })}
          variant="ghost"
          colorScheme="primary"
        />
      </Box>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messageList}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={scrollToBottom}
        onLayout={scrollToBottom}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputContainer}
      >
        <HStack space={2} alignItems="center">
          <Menu
            isOpen={showMenu}
            onClose={() => setShowMenu(false)}
            trigger={(triggerProps) => (
              <IconButton
                {...triggerProps}
                icon={<Icon as={MaterialCommunityIcons} name="paperclip" />}
                onPress={handleAttachment}
                variant="ghost"
                colorScheme="primary"
              />
            )}
          >
            <Menu.Item onPress={handleImagePicker}>
              <HStack space={2} alignItems="center">
                <Icon as={MaterialCommunityIcons} name="image" />
                <Text>Photo</Text>
              </HStack>
            </Menu.Item>
            <Menu.Item onPress={handleFilePicker}>
              <HStack space={2} alignItems="center">
                <Icon as={MaterialCommunityIcons} name="file" />
                <Text>File</Text>
              </HStack>
            </Menu.Item>
            <Menu.Item onPress={handleLocationShare}>
              <HStack space={2} alignItems="center">
                <Icon as={MaterialCommunityIcons} name="map-marker" />
                <Text>Location</Text>
              </HStack>
            </Menu.Item>
          </Menu>

          <Input
            flex={1}
            placeholder="Type a message..."
            value={messageText}
            onChangeText={setMessageText}
            multiline
            maxHeight={100}
            style={styles.messageInput}
          />

          <IconButton
            icon={
              sending ? (
                <ActivityIndicator size="small" color="#4A90E2" />
              ) : (
                <Icon as={MaterialCommunityIcons} name="send" />
              )
            }
            onPress={sendMessage}
            disabled={!messageText.trim() || sending}
            colorScheme="primary"
            variant="solid"
            rounded="full"
          />
        </HStack>
      </KeyboardAvoidingView>

      <FamilyDropdown
        visible={showFamilyDropdown}
        onClose={() => setShowFamilyDropdown(false)}
        selectedFamily={selectedFamily}
        onFamilySelect={(name: string) => { setSelectedFamily(name); setShowFamilyDropdown(false); }}
        availableFamilies={[]}
      />
    </MainScreenLayout>
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
  headerAvatar: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666666',
  },
  messageList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    marginVertical: 4,
  },
  ownMessage: {
    justifyContent: 'flex-end',
  },
  otherMessage: {
    justifyContent: 'flex-start',
  },
  messageAvatar: {
    marginRight: 8,
  },
  senderName: {
    fontSize: 12,
    color: '#666666',
    marginLeft: 8,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
  },
  ownBubble: {
    backgroundColor: '#4A90E2',
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: '#F0F0F0',
    borderBottomLeftRadius: 4,
  },
  replyContainer: {
    backgroundColor: 'rgba(0,0,0,0.1)',
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  replyText: {
    fontSize: 12,
    color: '#666666',
  },
  messageText: {
    fontSize: 16,
    color: '#333333',
  },
  imageContainer: {
    alignItems: 'center',
    padding: 20,
  },
  imageText: {
    fontSize: 16,
    color: '#666666',
  },
  fileContainer: {
    alignItems: 'center',
    padding: 20,
  },
  fileText: {
    fontSize: 16,
    color: '#666666',
  },
  locationContainer: {
    alignItems: 'center',
    padding: 20,
  },
  locationText: {
    fontSize: 16,
    color: '#666666',
  },
  voiceContainer: {
    alignItems: 'center',
    padding: 20,
  },
  voiceText: {
    fontSize: 16,
    color: '#666666',
  },
  messageTime: {
    fontSize: 12,
    color: '#666666',
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  messageInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
});

export default ChatRoomScreen; 