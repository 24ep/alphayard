import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, Modal } from 'react-native';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';
import CoolIcon from '../common/CoolIcon';
import { homeStyles } from '../../styles/homeStyles';
import { useNavigationAnimation } from '../../contexts/NavigationAnimationContext';
import { ChatPage } from '../chat/ChatPage';
import { ChatConversation } from '../chat/ChatConversation';
import { useAuth } from '../../contexts/AuthContext';
import { useBranding } from '../../contexts/BrandingContext';
import { NotificationDrawer } from './NotificationDrawer';
import { useNavigation } from '@react-navigation/native';
import { useMainContent } from '../../contexts/MainContentContext';

interface WelcomeSectionProps {
  selectedFamily: string;
  onFamilyDropdownPress: () => void;
  showFamilyDropdown: boolean;
  familyMembers?: any[];
}

export const WelcomeSection: React.FC<WelcomeSectionProps> = ({
  selectedFamily,
  onFamilyDropdownPress,
  showFamilyDropdown,
  familyMembers = [],
}) => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const { familyNameScaleAnim, welcomeOpacityAnim, chatOpacityAnim } = useNavigationAnimation();
  const { setActiveSection } = useMainContent();
  const { iconUrl, mobileAppName } = useBranding();
  
  // Chat state
  const [showChatPage, setShowChatPage] = useState(false);
  const [showChatConversation, setShowChatConversation] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string>('');
  const [currentChatName, setCurrentChatName] = useState<string>('');
  
  // Notification state
  const [showNotificationDrawer, setShowNotificationDrawer] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      title: 'New Message',
      message: 'Mom sent you a message about dinner plans',
      timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      type: 'message' as const,
      isRead: false,
      senderName: 'Mom'
    },
    {
      id: '2',
      title: 'hourse Update',
      message: 'Dad updated his location - he\'s at the grocery store',
      timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
      type: 'hourse' as const,
      isRead: false,
      senderName: 'Dad'
    },
    {
      id: '3',
      title: 'Reminder',
      message: 'Don\'t forget about the hourse meeting at 7 PM',
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      type: 'reminder' as const,
      isRead: true
    },
    {
      id: '4',
      title: 'System Update',
      message: 'Your hourse safety settings have been updated',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      type: 'system' as const,
      isRead: true
    }
  ]);
  
  // hourse member avatars for rotation
  const familyAvatars = [
    { name: 'account', color: '#FFB6C1' },
    { name: 'account-circle', color: '#FF6B6B' },
    { name: 'account-outline', color: '#FFD700' },
    { name: 'account-group', color: '#98FB98' },
  ];

  const [currentAvatarIndex, setCurrentAvatarIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const interval = setInterval(() => {
      // Fade out
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(() => {
        // Change avatar
        setCurrentAvatarIndex((prevIndex) => 
          (prevIndex + 1) % familyAvatars.length
        );
        // Fade in
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }).start();
      });
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval);
  }, [fadeAnim]);

  const currentAvatar = familyAvatars[currentAvatarIndex];

  // Chat handlers
  const handleChatAvatarPress = () => {
    setActiveSection('chat');
  };

  const handleCloseChatPage = () => {
    setShowChatPage(false);
    setShowChatConversation(false);
  };

  const handleNavigateToChat = (chatId: string, chatName: string) => {
    setCurrentChatId(chatId);
    setCurrentChatName(chatName);
    setShowChatConversation(true);
  };

  const handleBackToChatList = () => {
    setShowChatConversation(false);
  };

  // Notification handlers
  const handleNotificationIconPress = () => {
    setShowNotificationDrawer(true);
  };

  const handleCloseNotificationDrawer = () => {
    setShowNotificationDrawer(false);
  };

  const handleNotificationPress = (notification: any) => {
    // Mark notification as read
    setNotifications(prev => 
      prev.map(n => 
        n.id === notification.id ? { ...n, isRead: true } : n
      )
    );
    
    // Handle different notification types
    switch (notification.type) {
      case 'message':
        // Navigate to chat
        setShowNotificationDrawer(false);
        setShowChatPage(true);
        break;
      case 'hourse':
        // Could navigate to hourse screen
        break;
      case 'reminder':
        // Could navigate to calendar
        break;
      default:
        break;
    }
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, isRead: true }))
    );
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  // Greeting removed per request

  return (
    <View style={homeStyles.welcomeSection}>
      {/* Greeting removed */}
      <View style={homeStyles.familyNameRow}>
        <TouchableOpacity 
          style={homeStyles.familyNameContainer}
          onPress={onFamilyDropdownPress}
        >
          <View style={homeStyles.familySelectorContainer}>
            <View style={homeStyles.familyLogoBox}>
              {iconUrl ? (
                <View style={{ width: 20, height: 20, borderRadius: 4, overflow: 'hidden' }}>
                  <View style={{ flex: 1, backgroundColor: 'transparent' }}>
                    {/* @ts-ignore: React Native Image imported indirectly by RN runtime */}
                    <img src={iconUrl} alt="app icon" style={{ width: 20, height: 20, objectFit: 'cover' }} />
                  </View>
                </View>
              ) : (
                <CoolIcon name="house-03" size={20} color="#FFFFFF" />
              )}
            </View>
            <View style={homeStyles.familyTextColumn}>
              <Text style={homeStyles.familyLabelText}>{mobileAppName || 'hourse'}</Text>
              <Animated.Text
                style={[homeStyles.familyNameText, { transform: [{ scale: familyNameScaleAnim }] }]}
                numberOfLines={1}
              >
                {selectedFamily}
              </Animated.Text>
            </View>
            <IconMC 
              name={showFamilyDropdown ? "chevron-up" : "chevron-down"} 
              size={20} 
              color="#666666" 
            />
          </View>
        </TouchableOpacity>
        <Animated.View style={{ opacity: chatOpacityAnim }}>
          <View style={homeStyles.chatContainer}>
            {/* Notification Icon (left) */}
            <TouchableOpacity 
              style={homeStyles.notificationIconContainer} 
              onPress={handleNotificationIconPress}
            >
              <View style={homeStyles.notificationIcon}>
                <CoolIcon name="bell" size={28} color="#FFFFFF" />
              </View>
              {notifications.filter(n => !n.isRead).length > 0 && (
                <View style={homeStyles.notificationBadgeSmall}>
                  <Text style={homeStyles.notificationBadgeSmallText}>
                    {notifications.filter(n => !n.isRead).length}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Chat Icon (right) */}
            <TouchableOpacity style={homeStyles.chatCycleCard} onPress={handleChatAvatarPress}>
              <View style={homeStyles.notificationIcon}>
                <CoolIcon name="chat" size={28} color="#FFFFFF" />
              </View>
              <View style={homeStyles.chatBadge}>
                <Text style={homeStyles.chatBadgeText}>3</Text>
              </View>
            </TouchableOpacity>

            {/* Settings Gear (far right) */}
            <TouchableOpacity
              style={homeStyles.chatCycleCard}
              onPress={() => {
                // Navigate to unified Settings screen
                // @ts-ignore
                navigation.navigate('Settings');
              }}
              accessibilityLabel="Open Settings"
            >
              <View style={homeStyles.notificationIcon}>
                <CoolIcon name="settings" size={26} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>


      {/* Notification Drawer */}
      <NotificationDrawer
        visible={showNotificationDrawer}
        onClose={handleCloseNotificationDrawer}
        notifications={notifications}
        onNotificationPress={handleNotificationPress}
        onMarkAllAsRead={handleMarkAllAsRead}
        onClearAll={handleClearAll}
      />
    </View>
  );
};
