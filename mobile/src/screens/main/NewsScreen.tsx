import React, { useEffect, useRef, useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  RefreshControl, 
  TextInput, 
  Image, 
  Dimensions,
  StyleSheet,
  FlatList
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Animated } from 'react-native';
import CoolIcon from '../../components/common/CoolIcon';
import NewsDetailDrawer from '../../components/news/NewsDetailDrawer';
import MainScreenLayout from '../../components/layout/MainScreenLayout';
import { FamilyDropdown } from '../../components/home/FamilyDropdown';
import { useNavigationAnimation } from '../../contexts/NavigationAnimationContext';

const { width } = Dimensions.get('window');

type CategoryKey = 'technology' | 'sports' | 'bonary' | 'community' | 'local' | 'workplace' | 'hometown' | 'school';

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  imageUrl?: string;
  source: string;
  publishedAt: string;
  category: CategoryKey;
  readTime: number;
  isBreaking?: boolean;
  isTrending?: boolean;
}

const CATEGORIES: { key: CategoryKey; label: string; icon: string; color: string }[] = [
  { key: 'technology', label: 'Tech', icon: 'cpu', color: '#3B82F6' },
  { key: 'sports', label: 'Sports', icon: 'trophy', color: '#10B981' },
  { key: 'bonary', label: 'Bonary', icon: 'heart', color: '#F59E0B' },
  { key: 'community', label: 'Community', icon: 'users', color: '#8B5CF6' },
  { key: 'local', label: 'Local', icon: 'map-pin', color: '#EF4444' },
  { key: 'workplace', label: 'Work', icon: 'briefcase', color: '#06B6D4' },
  { key: 'hometown', label: 'Hometown', icon: 'home', color: '#84CC16' },
  { key: 'school', label: 'School', icon: 'graduation-cap', color: '#F97316' },
];

// Mock data for demonstration
const MOCK_NEWS: NewsItem[] = [
  {
    id: '1',
    title: 'New AI Technology Revolutionizes Healthcare',
    summary: 'Breakthrough in medical AI promises faster diagnosis and personalized treatment plans.',
    imageUrl: 'https://via.placeholder.com/300x200/3B82F6/FFFFFF?text=AI+Tech',
    source: 'Tech Daily',
    publishedAt: '2 hours ago',
    category: 'technology',
    readTime: 5,
    isTrending: true,
  },
  {
    id: '2',
    title: 'Local Community Garden Opens This Weekend',
    summary: 'Join neighbors for the grand opening of our new sustainable community garden.',
    imageUrl: 'https://via.placeholder.com/300x200/10B981/FFFFFF?text=Garden',
    source: 'Community News',
    publishedAt: '4 hours ago',
    category: 'community',
    readTime: 3,
  },
  {
    id: '3',
    title: 'School District Announces New STEM Programs',
    summary: 'Enhanced science and technology curriculum coming to local schools next semester.',
    imageUrl: 'https://via.placeholder.com/300x200/F97316/FFFFFF?text=STEM',
    source: 'Education Weekly',
    publishedAt: '6 hours ago',
    category: 'school',
    readTime: 4,
  },
  {
    id: '4',
    title: 'Workplace Wellness Initiative Launches',
    summary: 'New employee wellness programs focus on mental health and work-life balance.',
    imageUrl: 'https://via.placeholder.com/300x200/06B6D4/FFFFFF?text=Wellness',
    source: 'Business Today',
    publishedAt: '8 hours ago',
    category: 'workplace',
    readTime: 6,
  },
  {
    id: '5',
    title: 'Hometown Festival Returns This Summer',
    summary: 'Annual celebration brings together families for food, music, and community fun.',
    imageUrl: 'https://via.placeholder.com/300x200/84CC16/FFFFFF?text=Festival',
    source: 'Local Events',
    publishedAt: '1 day ago',
    category: 'hometown',
    readTime: 2,
  },
];

const NewsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [activeCategory, setActiveCategory] = useState<CategoryKey>('technology');
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newsItems, setNewsItems] = useState<NewsItem[]>(MOCK_NEWS);
  const [selectedArticle, setSelectedArticle] = useState<NewsItem | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const { cardMarginTopAnim } = useNavigationAnimation();
  const cardOpacityAnim = useRef(new Animated.Value(1)).current;

  // Family (hourse) selection to match Home/Calendar/Notes header
  const [showFamilyDropdown, setShowFamilyDropdown] = useState(false);
  const [selectedFamily, setSelectedFamily] = useState('Smith Family');
  const availableFamilies = [
    { id: '1', name: 'Smith Family', members: 4 },
    { id: '2', name: 'Johnson Family', members: 3 },
    { id: '3', name: 'Williams Family', members: 5 },
    { id: '4', name: 'Brown Family', members: 2 },
  ];
  const handleFamilySelect = (familyName: string) => {
    setSelectedFamily(familyName);
    setShowFamilyDropdown(false);
  };

  useEffect(() => {
    // Filter news by category
    const filtered = MOCK_NEWS.filter(item => 
      item.category === activeCategory && 
      item.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setNewsItems(filtered);
  }, [activeCategory, searchQuery]);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => setRefreshing(false), 1000);
  };

  const renderNewsItem = ({ item }: { item: NewsItem }) => (
    <TouchableOpacity 
      style={styles.newsCard}
      onPress={() => { setSelectedArticle(item); setShowDetail(true); }}
    >
      <View style={styles.newsImageContainer}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.newsImage} />
        ) : (
          <View style={[styles.newsImagePlaceholder, { backgroundColor: CATEGORIES.find(c => c.key === item.category)?.color }]}>
            <CoolIcon name={CATEGORIES.find(c => c.key === item.category)?.icon || 'newspaper'} size={24} color="#FFFFFF" />
          </View>
        )}
        {item.isBreaking && (
          <View style={styles.breakingBadge}>
            <Text style={styles.breakingText}>BREAKING</Text>
          </View>
        )}
        {item.isTrending && (
          <View style={styles.trendingBadge}>
            <CoolIcon name="trending-up" size={12} color="#FFFFFF" />
          </View>
        )}
      </View>
      <View style={styles.newsContent}>
        <Text style={styles.newsTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.newsSummary} numberOfLines={2}>{item.summary}</Text>
        <View style={styles.newsMeta}>
          <Text style={styles.newsSource}>{item.source}</Text>
          <Text style={styles.newsTime}>{item.publishedAt}</Text>
          <Text style={styles.readTime}>{item.readTime} min read</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <MainScreenLayout
      selectedFamily={selectedFamily}
      onToggleFamilyDropdown={() => setShowFamilyDropdown(!showFamilyDropdown)}
      showFamilyDropdown={showFamilyDropdown}
      cardMarginTopAnim={cardMarginTopAnim}
      cardOpacityAnim={cardOpacityAnim}
    >
      <FamilyDropdown
        visible={showFamilyDropdown}
        onClose={() => setShowFamilyDropdown(false)}
        selectedFamily={selectedFamily}
        onFamilySelect={handleFamilySelect}
        availableFamilies={availableFamilies}
      />

      <View style={{ flex: 1, paddingTop: 20 }}>
        <FlatList
          data={newsItems}
          renderItem={renderNewsItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View>
              <View style={[styles.searchContainer, { paddingTop: 0, marginBottom: 8 }]}>
                <View style={styles.searchBar}>
                  <CoolIcon name="search" size={20} color="#9CA3AF" />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search news..."
                    placeholderTextColor="#9CA3AF"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                  {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                      <CoolIcon name="x" size={20} color="#9CA3AF" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              <View style={[styles.categoriesContainer, { marginBottom: 12 }]}> 
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false} 
                  contentContainerStyle={styles.categoriesScroll}
                >
                  {CATEGORIES.map((category) => (
                    <TouchableOpacity
                      key={category.key}
                      onPress={() => setActiveCategory(category.key)}
                      style={[
                        styles.categoryTab,
                        { 
                          backgroundColor: activeCategory === category.key ? category.color : 'rgba(0,0,0,0.04)',
                          borderColor: category.color,
                        }
                      ]}
                    >
                      <CoolIcon 
                        name={category.icon} 
                        size={16} 
                        color={activeCategory === category.key ? '#FFFFFF' : category.color} 
                      />
                      <Text style={[
                        styles.categoryText,
                        { color: activeCategory === category.key ? '#FFFFFF' : category.color }
                      ]}>
                        {category.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#D32F2F']}
              tintColor="#D32F2F"
            />
          }
          contentContainerStyle={styles.newsList}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <CoolIcon name="newspaper" size={48} color="#9CA3AF" />
              <Text style={styles.emptyTitle}>No news found</Text>
              <Text style={styles.emptySubtitle}>Try a different category or search term</Text>
            </View>
          }
        />
        <NewsDetailDrawer 
          visible={showDetail}
          onClose={() => setShowDetail(false)}
          article={selectedArticle || undefined}
        />
      </View>
    </MainScreenLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  categoriesContainer: {
    marginBottom: 20,
  },
  categoriesScroll: {
    paddingHorizontal: 20,
    gap: 12,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    gap: 8,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 20,
  },
  newsList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  newsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  newsImageContainer: {
    position: 'relative',
    height: 180,
  },
  newsImage: {
    width: '100%',
    height: '100%',
  },
  newsImagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  breakingBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  breakingText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  trendingBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#10B981',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newsContent: {
    padding: 16,
  },
  newsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    lineHeight: 24,
  },
  newsSummary: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
    lineHeight: 20,
  },
  newsMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  newsSource: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  newsTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  readTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default NewsScreen;


