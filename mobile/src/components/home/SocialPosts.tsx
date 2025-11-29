import React from 'react';
import { View, ScrollView, TouchableOpacity, Text, Image } from 'react-native';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';
import { homeStyles } from '../../styles/homeStyles';
import { SocialPost } from '../../types/home';

interface SocialPostsProps {
  posts: SocialPost[];
  onPostPress: (post: SocialPost) => void;
  onLikePress: (post: SocialPost) => void;
  onCommentPress: (post: SocialPost) => void;
  onSharePress: (post: SocialPost) => void;
  onReportPress: (post: SocialPost) => void;
}

const SocialPosts: React.FC<SocialPostsProps> = ({
  posts,
  onPostPress,
  onLikePress,
  onCommentPress,
  onSharePress,
  onReportPress,
}) => {
  const renderPost = (post: SocialPost) => (
    <View key={post.id} style={homeStyles.socialPostCard}>
      {/* Post Header */}
      <View style={homeStyles.postHeader}>
        <View style={homeStyles.postAuthor}>
          <Image source={{ uri: post.author.avatar }} style={homeStyles.postAuthorAvatar} />
          <View style={homeStyles.postAuthorInfo}>
            <View style={homeStyles.postAuthorNameRow}>
              <Text style={homeStyles.postAuthorName}>{post.author.name}</Text>
              {post.author.isVerified && (
                <IconMC name="check-circle" size={16} color="#4F46E5" />
              )}
            </View>
            <Text style={homeStyles.postTimestamp}>{post.timestamp}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={homeStyles.postMoreButton}
          onPress={() => onReportPress(post)}
        >
          <IconMC name="dots-vertical" size={20} color="#666666" />
        </TouchableOpacity>
      </View>

      {/* Post Content */}
      <TouchableOpacity onPress={() => onPostPress(post)}>
        <Text style={homeStyles.postContent}>{post.content}</Text>
        
        {/* Post Media */}
        {post.media && (
          <View style={homeStyles.postMedia}>
            {post.media.type === 'image' ? (
              <Image source={{ uri: post.media.url }} style={homeStyles.postImage} />
            ) : (
              <View style={homeStyles.postVideo}>
                <IconMC name="play-circle" size={48} color="#FFFFFF" />
              </View>
            )}
          </View>
        )}

        {/* Post Location */}
        {post.location && (
          <View style={homeStyles.postLocation}>
            <IconMC name="map-marker" size={16} color="#666666" />
            <Text style={homeStyles.postLocationText}>{post.location}</Text>
          </View>
        )}

        {/* Post Tags */}
        {post.tags && post.tags.length > 0 && (
          <View style={homeStyles.postTags}>
            {post.tags.map((tag, index) => (
              <Text key={index} style={homeStyles.postTag}>
                #{tag}
              </Text>
            ))}
          </View>
        )}
      </TouchableOpacity>

      {/* Post Actions */}
      <View style={homeStyles.postActions}>
        <TouchableOpacity
          style={homeStyles.postAction}
          onPress={() => onLikePress(post)}
        >
          <IconMC
            name={post.isLiked ? "heart" : "heart-outline"}
            size={20}
            color={post.isLiked ? "#FF5A5A" : "#666666"}
          />
          <Text style={[
            homeStyles.postActionText,
            { color: post.isLiked ? "#FF5A5A" : "#666666" }
          ]}>
            {post.likes}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={homeStyles.postAction}
          onPress={() => onCommentPress(post)}
        >
          <IconMC name="comment-outline" size={20} color="#666666" />
          <Text style={homeStyles.postActionText}>{post.comments}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={homeStyles.postAction}
          onPress={() => onSharePress(post)}
        >
          <IconMC name="share-outline" size={20} color="#666666" />
          <Text style={homeStyles.postActionText}>{post.shares}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScrollView
      style={homeStyles.socialPostsContainer}
      showsVerticalScrollIndicator={false}
    >
      {posts.map(renderPost)}
    </ScrollView>
  );
};

export default SocialPosts;
