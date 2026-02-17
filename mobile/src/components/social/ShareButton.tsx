import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Share,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { socialApi } from '../../services/api/social';

interface ShareButtonProps {
  postId: string;
  postContent?: string;
  postUrl?: string;
  sharesCount?: number;
  size?: 'small' | 'medium' | 'large';
  showCount?: boolean;
  onShare?: (type: string) => void;
}

export const ShareButton: React.FC<ShareButtonProps> = ({
  postId,
  postContent,
  postUrl,
  sharesCount = 0,
  size = 'medium',
  showCount = true,
  onShare,
}) => {
  const [showShareModal, setShowShareModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const iconSize = size === 'small' ? 18 : size === 'large' ? 28 : 22;

  const handlePress = () => {
    setShowShareModal(true);
  };

  return (
    <>
      <TouchableOpacity onPress={handlePress} style={styles.button}>
        <Ionicons name="share-outline" size={iconSize} color="#6B7280" />
        {showCount && sharesCount > 0 && (
          <Text style={styles.countText}>{sharesCount}</Text>
        )}
      </TouchableOpacity>

      <ShareModal
        visible={showShareModal}
        postId={postId}
        postContent={postContent}
        postUrl={postUrl}
        onClose={() => setShowShareModal(false)}
        onShare={(type) => {
          onShare?.(type);
          setShowShareModal(false);
        }}
      />
    </>
  );
};

// Share Modal
interface ShareModalProps {
  visible: boolean;
  postId: string;
  postContent?: string;
  postUrl?: string;
  onClose: () => void;
  onShare: (type: string) => void;
}

const ShareModal: React.FC<ShareModalProps> = ({
  visible,
  postId,
  postContent,
  postUrl,
  onClose,
  onShare,
}) => {
  const [loading, setLoading] = useState(false);

  const shareOptions = [
    { id: 'repost', icon: 'repeat', label: 'Repost', color: '#10B981' },
    { id: 'quote', icon: 'create', label: 'Quote', color: '#3B82F6' },
    { id: 'message', icon: 'mail', label: 'Send via Message', color: '#6366F1' },
    { id: 'copy', icon: 'copy', label: 'Copy Link', color: '#6B7280' },
    { id: 'share', icon: 'share-social', label: 'Share via...', color: '#F59E0B' },
  ];

  const handleShare = async (type: string) => {
    try {
      setLoading(true);

      switch (type) {
        case 'repost':
          await handleRepost();
          break;
        case 'quote':
          // Navigate to compose screen with quote
          onShare('quote');
          return;
        case 'message':
          // Navigate to message compose
          onShare('message');
          return;
        case 'copy':
          await handleCopyLink();
          break;
        case 'share':
          await handleNativeShare();
          break;
      }

      onShare(type);
    } catch (error) {
      console.error('Error sharing:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRepost = async () => {
    try {
      // Call API to create repost
      // For now, just record the share
      await socialApi.sharePost?.(postId, { type: 'repost' });
    } catch (error) {
      console.error('Error reposting:', error);
      throw error;
    }
  };

  const handleCopyLink = async () => {
    const link = postUrl || `https://boundary.app/post/${postId}`;
    // In React Native, you'd use Clipboard.setString(link)
    // For now, we'll just log it
    console.log('Copied link:', link);
  };

  const handleNativeShare = async () => {
    const link = postUrl || `https://boundary.app/post/${postId}`;
    const message = postContent 
      ? `${postContent.substring(0, 100)}${postContent.length > 100 ? '...' : ''}\n\n${link}`
      : link;

    try {
      await Share.share({
        message,
        url: link,
      });
    } catch (error) {
      console.error('Error with native share:', error);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Share Post</Text>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#3B82F6" />
            </View>
          ) : (
            <ScrollView style={styles.optionsContainer}>
              {shareOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={styles.shareOption}
                  onPress={() => handleShare(option.id)}
                >
                  <View style={[styles.optionIcon, { backgroundColor: `${option.color}15` }]}>
                    <Ionicons name={option.icon as any} size={24} color={option.color} />
                  </View>
                  <Text style={styles.optionLabel}>{option.label}</Text>
                  <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {/* Cancel Button */}
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// Repost Button (simplified version for inline use)
interface RepostButtonProps {
  postId: string;
  repostsCount?: number;
  isReposted?: boolean;
  onRepost?: () => void;
}

export const RepostButton: React.FC<RepostButtonProps> = ({
  postId,
  repostsCount = 0,
  isReposted = false,
  onRepost,
}) => {
  const [reposted, setReposted] = useState(isReposted);
  const [count, setCount] = useState(repostsCount);
  const [loading, setLoading] = useState(false);

  const handleRepost = async () => {
    try {
      setLoading(true);
      
      if (reposted) {
        // Undo repost
        await socialApi.undoRepost?.(postId);
        setReposted(false);
        setCount(c => Math.max(0, c - 1));
      } else {
        // Create repost
        await socialApi.sharePost?.(postId, { type: 'repost' });
        setReposted(true);
        setCount(c => c + 1);
      }
      
      onRepost?.();
    } catch (error) {
      console.error('Error with repost:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity
      onPress={handleRepost}
      disabled={loading}
      style={styles.repostButton}
    >
      {loading ? (
        <ActivityIndicator size="small" color={reposted ? '#10B981' : '#6B7280'} />
      ) : (
        <Ionicons
          name="repeat"
          size={20}
          color={reposted ? '#10B981' : '#6B7280'}
        />
      )}
      {count > 0 && (
        <Text style={[styles.repostCount, reposted && styles.repostedCount]}>
          {count}
        </Text>
      )}
    </TouchableOpacity>
  );
};

// Share Count Display
interface ShareCountProps {
  count: number;
  onPress?: () => void;
}

export const ShareCount: React.FC<ShareCountProps> = ({ count, onPress }) => {
  if (count === 0) return null;

  return (
    <TouchableOpacity onPress={onPress} style={styles.shareCountContainer}>
      <Text style={styles.shareCountText}>
        {count} {count === 1 ? 'share' : 'shares'}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    gap: 4,
  },
  countText: {
    fontSize: 13,
    color: '#6B7280',
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
    paddingBottom: 24,
  },
  modalHeader: {
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalHandle: {
    width: 36,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  loadingContainer: {
    padding: 48,
    alignItems: 'center',
  },
  optionsContainer: {
    maxHeight: 300,
  },
  shareOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  optionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionLabel: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  cancelButton: {
    marginTop: 8,
    marginHorizontal: 16,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
  },
  // Repost Button
  repostButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    gap: 4,
  },
  repostCount: {
    fontSize: 13,
    color: '#6B7280',
  },
  repostedCount: {
    color: '#10B981',
  },
  // Share Count
  shareCountContainer: {
    paddingVertical: 4,
  },
  shareCountText: {
    fontSize: 13,
    color: '#6B7280',
  },
});

export default ShareButton;
