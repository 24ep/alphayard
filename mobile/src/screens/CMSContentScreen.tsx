import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Input,
  TextArea,
  Modal,
  useDisclose,
  useToast,
  ScrollView,
  Image,
  Badge,
  IconButton,
  Avatar,
  Divider,
  useColorModeValue,
} from 'native-base';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Content, cmsService } from '../services/cmsService';
import { ContentList } from '../components/ContentList';

// Comment interface removed as it was unused

interface CMSContentScreenProps {
  circleId: string;
  onBack?: () => void;
}

export const CMSContentScreen: React.FC<CMSContentScreenProps> = ({
  circleId,
  onBack,
}) => {
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createContent, setCreateContent] = useState({
    title: '',
    content: '',
    excerpt: '',
    content_type_id: 'circle_news',
  });

  const { isOpen, onOpen, onClose } = useDisclose();
  const toast = useToast();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const mutedTextColor = useColorModeValue('gray.500', 'gray.400');

  useEffect(() => {
    if (selectedContent) {
      fetchComments();
    }
  }, [selectedContent]);

  const fetchComments = async () => {
    if (!selectedContent) return;

    try {
      setLoading(true);
      const data = await cmsService.getComments(selectedContent.id);
      setComments(data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.show({
        title: 'Error',
        description: 'Failed to load comments',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleContentPress = (content: Content) => {
    setSelectedContent(content);
    onOpen();
  };

  const handleContentLike = async (contentId: string) => {
    try {
      await cmsService.likeContent(contentId);
      toast.show({
        title: 'Success',
        description: 'Content liked!',
      });
    } catch (error) {
      console.error('Error liking content:', error);
      toast.show({
        title: 'Error',
        description: 'Failed to like content',
      });
    }
  };

  const handleContentShare = async (contentId: string) => {
    try {
      await cmsService.shareContent(contentId, 'mobile');
      toast.show({
        title: 'Success',
        description: 'Content shared!',
      });
    } catch (error) {
      console.error('Error sharing content:', error);
      toast.show({
        title: 'Error',
        description: 'Failed to share content',
      });
    }
  };

  const handleContentComment = (_contentId: string) => {
    // This will be handled by the modal
  };

  const handleCreateComment = async () => {
    if (!selectedContent || !newComment.trim()) return;

    try {
      setLoading(true);
      await cmsService.createComment(selectedContent.id, newComment);
      setNewComment('');
      await fetchComments();
      toast.show({
        title: 'Success',
        description: 'Comment added!',
      });
    } catch (error) {
      console.error('Error creating comment:', error);
      toast.show({
        title: 'Error',
        description: 'Failed to add comment',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateContent = async () => {
    try {
      setLoading(true);
      await cmsService.createContent(circleId, createContent);
      setShowCreateModal(false);
      setCreateContent({
        title: '',
        content: '',
        excerpt: '',
        content_type_id: 'circle_news',
      });
      toast.show({
        title: 'Success',
        description: 'Content created!',
      });
    } catch (error) {
      console.error('Error creating content:', error);
      toast.show({
        title: 'Error',
        description: 'Failed to create content',
      });
    } finally {
      setLoading(false);
    }
  };

  const getContentTypeIcon = (type: string) => {
    const iconSize = 18;
    const iconColor = textColor as string;
    switch (type) {
      case 'circle_news': return <MaterialCommunityIcons name="newspaper-variant-outline" size={iconSize} color={iconColor} />;
      case 'circle_events': return <MaterialCommunityIcons name="party-popper" size={iconSize} color={iconColor} />;
      case 'circle_memories': return <MaterialCommunityIcons name="camera-outline" size={iconSize} color={iconColor} />;
      case 'safety_alerts': return <MaterialCommunityIcons name="alert-outline" size={iconSize} color={iconColor} />;
      case 'circle_recipes': return <MaterialCommunityIcons name="chef-hat" size={iconSize} color={iconColor} />;
      case 'circle_tips': return <MaterialCommunityIcons name="lightbulb-outline" size={iconSize} color={iconColor} />;
      default: return <MaterialCommunityIcons name="file-document-outline" size={iconSize} color={iconColor} />;
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Box flex={1} bg={bgColor}>
      {/* Header */}
      <HStack
        alignItems="center"
        justifyContent="space-between"
        p={4}
        borderBottomWidth="1"
        borderBottomColor={borderColor}
        bg={bgColor}
      >
        <HStack alignItems="center" space={3}>
          <IconButton
            icon={<Ionicons name="arrow-back" size={24} color={textColor} />}
            onPress={onBack}
          />
          <Text fontSize="xl" fontWeight="bold" color={textColor}>
            Circle Content
          </Text>
        </HStack>

        <Button
          size="sm"
          colorScheme="blue"
          onPress={() => setShowCreateModal(true)}
        >
          Create
        </Button>
      </HStack>

      {/* Content List */}
      <ContentList
        circleId={circleId}
        onContentPress={handleContentPress}
        onContentLike={handleContentLike}
        onContentShare={handleContentShare}
        onContentComment={handleContentComment}
        showFilters={true}
        showSearch={true}
      />

      {/* Content Detail Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="full">
        <Modal.Content>
          <Modal.Header>
            <HStack alignItems="center" space={3}>
              {getContentTypeIcon(selectedContent?.content_types?.name || '')}
              <VStack>
                <Text fontSize="lg" fontWeight="bold">
                  {selectedContent?.title}
                </Text>
                <Text fontSize="sm" color={mutedTextColor}>
                  {formatDate(selectedContent?.created_at || '')}
                </Text>
              </VStack>
            </HStack>
          </Modal.Header>

          <Modal.Body>
            <ScrollView>
              <VStack space={4}>
                {/* Featured Image */}
                {selectedContent?.featured_image_url && (
                  <Image
                    source={{ uri: selectedContent.featured_image_url }}
                    alt={selectedContent.title}
                    width="100%"
                    height={200}
                    borderRadius="md"
                    resizeMode="cover"
                  />
                )}

                {/* Content */}
                <Text fontSize="md" color={textColor}>
                  {selectedContent?.content}
                </Text>

                {/* Tags */}
                {selectedContent?.content_tags && selectedContent.content_tags.length > 0 && (
                  <HStack space={2} flexWrap="wrap">
                    {selectedContent.content_tags.map((tag, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        colorScheme="blue"
                        size="sm"
                      >
                        #{tag.tag}
                      </Badge>
                    ))}
                  </HStack>
                )}

                <Divider />

                {/* Comments */}
                <VStack space={3}>
                  <Text fontSize="lg" fontWeight="semibold">
                    Comments ({comments.length})
                  </Text>

                  {comments.map((comment, index) => (
                    <HStack key={index} space={3} alignItems="flex-start">
                      <Avatar
                        size="sm"
                        source={{ uri: comment.users?.avatar_url }}
                      />
                      <VStack flex={1} space={1}>
                        <HStack alignItems="center" space={2}>
                          <Text fontSize="sm" fontWeight="semibold">
                            {comment.users?.first_name} {comment.users?.last_name}
                          </Text>
                          <Text fontSize="xs" color={mutedTextColor}>
                            {formatDate(comment.created_at)}
                          </Text>
                        </HStack>
                        <Text fontSize="sm" color={textColor}>
                          {comment.comment}
                        </Text>
                      </VStack>
                    </HStack>
                  ))}

                  {/* Add Comment */}
                  <HStack space={2} mt={4}>
                    <Input
                      flex={1}
                      placeholder="Add a comment..."
                      value={newComment}
                      onChangeText={setNewComment}
                    />
                    <IconButton
                      icon={<Ionicons name="send" size={20} color="#3B82F6" />}
                      onPress={handleCreateComment}
                      isDisabled={!newComment.trim() || loading}
                    />
                  </HStack>
                </VStack>
              </VStack>
            </ScrollView>
          </Modal.Body>

          <Modal.Footer>
            <HStack space={3}>
              <IconButton
                icon={<Ionicons name="heart" size={20} color="#FF1744" />}
                onPress={() => handleContentLike(selectedContent?.id || '')}
              />
              <IconButton
                icon={<Ionicons name="share-social" size={20} color="#3B82F6" />}
                onPress={() => handleContentShare(selectedContent?.id || '')}
              />
              <Button variant="ghost" onPress={onClose}>
                Close
              </Button>
            </HStack>
          </Modal.Footer>
        </Modal.Content>
      </Modal>

      {/* Create Content Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} size="lg">
        <Modal.Content>
          <Modal.Header>Create New Content</Modal.Header>
          <Modal.Body>
            <VStack space={4}>
              <Input
                placeholder="Title"
                value={createContent.title}
                onChangeText={(text: string) => setCreateContent({ ...createContent, title: text })}
              />
              <TextArea
                {...({
                  placeholder: 'Excerpt',
                  value: createContent.excerpt,
                  onChangeText: (text: string) =>
                    setCreateContent({ ...createContent, excerpt: text }),
                  totalLines: 2,
                  autoCompleteType: 'off',
                } as any)}
              />
              <TextArea
                {...({
                  placeholder: 'Content',
                  value: createContent.content,
                  onChangeText: (text: string) =>
                    setCreateContent({ ...createContent, content: text }),
                  totalLines: 6,
                  autoCompleteType: 'off',
                } as any)}
              />
            </VStack>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="ghost" mr={3} onPress={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onPress={handleCreateContent}
              isDisabled={loading || !createContent.title.trim()}
            >
              {loading ? 'Creating...' : 'Create'}
            </Button>
          </Modal.Footer>
        </Modal.Content>
      </Modal>
    </Box>
  );
};

