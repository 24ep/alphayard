import { useState, useRef, useEffect } from 'react';
import { Animated, Alert } from 'react-native';
import { socialService } from '../../services/dataServices';

export const useHomeScreen = () => {
  // Tab state
  const [activeTab, setActiveTab] = useState('you');

  // UI state
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [showAllAttention, setShowAllAttention] = useState(false);

  // Comment drawer state
  const [showCommentDrawer, setShowCommentDrawer] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [commentAttachments, setCommentAttachments] = useState<Array<{ id: string, name: string, type: string }>>([]);

  // hourse dropdown state
  const [showFamilyDropdown, setShowFamilyDropdown] = useState(false);
  const [selectedFamily, setSelectedFamily] = useState('Smith hourse');

  // Attention drawer state
  const [showAttentionDrawer, setShowAttentionDrawer] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Handlers
  const handleTabPress = (tabId: string) => {
    setActiveTab(tabId);
  };

  const handleRefresh = () => {
    // Refresh logic here
    console.log('Refreshing...');
  };

  const handleCommentPress = (postId: string) => {
    setSelectedPostId(postId);
    setShowCommentDrawer(true);
  };

  const handleCloseCommentDrawer = () => {
    setShowCommentDrawer(false);
    setSelectedPostId(null);
    setNewComment('');
    setCommentAttachments([]);
  };

  // Fetch comments when a post is selected
  useEffect(() => {
    const fetchComments = async () => {
      if (!selectedPostId) {
        setComments([]);
        return;
      }

      setLoadingComments(true);
      try {
        const fetchedComments = await socialService.getComments(selectedPostId);
        setComments(fetchedComments);
      } catch (error) {
        console.error('Error fetching comments:', error);
        Alert.alert('Error', 'Failed to load comments');
      } finally {
        setLoadingComments(false);
      }
    };

    fetchComments();
  }, [selectedPostId, socialService]);

  const handleAddComment = async (media?: { type: string; url: string }, parentId?: string) => {
    if ((!newComment.trim() && !media) || !selectedPostId) return;

    // Optimistic update? No, simple loading state or wait for API for now.
    // Actually, let's just call API and refresh.
    try {
      const comment = await socialService.createComment({
        post_id: selectedPostId,
        author_id: 'current-user', // Service uses auth token in backend, usually ignored if service handles it. But createComment calls backend service?
        // Wait, socialService in mobile calls API. Backend service uses req.user.id.
        // So author_id here might be irrelevant if API ignores it, BUT socialService.createComment implementation in mobile likely maps to API call.
        content: newComment,
        media: media,
        parentId: parentId
      });

      // Refresh comments
      const updatedComments = await socialService.getComments(selectedPostId);
      setComments(updatedComments);
      setNewComment('');
      setCommentAttachments([]);
    } catch (error) {
      console.error('Error creating comment:', error);
      Alert.alert('Error', 'Failed to post comment');
    }
  };

  const handleLikeComment = async (commentId: string, isLiked: boolean) => {
    // Optimistic update
    setComments(prev => prev.map(c => {
      if (c.id === commentId) {
        return {
          ...c,
          is_liked: !isLiked,
          likes_count: isLiked ? Math.max(0, c.likes_count - 1) : c.likes_count + 1
        };
      }
      return c;
    }));

    try {
      if (isLiked) {
        await socialService.unlikeComment(commentId);
      } else {
        await socialService.likeComment(commentId);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      // Revert on error
      setComments(prev => prev.map(c => {
        if (c.id === commentId) {
          return {
            ...c,
            is_liked: isLiked,
            likes_count: isLiked ? c.likes_count + 1 : Math.max(0, c.likes_count - 1)
          };
        }
        return c;
      }));
    }
  };



  const handleAddAttachment = () => {
    // Placeholder for adding attachment
  };

  const handleRemoveAttachment = (id: string) => {
    setCommentAttachments(prev => prev.filter(a => a.id !== id));
  };

  const handleLinkPress = (url: string) => {
    // Handle link press
  };

  const handleFamilySelect = (family: string) => {
    setSelectedFamily(family);
    setShowFamilyDropdown(false);
  };

  return {
    // State
    activeTab,
    showBackToTop,
    showCreatePostModal,
    newPostContent,
    showAllAttention,
    showCommentDrawer,
    selectedPostId,
    newComment,
    commentAttachments,
    showFamilyDropdown,
    selectedFamily,
    showAttentionDrawer,

    // Animation values
    fadeAnim,
    slideAnim,

    // Setters
    setActiveTab,
    setShowBackToTop,
    setShowCreatePostModal,
    setNewPostContent,
    setShowAllAttention,
    setShowCommentDrawer,
    setSelectedPostId,
    setNewComment,
    setCommentAttachments,
    setShowFamilyDropdown,
    setSelectedFamily,
    setShowAttentionDrawer,

    // Data
    comments,
    loadingComments,

    // Handlers
    handleTabPress,
    handleRefresh,
    handleCommentPress,
    handleCloseCommentDrawer,
    handleAddComment,
    handleLikeComment,
    handleAddAttachment,
    handleRemoveAttachment,
    handleLinkPress,
    handleFamilySelect,
  };
};
