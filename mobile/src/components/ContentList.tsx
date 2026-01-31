import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  Select,
  Button,
  Badge,
  useColorModeValue,
  Spinner,
  Center,
  FlatList,
  RefreshControl,
} from 'native-base';
import { Search, Filter, SortAsc } from 'lucide-react-native';
import { ContentCard } from './ContentCard';
import { Content, cmsService } from '../services/cmsService';

interface ContentListProps {
  circleId: string;
  onContentPress?: (content: Content) => void;
  onContentLike?: (contentId: string) => void;
  onContentShare?: (contentId: string) => void;
  onContentComment?: (contentId: string) => void;
  showFilters?: boolean;
  showSearch?: boolean;
  limit?: number;
  contentTypeId?: string;
  categoryId?: string;
  status?: string;
  featured?: boolean;
  pinned?: boolean;
}

export const ContentList: React.FC<ContentListProps> = ({
  circleId,
  onContentPress,
  onContentLike,
  onContentShare,
  onContentComment,
  showFilters = true,
  showSearch = true,
  limit = 20,
  contentTypeId,
  categoryId,
  status = 'published',
  featured,
  pinned,
}) => {
  const [content, setContent] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categoryId || '');
  const [selectedContentType, setSelectedContentType] = useState(contentTypeId || '');
  const [sortBy, setSortBy] = useState<'created_at' | 'updated_at' | 'priority' | 'title'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [categories, setCategories] = useState<any[]>([]);
  const [contentTypes, setContentTypes] = useState<any[]>([]);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const mutedTextColor = useColorModeValue('gray.500', 'gray.400');

  useEffect(() => {
    fetchContent();
    fetchCategories();
    fetchContentTypes();
  }, [circleId, selectedCategory, selectedContentType, sortBy, sortOrder]);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const params: any = {
        limit,
        offset: 0,
      };

      if (status) params.status = status;
      if (selectedCategory) params.categoryId = selectedCategory;
      if (selectedContentType) params.contentTypeId = selectedContentType;
      if (searchQuery) params.search = searchQuery;
      if (featured !== undefined) params.isFeatured = featured;
      if (pinned !== undefined) params.isPinned = pinned;

      const data = await cmsService.getContent(circleId, params);
      setContent(data);
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await cmsService.getCategories(circleId);
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchContentTypes = async () => {
    try {
      // This would need to be implemented in the backend
      // For now, we'll use a static list
      setContentTypes([
        { id: 'circle_news', name: 'Circle News' },
        { id: 'circle_events', name: 'Circle Events' },
        { id: 'circle_memories', name: 'Circle Memories' },
        { id: 'safety_alerts', name: 'Safety Alerts' },
        { id: 'circle_recipes', name: 'Circle Recipes' },
        { id: 'circle_tips', name: 'Circle Tips' },
      ]);
    } catch (error) {
      console.error('Error fetching content types:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchContent();
    setRefreshing(false);
  };

  const handleSearch = async () => {
    await fetchContent();
  };

  const handleContentLike = async (contentId: string) => {
    try {
      await cmsService.likeContent(contentId);
      // Update local state
      setContent(prevContent =>
        prevContent.map(item => {
          if (item.id === contentId) {
            const isLiked = item.content_interactions?.some(
              interaction => interaction.interaction_type === 'like'
            );
            const newInteractions = item.content_interactions || [];
            
            if (isLiked) {
              // Unlike
              return {
                ...item,
                content_interactions: newInteractions.filter(
                  interaction => !(interaction.interaction_type === 'like')
                )
              };
            } else {
              // Like
              return {
                ...item,
                content_interactions: [
                  ...newInteractions,
                  { interaction_type: 'like', user_id: 'current_user' }
                ]
              };
            }
          }
          return item;
        })
      );
      onContentLike?.(contentId);
    } catch (error) {
      console.error('Error liking content:', error);
    }
  };

  const handleContentShare = async (contentId: string) => {
    try {
      await cmsService.shareContent(contentId, 'mobile');
      onContentShare?.(contentId);
    } catch (error) {
      console.error('Error sharing content:', error);
    }
  };

  const handleContentComment = (contentId: string) => {
    onContentComment?.(contentId);
  };

  const renderContentItem = ({ item }: { item: Content }) => (
    <ContentCard
      content={item}
      onPress={onContentPress}
      onLike={handleContentLike}
      onShare={handleContentShare}
      onComment={handleContentComment}
    />
  );

  const renderEmptyState = () => (
    <Center py={8}>
      <Text fontSize="lg" color={mutedTextColor} textAlign="center">
        No content found
      </Text>
      <Text fontSize="sm" color={mutedTextColor} textAlign="center" mt={2}>
        Try adjusting your filters or search terms
      </Text>
    </Center>
  );

  if (loading) {
    return (
      <Center py={8}>
        <Spinner size="lg" />
        <Text mt={4} color={mutedTextColor}>
          Loading content...
        </Text>
      </Center>
    );
  }

  return (
    <VStack space={4} flex={1}>
      {/* Search and Filters */}
      {(showSearch || showFilters) && (
        <Box bg={bgColor} p={4} borderRadius="lg" borderWidth="1" borderColor={borderColor}>
          <VStack space={4}>
            {/* Search */}
            {showSearch && (
              <HStack space={2}>
                <Input
                  flex={1}
                  placeholder="Search content..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  InputLeftElement={<Search size={20} color="#9E9E9E" />}
                />
                <Button onPress={handleSearch} colorScheme="blue">
                  Search
                </Button>
              </HStack>
            )}

            {/* Filters */}
            {showFilters && (
              <HStack space={2} flexWrap="wrap">
                <Select
                  selectedValue={selectedContentType}
                  onValueChange={setSelectedContentType}
                  placeholder="Content Type"
                  minWidth="120"
                >
                  <Select.Item label="All Types" value="" />
                  {contentTypes.map((type) => (
                    <Select.Item key={type.id} label={type.name} value={type.id} />
                  ))}
                </Select>

                <Select
                  selectedValue={selectedCategory}
                  onValueChange={setSelectedCategory}
                  placeholder="Category"
                  minWidth="120"
                >
                  <Select.Item label="All Categories" value="" />
                  {categories.map((category) => (
                    <Select.Item key={category.id} label={category.name} value={category.id} />
                  ))}
                </Select>

                <Select
                  selectedValue={sortBy}
                  onValueChange={setSortBy}
                  placeholder="Sort By"
                  minWidth="120"
                >
                  <Select.Item label="Date Created" value="created_at" />
                  <Select.Item label="Date Updated" value="updated_at" />
                  <Select.Item label="Priority" value="priority" />
                  <Select.Item label="Title" value="title" />
                </Select>

                <Select
                  selectedValue={sortOrder}
                  onValueChange={setSortOrder}
                  placeholder="Order"
                  minWidth="100"
                >
                  <Select.Item label="Newest First" value="desc" />
                  <Select.Item label="Oldest First" value="asc" />
                </Select>
              </HStack>
            )}
          </VStack>
        </Box>
      )}

      {/* Content List */}
      <FlatList
        data={content}
        renderItem={renderContentItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </VStack>
  );
};

