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
import { Card, Badge, Progress } from 'native-base';
import { analyticsService } from '../../services/analytics/AnalyticsService';

interface EntertainmentItem {
  id: string;
  title: string;
  type: 'movie' | 'tv' | 'game' | 'music' | 'book' | 'activity';
  genre: string;
  rating: number;
  duration: number; // in minutes
  releaseYear: number;
  description: string;
  imageUrl?: string;
  trailerUrl?: string;
  isCircleFriendly: boolean;
  ageRating: string;
  language: string;
  cast?: string[];
  director?: string;
  platform?: string; // for games
  difficulty?: string; // for games
  players?: number; // for games
  isWatched?: boolean;
  isPlaying?: boolean;
  progress?: number; // 0-100
  watchTime?: number; // in minutes
  userRating?: number;
  reviews: number;
  averageRating: number;
}

interface EntertainmentCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  count: number;
}

interface EntertainmentWidgetProps {
  onPress?: () => void;
  maxItems?: number;
  showCategories?: boolean;
}

const EntertainmentWidget: React.FC<EntertainmentWidgetProps> = ({
  onPress,
  maxItems = 6,
  showCategories = true,
}) => {
  const [entertainmentItems, setEntertainmentItems] = useState<EntertainmentItem[]>([]);
  const [categories, setCategories] = useState<EntertainmentCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadEntertainmentData();
  }, []);

  const loadEntertainmentData = async () => {
    try {
      setLoading(true);
      
      // Simulate loading entertainment data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockEntertainmentItems: EntertainmentItem[] = [
        {
          id: '1',
          title: 'The Lion King',
          type: 'movie',
          genre: 'Animation',
          rating: 8.5,
          duration: 118,
          releaseYear: 2019,
          description: 'A young lion prince flees his kingdom only to learn the true meaning of responsibility and bravery.',
          imageUrl: 'https://placehold.co/200x300',
          trailerUrl: 'https://example.com/trailer/1',
          isCircleFriendly: true,
          ageRating: 'G',
          language: 'English',
          cast: ['Donald Glover', 'Beyoncé', 'James Earl Jones'],
          director: 'Jon Favreau',
          isWatched: false,
          progress: 0,
          reviews: 1250,
          averageRating: 8.5,
        },
        {
          id: '2',
          title: 'Stranger Things',
          type: 'tv',
          genre: 'Sci-Fi',
          rating: 8.7,
          duration: 45,
          releaseYear: 2016,
          description: 'When a young boy disappears, his mother must confront terrifying forces to get him back.',
          imageUrl: 'https://placehold.co/200x300',
          trailerUrl: 'https://example.com/trailer/2',
          isCircleFriendly: false,
          ageRating: 'TV-14',
          language: 'English',
          cast: ['Millie Bobby Brown', 'Finn Wolfhard', 'Winona Ryder'],
          isWatched: true,
          progress: 75,
          watchTime: 1800,
          userRating: 9,
          reviews: 890,
          averageRating: 8.7,
        },
        {
          id: '3',
          title: 'Minecraft',
          type: 'game',
          genre: 'Sandbox',
          rating: 9.0,
          duration: 0,
          releaseYear: 2011,
          description: 'A 3D sandbox game where players can build, explore, and survive in a blocky world.',
          imageUrl: 'https://placehold.co/200x300',
          isCircleFriendly: true,
          ageRating: 'E',
          language: 'Multi',
          platform: 'PC, Mobile, Console',
          difficulty: 'Easy',
          players: 4,
          isPlaying: true,
          progress: 45,
          watchTime: 3600,
          userRating: 10,
          reviews: 2500,
          averageRating: 9.0,
        },
        {
          id: '4',
          title: 'Harry Potter and the Sorcerer\'s Stone',
          type: 'book',
          genre: 'Fantasy',
          rating: 9.2,
          duration: 0,
          releaseYear: 1997,
          description: 'The first book in the Harry Potter series follows the young wizard\'s first year at Hogwarts.',
          imageUrl: 'https://placehold.co/200x300',
          isCircleFriendly: true,
          ageRating: 'All Ages',
          language: 'English',
          isWatched: false,
          progress: 0,
          reviews: 3200,
          averageRating: 9.2,
        },
        {
          id: '5',
          title: 'Circle Game Night',
          type: 'activity',
          genre: 'Board Games',
          rating: 8.8,
          duration: 60,
          releaseYear: 2023,
          description: 'Weekly Circle game night featuring various board games and activities.',
          imageUrl: 'https://placehold.co/200x300',
          isCircleFriendly: true,
          ageRating: 'All Ages',
          language: 'Multi',
          players: 6,
          isWatched: false,
          progress: 0,
          reviews: 150,
          averageRating: 8.8,
        },
        {
          id: '6',
          title: 'The Beatles: Abbey Road',
          type: 'music',
          genre: 'Rock',
          rating: 9.1,
          duration: 47,
          releaseYear: 1969,
          description: 'The eleventh studio album by the Beatles, featuring classic hits like "Come Together".',
          imageUrl: 'https://placehold.co/200x300',
          isCircleFriendly: true,
          ageRating: 'All Ages',
          language: 'English',
          isWatched: false,
          progress: 0,
          reviews: 1800,
          averageRating: 9.1,
        },
      ];

      const mockCategories: EntertainmentCategory[] = [
        { id: 'movie', name: 'Movies', icon: 'movie', color: '#E91E63', count: 25 },
        { id: 'tv', name: 'TV Shows', icon: 'television', color: '#2196F3', count: 18 },
        { id: 'game', name: 'Games', icon: 'gamepad-variant', color: '#4CAF50', count: 32 },
        { id: 'music', name: 'Music', icon: 'music', color: '#FF9800', count: 45 },
        { id: 'book', name: 'Books', icon: 'book-open-variant', color: '#9C27B0', count: 28 },
        { id: 'activity', name: 'Activities', icon: 'target', color: '#607D8B', count: 15 },
      ];

      setEntertainmentItems(mockEntertainmentItems.slice(0, maxItems));
      setCategories(mockCategories);
    } catch (error) {
      console.error('Failed to load entertainment data:', error);
      Alert.alert('Error', 'Failed to load entertainment data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadEntertainmentData();
    setRefreshing(false);
  };

  const handleItemPress = (item: EntertainmentItem) => {
    analyticsService.trackEvent('entertainment_item_pressed', {
      itemId: item.id,
      type: item.type,
      genre: item.genre,
      isCircleFriendly: item.isCircleFriendly,
    });
    
    if (onPress) {
      onPress();
    }
  };

  const getTypeIcon = (type: string) => {
    const iconMap: { [key: string]: string } = {
      movie: 'movie',
      tv: 'television',
      game: 'gamepad-variant',
      music: 'music',
      book: 'book-open-variant',
      activity: 'target',
    };
    return iconMap[type] || 'star';
  };

  const getTypeColor = (type: string) => {
    const colorMap: { [key: string]: string } = {
      movie: '#E91E63',
      tv: '#2196F3',
      game: '#4CAF50',
      music: '#FF9800',
      book: '#9C27B0',
      activity: '#607D8B',
    };
    return colorMap[type] || '#9E9E9E';
  };

  const formatDuration = (duration: number) => {
    if (duration === 0) return 'Variable';
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatRating = (rating: number) => {
    return rating.toFixed(1);
  };

  const renderEntertainmentItem = ({ item }: { item: EntertainmentItem }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => handleItemPress(item)}
    >
      <View style={styles.itemContent}>
        <View style={styles.itemLeft}>
          {item.imageUrl && (
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.itemImage}
              resizeMode="cover"
            />
          )}
          <View style={styles.itemInfo}>
            <View style={styles.itemHeader}>
              <Text style={styles.itemTitle} numberOfLines={1}>
                {item.title}
              </Text>
              <Icon
                name={getTypeIcon(item.type)}
                size={16}
                color={getTypeColor(item.type)}
              />
            </View>
            <Text style={styles.itemGenre}>
              {item.genre} • {item.releaseYear}
            </Text>
            <View style={styles.itemRating}>
              <Icon name="star" size={14} color="#FFC107" />
              <Text style={styles.ratingText}>
                {formatRating(item.averageRating)} ({item.reviews})
              </Text>
            </View>
            {item.isCircleFriendly && (
              <Badge colorScheme="green" rounded="full" variant="solid">
                Circle Friendly
              </Badge>
            )}
          </View>
        </View>
        
        <View style={styles.itemRight}>
          {item.progress !== undefined && item.progress > 0 && (
            <View style={styles.progressContainer}>
              <Progress
                value={item.progress}
                colorScheme="blue"
                size="sm"
                style={styles.progress}
              />
              <Text style={styles.progressText}>{item.progress}%</Text>
            </View>
          )}
          
          {item.isWatched && (
            <Icon name="check-circle" size={20} color="#4CAF50" />
          )}
          
          {item.isPlaying && (
            <Icon name="play-circle" size={20} color="#2196F3" />
          )}
        </View>
      </View>
      
      {item.description && (
        <Text style={styles.itemDescription} numberOfLines={2}>
          {item.description}
        </Text>
      )}
      
      <View style={styles.itemMeta}>
        <Text style={styles.itemDuration}>
          {formatDuration(item.duration)}
        </Text>
        <Text style={styles.itemAgeRating}>
          {item.ageRating}
        </Text>
        {item.players && (
          <Text style={styles.itemPlayers}>
            {item.players} players
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const getWatchedCount = () => {
    return entertainmentItems.filter(item => item.isWatched).length;
  };

  const getPlayingCount = () => {
    return entertainmentItems.filter(item => item.isPlaying).length;
  };

  const getCircleFriendlyCount = () => {
    return entertainmentItems.filter(item => item.isCircleFriendly).length;
  };

  if (loading) {
    return (
      <Card style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Entertainment</Text>
          <Icon name="movie" size={24} color="#4A90E2" />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#4A90E2" />
          <Text style={styles.loadingText}>Loading entertainment...</Text>
        </View>
      </Card>
    );
  }

  return (
    <Card style={styles.container}>
      <TouchableOpacity style={styles.header} onPress={onPress}>
        <Text style={styles.title}>Entertainment</Text>
        <Icon name="movie" size={24} color="#4A90E2" />
      </TouchableOpacity>

      {entertainmentItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="movie-outline" size={48} color="#9E9E9E" />
          <Text style={styles.emptyText}>No entertainment available</Text>
          <Text style={styles.emptySubtext}>Discover new movies, shows, and games</Text>
        </View>
      ) : (
        <>
          {/* Entertainment Categories */}
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

          {/* Entertainment Items */}
          <FlatList
            data={entertainmentItems}
            renderItem={renderEntertainmentItem}
            keyExtractor={(item) => item.id}
            style={styles.itemsList}
            showsVerticalScrollIndicator={false}
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        </>
      )}

      {entertainmentItems.length > 0 && (
        <View style={styles.footer}>
          <View style={styles.statsContainer}>
            <Text style={styles.statsText}>
              {getWatchedCount()} watched • {getPlayingCount()} playing
            </Text>
            <Text style={styles.circleText}>
              {getCircleFriendlyCount()} Circle friendly
            </Text>
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
  itemsList: {
    maxHeight: 500,
  },
  itemContainer: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  itemContent: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  itemLeft: {
    flexDirection: 'row',
    flex: 1,
  },
  itemImage: {
    width: 60,
    height: 90,
    borderRadius: 8,
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    flex: 1,
    marginRight: 8,
  },
  itemGenre: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  itemRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 12,
    color: '#666666',
  },
  itemRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  progressContainer: {
    alignItems: 'center',
    gap: 4,
  },
  progress: {
    width: 60,
    height: 4,
  },
  progressText: {
    fontSize: 10,
    color: '#666666',
  },
  itemDescription: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 8,
  },
  itemMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  itemDuration: {
    fontSize: 12,
    color: '#999999',
  },
  itemAgeRating: {
    fontSize: 12,
    color: '#999999',
  },
  itemPlayers: {
    fontSize: 12,
    color: '#999999',
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
  circleText: {
    fontSize: 14,
    color: '#4CAF50',
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

export default EntertainmentWidget; 
