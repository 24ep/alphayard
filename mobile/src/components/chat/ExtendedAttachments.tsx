import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, TextInput, Alert } from 'react-native';
import IconIon from 'react-native-vector-icons/Ionicons';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';
import { Audio } from 'expo-av';

interface ExtendedAttachmentsProps {
  visible: boolean;
  onClose: () => void;
  onEmojiSelect: (emoji: string) => void;
  onStickerSelect: (sticker: string) => void;
  onGifSelect: (gif: string) => void;
  onVoiceRecord: (voiceUri: string) => void;
}

export const ExtendedAttachments: React.FC<ExtendedAttachmentsProps> = ({
  visible,
  onClose,
  onEmojiSelect,
  onStickerSelect,
  onGifSelect,
  onVoiceRecord,
}) => {
  const [activeTab, setActiveTab] = useState<'emoji' | 'sticker' | 'gif' | 'voice'>('emoji');
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [gifSearchQuery, setGifSearchQuery] = useState('');
  const recordingInterval = useRef<NodeJS.Timeout | null>(null);

  const emojiCategories = {
    'Smileys': ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥'],
    'People': ['👶', '🧒', '👦', '👧', '🧑', '👨', '👩', '🧓', '👴', '👵', '👤', '👥', '🫂', '👪', '👨‍👩‍👧', '👨‍👩‍👧‍👦', '👨‍👩‍👦‍👦', '👨‍👩‍👧‍👧', '👨‍👨‍👦', '👨‍👨‍👧', '👨‍👨‍👧‍👦', '👨‍👨‍👦‍👦', '👨‍👨‍👧‍👧', '👩‍👩‍👦', '👩‍👩‍👧', '👩‍👩‍👧‍👦', '👩‍👩‍👦‍👦', '👩‍👩‍👧‍👧', '👨‍👦', '👨‍👦‍👦', '👨‍👧', '👨‍👧‍👦', '👨‍👧‍👧', '👩‍👦', '👩‍👦‍👦', '👩‍👧', '👩‍👧‍👦', '👩‍👧‍👧'],
    'Animals': ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒', '🦍', '🦧', '🐕', '🐩', '🦮', '🐕‍🦺', '🐈', '🐈‍⬛', '🦄', '🐎', '🦓', '🦌', '🐂', '🐃', '🐄', '🐪', '🐫', '🦙', '🦒', '🐘', '🦏', '🦛'],
    'Food': ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶', '🫑', '🌽', '🥕', '🫒', '🧄', '🧅', '🥔', '🍠', '🥐', '🥖', '🍞', '🥨', '🥯', '🧀', '🥚', '🍳', '🧈'],
    'Activities': ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🪃', '🥅', '⛳', '🪁', '🏹', '🎣', '🤿', '🥊', '🥋', '🎽', '🛹', '🛷', '⛸', '🥌', '🎿', '⛷', '🏂', '🪂', '🏋️‍♀️', '🏋️', '🏋️‍♂️', '🤼‍♀️', '🤼', '🤼‍♂️'],
  };

  const stickers = [
    { id: '1', name: 'Happy', uri: '😊' },
    { id: '2', name: 'Love', uri: '❤️' },
    { id: '3', name: 'Laugh', uri: '😂' },
    { id: '4', name: 'Cool', uri: '😎' },
    { id: '5', name: 'Wink', uri: '😉' },
    { id: '6', name: 'Kiss', uri: '😘' },
    { id: '7', name: 'Heart Eyes', uri: '😍' },
    { id: '8', name: 'Thinking', uri: '🤔' },
    { id: '9', name: 'Shocked', uri: '😱' },
    { id: '10', name: 'Crying', uri: '😢' },
    { id: '11', name: 'Angry', uri: '😠' },
    { id: '12', name: 'Sleepy', uri: '😴' },
  ];

  const gifs = [
    { id: '1', name: 'Happy Dance', uri: 'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif' },
    { id: '2', name: 'Thumbs Up', uri: 'https://media.giphy.com/media/3o6Zt4HU9n2Q8Q8Q8Q/giphy.gif' },
    { id: '3', name: 'Wave', uri: 'https://media.giphy.com/media/3o6Zt4HU9n2Q8Q8Q8Q/giphy.gif' },
    { id: '4', name: 'Celebration', uri: 'https://media.giphy.com/media/3o6Zt4HU9n2Q8Q8Q8Q/giphy.gif' },
    { id: '5', name: 'Love', uri: 'https://media.giphy.com/media/3o6Zt4HU9n2Q8Q8Q8Q/giphy.gif' },
    { id: '6', name: 'Laugh', uri: 'https://media.giphy.com/media/3o6Zt4HU9n2Q8Q8Q8Q/giphy.gif' },
  ];

  const startRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant microphone permission to record voice messages.');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      setRecording(recording);
      setIsRecording(true);
      setRecordingDuration(0);

      // Start duration counter
      recordingInterval.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } catch (error) {
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      setIsRecording(false);
      if (recordingInterval.current) {
        clearInterval(recordingInterval.current);
      }

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      
      if (uri && recordingDuration > 0) {
        onVoiceRecord(uri);
      }
      
      setRecording(null);
      setRecordingDuration(0);
    } catch (error) {
      Alert.alert('Error', 'Failed to stop recording');
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderEmojis = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      {Object.entries(emojiCategories).map(([category, emojis]) => (
        <View key={category} style={styles.categorySection}>
          <Text style={styles.categoryTitle}>{category}</Text>
          <View style={styles.emojiGrid}>
            {emojis.map((emoji, index) => (
              <TouchableOpacity
                key={index}
                style={styles.emojiButton}
                onPress={() => onEmojiSelect(emoji)}
              >
                <Text style={styles.emojiText}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );

  const renderStickers = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.stickerGrid}>
        {stickers.map((sticker) => (
          <TouchableOpacity
            key={sticker.id}
            style={styles.stickerButton}
            onPress={() => onStickerSelect(sticker.uri)}
          >
            <Text style={styles.stickerText}>{sticker.uri}</Text>
            <Text style={styles.stickerName}>{sticker.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );

  const renderGifs = () => (
    <View style={styles.content}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <IconIon name="search" size={20} color="#6B7280" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search GIFs..."
          value={gifSearchQuery}
          onChangeText={setGifSearchQuery}
        />
      </View>

      {/* GIF Grid */}
      <ScrollView style={styles.gifContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.gifGrid}>
          {gifs.map((gif) => (
            <TouchableOpacity
              key={gif.id}
              style={styles.gifButton}
              onPress={() => onGifSelect(gif.uri)}
            >
              <View style={styles.gifPlaceholder}>
                <IconMC name="gif" size={32} color="#6B7280" />
                <Text style={styles.gifName}>{gif.name}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );

  const renderVoice = () => (
    <View style={styles.voiceContainer}>
      <View style={styles.voiceContent}>
        {!isRecording ? (
          <TouchableOpacity style={styles.recordButton} onPress={startRecording}>
            <IconMC name="microphone" size={48} color="#FFFFFF" />
            <Text style={styles.recordButtonText}>Tap to Record</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.recordingContainer}>
            <View style={styles.recordingIndicator}>
              <View style={styles.recordingDot} />
              <Text style={styles.recordingText}>Recording...</Text>
              <Text style={styles.recordingDuration}>{formatDuration(recordingDuration)}</Text>
            </View>
            <TouchableOpacity style={styles.stopButton} onPress={stopRecording}>
              <IconMC name="stop" size={32} color="#FFFFFF" />
              <Text style={styles.stopButtonText}>Stop</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Attachments</Text>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <IconIon name="close" size={24} color="#1F2937" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'emoji' && styles.activeTab]}
          onPress={() => setActiveTab('emoji')}
        >
          <IconIon name="happy" size={20} color={activeTab === 'emoji' ? '#FFB6C1' : '#6B7280'} />
          <Text style={[styles.tabText, activeTab === 'emoji' && styles.activeTabText]}>Emoji</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'sticker' && styles.activeTab]}
          onPress={() => setActiveTab('sticker')}
        >
          <IconMC name="sticker-emoji" size={20} color={activeTab === 'sticker' ? '#FFB6C1' : '#6B7280'} />
          <Text style={[styles.tabText, activeTab === 'sticker' && styles.activeTabText]}>Sticker</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'gif' && styles.activeTab]}
          onPress={() => setActiveTab('gif')}
        >
          <IconMC name="gif" size={20} color={activeTab === 'gif' ? '#FFB6C1' : '#6B7280'} />
          <Text style={[styles.tabText, activeTab === 'gif' && styles.activeTabText]}>GIF</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'voice' && styles.activeTab]}
          onPress={() => setActiveTab('voice')}
        >
          <IconMC name="microphone" size={20} color={activeTab === 'voice' ? '#FFB6C1' : '#6B7280'} />
          <Text style={[styles.tabText, activeTab === 'voice' && styles.activeTabText]}>Voice</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === 'emoji' && renderEmojis()}
      {activeTab === 'sticker' && renderStickers()}
      {activeTab === 'gif' && renderGifs()}
      {activeTab === 'voice' && renderVoice()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 300,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  closeButton: {
    padding: 4,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 182, 193, 0.1)',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    gap: 4,
  },
  activeTab: {
    borderBottomColor: '#FFB6C1',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#FFB6C1',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  categorySection: {
    marginBottom: 20,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  emojiButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255, 182, 193, 0.1)',
  },
  emojiText: {
    fontSize: 24,
  },
  stickerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingVertical: 16,
  },
  stickerButton: {
    alignItems: 'center',
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 182, 193, 0.1)',
  },
  stickerText: {
    fontSize: 32,
    marginBottom: 4,
  },
  stickerName: {
    fontSize: 10,
    color: '#6B7280',
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginVertical: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#1F2937',
  },
  gifContainer: {
    flex: 1,
  },
  gifGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  gifButton: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 20,
    overflow: 'hidden',
  },
  gifPlaceholder: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gifName: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  voiceContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  voiceContent: {
    alignItems: 'center',
  },
  recordButton: {
    backgroundColor: '#FFB6C1',
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  recordButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  recordingContainer: {
    alignItems: 'center',
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 8,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#EF4444',
  },
  recordingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  recordingDuration: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  stopButton: {
    backgroundColor: '#EF4444',
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
});
