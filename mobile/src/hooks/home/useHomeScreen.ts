import { useState, useRef } from 'react';
import { Animated } from 'react-native';

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
  const [newComment, setNewComment] = useState('');
  const [commentAttachments, setCommentAttachments] = useState<Array<{id: string, name: string, type: string}>>([]);
  
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

  const handleAddComment = () => {
    if (newComment.trim()) {
      console.log('Adding comment:', newComment);
      setNewComment('');
      setCommentAttachments([]);
    }
  };

  const handleAddAttachment = () => {
    const newAttachment = {
      id: Date.now().toString(),
      name: 'attachment.jpg',
      type: 'image'
    };
    setCommentAttachments([...commentAttachments, newAttachment]);
  };

  const handleRemoveAttachment = (attachmentId: string) => {
    setCommentAttachments(commentAttachments.filter(att => att.id !== attachmentId));
  };

  const handleLinkPress = (url: string) => {
    console.log('Opening link:', url);
  };

  const handleFamilySelect = (familyName: string) => {
    setSelectedFamily(familyName);
    setShowFamilyDropdown(false);
    console.log('hourse selected:', familyName);
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
    
    // Handlers
    handleTabPress,
    handleRefresh,
    handleCommentPress,
    handleCloseCommentDrawer,
    handleAddComment,
    handleAddAttachment,
    handleRemoveAttachment,
    handleLinkPress,
    handleFamilySelect,
  };
};
