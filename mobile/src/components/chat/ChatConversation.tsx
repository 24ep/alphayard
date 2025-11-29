import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, StyleSheet, Alert, Image } from 'react-native';
import IconIon from 'react-native-vector-icons/Ionicons';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { ChatCustomization } from './ChatCustomization';
import { ExtendedAttachments } from './ExtendedAttachments';

interface Message {
  id: string;
  text: string;
  sender: string;
  timestamp: string;
  isOwn: boolean;
  attachment?: {
    type: 'image' | 'video' | 'file' | 'emoji' | 'sticker' | 'gif' | 'voice';
    uri: string;
    name?: string;
    size?: number;
    duration?: number; // For voice messages
  };
}

interface ChatConversationProps {
  chatId: string;
  chatName: string;
  onBack: () => void;
}

export const ChatConversation: React.FC<ChatConversationProps> = ({ 
  chatId, 
  chatName, 
  onBack 
}) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [showAttachmentOptions, setShowAttachmentOptions] = useState(false);
  const [pendingAttachment, setPendingAttachment] = useState<Message['attachment'] | null>(null);
  const [showCustomization, setShowCustomization] = useState(false);
  const [showExtendedAttachments, setShowExtendedAttachments] = useState(false);
  const [chatTheme, setChatTheme] = useState({
    primaryColor: '#FFB6C1',
    secondaryColor: '#FEF7F7',
    backgroundColor: '#FFFFFF',
    textColor: '#1F2937',
    bubbleColor: '#FFB6C1',
    bubbleTextColor: '#FFFFFF',
  });
  const [chatBackground, setChatBackground] = useState<string | null>(null);

  const handleSendMessage = () => {
    if (message.trim() || pendingAttachment) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: message.trim(),
        sender: 'You',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isOwn: true,
        attachment: pendingAttachment || undefined,
      };
      setMessages([...messages, newMessage]);
      setMessage('');
      setPendingAttachment(null);
    }
  };

  const handleImagePicker = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setPendingAttachment({
          type: 'image',
          uri: result.assets[0].uri,
          name: result.assets[0].fileName || 'image.jpg',
          size: result.assets[0].fileSize,
        });
        setShowAttachmentOptions(false);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleVideoPicker = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setPendingAttachment({
          type: 'video',
          uri: result.assets[0].uri,
          name: result.assets[0].fileName || 'video.mp4',
          size: result.assets[0].fileSize,
        });
        setShowAttachmentOptions(false);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick video');
    }
  };

  const handleDocumentPicker = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        setPendingAttachment({
          type: 'file',
          uri: result.assets[0].uri,
          name: result.assets[0].name,
          size: result.assets[0].size,
        });
        setShowAttachmentOptions(false);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const handleCameraCapture = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setPendingAttachment({
          type: 'image',
          uri: result.assets[0].uri,
          name: 'camera_capture.jpg',
          size: result.assets[0].fileSize,
        });
        setShowAttachmentOptions(false);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to capture image');
    }
  };

  const removePendingAttachment = () => {
    setPendingAttachment(null);
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleEmojiSelect = (emoji: string) => {
    setPendingAttachment({
      type: 'emoji',
      uri: emoji,
      name: 'emoji',
    });
    setShowExtendedAttachments(false);
  };

  const handleStickerSelect = (sticker: string) => {
    setPendingAttachment({
      type: 'sticker',
      uri: sticker,
      name: 'sticker',
    });
    setShowExtendedAttachments(false);
  };

  const handleGifSelect = (gif: string) => {
    setPendingAttachment({
      type: 'gif',
      uri: gif,
      name: 'gif',
    });
    setShowExtendedAttachments(false);
  };

  const handleVoiceRecord = (voiceUri: string) => {
    setPendingAttachment({
      type: 'voice',
      uri: voiceUri,
      name: 'voice_message',
      duration: 0, // In a real app, you'd get the actual duration
    });
    setShowExtendedAttachments(false);
  };

  const handleThemeChange = (theme: any) => {
    setChatTheme(theme);
  };

  const handleBackgroundChange = (backgroundUri: string) => {
    setChatBackground(backgroundUri);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <IconIon name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>{chatName}</Text>
          <Text style={styles.headerSubtitle}>Online</Text>
        </View>
        <TouchableOpacity style={styles.moreButton} onPress={() => setShowCustomization(true)}>
          <IconIon name="ellipsis-vertical" size={24} color="#1F2937" />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <ScrollView style={styles.messagesContainer} showsVerticalScrollIndicator={false}>
        {messages.map((msg) => (
          <View
            key={msg.id}
            style={[
              styles.messageContainer,
              msg.isOwn ? styles.ownMessage : styles.otherMessage
            ]}
          >
            <View
              style={[
                styles.messageBubble,
                msg.isOwn ? styles.ownBubble : styles.otherBubble
              ]}
            >
              {/* Attachment */}
              {msg.attachment && (
                <View style={styles.attachmentContainer}>
                  {msg.attachment.type === 'image' && (
                    <Image source={{ uri: msg.attachment.uri }} style={styles.attachmentImage} />
                  )}
                  {msg.attachment.type === 'video' && (
                    <View style={styles.videoAttachment}>
                      <IconMC name="play-circle" size={48} color="#FFFFFF" />
                      <Text style={styles.videoText}>Video</Text>
                    </View>
                  )}
                  {msg.attachment.type === 'file' && (
                    <View style={styles.fileAttachment}>
                      <IconMC name="file-document" size={32} color="#6B7280" />
                      <View style={styles.fileInfo}>
                        <Text style={styles.fileName} numberOfLines={1}>
                          {msg.attachment.name}
                        </Text>
                        <Text style={styles.fileSize}>
                          {formatFileSize(msg.attachment.size)}
                        </Text>
                      </View>
                    </View>
                  )}
                  {msg.attachment.type === 'emoji' && (
                    <View style={styles.emojiAttachment}>
                      <Text style={styles.emojiText}>{msg.attachment.uri}</Text>
                    </View>
                  )}
                  {msg.attachment.type === 'sticker' && (
                    <View style={styles.stickerAttachment}>
                      <Text style={styles.stickerText}>{msg.attachment.uri}</Text>
                    </View>
                  )}
                  {msg.attachment.type === 'gif' && (
                    <View style={styles.gifAttachment}>
                      <IconMC name="gif" size={48} color="#6B7280" />
                      <Text style={styles.gifText}>GIF</Text>
                    </View>
                  )}
                  {msg.attachment.type === 'voice' && (
                    <View style={styles.voiceAttachment}>
                      <IconMC name="play-circle" size={32} color="#FFB6C1" />
                      <View style={styles.voiceInfo}>
                        <Text style={styles.voiceText}>Voice Message</Text>
                        <Text style={styles.voiceDuration}>
                          {msg.attachment.duration ? `${msg.attachment.duration}s` : '0s'}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              )}
              
              {/* Message Text */}
              {msg.text && (
                <Text style={[
                  styles.messageText,
                  msg.isOwn ? styles.ownText : styles.otherText
                ]}>
                  {msg.text}
                </Text>
              )}
              
              <Text style={[
                styles.messageTime,
                msg.isOwn ? styles.ownTime : styles.otherTime
              ]}>
                {msg.timestamp}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Pending Attachment Preview */}
      {pendingAttachment && (
        <View style={styles.pendingAttachmentContainer}>
          <View style={styles.pendingAttachment}>
            {pendingAttachment.type === 'image' && (
              <Image source={{ uri: pendingAttachment.uri }} style={styles.pendingImage} />
            )}
            {pendingAttachment.type === 'video' && (
              <View style={styles.pendingVideo}>
                <IconMC name="play-circle" size={32} color="#6B7280" />
                <Text style={styles.pendingVideoText}>Video</Text>
              </View>
            )}
            {pendingAttachment.type === 'file' && (
              <View style={styles.pendingFile}>
                <IconMC name="file-document" size={24} color="#6B7280" />
                <Text style={styles.pendingFileName} numberOfLines={1}>
                  {pendingAttachment.name}
                </Text>
              </View>
            )}
            {pendingAttachment.type === 'emoji' && (
              <View style={styles.pendingEmoji}>
                <Text style={styles.pendingEmojiText}>{pendingAttachment.uri}</Text>
              </View>
            )}
            {pendingAttachment.type === 'sticker' && (
              <View style={styles.pendingSticker}>
                <Text style={styles.pendingStickerText}>{pendingAttachment.uri}</Text>
              </View>
            )}
            {pendingAttachment.type === 'gif' && (
              <View style={styles.pendingGif}>
                <IconMC name="gif" size={24} color="#6B7280" />
                <Text style={styles.pendingGifText}>GIF</Text>
              </View>
            )}
            {pendingAttachment.type === 'voice' && (
              <View style={styles.pendingVoice}>
                <IconMC name="microphone" size={24} color="#6B7280" />
                <Text style={styles.pendingVoiceText}>Voice Message</Text>
              </View>
            )}
            <TouchableOpacity 
              style={styles.removeAttachmentButton}
              onPress={removePendingAttachment}
            >
              <IconIon name="close" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Attachment Options Modal */}
      {showAttachmentOptions && (
        <View style={styles.attachmentOptionsOverlay}>
          <View style={styles.attachmentOptions}>
            <TouchableOpacity style={styles.attachmentOption} onPress={handleCameraCapture}>
              <IconMC name="camera" size={32} color="#FFB6C1" />
              <Text style={styles.attachmentOptionText}>Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.attachmentOption} onPress={handleImagePicker}>
              <IconMC name="image" size={32} color="#FFB6C1" />
              <Text style={styles.attachmentOptionText}>Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.attachmentOption} onPress={handleVideoPicker}>
              <IconMC name="video" size={32} color="#FFB6C1" />
              <Text style={styles.attachmentOptionText}>Video</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.attachmentOption} onPress={handleDocumentPicker}>
              <IconMC name="file-document" size={32} color="#FFB6C1" />
              <Text style={styles.attachmentOptionText}>File</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.attachmentOption} onPress={() => setShowExtendedAttachments(true)}>
              <IconMC name="emoticon-happy" size={32} color="#FFB6C1" />
              <Text style={styles.attachmentOptionText}>More</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity 
            style={styles.cancelAttachmentButton}
            onPress={() => setShowAttachmentOptions(false)}
          >
            <Text style={styles.cancelAttachmentText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Message Input */}
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TouchableOpacity 
            style={styles.attachmentButton}
            onPress={() => setShowAttachmentOptions(true)}
          >
            <IconMC name="plus" size={24} color="#6B7280" />
          </TouchableOpacity>
          <TextInput
            style={styles.textInput}
            placeholder="Type a message..."
            value={message}
            onChangeText={setMessage}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (message.trim() || pendingAttachment) ? styles.sendButtonActive : styles.sendButtonInactive
            ]}
            onPress={handleSendMessage}
            disabled={!message.trim() && !pendingAttachment}
          >
            <IconIon 
              name="send" 
              size={20} 
              color={(message.trim() || pendingAttachment) ? '#FFFFFF' : '#9CA3AF'} 
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Chat Customization Modal */}
      <ChatCustomization
        visible={showCustomization}
        onClose={() => setShowCustomization(false)}
        currentTheme={chatTheme}
        currentBackground={chatBackground}
        onThemeChange={handleThemeChange}
        onBackgroundChange={handleBackgroundChange}
      />

      {/* Extended Attachments Modal */}
      <ExtendedAttachments
        visible={showExtendedAttachments}
        onClose={() => setShowExtendedAttachments(false)}
        onEmojiSelect={handleEmojiSelect}
        onStickerSelect={handleStickerSelect}
        onGifSelect={handleGifSelect}
        onVoiceRecord={handleVoiceRecord}
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 182, 193, 0.1)',
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#10B981',
    marginTop: 2,
  },
  moreButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 182, 193, 0.1)',
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  ownBubble: {
    backgroundColor: '#FFB6C1',
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: '#F3F4F6',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  ownText: {
    color: '#FFFFFF',
  },
  otherText: {
    color: '#1F2937',
  },
  messageTime: {
    fontSize: 12,
    marginTop: 4,
  },
  ownTime: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  otherTime: {
    color: '#6B7280',
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#F9FAFB',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  sendButtonActive: {
    backgroundColor: '#FFB6C1',
  },
  sendButtonInactive: {
    backgroundColor: '#E5E7EB',
  },
  attachmentButton: {
    padding: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 182, 193, 0.1)',
  },
  pendingAttachmentContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F9FAFB',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  pendingAttachment: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  pendingImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  pendingVideo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  pendingVideoText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#6B7280',
  },
  pendingFile: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  pendingFileName: {
    marginLeft: 8,
    fontSize: 14,
    color: '#1F2937',
    flex: 1,
  },
  removeAttachmentButton: {
    padding: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 182, 193, 0.1)',
  },
  attachmentOptionsOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  attachmentOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 20,
    marginBottom: 12,
  },
  attachmentOption: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 182, 193, 0.1)',
    marginHorizontal: 4,
  },
  attachmentOptionText: {
    marginTop: 8,
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  cancelAttachmentButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelAttachmentText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
  },
  attachmentContainer: {
    marginBottom: 8,
  },
  attachmentImage: {
    width: 200,
    height: 150,
    borderRadius: 12,
  },
  videoAttachment: {
    width: 200,
    height: 120,
    backgroundColor: '#1F2937',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginTop: 8,
  },
  fileAttachment: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 12,
    maxWidth: 200,
  },
  fileInfo: {
    marginLeft: 12,
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },
  fileSize: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  emojiAttachment: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  emojiText: {
    fontSize: 48,
  },
  stickerAttachment: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  stickerText: {
    fontSize: 64,
  },
  gifAttachment: {
    width: 200,
    height: 120,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gifText: {
    color: '#6B7280',
    fontSize: 14,
    marginTop: 8,
  },
  voiceAttachment: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 12,
    maxWidth: 200,
  },
  voiceInfo: {
    marginLeft: 12,
    flex: 1,
  },
  voiceText: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },
  voiceDuration: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  pendingEmoji: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  pendingEmojiText: {
    fontSize: 32,
  },
  pendingSticker: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  pendingStickerText: {
    fontSize: 40,
  },
  pendingGif: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  pendingGifText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#6B7280',
  },
  pendingVoice: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  pendingVoiceText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#1F2937',
  },
});
