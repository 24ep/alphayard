import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, Image, ScrollView, TextInput, Share } from 'react-native';
import CoolIcon from '../common/CoolIcon';
import { homeStyles } from '../../styles/homeStyles';
import { newsService, NewsComment, NewsReaction } from '../../services/news/NewsService';
import { useAuth } from '../../contexts/AuthContext';

export interface NewsDetailData {
  id: string;
  title: string;
  summary?: string;
  content?: string;
  imageUrl?: string;
  source?: string;
  publishedAt?: string;
  readTime?: number;
}

interface NewsDetailDrawerProps {
  visible: boolean;
  onClose: () => void;
  article?: NewsDetailData | null;
}

export const NewsDetailDrawer: React.FC<NewsDetailDrawerProps> = ({ visible, onClose, article }) => {
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [comments, setComments] = useState<NewsComment[]>([]);
  const [commentText, setCommentText] = useState('');
  const { user } = useAuth();
  const articleId = article?.id || '';

  useEffect(() => {
    const load = async () => {
      if (!visible || !articleId) return;
      try {
        const list = await newsService.getComments(articleId);
        setComments(list);
      } catch (e) {
        // ignore
      }
    };
    load();
  }, [visible, articleId]);

  if (!article) return null;

  const toggleLike = async () => {
    const next = !liked;
    setLiked(next);
    if (disliked) setDisliked(false);
    try {
      await newsService.setReaction(articleId, user?.id || 'me', next ? 'like' : 'none');
    } catch (e) {}
  };

  const toggleDislike = async () => {
    const next = !disliked;
    setDisliked(next);
    if (liked) setLiked(false);
    try {
      await newsService.setReaction(articleId, user?.id || 'me', next ? 'dislike' : 'none');
    } catch (e) {}
  };

  const handleShare = async () => {
    try {
      await Share.share({
        title: article.title,
        message: `${article.title}${article.summary ? ` - ${article.summary}` : ''}`,
      });
    } catch (e) {
      // ignore
    }
  };

  const handleAddComment = async () => {
    const value = commentText.trim();
    if (!value) return;
    try {
      const created = await newsService.addComment(articleId, user?.id || 'me', value);
      setComments((prev) => [created, ...prev]);
      setCommentText('');
    } catch (e) {
      // ignore
    }
  };

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={homeStyles.commentDrawerOverlay}>
        <View style={homeStyles.commentDrawer}>
          <View style={homeStyles.commentDrawerHeader}>
            <Text style={homeStyles.commentDrawerTitle} numberOfLines={1}>News</Text>
            <TouchableOpacity style={homeStyles.commentDrawerCloseButton} onPress={onClose}>
              <CoolIcon name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ paddingHorizontal: 20 }} showsVerticalScrollIndicator={false}>
            {article.imageUrl ? (
              <View style={{ marginBottom: 16 }}>
                <Image source={{ uri: article.imageUrl }} style={{ width: '100%', height: 220, borderRadius: 12 }} resizeMode="cover" />
              </View>
            ) : null}

            <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#111827', marginBottom: 8 }}>{article.title}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              {article.source ? <Text style={{ fontSize: 12, color: '#6B7280' }}>{article.source}</Text> : null}
              {article.publishedAt ? <Text style={{ fontSize: 12, color: '#9CA3AF', marginHorizontal: 6 }}>•</Text> : null}
              {article.publishedAt ? <Text style={{ fontSize: 12, color: '#6B7280' }}>{article.publishedAt}</Text> : null}
              {article.readTime ? <Text style={{ fontSize: 12, color: '#9CA3AF', marginHorizontal: 6 }}>•</Text> : null}
              {article.readTime ? <Text style={{ fontSize: 12, color: '#6B7280' }}>{article.readTime} min read</Text> : null}
            </View>

            {/* Actions */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <TouchableOpacity onPress={toggleLike} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <CoolIcon name={liked ? 'thumb-up' : 'thumb-up-outline'} size={18} color={liked ? '#10B981' : '#6B7280'} />
                <Text style={{ color: liked ? '#10B981' : '#6B7280', fontWeight: '600' }}>Like</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={toggleDislike} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <CoolIcon name={disliked ? 'thumb-down' : 'thumb-down-outline'} size={18} color={disliked ? '#EF4444' : '#6B7280'} />
                <Text style={{ color: disliked ? '#EF4444' : '#6B7280', fontWeight: '600' }}>Dislike</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleShare} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <CoolIcon name="share-2" size={18} color="#6B7280" />
                <Text style={{ color: '#6B7280', fontWeight: '600' }}>Share</Text>
              </TouchableOpacity>
            </View>

            {article.summary ? (
              <Text style={{ fontSize: 16, color: '#374151', marginBottom: 12 }}>{article.summary}</Text>
            ) : null}

            <Text style={{ fontSize: 16, color: '#4B5563', lineHeight: 24, paddingBottom: 20 }}>
              {article.content || 'Full content goes here. This is a placeholder for the news article body text.'}
            </Text>

            {/* Comments */}
            <View style={{ paddingBottom: 20 }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 8 }}>Comments</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <View style={{ flex: 1, backgroundColor: '#F3F4F6', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 10 }}>
                  <TextInput
                    placeholder="Write a comment..."
                    placeholderTextColor="#9CA3AF"
                    value={commentText}
                    onChangeText={setCommentText}
                    style={{ fontSize: 14, color: '#111827' }}
                  />
                </View>
                <TouchableOpacity onPress={handleAddComment} style={{ backgroundColor: '#4A90E2', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10 }}>
                  <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>Post</Text>
                </TouchableOpacity>
              </View>

              {comments.length === 0 ? (
                <Text style={{ fontSize: 14, color: '#6B7280' }}>Be the first to comment</Text>
              ) : (
                comments.map((c) => (
                  <View key={c.id} style={{ paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' }}>
                    <Text style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 2 }}>{c.userName || c.userId}</Text>
                    <Text style={{ fontSize: 14, color: '#111827' }}>{c.text}</Text>
                  </View>
                ))
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default NewsDetailDrawer;


