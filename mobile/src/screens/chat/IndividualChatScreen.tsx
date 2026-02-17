import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
  Animated,
  Dimensions,
  Linking,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import IconIon from 'react-native-vector-icons/Ionicons';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';
import * as DocumentPicker from 'expo-document-picker';
import { Audio } from 'expo-av';
import { chatApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import { imagePickerService } from '../../services/imagePicker/ImagePickerService';

const { width } = Dimensions.get('window');

interface ChatMessage {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  timestamp: Date;
  isOwnMessage: boolean;
  type: 'text' | 'image' | 'file' | 'audio' | 'location' | 'video';
  status: 'sending' | 'sent' | 'delivered' | 'read';
  metadata?: {
    imageUrl?: string;
    fileName?: string;
    fileSize?: number;
    duration?: number;
    location?: { latitude: number; longitude: number; address?: string };
    thumbnailUrl?: string;
  };
  reactions?: { emoji: string; userId: string; userName: string }[];
  replyTo?: {
    id: string;
    text: string;
    senderName: string;
  };
}

interface RouteParams {
  chatId: string;
  chatName: string;
  circleId?: string;
  memberName?: string;
  memberAvatar?: string;
}

// Example messages data
const EXAMPLE_MESSAGES: ChatMessage[] = [
  {
    id: '1',
    text: 'Hey! How are you doing today?',
    senderId: 'other-user',
    senderName: 'Mom',
    timestamp: new Date(Date.now() - 3600000 * 2),
    isOwnMessage: false,
    type: 'text',
    status: 'read',
  },
  {
    id: '2',
    text: "I'm doing great! Just finished work. What about you?",
    senderId: 'me',
    senderName: 'You',
    timestamp: new Date(Date.now() - 3600000 * 1.9),
    isOwnMessage: true,
    type: 'text',
    status: 'read',
  },
  {
    id: '3',
    text: 'Just made some delicious cookies! 🍪',
    senderId: 'other-user',
    senderName: 'Mom',
    timestamp: new Date(Date.now() - 3600000 * 1.8),
    isOwnMessage: false,
    type: 'text',
    status: 'read',
    reactions: [{ emoji: '😍', userId: 'me', userName: 'You' }],
  },
  {
    id: '4',
    text: '',
    senderId: 'other-user',
    senderName: 'Mom',
    timestamp: new Date(Date.now() - 3600000 * 1.7),
    isOwnMessage: false,
    type: 'image',
    status: 'read',
    metadata: {
      imageUrl: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400',
    },
  },
  {
    id: '5',
    text: 'Those look amazing! Save some for me!',
    senderId: 'me',
    senderName: 'You',
    timestamp: new Date(Date.now() - 3600000 * 1.6),
    isOwnMessage: true,
    type: 'text',
    status: 'read',
  },
  {
    id: '6',
    text: "Of course! I'll bring them when I visit this weekend",
    senderId: 'other-user',
    senderName: 'Mom',
    timestamp: new Date(Date.now() - 3600000 * 1.5),
    isOwnMessage: false,
    type: 'text',
    status: 'read',
  },
  {
    id: '7',
    text: '',
    senderId: 'other-user',
    senderName: 'Mom',
    timestamp: new Date(Date.now() - 3600000),
    isOwnMessage: false,
    type: 'location',
    status: 'read',
    metadata: {
      location: {
        latitude: 37.7749,
        longitude: -122.4194,
        address: '123 Main Street, San Francisco, CA',
      },
    },
  },
  {
    id: '8',
    text: "Here's where we should meet!",
    senderId: 'other-user',
    senderName: 'Mom',
    timestamp: new Date(Date.now() - 3600000 * 0.9),
    isOwnMessage: false,
    type: 'text',
    status: 'read',
  },
  {
    id: '9',
    text: 'Perfect! See you at 2pm then?',
    senderId: 'me',
    senderName: 'You',
    timestamp: new Date(Date.now() - 3600000 * 0.8),
    isOwnMessage: true,
    type: 'text',
    status: 'delivered',
  },
  {
    id: '10',
    text: 'Yes! Can\'t wait! ❤️',
    senderId: 'other-user',
    senderName: 'Mom',
    timestamp: new Date(Date.now() - 1800000),
    isOwnMessage: false,
    type: 'text',
    status: 'read',
    reactions: [{ emoji: '❤️', userId: 'me', userName: 'You' }],
  },
];

const IndividualChatScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const params = route.params as RouteParams;
  const { chatId, chatName, memberAvatar } = params;

  const { user } = useAuth();
  const { on, off, isConnected, sendMessage, startTyping, stopTyping, joinChat, leaveChat, initiateCall } = useSocket();

  const [messages, setMessages] = useState<ChatMessage[]>(EXAMPLE_MESSAGES);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [isLoading, setLoading] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<ChatMessage | null>(null);

  const flatListRef = useRef<FlatList>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const attachmentMenuAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Join chat room
    if (isConnected && chatId) {
      joinChat(chatId);
    }

    // Listen for incoming messages
    on('new-message', handleNewMessage as any);
    on('chat:typing', handleTypingStatus as any);

    return () => {
      off('new-message', handleNewMessage as any);
      off('chat:typing', handleTypingStatus as any);
      if (chatId) {
        leaveChat(chatId);
      }
    };
  }, [chatId, isConnected]);

  useEffect(() => {
    // Animate attachment menu
    Animated.spring(attachmentMenuAnim, {
      toValue: showAttachmentMenu ? 1 : 0,
      useNativeDriver: true,
      friction: 8,
    }).start();
  }, [showAttachmentMenu]);

  const handleNewMessage = (data: any) => {
    if (data.chatId === chatId || data.message?.chatRoomId === chatId) {
      const msg = data.message || data;
      const newMsg: ChatMessage = {
        id: msg.id || Date.now().toString(),
        text: msg.content || msg.text,
        senderId: msg.senderId,
        senderName: msg.sender?.firstName || msg.senderName || 'Unknown',
        senderAvatar: msg.sender?.avatarUrl,
        timestamp: new Date(msg.createdAt || Date.now()),
        isOwnMessage: msg.senderId === user?.id,
        type: msg.type || 'text',
        status: 'delivered',
        metadata: msg.metadata,
      };
      setMessages((prev) => [...prev, newMsg]);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const handleTypingStatus = (data: any) => {
    if (data.chatId === chatId && data.userId !== user?.id) {
      setOtherUserTyping(data.isTyping);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const text = newMessage.trim();
    setNewMessage('');
    setReplyingTo(null);

    // Optimistic update
    const optimisticMessage: ChatMessage = {
      id: Date.now().toString(),
      text,
      senderId: user?.id || 'me',
      senderName: 'You',
      senderAvatar: user?.avatarUrl,
      timestamp: new Date(),
      isOwnMessage: true,
      type: 'text',
      status: 'sending',
      replyTo: replyingTo
        ? {
            id: replyingTo.id,
            text: replyingTo.text,
            senderName: replyingTo.senderName,
          }
        : undefined,
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      if (isConnected && sendMessage) {
        sendMessage(chatId, text, 'text');
        // Update status to sent
        setMessages((prev) =>
          prev.map((m) =>
            m.id === optimisticMessage.id ? { ...m, status: 'sent' } : m
          )
        );
      } else {
        await chatApi.sendMessage(chatId, { content: text, type: 'text' });
        setMessages((prev) =>
          prev.map((m) =>
            m.id === optimisticMessage.id ? { ...m, status: 'sent' } : m
          )
        );
      }
    } catch (err) {
      console.error('Failed to send', err);
      Alert.alert('Error', 'Failed to send message');
      // Remove failed message
      setMessages((prev) => prev.filter((m) => m.id !== optimisticMessage.id));
    }

    // Stop typing
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    stopTyping(chatId);
  };

  const handleTyping = (text: string) => {
    setNewMessage(text);

    if (!isTyping && text.length > 0) {
      setIsTyping(true);
      startTyping(chatId);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      stopTyping(chatId);
    }, 1500);
  };

  const handleVoiceCall = () => {
    initiateCall([chatId], 'voice');
    navigation.navigate('VoiceCall' as never, {
      contactId: chatId,
      contactName: chatName,
      contactAvatar: memberAvatar,
    } as never);
  };

  const handleVideoCall = () => {
    initiateCall([chatId], 'video');
    navigation.navigate('VideoCall' as never, {
      contactId: chatId,
      contactName: chatName,
      contactAvatar: memberAvatar,
    } as never);
  };

  const handleImagePick = async () => {
    setShowAttachmentMenu(false);
    try {
      const permission = await imagePickerService.requestMediaLibraryPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant photo library access.');
        return;
      }

      const result = await imagePickerService.launchImageLibraryAsync({
        mediaTypes: 'Images',
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.[0]) {
        const image = result.assets[0];
        // Add image message
        const imageMessage: ChatMessage = {
          id: Date.now().toString(),
          text: '',
          senderId: user?.id || 'me',
          senderName: 'You',
          timestamp: new Date(),
          isOwnMessage: true,
          type: 'image',
          status: 'sending',
          metadata: { imageUrl: image.uri },
        };
        setMessages((prev) => [...prev, imageMessage]);
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

        // Simulate upload
        setTimeout(() => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === imageMessage.id ? { ...m, status: 'sent' } : m
            )
          );
        }, 1500);
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };

  const handleCameraCapture = async () => {
    setShowAttachmentMenu(false);
    try {
      const permission = await imagePickerService.requestCameraPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant camera access.');
        return;
      }

      const result = await imagePickerService.launchCameraAsync({
        mediaTypes: 'Images',
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.[0]) {
        const image = result.assets[0];
        const imageMessage: ChatMessage = {
          id: Date.now().toString(),
          text: '',
          senderId: user?.id || 'me',
          senderName: 'You',
          timestamp: new Date(),
          isOwnMessage: true,
          type: 'image',
          status: 'sending',
          metadata: { imageUrl: image.uri },
        };
        setMessages((prev) => [...prev, imageMessage]);
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

        setTimeout(() => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === imageMessage.id ? { ...m, status: 'sent' } : m
            )
          );
        }, 1500);
      }
    } catch (error) {
      console.error('Error capturing image:', error);
    }
  };

  const handleFilePick = async () => {
    setShowAttachmentMenu(false);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets?.[0]) {
        const file = result.assets[0];
        const fileMessage: ChatMessage = {
          id: Date.now().toString(),
          text: file.name,
          senderId: user?.id || 'me',
          senderName: 'You',
          timestamp: new Date(),
          isOwnMessage: true,
          type: 'file',
          status: 'sending',
          metadata: {
            fileName: file.name,
            fileSize: file.size,
          },
        };
        setMessages((prev) => [...prev, fileMessage]);
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

        setTimeout(() => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === fileMessage.id ? { ...m, status: 'sent' } : m
            )
          );
        }, 1500);
      }
    } catch (error) {
      console.error('Error picking file:', error);
    }
  };

  const handleStartRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant microphone access.');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      recordingRef.current = recording;
      setIsRecording(true);
      setRecordingDuration(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const handleStopRecording = async () => {
    if (!recordingRef.current) return;

    try {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }

      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();

      setIsRecording(false);
      recordingRef.current = null;

      if (uri) {
        const audioMessage: ChatMessage = {
          id: Date.now().toString(),
          text: 'Voice message',
          senderId: user?.id || 'me',
          senderName: 'You',
          timestamp: new Date(),
          isOwnMessage: true,
          type: 'audio',
          status: 'sending',
          metadata: { duration: recordingDuration },
        };
        setMessages((prev) => [...prev, audioMessage]);
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

        setTimeout(() => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === audioMessage.id ? { ...m, status: 'sent' } : m
            )
          );
        }, 1000);
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
    }
  };

  const handleLocationShare = () => {
    setShowAttachmentMenu(false);
    // Simulate location sharing
    const locationMessage: ChatMessage = {
      id: Date.now().toString(),
      text: '',
      senderId: user?.id || 'me',
      senderName: 'You',
      timestamp: new Date(),
      isOwnMessage: true,
      type: 'location',
      status: 'sent',
      metadata: {
        location: {
          latitude: 37.7749,
          longitude: -122.4194,
          address: 'Current Location',
        },
      },
    };
    setMessages((prev) => [...prev, locationMessage]);
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const handleMessageLongPress = (message: ChatMessage) => {
    setSelectedMessage(message);
    Alert.alert(
      'Message Options',
      '',
      [
        { text: 'Reply', onPress: () => setReplyingTo(message) },
        {
          text: 'React ❤️',
          onPress: () => {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === message.id
                  ? {
                      ...m,
                      reactions: [
                        ...(m.reactions || []),
                        { emoji: '❤️', userId: user?.id || 'me', userName: 'You' },
                      ],
                    }
                  : m
              )
            );
          },
        },
        {
          text: 'Copy',
          onPress: () => {
            // Copy message text
          },
        },
        message.isOwnMessage
          ? {
              text: 'Delete',
              style: 'destructive',
              onPress: () => {
                setMessages((prev) => prev.filter((m) => m.id !== message.id));
              },
            }
          : null,
        { text: 'Cancel', style: 'cancel' },
      ].filter(Boolean) as any
    );
  };

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderMessageStatus = (status: string) => {
    switch (status) {
      case 'sending':
        return <IconIon name="time-outline" size={12} color="#999" />;
      case 'sent':
        return <IconIon name="checkmark" size={12} color="#999" />;
      case 'delivered':
        return <IconIon name="checkmark-done" size={12} color="#999" />;
      case 'read':
        return <IconIon name="checkmark-done" size={12} color="#4CAF50" />;
      default:
        return null;
    }
  };

  const renderMessage = ({ item: message }: { item: ChatMessage }) => {
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onLongPress={() => handleMessageLongPress(message)}
        style={[
          styles.messageContainer,
          message.isOwnMessage ? styles.ownMessage : styles.otherMessage,
        ]}
      >
        <View style={styles.messageRow}>
          {/* Avatar for other messages */}
          {!message.isOwnMessage && (
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {message.senderName.charAt(0).toUpperCase()}
                </Text>
              </View>
            </View>
          )}

          <View style={styles.messageContent}>
            {/* Reply preview */}
            {message.replyTo && (
              <View style={styles.replyPreview}>
                <View style={styles.replyBar} />
                <View style={styles.replyContent}>
                  <Text style={styles.replyName}>{message.replyTo.senderName}</Text>
                  <Text style={styles.replyText} numberOfLines={1}>
                    {message.replyTo.text}
                  </Text>
                </View>
              </View>
            )}

            <View
              style={[
                styles.messageBubble,
                message.isOwnMessage ? styles.ownBubble : styles.otherBubble,
                message.type === 'image' && styles.imageBubble,
              ]}
            >
              {/* Text message */}
              {message.type === 'text' && (
                <Text
                  style={[
                    styles.messageText,
                    message.isOwnMessage ? styles.ownMessageText : styles.otherMessageText,
                  ]}
                >
                  {message.text}
                </Text>
              )}

              {/* Image message */}
              {message.type === 'image' && message.metadata?.imageUrl && (
                <Image
                  source={{ uri: message.metadata.imageUrl }}
                  style={styles.messageImage}
                  resizeMode="cover"
                />
              )}

              {/* Audio message */}
              {message.type === 'audio' && (
                <View style={styles.audioMessage}>
                  <TouchableOpacity style={styles.playButton}>
                    <IconIon name="play" size={20} color={message.isOwnMessage ? '#FFF' : '#FF5A5A'} />
                  </TouchableOpacity>
                  <View style={styles.audioWaveform}>
                    {[...Array(15)].map((_, i) => (
                      <View
                        key={i}
                        style={[
                          styles.waveformBar,
                          {
                            height: Math.random() * 16 + 4,
                            backgroundColor: message.isOwnMessage
                              ? 'rgba(255,255,255,0.6)'
                              : 'rgba(255,90,90,0.5)',
                          },
                        ]}
                      />
                    ))}
                  </View>
                  <Text
                    style={[
                      styles.audioDuration,
                      { color: message.isOwnMessage ? '#FFF' : '#666' },
                    ]}
                  >
                    {formatDuration(message.metadata?.duration || 0)}
                  </Text>
                </View>
              )}

              {/* File message */}
              {message.type === 'file' && (
                <View style={styles.fileMessage}>
                  <IconMC
                    name="file-document"
                    size={24}
                    color={message.isOwnMessage ? '#FFF' : '#FF5A5A'}
                  />
                  <View style={styles.fileInfo}>
                    <Text
                      style={[
                        styles.fileName,
                        { color: message.isOwnMessage ? '#FFF' : '#333' },
                      ]}
                      numberOfLines={1}
                    >
                      {message.metadata?.fileName || 'File'}
                    </Text>
                    <Text
                      style={[
                        styles.fileSize,
                        { color: message.isOwnMessage ? 'rgba(255,255,255,0.7)' : '#999' },
                      ]}
                    >
                      {message.metadata?.fileSize
                        ? `${(message.metadata.fileSize / 1024).toFixed(1)} KB`
                        : 'Unknown size'}
                    </Text>
                  </View>
                </View>
              )}

              {/* Location message */}
              {message.type === 'location' && message.metadata?.location && (
                <TouchableOpacity
                  style={styles.locationMessage}
                  onPress={() => {
                    const { latitude, longitude } = message.metadata!.location!;
                    const url = Platform.select({
                      ios: `maps://maps.apple.com/?ll=${latitude},${longitude}`,
                      android: `geo:${latitude},${longitude}`,
                    });
                    if (url) Linking.openURL(url);
                  }}
                >
                  <View style={styles.locationMap}>
                    <IconMC name="map-marker" size={32} color="#FF5A5A" />
                  </View>
                  <Text
                    style={[
                      styles.locationAddress,
                      { color: message.isOwnMessage ? '#FFF' : '#333' },
                    ]}
                    numberOfLines={2}
                  >
                    {message.metadata.location.address || 'View Location'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Reactions */}
            {message.reactions && message.reactions.length > 0 && (
              <View style={styles.reactionsContainer}>
                {message.reactions.map((reaction, idx) => (
                  <View key={idx} style={styles.reaction}>
                    <Text style={styles.reactionEmoji}>{reaction.emoji}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Timestamp and status */}
            <View style={styles.messageFooter}>
              <Text style={styles.messageTime}>{formatTime(message.timestamp)}</Text>
              {message.isOwnMessage && renderMessageStatus(message.status)}
            </View>
          </View>

          {/* Avatar for own messages */}
          {message.isOwnMessage && (
            <View style={styles.avatarContainer}>
              <View style={[styles.avatar, { backgroundColor: '#FF5A5A' }]}>
                <Text style={styles.avatarText}>
                  {(user?.firstName?.[0] || 'Y').toUpperCase()}
                </Text>
              </View>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderTypingIndicator = () => {
    if (!otherUserTyping) return null;

    return (
      <View style={[styles.messageContainer, styles.otherMessage]}>
        <View style={styles.messageRow}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{chatName.charAt(0).toUpperCase()}</Text>
            </View>
          </View>
          <View style={styles.messageContent}>
            <View style={[styles.messageBubble, styles.otherBubble]}>
              <View style={styles.typingIndicator}>
                <View style={[styles.typingDot, styles.typingDot1]} />
                <View style={[styles.typingDot, styles.typingDot2]} />
                <View style={[styles.typingDot, styles.typingDot3]} />
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const attachmentMenuTranslate = attachmentMenuAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [100, 0],
  });

  const renderAttachmentMenu = () => {
    if (!showAttachmentMenu) return null;

    return (
      <Animated.View
        style={[
          styles.attachmentMenu,
          { transform: [{ translateY: attachmentMenuTranslate }], opacity: attachmentMenuAnim },
        ]}
      >
        <TouchableOpacity style={styles.attachmentOption} onPress={handleImagePick}>
          <View style={[styles.attachmentIcon, { backgroundColor: '#4CAF50' }]}>
            <IconIon name="images" size={24} color="#FFF" />
          </View>
          <Text style={styles.attachmentLabel}>Gallery</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.attachmentOption} onPress={handleCameraCapture}>
          <View style={[styles.attachmentIcon, { backgroundColor: '#2196F3' }]}>
            <IconIon name="camera" size={24} color="#FFF" />
          </View>
          <Text style={styles.attachmentLabel}>Camera</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.attachmentOption} onPress={handleFilePick}>
          <View style={[styles.attachmentIcon, { backgroundColor: '#FF9800' }]}>
            <IconMC name="file-document" size={24} color="#FFF" />
          </View>
          <Text style={styles.attachmentLabel}>Document</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.attachmentOption} onPress={handleLocationShare}>
          <View style={[styles.attachmentIcon, { backgroundColor: '#E91E63' }]}>
            <IconIon name="location" size={24} color="#FFF" />
          </View>
          <Text style={styles.attachmentLabel}>Location</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <LinearGradient
        colors={['#FF5A5A', '#FF8A8A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <IconIon name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.headerInfo}>
          <View style={styles.headerAvatar}>
            <Text style={styles.headerAvatarText}>{chatName.charAt(0).toUpperCase()}</Text>
            {isOnline && <View style={styles.onlineIndicator} />}
          </View>
          <View style={styles.headerText}>
            <Text style={styles.headerName}>{chatName}</Text>
            <Text style={styles.headerStatus}>
              {otherUserTyping ? 'typing...' : isOnline ? 'Online' : 'Offline'}
            </Text>
          </View>
        </TouchableOpacity>

        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerActionButton} onPress={handleVoiceCall}>
            <IconIon name="call" size={20} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerActionButton} onPress={handleVideoCall}>
            <IconIon name="videocam" size={20} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerActionButton}>
            <IconIon name="ellipsis-vertical" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Messages */}
      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
          ListFooterComponent={renderTypingIndicator}
        />

        {/* Reply preview */}
        {replyingTo && (
          <View style={styles.replyingToContainer}>
            <View style={styles.replyingToContent}>
              <View style={styles.replyBar} />
              <View style={styles.replyingToText}>
                <Text style={styles.replyingToName}>Replying to {replyingTo.senderName}</Text>
                <Text style={styles.replyingToMessage} numberOfLines={1}>
                  {replyingTo.text || 'Attachment'}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => setReplyingTo(null)}>
              <IconIon name="close" size={20} color="#999" />
            </TouchableOpacity>
          </View>
        )}

        {/* Attachment menu */}
        {renderAttachmentMenu()}

        {/* Recording indicator */}
        {isRecording && (
          <View style={styles.recordingContainer}>
            <View style={styles.recordingDot} />
            <Text style={styles.recordingText}>Recording... {formatDuration(recordingDuration)}</Text>
            <TouchableOpacity style={styles.cancelRecording} onPress={() => setIsRecording(false)}>
              <Text style={styles.cancelRecordingText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Input */}
        <View style={styles.inputContainer}>
          <TouchableOpacity
            style={styles.attachButton}
            onPress={() => setShowAttachmentMenu(!showAttachmentMenu)}
          >
            <IconIon name={showAttachmentMenu ? 'close' : 'add'} size={24} color="#666" />
          </TouchableOpacity>

          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              value={newMessage}
              onChangeText={handleTyping}
              placeholder="Type a message..."
              placeholderTextColor="#999"
              multiline
              maxLength={1000}
            />

            <TouchableOpacity
              style={styles.emojiButton}
              onPress={() => {
                // Emoji picker
              }}
            >
              <IconIon name="happy-outline" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          {newMessage.trim() ? (
            <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
              <IconIon name="send" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.voiceButton}
              onPressIn={handleStartRecording}
              onPressOut={handleStopRecording}
            >
              <IconIon name="mic" size={20} color={isRecording ? '#FF5A5A' : '#666'} />
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
    marginRight: 4,
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerAvatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#FF5A5A',
  },
  headerText: {
    flex: 1,
  },
  headerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  headerStatus: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerActionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  chatContainer: {
    flex: 1,
  },
  messagesList: {
    paddingHorizontal: 12,
    paddingVertical: 16,
  },
  messageContainer: {
    marginBottom: 12,
  },
  ownMessage: {
    alignItems: 'flex-end',
  },
  otherMessage: {
    alignItems: 'flex-start',
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    maxWidth: '85%',
  },
  avatarContainer: {
    marginHorizontal: 4,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFF',
  },
  messageContent: {
    flex: 1,
  },
  replyPreview: {
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
    marginBottom: 4,
    overflow: 'hidden',
  },
  replyBar: {
    width: 3,
    backgroundColor: '#FF5A5A',
  },
  replyContent: {
    flex: 1,
    padding: 8,
  },
  replyName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF5A5A',
  },
  replyText: {
    fontSize: 12,
    color: '#666',
  },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    maxWidth: '100%',
  },
  ownBubble: {
    backgroundColor: '#FF5A5A',
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  imageBubble: {
    padding: 4,
    overflow: 'hidden',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  ownMessageText: {
    color: '#FFFFFF',
  },
  otherMessageText: {
    color: '#333333',
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 16,
  },
  audioMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 180,
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  audioWaveform: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 24,
  },
  waveformBar: {
    width: 3,
    marginHorizontal: 1,
    borderRadius: 1.5,
  },
  audioDuration: {
    fontSize: 12,
    marginLeft: 8,
  },
  fileMessage: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileInfo: {
    flex: 1,
    marginLeft: 12,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '500',
  },
  fileSize: {
    fontSize: 12,
    marginTop: 2,
  },
  locationMessage: {
    width: 180,
  },
  locationMap: {
    width: '100%',
    height: 80,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationAddress: {
    fontSize: 14,
  },
  reactionsContainer: {
    flexDirection: 'row',
    marginTop: 4,
  },
  reaction: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  reactionEmoji: {
    fontSize: 14,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginHorizontal: 4,
  },
  messageTime: {
    fontSize: 10,
    color: '#999',
    marginRight: 4,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#999',
    marginHorizontal: 2,
  },
  typingDot1: {
    opacity: 0.4,
  },
  typingDot2: {
    opacity: 0.7,
  },
  typingDot3: {
    opacity: 1,
  },
  replyingToContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  replyingToContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  replyingToText: {
    flex: 1,
    marginLeft: 8,
  },
  replyingToName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF5A5A',
  },
  replyingToMessage: {
    fontSize: 12,
    color: '#666',
  },
  attachmentMenu: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  attachmentOption: {
    flex: 1,
    alignItems: 'center',
  },
  attachmentIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  attachmentLabel: {
    fontSize: 12,
    color: '#666',
  },
  recordingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF5A5A',
    marginRight: 8,
  },
  recordingText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  cancelRecording: {
    padding: 8,
  },
  cancelRecordingText: {
    fontSize: 14,
    color: '#FF5A5A',
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  attachButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#F8F9FA',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 8,
    maxHeight: 120,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    maxHeight: 100,
    paddingVertical: 0,
  },
  emojiButton: {
    padding: 4,
    marginLeft: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF5A5A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  voiceButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default IndividualChatScreen;
