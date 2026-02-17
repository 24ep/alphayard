
import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  FlatList,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Text,
} from 'react-native';
import { Box, HStack, VStack, Avatar, Input, IconButton, Menu, Icon } from 'native-base';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as Location from 'expo-location';

import { useAuth } from '../../contexts/AuthContext';
import { chatApi } from '../../services/api';
import { socketService } from '../../services/socket/SocketService';
import { analyticsService } from '../../services/analytics/AnalyticsService';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import MainScreenLayout from '../../components/layout/MainScreenLayout';
import { CircleDropdown } from '../../components/home/CircleDropdown';

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
  mediaUrl?: string; // For images/files
  location?: {
      latitude: number;
      longitude: number;
  };
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
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { chatId, chatName } = route.params;
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const [showCircleDropdown, setShowCircleDropdown] = useState(false);
  const [selectedCircle, setSelectedCircle] = useState('Smith Circle');

  const mapApiMessageToUiMessage = (apiMsg: any): Message => {
      const isOwn = apiMsg.senderId === user?.id;
      return {
          id: apiMsg.id,
          text: apiMsg.content,
          sender: {
              id: apiMsg.senderId,
              name: apiMsg.sender ? `${apiMsg.sender.firstName} ${apiMsg.sender.lastName || ''}`.trim() : 'Unknown',
              avatar: apiMsg.sender?.avatarUrl
          },
          timestamp: new Date(apiMsg.createdAt).getTime(),
          type: apiMsg.type || 'text',
          status: 'read', // Default to read for history
          isOwn,
          replyTo: apiMsg.replyTo ? {
              id: apiMsg.replyTo,
              text: 'Replying to message...', // Ideally fetch reply content
              sender: 'Unknown'
          } : undefined,
          reactions: apiMsg.reactions?.map((r: any) => ({
              emoji: r.emoji,
              users: [r.userId] // Simplified
          })),
          mediaUrl: apiMsg.metadata?.imageUri || apiMsg.metadata?.fileUri,
          location: (apiMsg.type === 'location' && apiMsg.metadata) ? {
              latitude: apiMsg.metadata.latitude,
              longitude: apiMsg.metadata.longitude
          } : undefined
      };
  };

  useEffect(() => {
    loadMessages();
    setupMessageListener();
    
    return () => {
        socketService.off('new-message');
    };
  }, [chatId]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const res = await chatApi.getMessages(chatId);
      if (res.success && res.data) {
          const formattedMessages = res.data.map(mapApiMessageToUiMessage);
          // Sort by timestamp (asc)
          formattedMessages.sort((a, b) => a.timestamp - b.timestamp);
          setMessages(formattedMessages);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
      Alert.alert('Error', 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const setupMessageListener = () => {
    socketService.on('new-message', (data: { message: any }) => {
      if (data.message && data.message.chatRoomId === chatId) {
          const newMsg = mapApiMessageToUiMessage(data.message);
          setMessages(prev => {
              // Deduplicate
              if (prev.some(m => m.id === newMsg.id)) return prev;
              return [...prev, newMsg];
          });
          scrollToBottom();
      }
    });
  };

  const sendMessage = async () => {
    if (!messageText.trim()) return;
    const textToSend = messageText.trim();
    setMessageText(''); // Clear immediately for UX

    try {
      setSending(true);
      // Optimistic update
      const tempId = Date.now().toString();
      const optimisticMsg: Message = {
          id: tempId,
          text: textToSend,
          sender: { 
              id: user?.id || 'me', 
              name: 'Me', // Will be replaced on refresh
              avatar: user?.avatar 
          },
          timestamp: Date.now(),
          type: 'text',
          status: 'sending',
          isOwn: true
      };
      setMessages(prev => [...prev, optimisticMsg]);
      scrollToBottom();

      const res = await chatApi.sendMessage(chatId, {
          content: textToSend,
          type: 'text'
      });
      
      if (res.success && res.data) {
          // Replace optimistic message
          const serverMsg = mapApiMessageToUiMessage(res.data);
          setMessages(prev => prev.map(m => m.id === tempId ? serverMsg : m));
      } else {
           setMessages(prev => prev.filter(m => m.id !== tempId)); // Remove if failed
           Alert.alert('Error', 'Failed to send message');
      }
      
      analyticsService.trackEvent('message_sent', {
        chatId,
        messageType: 'text',
        messageLength: textToSend.length,
      });
    } catch (error) {
      console.error('Failed to send message:', error);
      Alert.alert('Error', 'Failed to send message');
      setMessages(prev => prev.filter(m => m.status === 'sending')); // Remove optimistic
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
      const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        
        // 1. Send initial message
        const sendRes = await chatApi.sendMessage(chatId, {
            content: 'Image',
            type: 'image',
        });

        if (sendRes.success && sendRes.data) {
             const messageId = sendRes.data.id;
             
             // 2. Upload attachment
             // Note: In a real app we might want to show upload progress
             try {
                await chatApi.uploadAttachment(messageId, {
                    uri: asset.uri,
                    name: asset.fileName || 'image.jpg',
                    type: asset.mimeType || 'image/jpeg'
                });
             } catch (uploadError) {
                 console.error('Failed to upload attachment:', uploadError);
                 Alert.alert('Error', 'Message sent but failed to upload image');
             }

             // 3. Refresh
             loadMessages(); 
        }
      }
    } catch (error) {
      console.error('Failed to send image:', error);
      Alert.alert('Error', 'Failed to send image');
    }
  };

  const handleFilePicker = async () => {
    setShowMenu(false);
    try {
      const result = await DocumentPicker.getDocumentAsync({
          type: '*/*'
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        
        // 1. Send initial message
        const sendRes = await chatApi.sendMessage(chatId, {
            content: file.name,
            type: 'file',
        });

        if (sendRes.success && sendRes.data) {
            const messageId = sendRes.data.id;

            // 2. Upload attachment
            try {
                await chatApi.uploadAttachment(messageId, {
                    uri: file.uri,
                    name: file.name,
                    type: file.mimeType || 'application/octet-stream' // DocumentPicker usually provides mimeType
                });
            } catch (uploadError) {
                 console.error('Failed to upload file:', uploadError);
                 Alert.alert('Error', 'Message sent but failed to upload file');
            }

            // 3. Refresh
            loadMessages();
        }
      }
    } catch (error) {
      console.error('Failed to send file:', error);
      Alert.alert('Error', 'Failed to send file');
    }
  };

  const handleLocationShare = async () => {
    setShowMenu(false);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
          Alert.alert('Permission denied', 'Permission to access location was denied');
          return;
      }
      
      const location = await Location.getCurrentPositionAsync({});
      if (location) {
        await chatApi.sendMessage(chatId, {
           content: 'Shared Location',
           type: 'location',
           metadata: { 
               latitude: location.coords.latitude, 
               longitude: location.coords.longitude 
           }
        });
        loadMessages();
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
              {item.sender?.name?.charAt(0).toUpperCase() || '?'}
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
            <Text style={[styles.senderName, { marginLeft: 4 }]}>{item.sender?.name || 'Unknown'}</Text>
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
                  name={item.status ? getMessageStatusIcon(item.status) : 'clock-outline'}
                  size="xs"
                  color={item.status ? getMessageStatusColor(item.status) : '#9E9E9E'}
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
              {item.sender?.name?.charAt(0).toUpperCase() || '?'}
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
      <MainScreenLayout>
        <LoadingSpinner fullScreen />
      </MainScreenLayout>
    );
  }

  return (
    <MainScreenLayout>
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
          <Input
            flex={1}
            placeholder="Type a message..."
            value={messageText}
            onChangeText={setMessageText}
            style={styles.messageInput}
            InputLeftElement={
              <Menu
                isOpen={showMenu}
                onClose={() => setShowMenu(false)}
                trigger={(triggerProps) => (
                  <IconButton
                    {...triggerProps}
                    icon={<Icon as={MaterialCommunityIcons} name="paperclip" />}
                    onPress={handleAttachment}
                    variant="ghost"
                    colorScheme="gray"
                    _icon={{ color: "gray.500" }}
                    ml={2}
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
            }
            InputRightElement={
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
                variant="ghost"
                colorScheme="primary"
                mr={2}
              />
            }
          />
        </HStack>
      </KeyboardAvoidingView>

      <CircleDropdown
        visible={showCircleDropdown}
        onClose={() => setShowCircleDropdown(false)}
        selectedCircle={selectedCircle}
        onCircleSelect={(name: string) => { setSelectedCircle(name); setShowCircleDropdown(false); }}
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
