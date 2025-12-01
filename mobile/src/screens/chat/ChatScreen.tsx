import React, { useState, useEffect, useRef } from 'react';
import { View, KeyboardAvoidingView, Platform, FlatList, Alert, TouchableOpacity, Image, Linking } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  Button,
  Icon,
  Pressable,
  useColorModeValue,
  Avatar,
  Badge,
  Divider,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Spinner,
} from 'native-base';
import { useNavigation, useRoute } from '@react-navigation/native';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';
import * as DocumentPicker from 'expo-document-picker';
import { imagePickerService } from '../../services/imagePicker/ImagePickerService';
import { Audio } from 'expo-av';
import { colors } from '../../theme/colors';
import { textStyles } from '../../theme/typography';
import { chatApi, type Chat, type Message } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';

interface ChatScreenProps {
  route: {
    params: {
      familyId: string;
      familyName: string;
      participants: Array<{
        id: string;
        name: string;
        avatar?: string;
        isOnline: boolean;
      }>;
    };
  };
}

const ChatScreen: React.FC<ChatScreenProps> = ({ route }) => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { 
    isConnected, 
    joinChat, 
    leaveChat, 
    sendMessage, 
    startTyping, 
    stopTyping,
    initiateCall,
    on, 
    off 
  } = useSocket();
  
  const { familyId, familyName, participants } = route.params;
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [chat, setChat] = useState<Chat | null>(null);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  const flatListRef = useRef<FlatList>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const bgColor = useColorModeValue(colors.white[500], colors.gray[900]);
  const cardBgColor = useColorModeValue(colors.white[500], colors.gray[800]);
  const textColor = useColorModeValue(colors.gray[800], colors.white[500]);
  const inputBgColor = useColorModeValue(colors.gray[100], colors.gray[700]);

  useEffect(() => {
    // Load chat history
    loadChatHistory();
    
    // Setup socket listeners (aligned with backend socket event names)
    on('new-message', handleNewMessage as any);
    on('chat:typing', handleTypingStatus as any);
    on('chat-joined', handleJoinedChat as any);
    on('chat-left', handleLeftChat as any);
    
    // Join chat room when connected
    if (isConnected && chat?.id) {
      joinChat(chat.id);
    }
    
    return () => {
      off('new-message', handleNewMessage as any);
      off('chat:typing', handleTypingStatus as any);
      off('chat-joined', handleJoinedChat as any);
      off('chat-left', handleLeftChat as any);
      
      if (chat?.id) {
        leaveChat(chat.id);
      }

      // Cleanup recording
      if (recording) {
        recording.stopAndUnloadAsync().catch(console.error);
      }
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, [familyId, isConnected, chat?.id, recording]);

  const loadChatHistory = async () => {
    try {
      setIsLoading(true);
      
      // First, get or create the hourse chat
      const chatsResponse = await chatApi.getChats();
      if (chatsResponse.success) {
        let familyChat = chatsResponse.chats.find(c => c.type === 'hourse');
        
        if (!familyChat) {
          // Create hourse chat if it doesn't exist
          const createResponse = await chatApi.createChat({
            type: 'hourse',
            name: `${familyName} hourse Chat`,
            description: `hourse chat for ${familyName}`,
          });
          if (createResponse.success) {
            familyChat = createResponse.chat;
          }
        }
        
        if (familyChat) {
          setChat(familyChat);
          
          // Load messages for this chat
          const messagesResponse = await chatApi.getMessages(familyChat.id, {
            limit: 50,
            offset: 0,
          });
          
          if (messagesResponse.success) {
            setMessages(messagesResponse.messages);
          }
        }
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
      Alert.alert('Error', 'Failed to load chat messages');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewMessage = (data: { message: Message }) => {
    setMessages(prev => [...prev, data.message]);
    scrollToBottom();
  };

  const handleTypingStatus = (data: { chatId: string; userId: string; userName: string; isTyping: boolean }) => {
    if (data.userId === user?.id) return;
    
    setTypingUsers(prev => {
      if (data.isTyping) {
        return prev.includes(data.userId) ? prev : [...prev, data.userId];
      } else {
        return prev.filter(id => id !== data.userId);
      }
    });
  };

  const handleJoinedChat = (data: { chatId: string; message: string }) => {
    console.log('Joined chat:', data);
  };

  const handleLeftChat = (data: { chatId: string; message: string }) => {
    console.log('Left chat:', data);
  };

  // Send message with attachment
  const sendMessageWithAttachment = async (file: any, image: any, audioUri: string | null) => {
    if (!chat || !user) return;

    try {
      setIsSending(true);
      
      let messageType: 'text' | 'image' | 'video' | 'audio' | 'location' | 'file' = 'text';
      let content = newMessage.trim() || '';
      let metadata: any = {};

      // Determine message type and prepare content
      if (audioUri) {
        messageType = 'audio';
        content = content || 'Voice message';
        metadata = { audioUri, duration: recordingTime };
        setRecordingUri(null);
        setRecordingTime(0);
      } else if (image) {
        messageType = 'image';
        content = content || '📷 Image';
        metadata = { 
          imageUri: image.uri,
          width: image.width,
          height: image.height 
        };
        setSelectedImage(null);
      } else if (file) {
        messageType = 'file';
        content = content || `📎 ${file.name}`;
        metadata = {
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          fileUri: file.uri
        };
        setSelectedFile(null);
      }

      // Send message via Socket.io for real-time delivery
      if (isConnected) {
        sendMessage(chat.id, content, messageType);
      } else {
        // Fallback to API if socket not connected
        const response = await chatApi.sendMessage(chat.id, {
          content,
          type: messageType,
          metadata,
        });
        
        if (response.success) {
          setMessages(prev => [...prev, response.data]);
        }
      }
      
      // Clear input and attachments
      setNewMessage('');
      setSelectedFile(null);
      setSelectedImage(null);
      
      // Stop typing indicator
      setIsTyping(false);
      stopTyping(chat.id);
      
      // Scroll to bottom
      scrollToBottom();
    } catch (error) {
      console.error('Failed to send message with attachment:', error);
      Alert.alert('Error', 'Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() && !selectedFile && !selectedImage && !recordingUri) return;
    if (!user || !chat) return;

    // If there's an attachment, use the attachment handler
    if (selectedFile || selectedImage || recordingUri) {
      await sendMessageWithAttachment(selectedFile, selectedImage, recordingUri);
      return;
    }

    // Otherwise send text message
    try {
      setIsSending(true);
      
      // Send message via Socket.io for real-time delivery
      if (isConnected) {
        sendMessage(chat.id, newMessage.trim(), 'text');
      } else {
        // Fallback to API if socket not connected
        const response = await chatApi.sendMessage(chat.id, {
          content: newMessage.trim(),
          type: 'text',
        });
        
        if (response.success) {
          setMessages(prev => [...prev, response.data]);
        }
      }
      
      // Clear input
      setNewMessage('');
      
      // Stop typing indicator
      setIsTyping(false);
      stopTyping(chat.id);
      
      // Scroll to bottom
      scrollToBottom();
    } catch (error) {
      console.error('Failed to send message:', error);
      Alert.alert('Error', 'Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const handleTyping = (text: string) => {
    setNewMessage(text);
    
    if (!isTyping && text.length > 0) {
      setIsTyping(true);
      if (chat?.id) {
        startTyping(chat.id);
      }
    }
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      if (chat?.id) {
        stopTyping(chat.id);
      }
    }, 1000);
  };

  const handleTyping = (text: string) => {
    setNewMessage(text);
    
    // Handle typing indicator
    if (!isTyping) {
      setIsTyping(true);
      socketService.sendTypingStatus(true);
    }
    
    // Clear typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socketService.sendTypingStatus(false);
    }, 1000);
  };

  const scrollToBottom = () => {
    flatListRef.current?.scrollToEnd({ animated: true });
  };

  // Handle file selection
  const handleFileSelect = async () => {
    try {
      setShowAttachmentMenu(false);
      
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setSelectedFile({
          uri: file.uri,
          name: file.name,
          type: file.mimeType || 'application/octet-stream',
          size: file.size,
        });
      }
    } catch (error: any) {
      console.error('Error picking file:', error);
      Alert.alert('Error', 'Failed to select file. Please try again.');
    }
  };

  // Handle image selection
  const handleImageSelect = async () => {
    try {
      setShowAttachmentMenu(false);
      
      // Request permissions
      const permissionResult = await imagePickerService.requestMediaLibraryPermissionsAsync();
      if (permissionResult.status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant access to your photo library.');
        return;
      }

      const result = await imagePickerService.launchImageLibraryAsync({
        mediaTypes: 'Images',
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const image = result.assets[0];
        setSelectedImage({
          uri: image.uri,
          type: 'image/jpeg',
          width: image.width,
          height: image.height,
        });
      }
    } catch (error: any) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  // Handle camera capture
  const handleCameraCapture = async () => {
    try {
      setShowAttachmentMenu(false);
      
      // Request camera permissions
      const permissionResult = await imagePickerService.requestCameraPermissionsAsync();
      if (permissionResult.status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant camera access.');
        return;
      }

      const result = await imagePickerService.launchCameraAsync({
        mediaTypes: 'Images',
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const image = result.assets[0];
        setSelectedImage({
          uri: image.uri,
          type: 'image/jpeg',
          width: image.width,
          height: image.height,
        });
      }
    } catch (error: any) {
      console.error('Error capturing image:', error);
      Alert.alert('Error', 'Failed to capture image. Please try again.');
    }
  };

  // Handle voice recording start
  const handleStartRecording = async () => {
    try {
      // Request audio permissions
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant microphone access.');
        return;
      }

      // Configure audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Start recording
      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(newRecording);
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error: any) {
      console.error('Error starting recording:', error);
      Alert.alert('Error', 'Failed to start recording. Please try again.');
    }
  };

  // Handle voice recording stop
  const handleStopRecording = async () => {
    try {
      if (!recording) return;

      // Stop timer
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }

      // Stop recording
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      
      setIsRecording(false);
      setRecording(null);
      
      if (uri) {
        setRecordingUri(uri);
        // Auto-send the recording (or you can show a preview first)
        await sendMessageWithAttachment(null, null, uri);
      }
    } catch (error: any) {
      console.error('Error stopping recording:', error);
      Alert.alert('Error', 'Failed to stop recording.');
      setIsRecording(false);
      setRecording(null);
    }
  };

  // Handle attachment menu toggle
  const toggleAttachmentMenu = () => {
    setShowAttachmentMenu(!showAttachmentMenu);
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isOwnMessage = item.senderId === user?.id;
    const messageTime = new Date(item.timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <Box
        alignSelf={isOwnMessage ? 'flex-end' : 'flex-start'}
        maxW="80%"
        mb={3}
      >
        <HStack 
          space={2} 
          alignItems="flex-end"
          flexDirection={isOwnMessage ? 'row-reverse' : 'row'}
        >
          {/* Left Avatar for other messages */}
          {!isOwnMessage && (
            <Box position="relative">
              <Avatar
                size="md"
                source={{ uri: item.senderAvatar }}
                bg={colors.primary[500]}
                borderWidth={2}
                borderColor={colors.white[500]}
                shadow={2}
              >
                {item.senderName.charAt(0).toUpperCase()}
              </Avatar>
              {/* Online indicator */}
              <Box
                position="absolute"
                bottom={0}
                right={0}
                w={3}
                h={3}
                borderRadius="full"
                bg={colors.green[500]}
                borderWidth={2}
                borderColor={colors.white[500]}
              />
            </Box>
          )}
          
          {/* Message Bubble */}
          <VStack space={1} flex={1}>
            {!isOwnMessage && (
              <Text style={textStyles.caption} color={colors.gray[600]} mb={1} ml={1}>
                {item.senderName}
              </Text>
            )}
            
            <Box
              bg={isOwnMessage ? 'rgba(255, 90, 90, 0.8)' : 'rgba(255, 255, 255, 0.7)'}
              px={4}
              py={3}
              borderRadius={20}
              borderTopLeftRadius={isOwnMessage ? 20 : 4}
              borderTopRightRadius={isOwnMessage ? 4 : 20}
              shadow={3}
              elevation={4}
              style={{
                shadowColor: '#000',
                shadowOffset: {
                  width: 0,
                  height: 2,
                },
                shadowOpacity: 0.15,
                shadowRadius: 4,
              }}
            >
              {item.type === 'text' && (
                <Text
                  style={textStyles.body}
                  color={isOwnMessage ? colors.white[500] : textColor}
                >
                  {item.content}
                </Text>
              )}
              
              {item.type === 'image' && item.metadata?.imageUrl && (
                <Box>
                  <Text
                    style={textStyles.caption}
                    color={isOwnMessage ? colors.white[500] : colors.gray[600]}
                    mb={2}
                  >
                    📷 Image
                  </Text>
                  <Box
                    w="100%"
                    h={200}
                    bg="rgba(229, 229, 229, 0.6)"
                    borderRadius={8}
                    justifyContent="center"
                    alignItems="center"
                  >
                    <Text style={textStyles.caption} color={colors.gray[600]}>
                      Image Preview
                    </Text>
                  </Box>
                </Box>
              )}
              
              {item.type === 'location' && item.metadata?.location && (
                <Box>
                  <Text
                    style={textStyles.caption}
                    color={isOwnMessage ? colors.white[500] : colors.gray[600]}
                    mb={2}
                  >
                    📍 Location shared
                  </Text>
                  <Pressable
                    onPress={() => {
                      const location = item.metadata?.location;
                      if (location?.latitude && location?.longitude) {
                        const url = Platform.select({
                          ios: `maps://maps.apple.com/?ll=${location.latitude},${location.longitude}&q=${location.address || 'Location'}`,
                          android: `geo:${location.latitude},${location.longitude}?q=${location.address || 'Location'}`,
                        });
                        if (url) {
                          Linking.openURL(url).catch(err => {
                            console.error('Failed to open maps:', err);
                            Alert.alert('Error', 'Could not open maps app');
                          });
                        }
                      }
                    }}
                    bg={isOwnMessage ? 'rgba(255, 255, 255, 0.2)' : colors.gray[100]}
                    borderRadius={8}
                    p={3}
                    mb={2}
                  >
                    <HStack space={2} alignItems="center">
                      <Icon as={IconMC} name="map-marker" size={5} color={isOwnMessage ? colors.white[500] : colors.primary[500]} />
                      <VStack flex={1}>
                        {location.address && (
                          <Text
                            style={textStyles.body}
                            color={isOwnMessage ? colors.white[500] : colors.gray[800]}
                            fontWeight="600"
                          >
                            {location.address}
                          </Text>
                        )}
                        <Text
                          style={textStyles.caption}
                          color={isOwnMessage ? colors.white[400] : colors.gray[600]}
                        >
                          {location.latitude?.toFixed(6)}, {location.longitude?.toFixed(6)}
                        </Text>
                        {location.accuracy && (
                          <Text
                            style={textStyles.caption}
                            color={isOwnMessage ? colors.white[400] : colors.gray[500]}
                          >
                            Accuracy: {Math.round(location.accuracy)}m
                          </Text>
                        )}
                      </VStack>
                      <Icon as={IconMC} name="open-in-new" size={4} color={isOwnMessage ? colors.white[400] : colors.gray[500]} />
                    </HStack>
                  </Pressable>
                </Box>
              )}
              
              {item.type === 'emergency' && (
                <Box>
                  <Text
                    style={textStyles.caption}
                    color={colors.error[500]}
                    fontWeight="600"
                    mb={2}
                  >
                    🚨 Emergency Alert
                  </Text>
                  <Text
                    style={textStyles.body}
                    color={isOwnMessage ? colors.white[500] : textColor}
                  >
                    {item.content}
                  </Text>
                </Box>
              )}

              {item.type === 'file' && item.metadata?.fileName && (
                <Box>
                  <HStack space={2} alignItems="center">
                    <Icon as={IconMC} name="file-document" size={5} color={isOwnMessage ? colors.white[500] : colors.gray[600]} />
                    <VStack flex={1}>
                      <Text
                        style={textStyles.body}
                        color={isOwnMessage ? colors.white[500] : textColor}
                        fontWeight="500"
                      >
                        {item.metadata.fileName}
                      </Text>
                      <Text
                        style={textStyles.caption}
                        color={isOwnMessage ? colors.white[500] : colors.gray[600]}
                      >
                        {item.metadata.fileSize || 'Unknown size'}
                      </Text>
                    </VStack>
                  </HStack>
                </Box>
              )}

              {item.type === 'voice' && item.metadata?.duration && (
                <Box>
                  <HStack space={2} alignItems="center">
                    <Icon as={IconMC} name="play-circle" size={6} color={isOwnMessage ? colors.white[500] : colors.primary[500]} />
                    <VStack flex={1}>
                      <Text
                        style={textStyles.body}
                        color={isOwnMessage ? colors.white[500] : textColor}
                      >
                        Voice Message
                      </Text>
                      <Text
                        style={textStyles.caption}
                        color={isOwnMessage ? colors.white[500] : colors.gray[600]}
                      >
                        {item.metadata.duration}s
                      </Text>
                    </VStack>
                  </HStack>
                </Box>
              )}
            </Box>
            
            <Text
              style={textStyles.caption}
              color={colors.gray[500]}
              alignSelf={isOwnMessage ? 'flex-end' : 'flex-start'}
            >
              {messageTime}
              {item.isRead && isOwnMessage && (
                <Text color={colors.primary[500]}> ✓</Text>
              )}
            </Text>
          </VStack>
          
          {/* Right Avatar for own messages */}
          {isOwnMessage && (
            <Box position="relative">
              <Avatar
                size="md"
                source={{ uri: item.senderAvatar }}
                bg={colors.primary[500]}
                borderWidth={2}
                borderColor={colors.white[500]}
                shadow={2}
              >
                {item.senderName.charAt(0).toUpperCase()}
              </Avatar>
              {/* Online indicator for own messages */}
              <Box
                position="absolute"
                bottom={0}
                right={0}
                w={3}
                h={3}
                borderRadius="full"
                bg={colors.green[500]}
                borderWidth={2}
                borderColor={colors.white[500]}
              />
            </Box>
          )}
        </HStack>
      </Box>
    );
  };

  const renderTypingIndicator = () => {
    if (typingUsers.length === 0) return null;

    const typingNames = typingUsers
      .map(userId => participants.find(p => p.id === userId)?.name)
      .filter(Boolean)
      .join(', ');

    return (
      <Box alignSelf="flex-start" maxW="80%" mb={2}>
        <Box
          bg={cardBgColor}
          px={4}
          py={3}
          borderRadius={16}
          borderTopLeftRadius={4}
          borderTopRightRadius={16}
          shadow={1}
        >
          <HStack space={2} alignItems="center">
            <Spinner size="sm" color={colors.primary[500]} />
            <Text style={textStyles.caption} color={colors.gray[600]}>
              {typingNames} is typing...
            </Text>
          </HStack>
        </Box>

        {/* Attachment Menu */}
        {showAttachmentMenu && (
          <Box
            bg={cardBgColor}
            px={4}
            py={3}
            borderTopWidth={1}
            borderTopColor={colors.gray[200]}
          >
            <HStack space={4} justifyContent="space-around">
              <TouchableOpacity onPress={handleImageSelect}>
                <VStack alignItems="center" space={2}>
                  <Box
                    w={12}
                    h={12}
                    bg={colors.primary[100]}
                    borderRadius="full"
                    justifyContent="center"
                    alignItems="center"
                  >
                    <Icon as={IconMC} name="image" size={6} color={colors.primary[500]} />
                  </Box>
                  <Text style={textStyles.caption} color={colors.gray[600]}>
                    Gallery
                  </Text>
                </VStack>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleCameraCapture}>
                <VStack alignItems="center" space={2}>
                  <Box
                    w={12}
                    h={12}
                    bg={colors.primary[100]}
                    borderRadius="full"
                    justifyContent="center"
                    alignItems="center"
                  >
                    <Icon as={IconMC} name="camera" size={6} color={colors.primary[500]} />
                  </Box>
                  <Text style={textStyles.caption} color={colors.gray[600]}>
                    Camera
                  </Text>
                </VStack>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleFileSelect}>
                <VStack alignItems="center" space={2}>
                  <Box
                    w={12}
                    h={12}
                    bg={colors.primary[100]}
                    borderRadius="full"
                    justifyContent="center"
                    alignItems="center"
                  >
                    <Icon as={IconMC} name="file-document" size={6} color={colors.primary[500]} />
                  </Box>
                  <Text style={textStyles.caption} color={colors.gray[600]}>
                    Document
                  </Text>
                </VStack>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleStartRecording}>
                <VStack alignItems="center" space={2}>
                  <Box
                    w={12}
                    h={12}
                    bg={colors.primary[100]}
                    borderRadius="full"
                    justifyContent="center"
                    alignItems="center"
                  >
                    <Icon as={IconMC} name="microphone" size={6} color={colors.primary[500]} />
                  </Box>
                  <Text style={textStyles.caption} color={colors.gray[600]}>
                    Voice
                  </Text>
                </VStack>
              </TouchableOpacity>
            </HStack>
          </Box>
        )}
      </Box>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={['#FA7272', '#FFBBB4']}
        locations={[0, 1.0]}
        start={{ x: 0, y: 1 }}
        end={{ x: 1, y: 0 }}
        style={{ flex: 1 }}
      >
        <Box flex={1} safeArea>
        {/* Header */}
        <HStack
          bg="rgba(255, 255, 255, 0.9)"
          px={4}
          py={3}
          alignItems="center"
          space={3}
          shadow={2}
          borderBottomWidth={1}
          borderBottomColor="rgba(240, 240, 240, 0.5)"
        >
          <IconButton
            icon={<Icon as={IconMC} name="arrow-left" size={6} />}
            onPress={() => navigation.goBack()}
            variant="ghost"
          />
          
          <Pressable flex={1} onPress={onOpen}>
            <VStack>
              <Text style={textStyles.h3} color={textColor} fontWeight="600">
                {familyName}
              </Text>
              <HStack space={2} alignItems="center">
                <HStack space={-2}>
                  {participants.slice(0, 3).map((participant, index) => (
                    <Avatar
                      key={participant.id}
                      size="xs"
                      source={{ uri: participant.avatar }}
                      bg={colors.primary[500]}
                      borderWidth={1}
                      borderColor={cardBgColor}
                      zIndex={participants.length - index}
                    >
                      {participant.name.charAt(0)}
                    </Avatar>
                  ))}
                </HStack>
                <Text style={textStyles.caption} color={colors.gray[600]}>
                  {participants.length} members
                </Text>
              </HStack>
            </VStack>
          </Pressable>
          
          <IconButton
            icon={<Icon as={IconMC} name="phone" size={6} />}
            onPress={() => {
              const participantIds = participants.map(p => p.id);
              initiateCall(participantIds, 'voice');
              Alert.alert('Call Initiated', 'Starting voice call...');
            }}
            variant="ghost"
          />
          
          <IconButton
            icon={<Icon as={IconMC} name="video" size={6} />}
            onPress={() => {
              const participantIds = participants.map(p => p.id);
              initiateCall(participantIds, 'video');
              Alert.alert('Call Initiated', 'Starting video call...');
            }}
            variant="ghost"
          />
          
          <IconButton
            icon={<Icon as={IconMC} name="dots-vertical" size={6} />}
            onPress={() => {
              Alert.alert(
                'Chat Options',
                'Select an option',
                [
                  { text: 'View Members', onPress: () => {} },
                  { text: 'Mute Notifications', onPress: () => {} },
                  { text: 'Clear Chat', onPress: () => {} },
                  { text: 'Leave Chat', onPress: () => {}, style: 'destructive' },
                  { text: 'Cancel', style: 'cancel' }
                ]
              );
            }}
            variant="ghost"
          />
        </HStack>

        {/* Voice Recording Indicator */}
        {isRecording && (
          <Box
            bg={colors.error[500]}
            px={4}
            py={2}
            flexDirection="row"
            alignItems="center"
            justifyContent="center"
            space={2}
          >
            <Icon as={IconMC} name="microphone" size={5} color={colors.white[500]} />
            <Text style={textStyles.body} color={colors.white[500]} fontWeight="500">
              Recording... {recordingTime}s
            </Text>
            <TouchableOpacity onPress={handleStopRecording}>
              <Icon as={IconMC} name="stop" size={5} color={colors.white[500]} />
            </TouchableOpacity>
          </Box>
        )}

        {/* Messages */}
        <Box flex={1} px={4} bg="rgba(255, 255, 255, 0.05)">
          {isLoading ? (
            <Box flex={1} justifyContent="center" alignItems="center">
              <Spinner size="lg" color={colors.primary[500]} />
              <Text style={textStyles.body} color={colors.gray[600]} mt={2}>
                Loading messages...
              </Text>
            </Box>
          ) : (
            <FlatList
              ref={flatListRef}
              data={messages}
              renderItem={renderMessage}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              onContentSizeChange={scrollToBottom}
              onLayout={scrollToBottom}
              ListFooterComponent={renderTypingIndicator}
              inverted={false}
            />
          )}
        </Box>

        {/* Input */}
        <Box bg="rgba(255, 255, 255, 0.9)" px={4} py={3} shadow={3} borderTopWidth={1} borderTopColor="rgba(240, 240, 240, 0.5)">
          <HStack space={3} alignItems="flex-end">
            <IconButton
              icon={<Icon as={IconMC} name="plus" size={6} />}
              onPress={toggleAttachmentMenu}
              variant="ghost"
              size="sm"
            />
            
            <Box flex={1}>
              <Input
                value={newMessage}
                onChangeText={handleTyping}
                placeholder="Type a message..."
                multiline
                maxH={100}
                borderRadius={20}
                bg={inputBgColor}
                borderWidth={0}
                _focus={{
                  bg: inputBgColor,
                  borderWidth: 0,
                }}
                InputRightElement={
                  <HStack space={1} mr={2}>
                    <IconButton
                      icon={<Icon as={IconMC} name="camera" size={5} />}
                      onPress={handleCameraCapture}
                      variant="ghost"
                      size="sm"
                    />
                    <IconButton
                      icon={<Icon as={IconMC} name="paperclip" size={5} />}
                      onPress={toggleAttachmentMenu}
                      variant="ghost"
                      size="sm"
                    />
                                         <IconButton
                       icon={
                         isRecording ? (
                           <Icon as={IconMC} name="stop" size={5} color={colors.error[500]} />
                         ) : (
                           <Icon as={IconMC} name="microphone" size={5} />
                         )
                       }
                       onPress={isRecording ? handleStopRecording : handleStartRecording}
                       variant="ghost"
                       size="sm"
                       bg={isRecording ? colors.error[100] : 'transparent'}
                     />
                  </HStack>
                }
              />
            </Box>
            
            <IconButton
              icon={
                isSending ? (
                  <Spinner size="sm" color={colors.white[500]} />
                ) : (
                  <Icon as={IconMC} name="send" size={5} />
                )
              }
              onPress={handleSendMessage}
              bg={colors.primary[500]}
              _pressed={{ bg: colors.primary[600] }}
              borderRadius="full"
              size="sm"
              isDisabled={(!newMessage.trim() && !selectedFile && !selectedImage && !recordingUri) || isSending}
            />
          </HStack>
        </Box>
      </Box>

      {/* Participants Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <Text style={textStyles.h3} color={textColor}>
              hourse Members
            </Text>
          </ModalHeader>
          <ModalBody>
            <VStack space={3}>
              {participants.map((participant) => (
                <HStack key={participant.id} space={3} alignItems="center">
                  <Avatar
                    size="md"
                    source={{ uri: participant.avatar }}
                    bg={colors.primary[500]}
                  >
                    {participant.name.charAt(0)}
                  </Avatar>
                  
                  <VStack flex={1}>
                    <Text style={textStyles.h4} color={textColor} fontWeight="500">
                      {participant.name}
                    </Text>
                    <HStack space={2} alignItems="center">
                      <Box
                        w={2}
                        h={2}
                        borderRadius="full"
                        bg={participant.isOnline ? colors.success[500] : colors.gray[400]}
                      />
                      <Text style={textStyles.caption} color={colors.gray[600]}>
                        {participant.isOnline ? 'Online' : 'Offline'}
                      </Text>
                    </HStack>
                  </VStack>
                </HStack>
              ))}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onPress={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
        </Box>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

export default ChatScreen; 