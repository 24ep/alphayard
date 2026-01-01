import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, ScrollView, RefreshControl } from 'react-native';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';
import { homeStyles } from '../../styles/homeStyles';
import { socialService } from '../../services/dataServices';
import { SocialPost } from '../../types/home';
import { useDataServiceWithRefresh } from '../../hooks/useDataService';

interface SocialTabProps {
  onCommentPress: (postId: string) => void;
  familyId?: string;
  refreshKey?: number;
}

export const SocialTab: React.FC<SocialTabProps> = ({ onCommentPress, familyId, refreshKey }) => {
  const fetchPosts = React.useCallback(() => socialService.getPosts({
    familyId,
    limit: 20
  }), [familyId]);

  const {
    data: posts = [],
    error,
    loading,
    refreshing,
    onRefresh,
    clearError
  } = useDataServiceWithRefresh(
    fetchPosts,
    {
      dependencies: [familyId, refreshKey]
    }
  );

  // Show error alert if there's an error
  React.useEffect(() => {
    if (error) {
      Alert.alert(
        'Error Loading Posts',
        error,
        [
          { text: 'Retry', onPress: onRefresh },
          { text: 'Cancel', onPress: clearError }
        ]
      );
    }
  }, [error, onRefresh, clearError]);

  // Ensure posts is an array
  const safePosts = Array.isArray(posts) ? posts : [];

  if (loading && !refreshing) {
    return (
      <View style={{ flex: 1, backgroundColor: 'transparent' }}>
        <View style={homeStyles.section}>
          <View style={homeStyles.sectionHeader}>
            <Text style={homeStyles.sectionTitle}>hourse Posts</Text>
          </View>
          <View style={{ padding: 20, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#FF5A5A" />
            <Text style={{ marginTop: 10, color: '#666' }}>Loading posts...</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      showsVerticalScrollIndicator={false}
    >
      <View style={homeStyles.section}>
        <View style={homeStyles.sectionHeader}>
          <Text style={homeStyles.sectionTitle}>hourse Posts</Text>
        </View>
        {safePosts.length === 0 ? (
          <View style={{ padding: 20, alignItems: 'center' }}>
            <IconMC name="chat-outline" size={48} color="#9CA3AF" />
            <Text style={{ marginTop: 10, color: '#666', textAlign: 'center' }}>
              No posts yet. Start a conversation in hourse chat!
            </Text>
          </View>
        ) : (
          safePosts.map((post, index) => (
            <View key={post.id} style={homeStyles.socialPostListItem}>
              {/* Post Header */}
              <View style={homeStyles.socialPostHeader}>
                <View style={homeStyles.socialPostAuthor}>
                  <View style={homeStyles.socialPostAvatar}>
                    <Text style={homeStyles.socialPostAvatarText}>
                      {post.author.name.charAt(0)}
                    </Text>
                  </View>
                  <View style={homeStyles.socialPostAuthorInfo}>
                    <View style={homeStyles.socialPostAuthorNameRow}>
                      <Text style={homeStyles.socialPostAuthorName}>{post.author.name}</Text>
                      {post.author.isVerified && (
                        <IconMC name="check-circle" size={16} color="#3B82F6" />
                      )}
                    </View>
                    <Text style={homeStyles.socialPostTimestamp}>{post.timestamp}</Text>
                  </View>
                </View>
                <TouchableOpacity style={homeStyles.socialPostMoreButton}>
                  <IconMC name="dots-vertical" size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>

              {/* Post Content */}
              <Text style={homeStyles.socialPostContent}>{post.content}</Text>

              {/* Post Media */}
              {post.media && (
                <View style={homeStyles.socialPostMedia}>
                  <View style={homeStyles.socialPostMediaPlaceholder}>
                    <IconMC
                      name={post.media.type === 'image' ? 'image' : 'play-circle'}
                      size={40}
                      color="#9CA3AF"
                    />
                    <Text style={homeStyles.socialPostMediaText}>
                      {post.media.type === 'image' ? 'Image' : 'Video'}
                    </Text>
                  </View>
                </View>
              )}

              {/* Post Actions */}
              <View style={homeStyles.socialPostActions}>
                <TouchableOpacity style={homeStyles.socialPostAction}>
                  <IconMC
                    name={post.isLiked ? "heart" : "heart-outline"}
                    size={20}
                    color={post.isLiked ? "#EF4444" : "#6B7280"}
                  />
                  <Text style={homeStyles.socialPostActionText}>{post.likes}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={homeStyles.socialPostAction}
                  onPress={() => onCommentPress(post.id)}
                >
                  <IconMC name="comment-outline" size={20} color="#6B7280" />
                  <Text style={homeStyles.socialPostActionText}>{post.comments}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={homeStyles.socialPostAction}>
                  <IconMC name="share-outline" size={20} color="#6B7280" />
                  <Text style={homeStyles.socialPostActionText}>{post.shares}</Text>
                </TouchableOpacity>
              </View>

              {/* Divider (except for last item) */}
              {index < safePosts.length - 1 && (
                <View style={homeStyles.socialPostDivider} />
              )}
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};
