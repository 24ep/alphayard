import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Image,
  Badge,
  IconButton,
  Avatar,
  AvatarGroup,
  useColorModeValue,
  Pressable,
} from 'native-base';
import { Heart, MessageCircle, Share, Eye, Star, Pin, Newspaper, PartyPopper, Camera, AlertTriangle, ChefHat, Lightbulb, FileText } from 'lucide-react-native';
import { Content } from '../services/cmsService';

interface ContentCardProps {
  content: Content;
  onPress?: (content: Content) => void;
  onLike?: (contentId: string) => void;
  onShare?: (contentId: string) => void;
  onComment?: (contentId: string) => void;
  showInteractions?: boolean;
  compact?: boolean;
}

export const ContentCard: React.FC<ContentCardProps> = ({
  content,
  onPress,
  onLike,
  onShare,
  onComment,
  showInteractions = true,
  compact = false,
}) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const mutedTextColor = useColorModeValue('gray.500', 'gray.400');

  const getContentTypeIcon = (type: string) => {
    const iconColor = textColor as string;
    switch (type) {
      case 'family_news': return <Newspaper size={16} color={iconColor} />;
      case 'family_events': return <PartyPopper size={16} color={iconColor} />;
      case 'family_memories': return <Camera size={16} color={iconColor} />;
      case 'safety_alerts': return <AlertTriangle size={16} color={iconColor} />;
      case 'family_recipes': return <ChefHat size={16} color={iconColor} />;
      case 'family_tips': return <Lightbulb size={16} color={iconColor} />;
      default: return <FileText size={16} color={iconColor} />;
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'published': return 'green';
      case 'draft': return 'yellow';
      case 'archived': return 'gray';
      default: return 'gray';
    }
  };

  const getPriorityColor = (priority: number): string => {
    if (priority >= 8) return 'red';
    if (priority >= 5) return 'orange';
    if (priority >= 2) return 'blue';
    return 'green';
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const isLiked = content.content_interactions?.some(
    interaction => interaction.interaction_type === 'like'
  );

  const likeCount = content.content_interactions?.filter(
    interaction => interaction.interaction_type === 'like'
  ).length || 0;

  const commentCount = content.content_comments?.length || 0;

  const viewCount = content.content_interactions?.filter(
    interaction => interaction.interaction_type === 'view'
  ).length || 0;

  return (
    <Pressable onPress={() => onPress?.(content)}>
      <Box
        bg={bgColor}
        borderRadius="lg"
        borderWidth="1"
        borderColor={borderColor}
        p={4}
        mb={3}
        shadow="sm"
      >
        {/* Header */}
        <HStack justifyContent="space-between" alignItems="center" mb={3}>
          <HStack alignItems="center" space={2}>
            {getContentTypeIcon(content.content_types?.name || '')}
            <VStack>
              <Text fontSize="sm" fontWeight="semibold" color={textColor}>
                {content.content_types?.name || 'Content'}
              </Text>
              <Text fontSize="xs" color={mutedTextColor}>
                {formatDate(content.created_at)}
              </Text>
            </VStack>
          </HStack>

          <HStack space={2}>
            {content.is_pinned && (
              <Pin size={16} color="#FFD700" />
            )}
            {content.is_featured && (
              <Star size={16} color="#FFD700" />
            )}
            <Badge
              colorScheme={getStatusColor(content.status)}
              variant="subtle"
              size="sm"
            >
              {content.status}
            </Badge>
          </HStack>
        </HStack>

        {/* Category */}
        {content.categories && (
          <HStack mb={3}>
            <Badge
              bg={content.categories.color}
              color="white"
              variant="solid"
              size="sm"
            >
              {content.categories.name}
            </Badge>
          </HStack>
        )}

        {/* Title */}
        <Text fontSize="lg" fontWeight="bold" color={textColor} mb={2}>
          {content.title}
        </Text>

        {/* Featured Image */}
        {content.featured_image_url && !compact && (
          <Image
            source={{ uri: content.featured_image_url }}
            alt={content.title}
            width="100%"
            height={200}
            borderRadius="md"
            mb={3}
            resizeMode="cover"
          />
        )}

        {/* Content/Excerpt */}
        {!compact && (
          <Text
            fontSize="sm"
            color={mutedTextColor}
            numberOfLines={3}
            mb={3}
          >
            {content.excerpt || content.content}
          </Text>
        )}

        {/* Tags */}
        {content.content_tags && content.content_tags.length > 0 && !compact && (
          <HStack space={2} mb={3} flexWrap="wrap">
            {content.content_tags.slice(0, 3).map((tag, index) => (
              <Badge
                key={index}
                variant="outline"
                colorScheme="blue"
                size="sm"
              >
                #{tag.tag}
              </Badge>
            ))}
            {content.content_tags.length > 3 && (
              <Badge variant="outline" colorScheme="gray" size="sm">
                +{content.content_tags.length - 3}
              </Badge>
            )}
          </HStack>
        )}

        {/* Interactions */}
        {showInteractions && (
          <HStack justifyContent="space-between" alignItems="center">
            <HStack space={4}>
              <HStack alignItems="center" space={1}>
                <IconButton
                  icon={<Heart size={16} color={isLiked ? '#FF1744' : '#9E9E9E'} />}
                  size="sm"
                  onPress={() => onLike?.(content.id)}
                />
                <Text fontSize="sm" color={mutedTextColor}>
                  {likeCount}
                </Text>
              </HStack>

              <HStack alignItems="center" space={1}>
                <IconButton
                  icon={<MessageCircle size={16} color="#9E9E9E" />}
                  size="sm"
                  onPress={() => onComment?.(content.id)}
                />
                <Text fontSize="sm" color={mutedTextColor}>
                  {commentCount}
                </Text>
              </HStack>

              <HStack alignItems="center" space={1}>
                <IconButton
                  icon={<Share size={16} color="#9E9E9E" />}
                  size="sm"
                  onPress={() => onShare?.(content.id)}
                />
                <Text fontSize="sm" color={mutedTextColor}>
                  Share
                </Text>
              </HStack>
            </HStack>

            <HStack alignItems="center" space={1}>
              <Eye size={16} color="#9E9E9E" />
              <Text fontSize="sm" color={mutedTextColor}>
                {viewCount}
              </Text>
            </HStack>
          </HStack>
        )}

        {/* Priority Indicator */}
        {content.priority > 0 && (
          <HStack mt={2}>
            <Badge
              colorScheme={getPriorityColor(content.priority)}
              variant="subtle"
              size="sm"
            >
              Priority {content.priority}
            </Badge>
          </HStack>
        )}
      </Box>
    </Pressable>
  );
};
