import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Animated,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import IconIon from 'react-native-vector-icons/Ionicons';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';
import { brandColors, textColors } from '../../theme/colors';

interface ChatMessage {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  timestamp: Date;
  isOwnMessage: boolean;
}

import { chatApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';

interface RouteParams {
  chatId: string;
  chatName: string;
  circleId?: string;
  memberName?: string;
}

const IndividualChatScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const params = route.params as RouteParams;
  const { chatId, chatName } = params;

  const { user } = useAuth();
  const { on, off, isConnected, sendMessage } = useSocket();
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    loadMessages();

    // Listen for incoming messages
    on('new-message', (data: any) => {
        // If message belongs to this chat
        if (data.chatId === chatId || data.message?.chatRoomId === chatId) {
           const msg = data.message || data;
           addMessageToState(msg);
        }
    });

    return () => {
      off('new-message');
    };
  }, [chatId]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const res = await chatApi.getMessages(chatId);
      if (res.success && res.data) {
        // Map API messages to UI format
        const formatted = res.data.map((m: any) => ({
          id: m.id,
          text: m.content,
          senderId: m.senderId,
          senderName: m.sender?.firstName || 'Unknown',
          senderAvatar: m.sender?.avatarUrl,
          timestamp: new Date(m.createdAt),
          isOwnMessage: m.senderId === user?.id
        }));
        setMessages(formatted.reverse()); // Assuming API returns newest first? Usually older first is better for chat lists but let's check
      }
    } catch (err) {
      console.error('Failed to load messages', err);
    } finally {
      setLoading(false);
    }
  };

  const addMessageToState = (m: any) => {
      const newMsg = {
          id: m.id || Date.now().toString(),
          text: m.content || m.text,
          senderId: m.senderId,
          senderName: m.sender?.firstName || m.senderName || 'Unknown',
          senderAvatar: m.sender?.avatarUrl,
          timestamp: new Date(m.createdAt || Date.now()),
          isOwnMessage: m.senderId === user?.id
      };
      setMessages(prev => [...prev, newMsg]);
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
  };


  const handleFileSelect = () => {
      // Placeholder for file selection
      handleMoreOptions();
  };


  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
        const text = newMessage.trim();
        setNewMessage(''); // Clear immediately for UX

        // Optimistic update
        /* 
        const optimMsg = {
            id: Date.now().toString(),
            text: text,
            senderId: user?.id || 'me',
            senderName: 'You',
            senderAvatar: user?.avatarUrl,
            timestamp: new Date(),
            isOwnMessage: true
        };
        setMessages(prev => [...prev, optimMsg]);
        */

        if (isConnected && sendMessage) {
            sendMessage(chatId, text, 'text');
        } else {
            // Fallback to API
            await chatApi.sendMessage(chatId, { content: text, type: 'text' });
            loadMessages(); // Reload to get the real message back
        }
    } catch (err) {
        console.error('Failed to send', err);
        Alert.alert('Error', 'Failed to send message');
    }
  };

  // Voice/Video call handlers - Placeholder for now
  const handleVoiceCall = () => {
    Alert.alert('Voice Call', `Start voice call with ${chatName}?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call', onPress: () => console.log('Call started') }
    ]);
  };

  const handleVideoCall = () => {
    Alert.alert('Video Call', `Start video call with ${chatName}?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call', onPress: () => console.log('Video Call started') }
    ]);
  };

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleMoreOptions = () => {
    Alert.alert(
      'Chat Options',
      'What would you like to do?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'View Profile', onPress: () => console.log('View profile') },
        { text: 'Share Location', onPress: () => console.log('Share location') },
        { text: 'Mute Notifications', onPress: () => console.log('Mute') },
      ]
    );
  };

  const renderMemberAvatar = () => {
    const avatarSeed = (chatName || 'User').toLowerCase().replace(/\s+/g, '-');
    const avatarUrl = `https://api.dicebear.com/7.x/personas/svg?seed=${avatarSeed}&backgroundColor=ffd5dc`;
    
    return (
      <View style={styles.memberAvatar}>
        <View style={styles.avatarContent}>
          <Text style={styles.avatarText}>
            {(chatName || 'C').charAt(0).toUpperCase()}
          </Text>
          {isOnline && <View style={styles.onlineIndicator} />}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#FF5A5A" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <IconIon name="arrow-back" size={24} color="#333333" />
        </TouchableOpacity>
        
        <View style={styles.headerInfo}>
          {renderMemberAvatar()}
          <View style={styles.headerText}>
            <Text style={styles.memberName}>{chatName || 'Chat'}</Text>
            <Text style={styles.memberStatus}>
              {isOnline ? 'Online' : 'Offline'}
            </Text>
          </View>
        </View>
        
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.callButton} onPress={handleVoiceCall}>
            <IconIon name="call" size={20} color="#333333" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.videoCallButton} onPress={handleVideoCall}>
            <IconIon name="videocam" size={20} color="#333333" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.moreButton} onPress={handleMoreOptions}>
            <IconIon name="ellipsis-vertical" size={24} color="#333333" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView 
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.messagesContent}
        >
          {messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageContainer,
                message.isOwnMessage ? styles.ownMessage : styles.otherMessage,
              ]}
            >
              <View style={styles.messageRow}>
                {/* Left Avatar for other messages */}
                {!message.isOwnMessage && (
                  <View style={styles.avatarContainer}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>
                        {message.senderName.charAt(0).toUpperCase()}
                      </Text>
                      <View style={styles.onlineIndicator} />
                    </View>
                  </View>
                )}

                <View style={styles.messageContent}>
                  <View
                    style={[
                      styles.messageBubble,
                      message.isOwnMessage ? styles.ownBubble : styles.otherBubble,
                    ]}
                  >
                    <Text
                      style={[
                        styles.messageText,
                        message.isOwnMessage ? styles.ownMessageText : styles.otherMessageText,
                      ]}
                    >
                      {message.text}
                    </Text>
                  </View>
                  <Text style={styles.messageTime}>{formatTime(message.timestamp)}</Text>
                </View>

                {/* Right Avatar for own messages */}
                {message.isOwnMessage && (
                  <View style={styles.avatarContainer}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>
                        {message.senderName.charAt(0).toUpperCase()}
                      </Text>
                      <View style={styles.onlineIndicator} />
                    </View>
                  </View>
                )}
              </View>
            </View>
          ))}
          
          {isTyping && (
            <View style={[styles.messageContainer, styles.otherMessage]}>
              <View style={styles.messageRow}>
                <View style={styles.avatarContainer}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {(chatName || 'C').charAt(0).toUpperCase()}
                    </Text>
                    <View style={styles.onlineIndicator} />
                  </View>
                </View>
                <View style={styles.messageContent}>
                  <View style={[styles.messageBubble, styles.otherBubble]}>
                    <View style={styles.typingIndicator}>
                      <View style={styles.typingDot} />
                      <View style={styles.typingDot} />
                      <View style={styles.typingDot} />
                    </View>
                  </View>
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
             <TouchableOpacity style={styles.attachButton} onPress={handleFileSelect}>
                <IconIon name="add" size={24} color="#666" />
             </TouchableOpacity>

             <TextInput
                style={styles.textInput}
                value={newMessage}
                onChangeText={setNewMessage}
                placeholder="Type a message..."
                placeholderTextColor="#999"
                maxLength={500}
              />

              <TouchableOpacity
                style={[styles.sendButton, newMessage.trim() ? styles.sendButtonActive : null]}
                onPress={handleSendMessage}
                disabled={!newMessage.trim()}
              >
                <IconIon 
                  name="send" 
                  size={16} 
                  color={newMessage.trim() ? "#FFFFFF" : "#999"} 
                />
              </TouchableOpacity>
          </View>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
  },
  callButton: {
    padding: 8,
    marginRight: 12,
  },
  videoCallButton: {
    padding: 8,
    marginRight: 12,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  avatarContent: {
    width: '100%',
    height: '100%',
    position: 'relative',
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  memberStatus: {
    fontSize: 12,
    color: '#666666',
  },
  moreButton: {
    padding: 8,
  },
  chatContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  messageContainer: {
    marginBottom: 16,
  },
  ownMessage: {
    alignItems: 'flex-end',
  },
  otherMessage: {
    alignItems: 'flex-start',
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    maxWidth: '85%',
  },
  avatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FF5A5A',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  onlineIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    position: 'absolute',
    bottom: -2,
    right: -2,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  messageContent: {
    flex: 1,
    marginHorizontal: 8,
  },
  messageBubble: {
    maxWidth: '100%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
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
  messageTime: {
    fontSize: 10,
    color: '#999999',
    marginTop: 4,
    marginHorizontal: 4,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#999999',
    marginHorizontal: 2,
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
    width: '100%',
  },
  attachButton: {
    padding: 8,
  },
  textInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#333333',
    paddingHorizontal: 8,
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  sendButtonActive: {
    backgroundColor: '#FF5A5A',
  },
  voiceButton: {
    padding: 8,
    marginLeft: 8,
  },
  voiceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginLeft: 8,
  },
  recordingIndicator: {
    marginRight: 8,
  },
  recordingText: {
    fontSize: 14,
    color: '#666666',
  },
});

export default IndividualChatScreen; 
