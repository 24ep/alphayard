import { useState, useEffect } from 'react';
import { CustomTab, Widget, FamilyMember, AssetCard, AttentionApp } from '../types/home';

export const useHomeState = () => {
  // Basic state
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('hourse');
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Post-related state
  const [showAddPostPopup, setShowAddPostPopup] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostLocation, setNewPostLocation] = useState('');
  const [newPostImage, setNewPostImage] = useState<string | null>(null);
  const [newPostVideo, setNewPostVideo] = useState<string | null>(null);
  const [newPostTags, setNewPostTags] = useState<string[]>([]);
  const [newPostTagInput, setNewPostTagInput] = useState('');

  // Comment-related state
  const [showCommentPopup, setShowCommentPopup] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  // Share-related state
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [selectedPostForShare, setSelectedPostForShare] = useState<any>(null);

  // Report-related state
  const [showReportDropdown, setShowReportDropdown] = useState<string | null>(null);
  const [showReportOptions, setShowReportOptions] = useState<string | null>(null);
  const [showReportPopup, setShowReportPopup] = useState(false);
  const [selectedPostForReport, setSelectedPostForReport] = useState<any>(null);
  const [showOtherReportInput, setShowOtherReportInput] = useState(false);
  const [otherReportText, setOtherReportText] = useState('');
  const [showThankYouMessage, setShowThankYouMessage] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState<string>('');

  // Customize functionality
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);
  const [customTabs, setCustomTabs] = useState<CustomTab[]>([
    { id: 'hourse', name: 'hourse', icon: 'account-group', enabled: true, widgets: ['hourse-members', 'hourse-status-cards'] },
    { id: 'today', name: 'Today', icon: 'calendar-today', enabled: true, widgets: ['appointments', 'attention-apps', 'recently-used'] },
    { id: 'shop', name: 'Shop', icon: 'shopping', enabled: true, widgets: ['shopping-list', 'asset-cards'] },
    { id: 'map', name: 'Map', icon: 'map', enabled: true, widgets: ['location-map'] },
    { id: 'social', name: 'Social', icon: 'account-multiple', enabled: true, widgets: ['social-posts'] },
    { id: 'weather', name: 'Weather', icon: 'weather-partly-cloudy', enabled: true, widgets: ['weather'] },
    { id: 'news', name: 'News', icon: 'newspaper', enabled: true, widgets: ['news'] },
    { id: 'entertainment', name: 'Entertainment', icon: 'gamepad-variant', enabled: true, widgets: ['entertainment'] },
    { id: 'health', name: 'Health', icon: 'heart-pulse', enabled: true, widgets: ['health'] },
    { id: 'expenses', name: 'Expenses', icon: 'currency-usd', enabled: true, widgets: ['expenses'] },
  ]);

  // Location-related state
  const [showLocationPopup, setShowLocationPopup] = useState(false);
  const [showLocationRangePopup, setShowLocationRangePopup] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [selectedLocationRange, setSelectedLocationRange] = useState<number>(5);

  // Wallet-related state
  const [showAddWalletModal, setShowAddWalletModal] = useState(false);
  const [newWalletName, setNewWalletName] = useState('');
  const [newWalletIcon, setNewWalletIcon] = useState('wallet');
  const [newWalletColor, setNewWalletColor] = useState('#4F46E5');
  const [newWalletTargetValue, setNewWalletTargetValue] = useState('');
  const [newWalletBankAccount, setNewWalletBankAccount] = useState('');
  const [showBankAccount, setShowBankAccount] = useState(false);

  // hourse-related state
  const [showCreateFamilyModal, setShowCreateFamilyModal] = useState(false);
  const [newFamilyName, setNewFamilyName] = useState('');
  const [newFamilyType, setNewFamilyType] = useState('nuclear');
  const [newFamilyMembers, setNewFamilyMembers] = useState<string[]>([]);
  const [newMemberInput, setNewMemberInput] = useState('');
  const [showAddMemberInput, setShowAddMemberInput] = useState(false);

  // Refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  // Tab handlers
  const handleTabPress = (tabId: string) => {
    setActiveTab(tabId);
  };

  // Post handlers
  const handleAddPost = () => {
    setShowAddPostPopup(true);
  };

  const handleCloseAddPostPopup = () => {
    setShowAddPostPopup(false);
    setNewPostContent('');
    setNewPostLocation('');
    setNewPostImage(null);
    setNewPostVideo(null);
    setNewPostTags([]);
    setNewPostTagInput('');
  };

  // Comment handlers
  const handleCommentPress = (post: any) => {
    setSelectedPost(post);
    setShowCommentPopup(true);
  };

  const handleCloseCommentPopup = () => {
    setShowCommentPopup(false);
    setSelectedPost(null);
    setNewComment('');
    setReplyingTo(null);
    setReplyText('');
  };

  // Share handlers
  const handleSharePress = (post: any) => {
    setSelectedPostForShare(post);
    setShowShareOptions(true);
  };

  const handleCloseShareOptions = () => {
    setShowShareOptions(false);
    setSelectedPostForShare(null);
  };

  // Report handlers
  const handleReportPress = (post: any) => {
    setSelectedPostForReport(post);
    setShowReportPopup(true);
  };

  const handleCloseReportPopup = () => {
    setShowReportPopup(false);
    setSelectedPostForReport(null);
    setShowOtherReportInput(false);
    setOtherReportText('');
    setShowThankYouMessage(false);
    setSelectedReportType('');
  };

  // Location handlers
  const handleLocationPress = () => {
    setShowLocationPopup(true);
  };

  const handleCloseLocationPopup = () => {
    setShowLocationPopup(false);
  };

  const handleLocationRangePress = () => {
    setShowLocationRangePopup(true);
  };

  const handleCloseLocationRangePopup = () => {
    setShowLocationRangePopup(false);
  };

  // Wallet handlers
  const handleAddWalletPress = () => {
    setShowAddWalletModal(true);
  };

  const handleCloseAddWalletModal = () => {
    setShowAddWalletModal(false);
    setNewWalletName('');
    setNewWalletIcon('wallet');
    setNewWalletColor('#4F46E5');
    setNewWalletTargetValue('');
    setNewWalletBankAccount('');
    setShowBankAccount(false);
  };

  // hourse handlers
  const handleCreateFamilyPress = () => {
    setShowCreateFamilyModal(true);
  };

  const handleCloseCreateFamilyModal = () => {
    setShowCreateFamilyModal(false);
    setNewFamilyName('');
    setNewFamilyType('nuclear');
    setNewFamilyMembers([]);
    setNewMemberInput('');
    setShowAddMemberInput(false);
  };

  return {
    // State
    refreshing,
    activeTab,
    showBackToTop,
    showAddPostPopup,
    newPostContent,
    newPostLocation,
    newPostImage,
    newPostVideo,
    newPostTags,
    newPostTagInput,
    showCommentPopup,
    selectedPost,
    newComment,
    replyingTo,
    replyText,
    showShareOptions,
    selectedPostForShare,
    showReportDropdown,
    showReportOptions,
    showReportPopup,
    selectedPostForReport,
    showOtherReportInput,
    otherReportText,
    showThankYouMessage,
    selectedReportType,
    showCustomizeModal,
    customTabs,
    showLocationPopup,
    showLocationRangePopup,
    selectedLocation,
    selectedLocationRange,
    showAddWalletModal,
    newWalletName,
    newWalletIcon,
    newWalletColor,
    newWalletTargetValue,
    newWalletBankAccount,
    showBankAccount,
    showCreateFamilyModal,
    newFamilyName,
    newFamilyType,
    newFamilyMembers,
    newMemberInput,
    showAddMemberInput,

    // Setters
    setRefreshing,
    setActiveTab,
    setShowBackToTop,
    setNewPostContent,
    setNewPostLocation,
    setNewPostImage,
    setNewPostVideo,
    setNewPostTags,
    setNewPostTagInput,
    setNewComment,
    setReplyingTo,
    setReplyText,
    setShowReportDropdown,
    setShowReportOptions,
    setShowOtherReportInput,
    setOtherReportText,
    setShowThankYouMessage,
    setSelectedReportType,
    setShowCustomizeModal,
    setCustomTabs,
    setSelectedLocation,
    setSelectedLocationRange,
    setNewWalletName,
    setNewWalletIcon,
    setNewWalletColor,
    setNewWalletTargetValue,
    setNewWalletBankAccount,
    setShowBankAccount,
    setNewFamilyName,
    setNewFamilyType,
    setNewFamilyMembers,
    setNewMemberInput,
    setShowAddMemberInput,

    // Handlers
    onRefresh,
    handleTabPress,
    handleAddPost,
    handleCloseAddPostPopup,
    handleCommentPress,
    handleCloseCommentPopup,
    handleSharePress,
    handleCloseShareOptions,
    handleReportPress,
    handleCloseReportPopup,
    handleLocationPress,
    handleCloseLocationPopup,
    handleLocationRangePress,
    handleCloseLocationRangePopup,
    handleAddWalletPress,
    handleCloseAddWalletModal,
    handleCreateFamilyPress,
    handleCloseCreateFamilyModal,
  };
};
