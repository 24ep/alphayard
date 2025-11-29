import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { DynamicContentRenderer } from './DynamicContentRenderer';
import { ContentPage, contentService } from '../../services/ContentService';

interface NewsContentProps {
  onInteraction?: (componentId: string, interactionType: string) => void;
  onContentPress?: (content: ContentPage) => void;
  style?: any;
  showFullContent?: boolean;
}

export const NewsContent: React.FC<NewsContentProps> = ({
  onInteraction,
  onContentPress,
  style,
  showFullContent = false,
}) => {
  const [newsContent, setNewsContent] = useState<ContentPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadNewsContent = async () => {
    try {
      setLoading(true);
      const content = await contentService.getNewsContent();
      setNewsContent(content);
    } catch (error) {
      console.error('Error loading news content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadNewsContent();
    setRefreshing(false);
  };

  useEffect(() => {
    loadNewsContent();
  }, []);

  const handleInteraction = async (componentId: string, interactionType: string) => {
    // Track interaction for all news content
    for (const content of newsContent) {
      await contentService.trackContentInteraction(
        content.id,
        interactionType as any,
        componentId
      );
    }

    // Pass to parent
    onInteraction?.(componentId, interactionType);
  };

  const handleContentPress = (content: ContentPage) => {
    // Track view
    contentService.trackContentView(content.id);
    
    // Pass to parent
    onContentPress?.(content);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent, style]}>
        <ActivityIndicator size="large" color="#dc2626" />
        <Text style={styles.loadingText}>Loading news...</Text>
      </View>
    );
  }

  if (newsContent.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent, style]}>
        <Text style={styles.emptyText}>No news content available</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, style]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={['#dc2626']}
          tintColor="#dc2626"
        />
      }
      showsVerticalScrollIndicator={false}
    >
      {newsContent.map((content) => (
        <TouchableOpacity
          key={content.id}
          style={styles.contentCard}
          onPress={() => handleContentPress(content)}
          activeOpacity={0.7}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.contentTitle}>{content.title}</Text>
            <Text style={styles.contentDate}>
              {new Date(content.updatedAt).toLocaleDateString()}
            </Text>
          </View>
          
          {showFullContent ? (
            <DynamicContentRenderer
              content={content}
              onInteraction={handleInteraction}
            />
          ) : (
            <View style={styles.previewContainer}>
              <Text style={styles.previewText} numberOfLines={3}>
                {content.components
                  .find(comp => comp.type === 'text')
                  ?.props?.content || 'No preview available'}
              </Text>
              <Text style={styles.readMoreText}>Read more →</Text>
            </View>
          )}
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardHeader: {
    marginBottom: 12,
  },
  contentTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  contentDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  previewContainer: {
    marginTop: 8,
  },
  previewText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 8,
  },
  readMoreText: {
    fontSize: 14,
    color: '#dc2626',
    fontWeight: '500',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
  },
});
