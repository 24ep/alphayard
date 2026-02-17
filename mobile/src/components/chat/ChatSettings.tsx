import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Modal,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { chatApi } from '../../services/api/chat';

interface ChatSettingsProps {
  chatRoomId: string;
  chatName: string;
  onClose: () => void;
}

export const ChatSettingsSheet: React.FC<ChatSettingsProps> = ({
  chatRoomId,
  chatName,
  onClose,
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [isArchived, setIsArchived] = useState(false);
  const [disappearEnabled, setDisappearEnabled] = useState(false);
  const [disappearDuration, setDisappearDuration] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showDisappearOptions, setShowDisappearOptions] = useState(false);

  useEffect(() => {
    loadSettings();
  }, [chatRoomId]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const disappearResponse = await chatApi.getDisappearSettings(chatRoomId);
      if (disappearResponse.success && disappearResponse.settings) {
        setDisappearEnabled(disappearResponse.settings.enabled);
        setDisappearDuration(disappearResponse.settings.durationSeconds);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleMute = async () => {
    try {
      if (isMuted) {
        await chatApi.unmuteChat(chatRoomId);
        setIsMuted(false);
      } else {
        await chatApi.muteChat(chatRoomId);
        setIsMuted(true);
      }
    } catch (error) {
      console.error('Error toggling mute:', error);
    }
  };

  const handleTogglePin = async () => {
    try {
      if (isPinned) {
        await chatApi.unpinChat(chatRoomId);
        setIsPinned(false);
      } else {
        await chatApi.pinChat(chatRoomId);
        setIsPinned(true);
      }
    } catch (error) {
      console.error('Error toggling pin:', error);
    }
  };

  const handleToggleArchive = async () => {
    try {
      if (isArchived) {
        await chatApi.unarchiveChat(chatRoomId);
        setIsArchived(false);
      } else {
        await chatApi.archiveChat(chatRoomId);
        setIsArchived(true);
      }
    } catch (error) {
      console.error('Error toggling archive:', error);
    }
  };

  const handleSetDisappear = async (durationSeconds: number) => {
    try {
      const enabled = durationSeconds > 0;
      await chatApi.setDisappearSettings(chatRoomId, enabled, durationSeconds);
      setDisappearEnabled(enabled);
      setDisappearDuration(durationSeconds);
      setShowDisappearOptions(false);
    } catch (error) {
      console.error('Error setting disappear:', error);
    }
  };

  const formatDuration = (seconds: number): string => {
    if (seconds === 0) return 'Off';
    if (seconds < 60) return `${seconds} seconds`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours`;
    return `${Math.floor(seconds / 86400)} days`;
  };

  const disappearPresets = [
    { label: 'Off', seconds: 0 },
    { label: '5 seconds', seconds: 5 },
    { label: '1 minute', seconds: 60 },
    { label: '5 minutes', seconds: 300 },
    { label: '1 hour', seconds: 3600 },
    { label: '24 hours', seconds: 86400 },
    { label: '7 days', seconds: 604800 },
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.chatName}>{chatName}</Text>
        <Text style={styles.subtitle}>Chat Settings</Text>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickAction} onPress={handleToggleMute}>
            <View style={[styles.quickActionIcon, isMuted && styles.quickActionActive]}>
              <Ionicons 
                name={isMuted ? 'notifications-off' : 'notifications'} 
                size={22} 
                color={isMuted ? '#FFFFFF' : '#6B7280'} 
              />
            </View>
            <Text style={styles.quickActionText}>{isMuted ? 'Unmute' : 'Mute'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickAction} onPress={handleTogglePin}>
            <View style={[styles.quickActionIcon, isPinned && styles.quickActionActive]}>
              <Ionicons 
                name="pin" 
                size={22} 
                color={isPinned ? '#FFFFFF' : '#6B7280'} 
              />
            </View>
            <Text style={styles.quickActionText}>{isPinned ? 'Unpin' : 'Pin'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickAction} onPress={handleToggleArchive}>
            <View style={[styles.quickActionIcon, isArchived && styles.quickActionActive]}>
              <Ionicons 
                name="archive" 
                size={22} 
                color={isArchived ? '#FFFFFF' : '#6B7280'} 
              />
            </View>
            <Text style={styles.quickActionText}>{isArchived ? 'Unarchive' : 'Archive'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Disappearing Messages */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Disappearing Messages</Text>
        
        <TouchableOpacity 
          style={styles.settingRow}
          onPress={() => setShowDisappearOptions(true)}
        >
          <View style={styles.settingLeft}>
            <Ionicons name="timer-outline" size={24} color="#3B82F6" />
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Auto-delete messages</Text>
              <Text style={styles.settingValue}>
                {formatDuration(disappearDuration)}
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      {/* Notifications */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        
        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <Ionicons name="notifications-outline" size={24} color="#6B7280" />
            <Text style={styles.settingLabel}>Show notifications</Text>
          </View>
          <Switch
            value={!isMuted}
            onValueChange={handleToggleMute}
            trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
            thumbColor={!isMuted ? '#3B82F6' : '#F3F4F6'}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <Ionicons name="eye-outline" size={24} color="#6B7280" />
            <Text style={styles.settingLabel}>Show preview</Text>
          </View>
          <Switch
            value={true}
            onValueChange={() => {}}
            trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
            thumbColor="#3B82F6"
          />
        </View>
      </View>

      {/* Disappear Options Modal */}
      <Modal
        visible={showDisappearOptions}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDisappearOptions(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Disappearing Messages</Text>
              <TouchableOpacity onPress={() => setShowDisappearOptions(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSubtitle}>
              Messages will be automatically deleted after the selected time
            </Text>
            
            {disappearPresets.map((preset) => (
              <TouchableOpacity
                key={preset.seconds}
                style={[
                  styles.presetOption,
                  disappearDuration === preset.seconds && styles.presetSelected
                ]}
                onPress={() => handleSetDisappear(preset.seconds)}
              >
                <Text style={[
                  styles.presetText,
                  disappearDuration === preset.seconds && styles.presetTextSelected
                ]}>
                  {preset.label}
                </Text>
                {disappearDuration === preset.seconds && (
                  <Ionicons name="checkmark" size={20} color="#3B82F6" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

// Mute Options Picker
interface MuteOptionsProps {
  visible: boolean;
  onSelect: (duration: number | null) => void;
  onClose: () => void;
}

export const MuteOptionsPicker: React.FC<MuteOptionsProps> = ({
  visible,
  onSelect,
  onClose,
}) => {
  const options = [
    { label: '8 hours', duration: 8 * 60 * 60 * 1000 },
    { label: '1 week', duration: 7 * 24 * 60 * 60 * 1000 },
    { label: 'Always', duration: null },
  ];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.muteOverlay} onPress={onClose} activeOpacity={1}>
        <View style={styles.muteSheet}>
          <Text style={styles.muteTitle}>Mute notifications for...</Text>
          {options.map((option) => (
            <TouchableOpacity
              key={option.label}
              style={styles.muteOption}
              onPress={() => onSelect(option.duration)}
            >
              <Text style={styles.muteOptionText}>{option.label}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.muteCancelButton} onPress={onClose}>
            <Text style={styles.muteCancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  chatName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
  },
  quickAction: {
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionActive: {
    backgroundColor: '#3B82F6',
  },
  quickActionText: {
    fontSize: 12,
    color: '#6B7280',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 15,
    color: '#1F2937',
  },
  settingValue: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  presetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  presetSelected: {
    backgroundColor: '#EFF6FF',
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  presetText: {
    fontSize: 16,
    color: '#374151',
  },
  presetTextSelected: {
    color: '#3B82F6',
    fontWeight: '500',
  },
  // Mute picker
  muteOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  muteSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
  },
  muteTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 16,
  },
  muteOption: {
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  muteOptionText: {
    fontSize: 16,
    color: '#3B82F6',
  },
  muteCancelButton: {
    marginTop: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  muteCancelText: {
    fontSize: 16,
    color: '#6B7280',
  },
});

export default ChatSettingsSheet;
