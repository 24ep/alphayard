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

interface RouteParams {
  circleId: string;
  circleName: string;
  memberId: string;
  memberName: string;
  isGroupChat: boolean;
}

const CircleGroupChatScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const params = route.params as RouteParams;
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const recordingAnimation = useRef(new Animated.Value(0)).current;

  // Mock messages for Circle group chat
  const mockMessages: ChatMessage[] = [
    {
      id: '1',
      text: 'Good morning everyone! How is everyone doing today?',
      senderId: 'mom',
      senderName: 'Sarah Lincon',
      senderAvatar: 'https://api.dicebear.com/7.x/personas/svg?seed=sarah-lincon&backgroundColor=ffd5dc',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      isOwnMessage: false,
    },
    {
      id: '2',
      text: 'Morning! I\'m doing great. Just finished my workout.',
      senderId: 'dad',
      senderName: 'Mike Lincon',
      senderAvatar: 'https://api.dicebear.com/7.x/personas/svg?seed=mike-lincon&backgroundColor=c0aede',
      timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000), // 1.5 hours ago
      isOwnMessage: false,
    },
    {
      id: '3',
      text: 'Hi everyone! I\'m at school now.',
      senderId: 'daughter',
      senderName: 'Emma Lincon',
      senderAvatar: 'https://api.dicebear.com/7.x/personas/svg?seed=emma-lincon&backgroundColor=b6e3f4',
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      isOwnMessage: false,
    },
    {
      id: '4',
      text: "Don't forget we have circle dinner tonight at 7 PM!",
      senderId: 'mom',
      senderName: 'Sarah Lincon',
      senderAvatar: 'https://api.dicebear.com/7.x/personas/svg?seed=sarah-lincon&backgroundColor=ffd5dc',
      timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
      isOwnMessage: false,
    },
    {
      id: '5',
      text: 'I\'ll be there! Looking forward to it.',
      senderId: 'user',
      senderName: 'You',
      senderAvatar: 'https://api.dicebear.com/7.x/personas/svg?seed=user&backgroundColor=4f46e5',
      timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      isOwnMessage: true,
    },
  ];

  useEffect(() => {
    setMessages(mockMessages);
  }, []);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: ChatMessage = {
        id: Date.now().toString(),
        text: newMessage.trim(),
        senderId: 'user',
        senderName: 'You',
        senderAvatar: 'https://api.dicebear.com/7.x/personas/svg?seed=user&backgroundColor=4f46e5',
        timestamp: new Date(),
        isOwnMessage: true,
      };
      
      setMessages(prev => [...prev, message]);
      setNewMessage('');
      
      // Scroll to bottom
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const handleVoiceCall = () => {
    Alert.alert(
      'Voice Call',
      'Start voice call with circle members?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call', onPress: () => {
          console.log('Starting voice call...');
          // Navigate to voice call screen
          navigation.navigate('VoiceCall', {
            circleId: params.circleId,
            circleName: params.circleName,
            isVideoCall: false,
          });
        }},
      ]
    );
  };

  const handleVideoCall = () => {
    Alert.alert(
      'Video Call',
      'Start video call with Circle members?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call', onPress: () => {
          console.log('Starting video call...');
          // Navigate to video call screen
          navigation.navigate('VideoCall', {
            circleId: params.circleId,
            circleName: params.circleName,
            isVideoCall: true,
          });
        }},
      ]
    );
  };

  const handleVoiceMessage = () => {
    if (!isRecording) {
      // Start recording
      setIsRecording(true);
      setIsVoiceMode(true);
      
      // Start recording animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(recordingAnimation, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(recordingAnimation, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
      
      console.log('Started recording voice message...');
    } else {
      // Stop recording
      setIsRecording(false);
      setIsVoiceMode(false);
      recordingAnimation.stopAnimation();
      
      console.log('Stopped recording voice message...');
      
      // Simulate sending voice message
      const voiceMessage: ChatMessage = {
        id: Date.now().toString(),
        text: '🎤 Voice message',
        senderId: 'user',
        senderName: 'You',
        senderAvatar: 'https://api.dicebear.com/7.x/personas/svg?seed=user&backgroundColor=4f46e5',
        timestamp: new Date(),
        isOwnMessage: true,
      };
      
      setMessages(prev => [...prev, voiceMessage]);
      
      // Scroll to bottom
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleMoreOptions = () => {
    Alert.alert(
      'Circle Group Chat Options',
      'What would you like to do?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'View Circle Members', onPress: () => console.log('View members') },
        { text: 'Share Location', onPress: () => console.log('Share location') },
        { text: 'Mute Notifications', onPress: () => console.log('Mute') },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#FF5A5A" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <IconIon name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        
        <View style={styles.headerInfo}>
          <View style={styles.circleAvatar}>
            <IconMC name="account-group" size={24} color="#FFFFFF" />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.circleName}>{params.circleName}</Text>
            <Text style={styles.memberCount}>4 members</Text>
          </View>
        </View>
        
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.callButton} onPress={handleVoiceCall}>
            <IconIon name="call" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.videoCallButton} onPress={handleVideoCall}>
            <IconIon name="videocam" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.moreButton} onPress={handleMoreOptions}>
            <IconIon name="ellipsis-vertical" size={24} color="#FFFFFF" />
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
                  {!message.isOwnMessage && (
                    <Text style={styles.senderName}>{message.senderName}</Text>
                  )}
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
                    <Text style={styles.avatarText}>S</Text>
                    <View style={styles.onlineIndicator} />
                  </View>
                </View>
                <View style={styles.messageContent}>
                  <Text style={styles.senderName}>Someone</Text>
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
          <TouchableOpacity style={styles.attachButton}>
            <IconIon name="add" size={24} color="#666" />
          </TouchableOpacity>
          
          {!isVoiceMode ? (
            <>
              <TextInput
                style={styles.textInput}
                value={newMessage}
                onChangeText={setNewMessage}
                placeholder="Type a message..."
                placeholderTextColor="#999"
                multiline
                maxLength={500}
              />
              
              <TouchableOpacity
                style={[styles.sendButton, newMessage.trim() ? styles.sendButtonActive : null]}
                onPress={handleSendMessage}
                disabled={!newMessage.trim()}
              >
                <IconIon 
                  name="send" 
                  size={20} 
                  color={newMessage.trim() ? "#FFFFFF" : "#999"} 
                />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.voiceButton} onPress={handleVoiceMessage}>
                <IconIon name="mic" size={20} color="#666" />
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.voiceInputContainer}>
                <Animated.View style={[
                  styles.recordingIndicator,
                  {
                    opacity: recordingAnimation,
                    transform: [{
                      scale: recordingAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 1.2],
                      })
                    }]
                  }
                ]}>
                  <IconIon name="mic" size={24} color="#FF5A5A" />
                </Animated.View>
                <Text style={styles.recordingText}>
                  {isRecording ? 'Recording... Tap to stop' : 'Tap to record voice message'}
                </Text>
              </View>
              
              <TouchableOpacity
                style={[styles.sendButton, styles.sendButtonActive]}
                onPress={handleVoiceMessage}
              >
                <IconIon 
                  name={isRecording ? "stop" : "mic"} 
                  size={20} 
                  color="#FFFFFF" 
                />
              </TouchableOpacity>
            </>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FF5A5A',
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
  circleAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  circleName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  memberCount: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  callButton: {
    padding: 8,
    marginRight: 12,
  },
  videoCallButton: {
    padding: 8,
    marginRight: 12,
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
  senderName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 4,
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
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  attachButton: {
    padding: 8,
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: '#F8F9FA',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    color: '#333333',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
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
    flex: 1,
    marginHorizontal: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  recordingIndicator: {
    marginRight: 8,
  },
  recordingText: {
    fontSize: 14,
    color: '#666666',
  },
});

export default CircleGroupChatScreen;
