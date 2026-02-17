import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { socialApi } from '../../services/api/social';
import { useAuth } from '../../contexts/AuthContext';

interface FollowButtonProps {
  userId: string;
  initialFollowing?: boolean;
  initialFollowedBy?: boolean;
  size?: 'small' | 'medium' | 'large';
  style?: object;
  onFollowChange?: (isFollowing: boolean) => void;
}

export const FollowButton: React.FC<FollowButtonProps> = ({
  userId,
  initialFollowing = false,
  initialFollowedBy = false,
  size = 'medium',
  style,
  onFollowChange,
}) => {
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const [isFollowedBy, setIsFollowedBy] = useState(initialFollowedBy);
  const [loading, setLoading] = useState(false);

  // Don't show for own profile
  if (user?.id === userId) return null;

  useEffect(() => {
    loadFollowStatus();
  }, [userId]);

  const loadFollowStatus = async () => {
    try {
      const response = await socialApi.getFollowStatus(userId);
      if (response.success) {
        setIsFollowing(response.isFollowing);
        setIsFollowedBy(response.isFollowedBy);
      }
    } catch (error) {
      console.error('Error loading follow status:', error);
    }
  };

  const handleToggleFollow = async () => {
    try {
      setLoading(true);
      
      if (isFollowing) {
        const response = await socialApi.unfollowUser(userId);
        if (response.success) {
          setIsFollowing(false);
          onFollowChange?.(false);
        }
      } else {
        const response = await socialApi.followUser(userId);
        if (response.success) {
          setIsFollowing(true);
          onFollowChange?.(true);
        }
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    } finally {
      setLoading(false);
    }
  };

  const getButtonStyle = () => {
    if (isFollowing) {
      return styles.followingButton;
    }
    if (isFollowedBy) {
      return styles.followBackButton;
    }
    return styles.followButton;
  };

  const getButtonText = () => {
    if (isFollowing) return 'Following';
    if (isFollowedBy) return 'Follow Back';
    return 'Follow';
  };

  const getTextStyle = () => {
    if (isFollowing) {
      return styles.followingText;
    }
    return styles.followText;
  };

  const buttonHeight = size === 'small' ? 28 : size === 'large' ? 44 : 36;
  const fontSize = size === 'small' ? 12 : size === 'large' ? 16 : 14;
  const paddingH = size === 'small' ? 12 : size === 'large' ? 24 : 16;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        getButtonStyle(),
        { height: buttonHeight, paddingHorizontal: paddingH },
        style,
      ]}
      onPress={handleToggleFollow}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator size="small" color={isFollowing ? '#3B82F6' : '#FFFFFF'} />
      ) : (
        <Text style={[getTextStyle(), { fontSize }]}>{getButtonText()}</Text>
      )}
    </TouchableOpacity>
  );
};

// User Card with Follow Button
interface UserCardProps {
  user: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
    isVerified?: boolean;
    followersCount?: number;
    isFollowing?: boolean;
    isFollowedBy?: boolean;
  };
  onPress?: () => void;
  showFollowButton?: boolean;
}

