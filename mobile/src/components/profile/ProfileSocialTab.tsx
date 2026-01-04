import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';
import { socialService } from '../../services/dataServices';
import moment from 'moment';

interface ProfileSocialTabProps {
    userId?: string;
}

interface Post {
    id: string;
    content: string;
    media?: { type: string; url: string };
    likes: number;
    comments: number;
    created_at: string;
}

export const ProfileSocialTab: React.FC<ProfileSocialTabProps> = ({ userId }) => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadPosts();
    }, [userId]);

    const loadPosts = async () => {
        try {
            setLoading(true);
            // In production, filter by userId
            const result = await socialService.getPosts({ limit: 10 });
            setPosts(result || []);
        } catch (error) {
            console.error('Failed to load posts:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#EF4444" />
                <Text style={styles.loadingText}>Loading posts...</Text>
            </View>
        );
    }

    if (posts.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <IconMC name="post-outline" size={64} color="#D1D5DB" />
                <Text style={styles.emptyTitle}>No Posts Yet</Text>
                <Text style={styles.emptySubtitle}>Share your first moment with family and friends</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Stats Header */}
            <View style={styles.statsHeader}>
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{posts.length}</Text>
                    <Text style={styles.statLabel}>Posts</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>
                        {posts.reduce((sum, post) => sum + (post.likes || 0), 0)}
                    </Text>
                    <Text style={styles.statLabel}>Likes</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>
                        {posts.reduce((sum, post) => sum + (post.comments || 0), 0)}
                    </Text>
                    <Text style={styles.statLabel}>Comments</Text>
                </View>
            </View>

            {/* Posts List */}
            <View style={styles.postsContainer}>
                {posts.map((post) => (
                    <TouchableOpacity key={post.id} style={styles.postCard}>
                        {post.media?.url && (
                            <Image
                                source={{ uri: post.media.url }}
                                style={styles.postImage}
                                resizeMode="cover"
                            />
                        )}
                        <View style={styles.postContent}>
                            <Text style={styles.postText} numberOfLines={3}>
                                {post.content}
                            </Text>
                            <View style={styles.postMeta}>
                                <View style={styles.postStats}>
                                    <IconMC name="heart" size={14} color="#EF4444" />
                                    <Text style={styles.postStatText}>{post.likes || 0}</Text>
                                    <IconMC name="comment-outline" size={14} color="#6B7280" style={{ marginLeft: 12 }} />
                                    <Text style={styles.postStatText}>{post.comments || 0}</Text>
                                </View>
                                <Text style={styles.postTime}>{moment(post.created_at).fromNow()}</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: '#6B7280',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
        paddingHorizontal: 32,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#374151',
        marginTop: 16,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        marginTop: 8,
    },
    statsHeader: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 12,
        padding: 20,
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1F2937',
    },
    statLabel: {
        fontSize: 13,
        color: '#6B7280',
        marginTop: 4,
    },
    statDivider: {
        width: 1,
        height: 40,
        backgroundColor: '#E5E7EB',
    },
    postsContainer: {
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    postCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        marginBottom: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    postImage: {
        width: '100%',
        height: 180,
    },
    postContent: {
        padding: 14,
    },
    postText: {
        fontSize: 14,
        color: '#374151',
        lineHeight: 20,
    },
    postMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    postStats: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    postStatText: {
        fontSize: 13,
        color: '#6B7280',
        marginLeft: 4,
    },
    postTime: {
        fontSize: 12,
        color: '#9CA3AF',
    },
});

export default ProfileSocialTab;
