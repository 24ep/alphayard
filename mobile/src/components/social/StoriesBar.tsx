import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  Dimensions,
  Animated,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { socialApi } from '../../services/api/social';
import { useAuth } from '../../contexts/AuthContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Story {
  id: string;
  authorId: string;
  content?: string;
  mediaUrl?: string;
  mediaType: 'image' | 'video' | 'text';
  backgroundColor?: string;
  textColor?: string;
  duration: number;
  viewsCount: number;
  expiresAt: string;
  createdAt: string;
  hasViewed?: boolean;
  myReaction?: string;
  author?: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
    isVerified: boolean;
  };
}

interface StoryGroup {
  userId: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  isVerified: boolean;
  stories: Story[];
  hasUnviewed: boolean;
}

interface StoriesBarProps {
  circleId?: string;
  onCreateStory?: () => void;
}

export const StoriesBar: React.FC<StoriesBarProps> = ({ circleId, onCreateStory }) => {
  const { user } = useAuth();
  const [storyGroups, setStoryGroups] = useState<StoryGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [activeGroupIndex, setActiveGroupIndex] = useState(0);
  const [activeStoryIndex, setActiveStoryIndex] = useState(0);

  useEffect(() => {
    loadStories();
  }, [circleId]);

  const loadStories = async () => {
    try {
      setLoading(true);
      const response = await socialApi.getStories({ circleId });
      if (response.success && response.stories) {
        // Group stories by author
        const grouped = groupStoriesByAuthor(response.stories);
        setStoryGroups(grouped);
      }
    } catch (error) {
      console.error('Error loading stories:', error);
    } finally {
      setLoading(false);
    }
  };

  const groupStoriesByAuthor = (stories: Story[]): StoryGroup[] => {
    const groups: { [key: string]: StoryGroup } = {};
    
    stories.forEach(story => {
      const authorId = story.authorId;
      if (!groups[authorId]) {
        groups[authorId] = {
          userId: authorId,
          username: story.author?.username || 'Unknown',
          displayName: story.author?.displayName || 'Unknown',
          avatarUrl: story.author?.avatarUrl,
          isVerified: story.author?.isVerified || false,
          stories: [],
          hasUnviewed: false,
        };
      }
      groups[authorId].stories.push(story);
      if (!story.hasViewed) {
        groups[authorId].hasUnviewed = true;
      }
    });

    // Sort: my stories first, then unviewed, then viewed
    return Object.values(groups).sort((a, b) => {
      if (a.userId === user?.id) return -1;
      if (b.userId === user?.id) return 1;
      if (a.hasUnviewed && !b.hasUnviewed) return -1;
      if (!a.hasUnviewed && b.hasUnviewed) return 1;
      return 0;
    });
  };

  const openStoryViewer = (groupIndex: number) => {
    setActiveGroupIndex(groupIndex);
    setActiveStoryIndex(0);
    setViewerOpen(true);
  };

  const handleCreateStory = () => {
    if (onCreateStory) {
      onCreateStory();
    }
  };

  return (
    <>
      <View style={styles.container}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Create Story Button */}
          <TouchableOpacity style={styles.storyItem} onPress={handleCreateStory}>
            <View style={styles.createStoryCircle}>
              <View style={styles.avatarContainer}>
                {user?.avatar_url ? (
                  <Image source={{ uri: user.avatar_url }} style={styles.avatar} />
                ) : (
                  <View style={[styles.avatar, styles.placeholderAvatar]}>
                    <Ionicons name="person" size={24} color="#9CA3AF" />
                  </View>
                )}
              </View>
              <View style={styles.addButton}>
                <Ionicons name="add" size={16} color="#FFFFFF" />
              </View>
            </View>
            <Text style={styles.storyLabel} numberOfLines={1}>Your Story</Text>
          </TouchableOpacity>

          {/* Story Groups */}
          {storyGroups.map((group, index) => (
            <TouchableOpacity
              key={group.userId}
              style={styles.storyItem}
              onPress={() => openStoryViewer(index)}
            >
              <View style={[
                styles.storyCircle,
                group.hasUnviewed ? styles.unviewedRing : styles.viewedRing
              ]}>
                {group.avatarUrl ? (
                  <Image source={{ uri: group.avatarUrl }} style={styles.avatar} />
                ) : (
                  <View style={[styles.avatar, styles.placeholderAvatar]}>
                    <Text style={styles.avatarInitial}>
                      {group.displayName.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
              </View>
              <Text style={styles.storyLabel} numberOfLines={1}>
                {group.userId === user?.id ? 'You' : group.displayName}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Story Viewer Modal */}
      <StoryViewer
        visible={viewerOpen}
        storyGroups={storyGroups}
        activeGroupIndex={activeGroupIndex}
        onClose={() => setViewerOpen(false)}
        onGroupChange={setActiveGroupIndex}
      />
    </>
  );
};

// Story Viewer Component
interface StoryViewerProps {
  visible: boolean;
  storyGroups: StoryGroup[];
  activeGroupIndex: number;
  onClose: () => void;
  onGroupChange: (index: number) => void;
}

const StoryViewer: React.FC<StoryViewerProps> = ({
  visible,
  storyGroups,
  activeGroupIndex,
  onClose,
  onGroupChange,
}) => {
  const [activeStoryIndex, setActiveStoryIndex] = useState(0);
  const progress = useRef(new Animated.Value(0)).current;
  const progressAnimation = useRef<Animated.CompositeAnimation | null>(null);

  const activeGroup = storyGroups[activeGroupIndex];
  const activeStory = activeGroup?.stories[activeStoryIndex];

  useEffect(() => {
    if (visible && activeStory) {
      startProgress();
      markAsViewed();
    }
    return () => {
      if (progressAnimation.current) {
        progressAnimation.current.stop();
      }
    };
  }, [visible, activeGroupIndex, activeStoryIndex]);

  const startProgress = () => {
    progress.setValue(0);
    const duration = (activeStory?.duration || 5) * 1000;
    
    progressAnimation.current = Animated.timing(progress, {
      toValue: 1,
      duration,
      useNativeDriver: false,
    });

    progressAnimation.current.start(({ finished }) => {
      if (finished) {
        goToNextStory();
      }
    });
  };

  const markAsViewed = async () => {
    if (activeStory && !activeStory.hasViewed) {
      try {
        await socialApi.viewStory(activeStory.id);
      } catch (error) {
        console.error('Error marking story as viewed:', error);
      }
    }
  };

  const goToNextStory = () => {
    if (!activeGroup) return;
    
    if (activeStoryIndex < activeGroup.stories.length - 1) {
      setActiveStoryIndex(activeStoryIndex + 1);
    } else if (activeGroupIndex < storyGroups.length - 1) {
      onGroupChange(activeGroupIndex + 1);
      setActiveStoryIndex(0);
    } else {
      onClose();
    }
  };

  const goToPrevStory = () => {
    if (activeStoryIndex > 0) {
      setActiveStoryIndex(activeStoryIndex - 1);
    } else if (activeGroupIndex > 0) {
      onGroupChange(activeGroupIndex - 1);
      const prevGroup = storyGroups[activeGroupIndex - 1];
      setActiveStoryIndex(prevGroup.stories.length - 1);
    }
  };

  const handleTap = (side: 'left' | 'right') => {
    if (side === 'left') {
      goToPrevStory();
    } else {
      goToNextStory();
    }
  };

  if (!visible || !activeGroup || !activeStory) return null;

  return (
    <Modal visible={visible} animationType="fade" statusBarTranslucent>
      <View style={styles.viewerContainer}>
        {/* Background */}
        {activeStory.mediaType === 'text' ? (
          <View style={[
            styles.storyBackground,
            { backgroundColor: activeStory.backgroundColor || '#1E40AF' }
          ]}>
            <Text style={[
              styles.storyText,
              { color: activeStory.textColor || '#FFFFFF' }
            ]}>
              {activeStory.content}
            </Text>
          </View>
        ) : (
          <Image
            source={{ uri: activeStory.mediaUrl }}
            style={styles.storyImage}
            resizeMode="cover"
          />
        )}

        {/* Progress Bars */}
        <View style={styles.progressContainer}>
          {activeGroup.stories.map((_, index) => (
            <View key={index} style={styles.progressBarBg}>
              <Animated.View
                style={[
                  styles.progressBarFill,
                  {
                    width: index < activeStoryIndex
                      ? '100%'
                      : index === activeStoryIndex
                        ? progress.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0%', '100%'],
                          })
                        : '0%',
                  },
                ]}
              />
            </View>
          ))}
        </View>

        {/* Header */}
        <View style={styles.viewerHeader}>
          <View style={styles.authorInfo}>
            {activeGroup.avatarUrl ? (
              <Image source={{ uri: activeGroup.avatarUrl }} style={styles.viewerAvatar} />
            ) : (
              <View style={[styles.viewerAvatar, styles.placeholderAvatar]}>
                <Text style={styles.avatarInitial}>
                  {activeGroup.displayName.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <View>
              <Text style={styles.authorName}>{activeGroup.displayName}</Text>
              <Text style={styles.storyTime}>
                {getTimeAgo(activeStory.createdAt)}
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Tap Areas */}
        <View style={styles.tapAreas}>
          <TouchableOpacity
            style={styles.tapAreaLeft}
            onPress={() => handleTap('left')}
            activeOpacity={1}
          />
          <TouchableOpacity
            style={styles.tapAreaRight}
            onPress={() => handleTap('right')}
            activeOpacity={1}
          />
        </View>

        {/* Reactions */}
        <View style={styles.reactionBar}>
          <StoryReactions storyId={activeStory.id} currentReaction={activeStory.myReaction} />
        </View>
      </View>
    </Modal>
  );
};

// Story Reactions Component
const StoryReactions: React.FC<{ storyId: string; currentReaction?: string }> = ({
  storyId,
  currentReaction,
}) => {
  const [selectedReaction, setSelectedReaction] = useState(currentReaction);
  const reactions = ['❤️', '😂', '😮', '😢', '🔥', '👏'];

  const handleReaction = async (reaction: string) => {
    try {
      const reactionMap: { [key: string]: string } = {
        '❤️': 'love',
        '😂': 'laugh',
        '😮': 'wow',
        '😢': 'sad',
        '🔥': 'fire',
        '👏': 'clap',
      };
      await socialApi.reactToStory(storyId, reactionMap[reaction]);
      setSelectedReaction(reaction);
    } catch (error) {
      console.error('Error reacting to story:', error);
    }
  };

  return (
    <View style={styles.reactionsRow}>
      {reactions.map((reaction) => (
        <TouchableOpacity
          key={reaction}
          style={[
            styles.reactionButton,
            selectedReaction === reaction && styles.selectedReaction,
          ]}
          onPress={() => handleReaction(reaction)}
        >
          <Text style={styles.reactionEmoji}>{reaction}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

// Helper function
const getTimeAgo = (dateString: string): string => {
  const now = new Date();
  const date = new Date(dateString);
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  
  if (hours < 1) return 'Just now';
  if (hours === 1) return '1h ago';
  return `${hours}h ago`;
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingVertical: 12,
  },
  scrollContent: {
    paddingHorizontal: 12,
    gap: 12,
  },
  storyItem: {
    alignItems: 'center',
    width: 72,
  },
  createStoryCircle: {
    width: 64,
    height: 64,
    position: 'relative',
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
  },
  addButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  storyCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    padding: 2,
  },
  unviewedRing: {
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  viewedRing: {
    borderWidth: 2,
    borderColor: '#D1D5DB',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
  },
  placeholderAvatar: {
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: 20,
    fontWeight: '600',
    color: '#6B7280',
  },
  storyLabel: {
    fontSize: 12,
    color: '#374151',
    marginTop: 4,
    textAlign: 'center',
    maxWidth: 72,
  },
  // Viewer Styles
  viewerContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  storyBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  storyText: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
  },
  storyImage: {
    flex: 1,
    width: '100%',
  },
  progressContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 8,
    right: 8,
    flexDirection: 'row',
    gap: 4,
    zIndex: 10,
  },
  progressBarBg: {
    flex: 1,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 1,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
  },
  viewerHeader: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 30,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    zIndex: 10,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  viewerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  storyTime: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  closeButton: {
    padding: 8,
  },
  tapAreas: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
  },
  tapAreaLeft: {
    flex: 1,
  },
  tapAreaRight: {
    flex: 2,
  },
  reactionBar: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 40 : 20,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
  },
  reactionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  reactionButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedReaction: {
    backgroundColor: 'rgba(255,255,255,0.4)',
    transform: [{ scale: 1.1 }],
  },
  reactionEmoji: {
    fontSize: 24,
  },
});

export default StoriesBar;