export const UserCard: React.FC<UserCardProps> = ({
  user,
  onPress,
  showFollowButton = true,
}) => {
  return (
    <TouchableOpacity style={styles.userCard} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.userInfo}>
        <View style={styles.avatar}>
          {user.avatarUrl ? (
            <View style={styles.avatarImage}>
              {/* Image would go here */}
            </View>
          ) : (
            <View style={[styles.avatarImage, styles.avatarPlaceholder]}>
              <Text style={styles.avatarInitial}>
                {user.displayName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.userDetails}>
          <View style={styles.nameRow}>
            <Text style={styles.displayName} numberOfLines={1}>
              {user.displayName}
            </Text>
            {user.isVerified && (
              <Ionicons name="checkmark-circle" size={16} color="#3B82F6" />
            )}
          </View>
          <Text style={styles.username}>@{user.username}</Text>
          {user.followersCount !== undefined && (
            <Text style={styles.followersCount}>
              {user.followersCount} followers
            </Text>
          )}
        </View>
      </View>
      
      {showFollowButton && (
        <FollowButton
          userId={user.id}
          initialFollowing={user.isFollowing}
          initialFollowedBy={user.isFollowedBy}
          size="small"
        />
      )}
    </TouchableOpacity>
  );
};

// Friend Request Card
interface FriendRequestCardProps {
  request: {
    id: string;
    message?: string;
    createdAt: string;
    sender: {
      id: string;
      username: string;
      displayName: string;
      avatarUrl?: string;
      isVerified?: boolean;
    };
  };
  onAccept: (requestId: string) => void;
  onReject: (requestId: string) => void;
}

export const FriendRequestCard: React.FC<FriendRequestCardProps> = ({
  request,
  onAccept,
  onReject,
}) => {
  const [loading, setLoading] = useState<'accept' | 'reject' | null>(null);

  const handleAccept = async () => {
    setLoading('accept');
    try {
      await onAccept(request.id);
    } finally {
      setLoading(null);
    }
  };

  const handleReject = async () => {
    setLoading('reject');
    try {
      await onReject(request.id);
    } finally {
      setLoading(null);
    }
  };

  return (
    <View style={styles.requestCard}>
      <View style={styles.requestInfo}>
        <View style={styles.avatar}>
          <View style={[styles.avatarImage, styles.avatarPlaceholder]}>
            <Text style={styles.avatarInitial}>
              {request.sender.displayName.charAt(0).toUpperCase()}
            </Text>
          </View>
        </View>
        <View style={styles.requestDetails}>
          <View style={styles.nameRow}>
            <Text style={styles.displayName}>{request.sender.displayName}</Text>
            {request.sender.isVerified && (
              <Ionicons name="checkmark-circle" size={16} color="#3B82F6" />
            )}
          </View>
          <Text style={styles.username}>@{request.sender.username}</Text>
          {request.message && (
            <Text style={styles.requestMessage} numberOfLines={2}>
              "{request.message}"
            </Text>
          )}
        </View>
      </View>
      
      <View style={styles.requestActions}>
        <TouchableOpacity
          style={styles.acceptButton}
          onPress={handleAccept}
          disabled={loading !== null}
        >
          {loading === 'accept' ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.acceptText}>Accept</Text>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.rejectButton}
          onPress={handleReject}
          disabled={loading !== null}
        >
          {loading === 'reject' ? (
            <ActivityIndicator size="small" color="#6B7280" />
          ) : (
            <Text style={styles.rejectText}>Decline</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Suggested Users Section
interface SuggestedUsersSectionProps {
  onUserPress?: (userId: string) => void;
}

export const SuggestedUsersSection: React.FC<SuggestedUsersSectionProps> = ({
  onUserPress,
}) => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSuggestions();
  }, []);

  const loadSuggestions = async () => {
    try {
      setLoading(true);
      const response = await socialApi.getSuggestedUsers(10);
      if (response.success) {
        setUsers(response.users || []);
      }
    } catch (error) {
      console.error('Error loading suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#3B82F6" />
      </View>
    );
  }

  if (users.length === 0) return null;

  return (
    <View style={styles.suggestedSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Suggested for you</Text>
        <TouchableOpacity>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.usersList}>
        {users.slice(0, 5).map(user => (
          <UserCard
            key={user.id}
            user={user}
            onPress={() => onUserPress?.(user.id)}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
  },
  followButton: {
    backgroundColor: '#3B82F6',
  },
  followBackButton: {
    backgroundColor: '#3B82F6',
  },
  followingButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  followText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  followingText: {
    color: '#374151',
    fontWeight: '600',
  },
  // User Card styles
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 8,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  avatar: {
    marginRight: 12,
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
  },
  userDetails: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  displayName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  username: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  followersCount: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  // Friend Request styles
  requestCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  requestInfo: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  requestDetails: {
    flex: 1,
  },
  requestMessage: {
    fontSize: 13,
    color: '#6B7280',
    fontStyle: 'italic',
    marginTop: 4,
  },
  requestActions: {
    flexDirection: 'row',
    gap: 8,
  },
  acceptButton: {
    flex: 1,
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  acceptText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  rejectButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  rejectText: {
    color: '#6B7280',
    fontWeight: '600',
    fontSize: 14,
  },
  // Suggested section styles
  loadingContainer: {
    padding: 24,
    alignItems: 'center',
  },
  suggestedSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  seeAllText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  usersList: {
    gap: 8,
  },
});

export default FollowButton;
