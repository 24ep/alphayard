import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Modal,
  Pressable,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export type ReactionType = 'like' | 'love' | 'laugh' | 'wow' | 'sad' | 'angry' | 'celebrate' | 'support' | 'insightful';

export interface ReactionCounts {
  like: number;
  love: number;
  laugh: number;
  wow: number;
  sad: number;
  angry: number;
  celebrate: number;
  support: number;
  insightful: number;
  total: number;
}

interface ReactionPickerProps {
  currentReaction?: ReactionType;
  counts?: ReactionCounts;
  onReact: (reaction: ReactionType) => void;
  onRemoveReaction: () => void;
  size?: 'small' | 'medium' | 'large';
  showCount?: boolean;
}

const REACTIONS: { type: ReactionType; emoji: string; label: string; color: string }[] = [
  { type: 'like', emoji: '👍', label: 'Like', color: '#3B82F6' },
  { type: 'love', emoji: '❤️', label: 'Love', color: '#EF4444' },
  { type: 'laugh', emoji: '😂', label: 'Haha', color: '#F59E0B' },
  { type: 'wow', emoji: '😮', label: 'Wow', color: '#F59E0B' },
  { type: 'sad', emoji: '😢', label: 'Sad', color: '#F59E0B' },
  { type: 'angry', emoji: '😠', label: 'Angry', color: '#F97316' },
];

