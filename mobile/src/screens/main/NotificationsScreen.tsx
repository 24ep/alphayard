import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  RefreshControl,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import IconIon from 'react-native-vector-icons/Ionicons';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';
import { brandColors, textColors } from '../../theme/colors';
import NotificationService, { Notification } from '../../services/notification/NotificationService';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'system' | 'hourse' | 'finance' | 'health';
  timestamp: string;
  isRead: boolean;
  icon: string;
  color: string;
}

const NotificationsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'read'>('all');
  const [filter, setFilter] = useState<'all' | 'system' | 'hourse' | 'finance' | 'health'>('all');
  const [unreadCount, setUnreadCount] = useState(0);

  const notificationService = NotificationService.getInstance();

  useEffect(() => {
    loadNotifications();
    
    // Subscribe to notification updates
    const unsubscribe = notificationService.addListener((updatedNotifications) => {
      setNotifications(updatedNotifications);
      updateUnreadCount(updatedNotifications);
    });

    return unsubscribe;
  }, []);

  const loadNotifications = async () => {
    try {
      const allNotifications = await notificationService.getNotifications();
      setNotifications(allNotifications);
      updateUnreadCount(allNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const updateUnreadCount = (notifications: Notification[]) => {
    const count = notifications.filter(n => !n.isRead).length;
    setUnreadCount(count);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadNotifications();
    } catch (error) {
      console.error('Error refreshing notifications:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    Alert.alert(
      'Mark All as Read',
      'Are you sure you want to mark all notifications as read?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark All Read',
          onPress: async () => {
            try {
              await notificationService.markAllAsRead();
            } catch (error) {
              console.error('Error marking all notifications as read:', error);
            }
          }
        }
      ]
    );
  };

  const deleteNotification = async (notificationId: string) => {
    Alert.alert(
      'Delete Notification',
      'Are you sure you want to delete this notification?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await notificationService.deleteNotification(notificationId);
            } catch (error) {
              console.error('Error deleting notification:', error);
            }
          }
        }
      ]
    );
  };

  const handleNotificationPress = async (notification: Notification) => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }
    
    // Navigate based on notification type
    switch (notification.type) {
      case 'hourse':
        // @ts-ignore
        navigation.navigate('FamilyChat', { notification });
        break;
      case 'finance':
        // @ts-ignore
        navigation.navigate('AssetDetail', { notification });
        break;
      case 'health':
        // @ts-ignore
        navigation.navigate('HealthDetail', { notification });
        break;
      default:
        // Handle system notifications
        Alert.alert(notification.title, notification.message);
        break;
    }
  };

  const getFilteredNotifications = () => {
    let filtered = notifications;

    // Filter by active tab
    if (activeTab === 'unread') {
      filtered = filtered.filter(n => !n.isRead);
    } else if (activeTab === 'read') {
      filtered = filtered.filter(n => n.isRead);
    }

    // Filter by category
    if (filter !== 'all') {
      filtered = filtered.filter(n => n.type === filter);
    }

    return filtered;
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'system':
        return <IconMC name="cog" size={20} color="#666666" />;
      case 'hourse':
        return <IconMC name="account-group" size={20} color="#4CAF50" />;
      case 'finance':
        return <IconMC name="currency-usd" size={20} color="#FF9800" />;
      case 'health':
        return <IconMC name="medical-bag" size={20} color="#F44336" />;
      case 'success':
        return <IconMC name="check-circle" size={20} color="#4CAF50" />;
      case 'warning':
        return <IconMC name="alert" size={20} color="#FF9800" />;
      case 'error':
        return <IconMC name="alert-circle" size={20} color="#F44336" />;
      default:
        return <IconMC name="bell" size={20} color="#666666" />;
    }
  };

  const getNotificationTypeColor = (type: string) => {
    switch (type) {
      case 'system':
        return '#FF5A5A';
      case 'hourse':
        return '#4CAF50';
      case 'finance':
        return '#FF8C8C';
      case 'health':
        return '#FF5A5A';
      case 'success':
        return '#4CAF50';
      case 'warning':
        return '#FF8C8C';
      case 'error':
        return '#FF5A5A';
      default:
        return '#666666';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return timestamp.toLocaleDateString();
  };

  const renderNotificationItem = (item: Notification) => (
    <TouchableOpacity
      key={item.id}
      style={[
        styles.listItem,
        !item.isRead && styles.unreadListItem
      ]}
      onPress={() => handleNotificationPress(item)}
    >
      <View style={styles.listItemLeft}>
        <View style={[styles.listItemIcon, { backgroundColor: getNotificationTypeColor(item.type) + '20' }]}>
          {getNotificationIcon(item.type)}
        </View>
      </View>
      
      <View style={styles.listItemContent}>
        <Text style={styles.listItemTitle}>{item.title}</Text>
        <Text style={styles.listItemDescription}>{item.message}</Text>
        <View style={styles.listItemMeta}>
          <Text style={styles.listItemDate}>{formatTimestamp(item.timestamp)}</Text>
        </View>
      </View>
      
      <View style={styles.listItemRight}>
        {!item.isRead && <View style={styles.unreadDot} />}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deleteNotification(item.id)}
        >
          <IconMC name="delete-outline" size={16} color="#999999" />
        </TouchableOpacity>
        <IconIon name="chevron-forward" size={16} color="#666666" />
      </View>
    </TouchableOpacity>
  );

  const renderTabContent = () => {
    return (
      <>
        {/* Filter Tabs */}
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
              onPress={() => setFilter('all')}
            >
              <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
                All ({notifications.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterTab, filter === 'system' && styles.filterTabActive]}
              onPress={() => setFilter('system')}
            >
              <Text style={[styles.filterText, filter === 'system' && styles.filterTextActive]}>
                System
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterTab, filter === 'hourse' && styles.filterTabActive]}
              onPress={() => setFilter('hourse')}
            >
              <Text style={[styles.filterText, filter === 'hourse' && styles.filterTextActive]}>
                hourse
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterTab, filter === 'finance' && styles.filterTabActive]}
              onPress={() => setFilter('finance')}
            >
              <Text style={[styles.filterText, filter === 'finance' && styles.filterTextActive]}>
                Finance
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterTab, filter === 'health' && styles.filterTabActive]}
              onPress={() => setFilter('health')}
            >
              <Text style={[styles.filterText, filter === 'health' && styles.filterTextActive]}>
                Health
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Notifications List */}
        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.itemsContainer}>
            {getFilteredNotifications().length > 0 ? (
              getFilteredNotifications().map(renderNotificationItem)
            ) : (
              <View style={styles.emptyState}>
                <IconMC name="bell-off" size={48} color="#CCCCCC" />
                <Text style={styles.emptyTitle}>No Notifications</Text>
                <Text style={styles.emptySubtitle}>
                  {filter === 'all' 
                    ? 'You\'re all caught up!'
                    : `No ${filter} notifications found`
                  }
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <IconIon name="arrow-back" size={24} color="#333333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.markAllButton}
            onPress={markAllAsRead}
          >
            <Text style={styles.markAllText}>Mark All Read</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Tabs */}
      <View style={styles.mainTabsContainer}>
        <TouchableOpacity
          style={[styles.mainTab, activeTab === 'all' && styles.mainTabActive]}
          onPress={() => setActiveTab('all')}
        >
          <IconMC 
            name="bell" 
            size={20} 
            color={activeTab === 'all' ? '#FFFFFF' : '#666666'} 
          />
          <Text style={[styles.mainTabText, activeTab === 'all' && styles.mainTabTextActive]}>
            All Notifications
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.mainTab, activeTab === 'unread' && styles.mainTabActive]}
          onPress={() => setActiveTab('unread')}
        >
          <IconMC 
            name="bell-ring" 
            size={20} 
            color={activeTab === 'unread' ? '#FFFFFF' : '#666666'} 
          />
          <Text style={[styles.mainTabText, activeTab === 'unread' && styles.mainTabTextActive]}>
            Unread
          </Text>
          {unreadCount > 0 && (
            <View style={styles.mainTabBadge}>
              <Text style={styles.mainTabBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.mainTab, activeTab === 'read' && styles.mainTabActive]}
          onPress={() => setActiveTab('read')}
        >
          <IconMC 
            name="bell-check" 
            size={20} 
            color={activeTab === 'read' ? '#FFFFFF' : '#666666'} 
          />
          <Text style={[styles.mainTabText, activeTab === 'read' && styles.mainTabTextActive]}>
            Read
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      {renderTabContent()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(240, 240, 240, 0.6)',
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  markAllButton: {
    padding: 8,
  },
  markAllText: {
    fontSize: 14,
    color: brandColors.primary,
    fontWeight: '500',
  },
  mainTabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(240, 240, 240, 0.6)',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  mainTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 20,
    marginHorizontal: 4,
    position: 'relative',
  },
  mainTabActive: {
    backgroundColor: brandColors.primary,
  },
  mainTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
    marginLeft: 6,
  },
  mainTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  mainTabBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FF5A5A',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainTabBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  filterContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(240, 240, 240, 0.6)',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  filterTab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: '#F8F9FA',
  },
  filterTabActive: {
    backgroundColor: brandColors.primary,
  },
  filterText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  itemsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(240, 240, 240, 0.6)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  unreadListItem: {
    backgroundColor: 'rgba(248, 249, 250, 0.7)',
    borderColor: brandColors.primary + '30',
  },
  listItemLeft: {
    marginRight: 12,
  },
  listItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listItemContent: {
    flex: 1,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  listItemDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 6,
    lineHeight: 20,
  },
  listItemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listItemDate: {
    fontSize: 12,
    color: '#999999',
  },
  listItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: brandColors.primary,
    marginRight: 8,
  },
  deleteButton: {
    padding: 8,
    marginRight: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
});

export default NotificationsScreen; 