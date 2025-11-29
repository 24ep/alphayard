import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { DynamicContentRenderer } from './DynamicContentRenderer';
import { ContentPage, contentService } from '../../services/ContentService';

interface MarketingContentProps {
  onInteraction?: (componentId: string, interactionType: string) => void;
  style?: any;
}

export const MarketingContent: React.FC<MarketingContentProps> = ({
  onInteraction,
  style,
}) => {
  const [marketingContent, setMarketingContent] = useState<ContentPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadMarketingContent = async () => {
    try {
      setLoading(true);
      const content = await contentService.getMarketingContent();
      setMarketingContent(content);
    } catch (error) {
      console.error('Error loading marketing content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadMarketingContent();
    setRefreshing(false);
  };

  useEffect(() => {
    loadMarketingContent();
  }, []);

  const handleInteraction = async (componentId: string, interactionType: string) => {
    // Track interaction for all marketing content
    for (const content of marketingContent) {
      await contentService.trackContentInteraction(
        content.id,
        interactionType as any,
        componentId
      );
    }

    // Pass to parent
    onInteraction?.(componentId, interactionType);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent, style]}>
        <ActivityIndicator size="large" color="#dc2626" />
        <Text style={styles.loadingText}>Loading content...</Text>
      </View>
    );
  }

  if (marketingContent.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent, style]}>
        <Text style={styles.emptyText}>No marketing content available</Text>
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
      {marketingContent.map((content) => (
        <View key={content.id} style={styles.contentWrapper}>
          <DynamicContentRenderer
            content={content}
            onInteraction={handleInteraction}
          />
        </View>
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
  contentWrapper: {
    marginBottom: 24,
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
