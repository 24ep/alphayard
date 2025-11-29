import React from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import CoolIcon from '../../components/common/CoolIcon';

type NewsDetailParams = {
  NewsDetail: {
    id: string;
    title: string;
    summary?: string;
    content?: string;
    imageUrl?: string;
    source?: string;
    publishedAt?: string;
    readTime?: number;
  };
};

const NewsDetailScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<NewsDetailParams, 'NewsDetail'>>();
  const article = route.params || {} as any;

  return (
    <LinearGradient
      colors={['#FA7272', '#FFBBB4']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <CoolIcon name="arrow-left" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>Article</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
          {article.imageUrl ? (
            <Image source={{ uri: article.imageUrl }} style={styles.heroImage} />
          ) : null}

          <View style={styles.contentCard}>
            <Text style={styles.title}>{article.title}</Text>
            <View style={styles.metaRow}>
              {article.source ? <Text style={styles.metaText}>{article.source}</Text> : null}
              {article.publishedAt ? <Text style={styles.metaDot}>•</Text> : null}
              {article.publishedAt ? <Text style={styles.metaText}>{article.publishedAt}</Text> : null}
              {article.readTime ? <Text style={styles.metaDot}>•</Text> : null}
              {article.readTime ? <Text style={styles.metaText}>{article.readTime} min read</Text> : null}
            </View>
            {article.summary ? (
              <Text style={styles.summary}>{article.summary}</Text>
            ) : null}
            <Text style={styles.body}>
              {article.content || 'Full content goes here. This is a placeholder for the news article body text. It will include paragraphs, images, and rich content from the source.'}
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
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
  heroImage: {
    width: '100%',
    height: 220,
  },
  contentCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -20,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
    lineHeight: 28,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  metaText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  metaDot: {
    fontSize: 12,
    color: '#9CA3AF',
    marginHorizontal: 4,
  },
  summary: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 12,
  },
  body: {
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 24,
    paddingBottom: 24,
  },
});

export default NewsDetailScreen;


