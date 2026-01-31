import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Card, Badge } from 'native-base';
import { analyticsService } from '../../services/analytics/AnalyticsService';

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  author: string;
  publishedAt: number;
  category: string;
  tags: string[];
  imageUrl?: string;
  source: string;
  url: string;
  isLocal: boolean;
  isCircle: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  readCount: number;
  shareCount: number;
}

interface NewsCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  count: number;
}

interface NewsWidgetProps {
  onPress?: () => void;
  maxItems?: number;
  showCategories?: boolean;
}

const NewsWidget: React.FC<NewsWidgetProps> = ({
  onPress,
  maxItems = 5,
  showCategories = true,
}) => {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [categories, setCategories] = useState<NewsCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadNewsData();
  }, []);

  const loadNewsData = async () => {
    try {
      setLoading(true);
      
      // Simulate loading news data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockNewsItems: NewsItem[] = [
        {
          id: '1',
          title: 'New Community Center Opening This Weekend',
          summary: 'The long-awaited community center will open its doors this Saturday with Circle activities and workshops.',
          content: 'The new community center, located at 123 Main Street, will feature a library, fitness center, and meeting rooms for local organizations.',
          author: 'Sarah Johnson',
          publishedAt: Date.now() - 3600000,
          category: 'local',
          tags: ['community', 'events', 'Circle'],
          imageUrl: 'https://via.placeholder.com/300x200',
          source: 'Local News',
          url: 'https://example.com/news/1',
          isLocal: true,
          isCircle: false,
          priority: 'high',
          readCount: 45,
          shareCount: 12,
        },
        {
          id: '2',
          title: 'Weather Alert: Heavy Rain Expected Tonight',
          summary: 'Local weather service issues warning for heavy rainfall and potential flooding in low-lying areas.',
          content: 'Residents are advised to secure outdoor items and avoid driving through flooded areas.',
          author: 'Weather Service',
          publishedAt: Date.now() - 7200000,
          category: 'weather',
          tags: ['weather', 'alert', 'safety'],
          imageUrl: 'https://via.placeholder.com/300x200',
          source: 'Weather Alert',
          url: 'https://example.com/news/2',
          isLocal: true,
          isCircle: false,
          priority: 'urgent',
          readCount: 128,
          shareCount: 34,
        },
        {
          id: '3',
          title: 'Circle Picnic at Central Park This Sunday',
          summary: 'Join your neighbors for a Circle-friendly picnic with games, food, and activities for all ages.',
          content: 'The annual neighborhood picnic will feature live music, children\'s games, and a potluck dinner.',
          author: 'Community Events',
          publishedAt: Date.now() - 10800000,
          category: 'events',
          tags: ['Circle', 'picnic', 'community'],
          imageUrl: 'https://via.placeholder.com/300x200',
          source: 'Community Events',
          url: 'https://example.com/news/3',
          isLocal: true,
          isCircle: true,
          priority: 'medium',
          readCount: 67,
          shareCount: 23,
        },
        {
          id: '4',
          title: 'New Safety Guidelines for Neighborhood Watch',
          summary: 'Updated safety guidelines and emergency contact information for all neighborhood watch members.',
          content: 'The neighborhood watch program has updated its guidelines to include new safety protocols and emergency procedures.',
          author: 'Neighborhood Watch',
          publishedAt: Date.now() - 14400000,
          category: 'safety',
          tags: ['safety', 'neighborhood', 'emergency'],
          imageUrl: 'https://via.placeholder.com/300x200',
          source: 'Neighborhood Watch',
          url: 'https://example.com/news/4',
          isLocal: true,
          isCircle: false,
          priority: 'high',
          readCount: 89,
          shareCount: 18,
        },
        {
          id: '5',
          title: 'Local School District Announces New Programs',
          summary: 'The school district introduces new after-school programs and technology initiatives for students.',
          content: 'Parents and students can look forward to new educational opportunities and enhanced learning experiences.',
          author: 'School District',
          publishedAt: Date.now() - 18000000,
          category: 'education',
          tags: ['education', 'school', 'programs'],
          imageUrl: 'https://via.placeholder.com/300x200',
          source: 'School District',
          url: 'https://example.com/news/5',
          isLocal: true,
          isCircle: true,
          priority: 'medium',
          readCount: 156,
          shareCount: 45,
        },
      ];

      const mockCategories: NewsCategory[] = [
        { id: 'local', name: 'Local News', icon: 'home', color: '#4CAF50', count: 15 },
        { id: 'weather', name: 'Weather', icon: 'weather-partly-cloudy', color: '#2196F3', count: 8 },
        { id: 'events', name: 'Events', icon: 'party-popper', color: '#FF9800', count: 12 },
        { id: 'safety', name: 'Safety', icon: 'shield', color: '#F44336', count: 6 },
        { id: 'education', name: 'Education', icon: 'school', color: '#9C27B0', count: 9 },
        { id: 'Circle', name: 'Circle', icon: 'account-group', color: '#E91E63', count: 11 },
      ];

      setNewsItems(mockNewsItems.slice(0, maxItems));
      setCategories(mockCategories);
    } catch (error) {
      console.error('Failed to load news data:', error);
      Alert.alert('Error', 'Failed to load news data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadNewsData();
    setRefreshing(false);
  };

  const handleNewsPress = (newsItem: NewsItem) => {
    analyticsService.trackEvent('news_item_pressed', {
      newsId: newsItem.id,
      category: newsItem.category,
      priority: newsItem.priority,
      isLocal: newsItem.isLocal,
      isCircle: newsItem.isCircle,
    });
    
    if (onPress) {
      onPress();
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return '#F44336';
      case 'high':
        return '#FF9800';
      case 'medium':
        return '#2196F3';
      case 'low':
        return '#4CAF50';
      default:
        return '#9E9E9E';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'alert-circle';
      case 'high':
        return 'exclamation';
      case 'medium':
        return 'information';
      case 'low':
        return 'check-circle';
      default:
        return 'circle';
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const renderNewsItem = ({ item }: { item: NewsItem }) => (
    <TouchableOpacity
      style={styles.newsContainer}
      onPress={() => handleNewsPress(item)}
    >
      <View style={styles.newsContent}>
        <View style={styles.newsLeft}>
          {item.imageUrl && (
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.newsImage}
              resizeMode="cover"
            />
          )}
          <View style={styles.newsInfo}>
            <View style={styles.newsHeader}>
              <Text style={styles.newsTitle} numberOfLines={2}>
                {item.title}
              </Text>
              <Icon
                name={getPriorityIcon(item.priority)}
                size={16}
                color={getPriorityColor(item.priority)}
                style={styles.priorityIcon}
              />
            </View>
            <Text style={styles.newsSummary} numberOfLines={2}>
              {item.summary}
            </Text>
            <View style={styles.newsMeta}>
              <Text style={styles.newsSource}>{item.source}</Text>
              <Text style={styles.newsTime}>
                {formatTime(item.publishedAt)}
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.newsRight}>
          <View style={styles.newsStats}>
            <Icon name="eye" size={14} color="#666666" />
            <Text style={styles.statsText}>{item.readCount}</Text>
          </View>
          <View style={styles.newsStats}>
            <Icon name="share-variant" size={14} color="#666666" />
            <Text style={styles.statsText}>{item.shareCount}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.newsTags}>
        {item.tags.slice(0, 3).map((tag, index) => (
          <Badge
            key={index}
            colorScheme="blue"
            rounded="full"
            variant="subtle"
            style={styles.tag}
          >
            {tag}
          </Badge>
        ))}
        {item.isLocal && (
          <Badge colorScheme="green" rounded="full" variant="solid">
            Local
          </Badge>
        )}
        {item.isCircle && (
          <Badge colorScheme="purple" rounded="full" variant="solid">
            Circle
          </Badge>
        )}
      </View>
    </TouchableOpacity>
  );

  const getUrgentNewsCount = () => {
    return newsItems.filter(item => item.priority === 'urgent').length;
  };

  const getLocalNewsCount = () => {
    return newsItems.filter(item => item.isLocal).length;
  };

  const getCircleNewsCount = () => {
    return newsItems.filter(item => item.isCircle).length;
  };

  if (loading) {
    return (
      <Card style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Local News</Text>
          <Icon name="newspaper" size={24} color="#4A90E2" />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#4A90E2" />
          <Text style={styles.loadingText}>Loading news...</Text>
        </View>
      </Card>
    );
  }

  return (
    <Card style={styles.container}>
      <TouchableOpacity style={styles.header} onPress={onPress}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Local News</Text>
          {getUrgentNewsCount() > 0 && (
            <Badge colorScheme="red" rounded="full" variant="solid">
              {getUrgentNewsCount()}
            </Badge>
          )}
        </View>
        <Icon name="newspaper" size={24} color="#4A90E2" />
      </TouchableOpacity>

      {newsItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="newspaper-outline" size={48} color="#9E9E9E" />
          <Text style={styles.emptyText}>No news available</Text>
          <Text style={styles.emptySubtext}>Check back later for updates</Text>
        </View>
      ) : (
        <>
          {/* News Categories */}
          {showCategories && categories.length > 0 && (
            <View style={styles.categoriesContainer}>
              <FlatList
                data={categories}
                horizontal
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) => (
                  <View style={styles.categoryItem}>
                    <Icon name={item.icon} size={24} color={item.color} style={styles.categoryIcon} />
                    <Text style={styles.categoryName}>{item.name}</Text>
                    <Badge colorScheme="blue" rounded="full" variant="subtle">
                      {item.count}
                    </Badge>
                  </View>
                )}
                keyExtractor={(item) => item.id}
                style={styles.categoriesList}
              />
            </View>
          )}

          {/* News Items */}
          <FlatList
            data={newsItems}
            renderItem={renderNewsItem}
            keyExtractor={(item) => item.id}
            style={styles.newsList}
            showsVerticalScrollIndicator={false}
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        </>
      )}

      {newsItems.length > 0 && (
        <View style={styles.footer}>
          <View style={styles.statsContainer}>
            <Text style={styles.statsText}>
              {getLocalNewsCount()} local • {getCircleNewsCount()} Circle
            </Text>
            {getUrgentNewsCount() > 0 && (
              <Text style={styles.urgentText}>
                {getUrgentNewsCount()} urgent
              </Text>
            )}
          </View>
          <TouchableOpacity style={styles.viewAllButton} onPress={onPress}>
            <Text style={styles.viewAllText}>View All</Text>
            <Icon name="chevron-right" size={16} color="#4A90E2" />
          </TouchableOpacity>
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 16,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666666',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#666666',
  },
  emptySubtext: {
    marginTop: 4,
    fontSize: 14,
    color: '#999999',
  },
  categoriesContainer: {
    marginBottom: 16,
  },
  categoriesList: {
    maxHeight: 60,
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: 16,
    minWidth: 80,
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  categoryName: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 4,
  },
  newsList: {
    maxHeight: 400,
  },
  newsContainer: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  newsContent: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  newsLeft: {
    flexDirection: 'row',
    flex: 1,
  },
  newsImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  newsInfo: {
    flex: 1,
  },
  newsHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    flex: 1,
    marginRight: 8,
  },
  priorityIcon: {
    marginTop: 2,
  },
  newsSummary: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  newsMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  newsSource: {
    fontSize: 12,
    color: '#999999',
  },
  newsTime: {
    fontSize: 12,
    color: '#999999',
  },
  newsRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  newsStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statsText: {
    fontSize: 12,
    color: '#666666',
  },
  newsTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  tag: {
    marginRight: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  statsText: {
    fontSize: 14,
    color: '#666666',
  },
  urgentText: {
    fontSize: 14,
    color: '#F44336',
    fontWeight: '600',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    fontSize: 14,
    color: '#4A90E2',
    fontWeight: '600',
  },
});

export default NewsWidget; 
