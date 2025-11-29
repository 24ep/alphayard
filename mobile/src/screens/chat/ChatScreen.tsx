import React, { useState, useEffect, useRef } from 'react';
import { View, KeyboardAvoidingView, Platform, FlatList, Alert, TouchableOpacity } from 'react-native';
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
    
    // Setup socket listeners
    on('new_message', handleNewMessage);
    on('user_typing', handleTypingStatus);
    on('joined_chat', handleJoinedChat);
    on('left_chat', handleLeftChat);
    
    // Join chat room when connected
    if (isConnected && chat?.id) {
      joinChat(chat.id);
    }
    
    return () => {
      off('new_message', handleNewMessage);
      off('user_typing', handleTypingStatus);
      off('joined_chat', handleJoinedChat);
      off('left_chat', handleLeftChat);
      
      if (chat?.id) {
        leaveChat(chat.id);
      }
    };
  }, [familyId, isConnected, chat?.id]);

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

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user || !chat) return;

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
  const handleFileSelect = () => {
    // TODO: Implement file picker
    Alert.alert('File Selection', 'File picker will be implemented');
    setShowAttachmentMenu(false);
  };

  // Handle image selection
  const handleImageSelect = () => {
    // TODO: Implement image picker
    Alert.alert('Image Selection', 'Image picker will be implemented');
    setShowAttachmentMenu(false);
  };

  // Handle camera capture
  const handleCameraCapture = () => {
    // TODO: Implement camera capture
    Alert.alert('Camera', 'Camera capture will be implemented');
    setShowAttachmentMenu(false);
  };

  // Handle voice recording start
  const handleStartRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    // TODO: Implement actual voice recording
    Alert.alert('Voice Recording', 'Voice recording started');
  };

  // Handle voice recording stop
  const handleStopRecording = () => {
    setIsRecording(false);
    // TODO: Implement actual voice recording stop and send
    Alert.alert('Voice Recording', 'Voice recording stopped and sent');
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
                  {/* TODO: Add location component */}
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
            onPress={() => {/* TODO: Initiate voice call */}}
            variant="ghost"
          />
          
          <IconButton
            icon={<Icon as={IconMC} name="video" size={6} />}
            onPress={() => {/* TODO: Initiate video call */}}
            variant="ghost"
          />
          
          <IconButton
            icon={<Icon as={IconMC} name="dots-vertical" size={6} />}
            onPress={() => {/* TODO: Open chat options */}}
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
                      onPress={() => {/* TODO: Take photo */}}
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
              onPress={sendMessage}
              bg={colors.primary[500]}
              _pressed={{ bg: colors.primary[600] }}
              borderRadius="full"
              size="sm"
              isDisabled={!newMessage.trim() || isSending}
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