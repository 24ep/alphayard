import React from 'react';
import { TouchableOpacity, View, Text, Image } from 'react-native';
import IconIon from 'react-native-vector-icons/Ionicons';
import { SocialPost as SocialPostType } from '../../../types/home';
import { homeStyles } from '../../../styles/homeStyles';

interface SocialPostProps {
  post: SocialPostType;
  showReportDropdown: string | null;
  onProfilePress: (user: any) => void;
  onReportDropdownToggle: (postId: string) => void;
  onReportPress: (postId: string) => void;
  onCommentPress: (post: SocialPostType) => void;
  onSharePost: (post: SocialPostType) => void;
}

const SocialPost: React.FC<SocialPostProps> = ({
  post,
  showReportDropdown,
  onProfilePress,
  onReportDropdownToggle,
  onReportPress,
  onCommentPress,
  onSharePost,
}) => {
  return (
    <View key={post.id}>
      <View style={homeStyles.socialPost}>
        {/* User Info */}
        <TouchableOpacity 
          style={homeStyles.postHeader}
          onPress={() => onProfilePress(post.author)}
        >
          <Image source={{ uri: post.author.avatar }} style={homeStyles.postAvatar} />
          <View style={homeStyles.postUserInfo}>
            <Text style={homeStyles.postUserName}>{post.author.name}</Text>
            <Text style={homeStyles.postTimeAgo}>{post.timestamp}</Text>
          </View>
        </TouchableOpacity>

        {/* 3-Dot Menu Button */}
        <TouchableOpacity 
          style={homeStyles.postMenuButton}
          onPress={() => onReportDropdownToggle(post.id)}
        >
          <IconIon name="ellipsis-vertical" size={20} color="#666666" />
        </TouchableOpacity>

        {/* Report Dropdown */}
        {showReportDropdown === post.id && (
          <View style={homeStyles.reportDropdown}>
            <TouchableOpacity 
              style={homeStyles.reportOption}
              onPress={() => onReportPress(post.id)}
            >
              <IconIon name="flag-outline" size={16} color="#FF5A5A" />
              <Text style={homeStyles.reportOptionText}>Report</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Post Content */}
        <Text style={homeStyles.postContent}>{post.content}</Text>

        {/* Media */}
        {post.media && (
          <View style={homeStyles.postMedia}>
            <Image source={{ uri: post.media.url }} style={homeStyles.postImage} />
          </View>
        )}

        {/* Action Buttons */}
        <View style={homeStyles.postActions}>
          <TouchableOpacity style={homeStyles.actionButton}>
            <IconIon 
              name={post.isLiked ? "heart" : "heart-outline"} 
              size={20} 
              color={post.isLiked ? "#FF5A5A" : "#666666"} 
            />
            <Text style={homeStyles.actionText}>{post.likes}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={homeStyles.actionButton}
            onPress={() => onCommentPress(post)}
          >
            <IconIon name="chatbubble-outline" size={20} color="#666666" />
            <Text style={homeStyles.actionText}>{post.comments}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={homeStyles.actionButton}
            onPress={() => onSharePost(post)}
          >
            <IconIon name="share-outline" size={20} color="#666666" />
            <Text style={homeStyles.actionText}>{post.shares}</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={homeStyles.socialPostSeparator} />
    </View>
  );
};

export default SocialPost;
