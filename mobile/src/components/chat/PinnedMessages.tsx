import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { chatApi } from '../../services/api/chat';

interface PinnedMessage {
  id: string;
  messageId: string;
  pinnedBy: string;
  pinnedAt: string;
  message?: {
    content: string;
    senderName: string;
    sentAt: string;
  };
}

interface PinnedMessagesProps {
  chatRoomId: string;
  onMessagePress?: (messageId: string) => void;
  isAdmin?: boolean;
}

export const PinnedMessagesBar: React.FC<PinnedMessagesProps> = ({
  chatRoomId,
  onMessagePress,
  isAdmin = false,
}) => {
  const [pinnedMessages, setPinnedMessages] = useState<PinnedMessage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPinnedMessages();
  }, [chatRoomId]);

  const loadPinnedMessages = async () => {
    try {
      setLoading(true);
      const response = await chatApi.getPinnedMessages(chatRoomId);
      if (response.success) {
        setPinnedMessages(response.pinnedMessages || []);
      }
    } catch (error) {
      console.error('Error loading pinned messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnpin = async (messageId: string) => {
    try {
      const response = await chatApi.unpinMessage(chatRoomId, messageId);
      if (response.success) {
        setPinnedMessages(pinnedMessages.filter(p => p.messageId !== messageId));
      }
    } catch (error) {
      console.error('Error unpinning message:', error);
    }
  };

  const handleNext = () => {
    setCurrentIndex((currentIndex + 1) % pinnedMessages.length);
  };

  if (loading || pinnedMessages.length === 0) {
    return null;
  }

  const currentPinned = pinnedMessages[currentIndex];

  return (
    <>
      <TouchableOpacity
        style={styles.pinnedBar}
        onPress={() => onMessagePress?.(currentPinned.messageId)}
        onLongPress={() => setShowAll(true)}
      >
        <View style={styles.pinnedIcon}>
          <Ionicons name="pin" size={16} color="#3B82F6" />
        </View>
        <View style={styles.pinnedContent}>
          <Text style={styles.pinnedLabel}>
            Pinned Message {pinnedMessages.length > 1 ? `${currentIndex + 1}/${pinnedMessages.length}` : ''}
          </Text>
          <Text style={styles.pinnedText} numberOfLines={1}>
            {currentPinned.message?.content || 'Message'}
          </Text>
        </View>
        {pinnedMessages.length > 1 && (
          <TouchableOpacity onPress={handleNext} style={styles.nextButton}>
            <Ionicons name="chevron-down" size={20} color="#6B7280" />
          </TouchableOpacity>
        )}
        {isAdmin && (
          <TouchableOpacity
            onPress={() => handleUnpin(currentPinned.messageId)}
            style={styles.closeButton}
          >
            <Ionicons name="close" size={18} color="#6B7280" />
          </TouchableOpacity>
        )}
      </TouchableOpacity>

      {/* All Pinned Messages Modal */}
      <Modal visible={showAll} transparent animationType="slide" onRequestClose={() => setShowAll(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Pinned Messages ({pinnedMessages.length})</Text>
              <TouchableOpacity onPress={() => setShowAll(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={pinnedMessages}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.pinnedItem}
                  onPress={() => {
                    setShowAll(false);
                    onMessagePress?.(item.messageId);
                  }}
                >
                  <Text style={styles.pinnedItemSender}>
                    {item.message?.senderName || 'Unknown'}
                  </Text>
                  <Text style={styles.pinnedItemContent} numberOfLines={2}>
                    {item.message?.content || 'Message'}
                  </Text>
                  {isAdmin && (
                    <TouchableOpacity
                      style={styles.unpinButton}
                      onPress={() => handleUnpin(item.messageId)}
                    >
                      <Text style={styles.unpinText}>Unpin</Text>
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </>
  );
};

// Pin Message Action Sheet
interface PinActionProps {
  messageId: string;
  chatRoomId: string;
  isPinned: boolean;
  onPinChange?: (isPinned: boolean) => void;
}

export const PinMessageButton: React.FC<PinActionProps> = ({
  messageId,
  chatRoomId,
  isPinned: initialIsPinned,
  onPinChange,
}) => {
  const [isPinned, setIsPinned] = useState(initialIsPinned);
  const [loading, setLoading] = useState(false);

  const handleTogglePin = async () => {
    try {
      setLoading(true);
      if (isPinned) {
        const response = await chatApi.unpinMessage(chatRoomId, messageId);
        if (response.success) {
          setIsPinned(false);
          onPinChange?.(false);
        }
      } else {
        const response = await chatApi.pinMessage(chatRoomId, messageId);
        if (response.success) {
          setIsPinned(true);
          onPinChange?.(true);
        }
      }
    } catch (error) {
      console.error('Error toggling pin:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity onPress={handleTogglePin} disabled={loading} style={styles.pinButton}>
      {loading ? (
        <ActivityIndicator size="small" color="#3B82F6" />
      ) : (
        <>
          <Ionicons
            name={isPinned ? 'pin' : 'pin-outline'}
            size={20}
            color={isPinned ? '#3B82F6' : '#6B7280'}
          />
          <Text style={[styles.pinButtonText, isPinned && styles.pinnedText]}>
            {isPinned ? 'Unpin' : 'Pin'}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  pinnedBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#DBEAFE',
  },
  pinnedIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  pinnedContent: {
    flex: 1,
  },
  pinnedLabel: {
    fontSize: 11,
    color: '#3B82F6',
    fontWeight: '600',
  },
  pinnedText: {
    fontSize: 14,
    color: '#1F2937',
  },
  nextButton: {
    padding: 6,
  },
  closeButton: {
    padding: 6,
    marginLeft: 4,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  pinnedItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  pinnedItemSender: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  pinnedItemContent: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  unpinButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  unpinText: {
    fontSize: 13,
    color: '#EF4444',
    fontWeight: '500',
  },
  // Pin button
  pinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 8,
  },
  pinButtonText: {
    fontSize: 14,
    color: '#6B7280',
  },
});

export default PinnedMessagesBar;
