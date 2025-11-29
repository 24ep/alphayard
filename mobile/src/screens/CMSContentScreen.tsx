import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Input,
  Textarea,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  useToast,
  ScrollView,
  Image,
  Badge,
  IconButton,
  Avatar,
  Divider,
  useColorModeValue,
} from 'native-base';
import { Heart, MessageCircle, Share, Send, ArrowLeft, Star, Pin, Newspaper, PartyPopper, Camera, AlertTriangle, ChefHat, Lightbulb, FileText } from 'lucide-react-native';
import { Content, cmsService } from '../services/cmsService';
import { ContentCard } from '../components/ContentCard';
import { ContentList } from '../components/ContentList';

interface CMSContentScreenProps {
  familyId: string;
  onBack?: () => void;
}

export const CMSContentScreen: React.FC<CMSContentScreenProps> = ({
  familyId,
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
    content_type_id: 'family_news',
  });

  const { isOpen, onOpen, onClose } = useDisclosure();
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
      setComments(data);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.show({
        title: 'Error',
        description: 'Failed to load comments',
        status: 'error',
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
        status: 'success',
      });
    } catch (error) {
      console.error('Error liking content:', error);
      toast.show({
        title: 'Error',
        description: 'Failed to like content',
        status: 'error',
      });
    }
  };

  const handleContentShare = async (contentId: string) => {
    try {
      await cmsService.shareContent(contentId, 'mobile');
      toast.show({
        title: 'Success',
        description: 'Content shared!',
        status: 'success',
      });
    } catch (error) {
      console.error('Error sharing content:', error);
      toast.show({
        title: 'Error',
        description: 'Failed to share content',
        status: 'error',
      });
    }
  };

  const handleContentComment = (contentId: string) => {
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
        status: 'success',
      });
    } catch (error) {
      console.error('Error creating comment:', error);
      toast.show({
        title: 'Error',
        description: 'Failed to add comment',
        status: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateContent = async () => {
    try {
      setLoading(true);
      await cmsService.createContent(familyId, createContent);
      setShowCreateModal(false);
      setCreateContent({
        title: '',
        content: '',
        excerpt: '',
        content_type_id: 'family_news',
      });
      toast.show({
        title: 'Success',
        description: 'Content created!',
        status: 'success',
      });
    } catch (error) {
      console.error('Error creating content:', error);
      toast.show({
        title: 'Error',
        description: 'Failed to create content',
        status: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const getContentTypeIcon = (type: string) => {
    const iconColor = textColor as string;
    switch (type) {
      case 'family_news': return <Newspaper size={18} color={iconColor} />;
      case 'family_events': return <PartyPopper size={18} color={iconColor} />;
      case 'family_memories': return <Camera size={18} color={iconColor} />;
      case 'safety_alerts': return <AlertTriangle size={18} color={iconColor} />;
      case 'family_recipes': return <ChefHat size={18} color={iconColor} />;
      case 'family_tips': return <Lightbulb size={18} color={iconColor} />;
      default: return <FileText size={18} color={iconColor} />;
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
            icon={<ArrowLeft size={24} color={textColor} />}
            onPress={onBack}
          />
          <Text fontSize="xl" fontWeight="bold" color={textColor}>
            Family Content
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
        familyId={familyId}
        onContentPress={handleContentPress}
        onContentLike={handleContentLike}
        onContentShare={handleContentShare}
        onContentComment={handleContentComment}
        showFilters={true}
        showSearch={true}
      />

      {/* Content Detail Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="full">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
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
          </ModalHeader>

          <ModalBody>
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
                      icon={<Send size={20} color="#3B82F6" />}
                      onPress={handleCreateComment}
                      disabled={!newComment.trim() || loading}
                    />
                  </HStack>
                </VStack>
              </VStack>
            </ScrollView>
          </ModalBody>

          <ModalFooter>
            <HStack space={3}>
              <IconButton
                icon={<Heart size={20} color="#FF1744" />}
                onPress={() => handleContentLike(selectedContent?.id || '')}
              />
              <IconButton
                icon={<Share size={20} color="#3B82F6" />}
                onPress={() => handleContentShare(selectedContent?.id || '')}
              />
              <Button variant="ghost" onPress={onClose}>
                Close
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Create Content Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create New Content</ModalHeader>
          <ModalBody>
            <VStack space={4}>
              <Input
                placeholder="Title"
                value={createContent.title}
                onChangeText={(text) => setCreateContent({ ...createContent, title: text })}
              />
              <Textarea
                placeholder="Excerpt"
                value={createContent.excerpt}
                onChangeText={(text) => setCreateContent({ ...createContent, excerpt: text })}
                numberOfLines={2}
              />
              <Textarea
                placeholder="Content"
                value={createContent.content}
                onChangeText={(text) => setCreateContent({ ...createContent, content: text })}
                numberOfLines={6}
              />
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onPress={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onPress={handleCreateContent}
              disabled={loading || !createContent.title.trim()}
            >
              {loading ? 'Creating...' : 'Create'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};