export const ReactionPicker: React.FC<ReactionPickerProps> = ({
  currentReaction,
  counts,
  onReact,
  onRemoveReaction,
  size = 'medium',
  showCount = true,
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const scaleAnims = useRef(REACTIONS.map(() => new Animated.Value(0))).current;
  const containerScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (showPicker) {
      // Animate container
      Animated.spring(containerScale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();

      // Stagger animate each reaction
      scaleAnims.forEach((anim, index) => {
        Animated.spring(anim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
          delay: index * 50,
        }).start();
      });
    } else {
      containerScale.setValue(0);
      scaleAnims.forEach(anim => anim.setValue(0));
    }
  }, [showPicker]);

  const handleLongPress = () => {
    setShowPicker(true);
  };

  const handlePress = () => {
    if (currentReaction) {
      onRemoveReaction();
    } else {
      onReact('like');
    }
  };

  const handleSelectReaction = (reaction: ReactionType) => {
    if (currentReaction === reaction) {
      onRemoveReaction();
    } else {
      onReact(reaction);
    }
    setShowPicker(false);
  };

  const getCurrentReactionDisplay = () => {
    if (!currentReaction) {
      return { emoji: null, color: '#6B7280' };
    }
    const reaction = REACTIONS.find(r => r.type === currentReaction);
    return { emoji: reaction?.emoji, color: reaction?.color || '#3B82F6' };
  };

  const { emoji, color } = getCurrentReactionDisplay();
  const totalCount = counts?.total || 0;

  const buttonSize = size === 'small' ? 32 : size === 'large' ? 48 : 40;
  const iconSize = size === 'small' ? 18 : size === 'large' ? 26 : 22;
  const emojiSize = size === 'small' ? 14 : size === 'large' ? 22 : 18;

  return (
    <View style={styles.container}>
      {/* Main Reaction Button */}
      <TouchableOpacity
        style={[styles.mainButton, { width: buttonSize, height: buttonSize }]}
        onPress={handlePress}
        onLongPress={handleLongPress}
        delayLongPress={300}
      >
        {emoji ? (
          <Text style={{ fontSize: emojiSize }}>{emoji}</Text>
        ) : (
          <Ionicons name="heart-outline" size={iconSize} color={color} />
        )}
      </TouchableOpacity>

      {/* Count */}
      {showCount && totalCount > 0 && (
        <Text style={[styles.countText, { color }]}>
          {totalCount > 999 ? `${(totalCount / 1000).toFixed(1)}k` : totalCount}
        </Text>
      )}

      {/* Reaction Picker Modal */}
      <Modal
        visible={showPicker}
        transparent
        animationType="none"
        onRequestClose={() => setShowPicker(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setShowPicker(false)}>
          <Animated.View
            style={[
              styles.pickerContainer,
              {
                transform: [{ scale: containerScale }],
              },
            ]}
          >
            {REACTIONS.map((reaction, index) => (
              <Animated.View
                key={reaction.type}
                style={{
                  transform: [{ scale: scaleAnims[index] }],
                }}
              >
                <TouchableOpacity
                  style={[
                    styles.reactionItem,
                    currentReaction === reaction.type && styles.selectedReaction,
                  ]}
                  onPress={() => handleSelectReaction(reaction.type)}
                >
                  <Text style={styles.reactionEmoji}>{reaction.emoji}</Text>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </Animated.View>
        </Pressable>
      </Modal>
    </View>
  );
};

// Reaction Summary Component - shows who reacted
interface ReactionSummaryProps {
  counts?: ReactionCounts;
  onPress?: () => void;
}

export const ReactionSummary: React.FC<ReactionSummaryProps> = ({ counts, onPress }) => {
  if (!counts || counts.total === 0) return null;

  // Get top 3 reactions
  const topReactions = Object.entries(counts)
    .filter(([key]) => key !== 'total' && counts[key as keyof ReactionCounts] > 0)
    .sort((a, b) => (b[1] as number) - (a[1] as number))
    .slice(0, 3)
    .map(([type]) => REACTIONS.find(r => r.type === type)?.emoji)
    .filter(Boolean);

  return (
    <TouchableOpacity style={styles.summaryContainer} onPress={onPress}>
      <View style={styles.emojiStack}>
        {topReactions.map((emoji, index) => (
          <View
            key={index}
            style={[styles.stackedEmoji, { zIndex: 3 - index, marginLeft: index > 0 ? -6 : 0 }]}
          >
            <Text style={styles.smallEmoji}>{emoji}</Text>
          </View>
        ))}
      </View>
      <Text style={styles.summaryText}>
        {counts.total > 999 ? `${(counts.total / 1000).toFixed(1)}k` : counts.total}
      </Text>
    </TouchableOpacity>
  );
};

// Inline Reaction Bar for Posts
interface InlineReactionBarProps {
  postId: string;
  currentReaction?: ReactionType;
  counts?: ReactionCounts;
  commentsCount?: number;
  sharesCount?: number;
  isBookmarked?: boolean;
  onReact: (reaction: ReactionType) => void;
  onRemoveReaction: () => void;
  onComment?: () => void;
  onShare?: () => void;
  onBookmark?: () => void;
}

export const InlineReactionBar: React.FC<InlineReactionBarProps> = ({
  postId,
  currentReaction,
  counts,
  commentsCount = 0,
  sharesCount = 0,
  isBookmarked = false,
  onReact,
  onRemoveReaction,
  onComment,
  onShare,
  onBookmark,
}) => {
  return (
    <View style={styles.inlineBar}>
      {/* Reactions */}
      <View style={styles.inlineItem}>
        <ReactionPicker
          currentReaction={currentReaction}
          counts={counts}
          onReact={onReact}
          onRemoveReaction={onRemoveReaction}
          size="small"
        />
      </View>

      {/* Comments */}
      <TouchableOpacity style={styles.inlineItem} onPress={onComment}>
        <Ionicons name="chatbubble-outline" size={20} color="#6B7280" />
        {commentsCount > 0 && (
          <Text style={styles.inlineCount}>{commentsCount}</Text>
        )}
      </TouchableOpacity>

      {/* Share */}
      <TouchableOpacity style={styles.inlineItem} onPress={onShare}>
        <Ionicons name="share-outline" size={20} color="#6B7280" />
        {sharesCount > 0 && (
          <Text style={styles.inlineCount}>{sharesCount}</Text>
        )}
      </TouchableOpacity>

      {/* Bookmark */}
      <TouchableOpacity style={styles.inlineItem} onPress={onBookmark}>
        <Ionicons
          name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
          size={20}
          color={isBookmarked ? '#3B82F6' : '#6B7280'}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  mainButton: {
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countText: {
    fontSize: 14,
    fontWeight: '500',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  reactionItem: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedReaction: {
    backgroundColor: '#E5E7EB',
    transform: [{ scale: 1.15 }],
  },
  reactionEmoji: {
    fontSize: 28,
  },
  // Summary styles
  summaryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  emojiStack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stackedEmoji: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  smallEmoji: {
    fontSize: 12,
  },
  summaryText: {
    fontSize: 13,
    color: '#6B7280',
  },
  // Inline bar styles
  inlineBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  inlineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  inlineCount: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
});

export default ReactionPicker;
