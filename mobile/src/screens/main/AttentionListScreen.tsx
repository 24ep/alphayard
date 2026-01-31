import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import IconIon from 'react-native-vector-icons/Ionicons';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';

interface AttentionItem {
  id: string;
  name: string;
  type: string;
  priority: string;
  status: string;
  description: string;
  date: string;
  time: string;
  icon: string;
  color: string;
  notificationCount?: number;
}

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  isRead: boolean;
  icon: string;
  color: string;
}

const AttentionListScreen: React.FC = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<'attention' | 'notifications'>('attention');
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  // Mock data for attention items
  const attentionItems: AttentionItem[] = [
    {
      id: '1',
      name: 'Circle Emergency',
      type: 'Emergency',
      priority: 'high',
      status: 'active',
      description: 'Mom needs immediate assistance',
      date: '2024-01-15',
      time: '14:30',
      icon: 'alert-circle',
      color: '#FF5A5A',
      notificationCount: 3,
    },
    {
      id: '2',
      name: 'Medical Appointment',
      type: 'Health',
      priority: 'medium',
      status: 'pending',
      description: 'Dad has doctor appointment tomorrow',
      date: '2024-01-16',
      time: '10:00',
      icon: 'medical-bag',
      color: '#FF8C8C',
      notificationCount: 1,
    },
    {
      id: '3',
      name: 'School Event',
      type: 'Education',
      priority: 'low',
      status: 'completed',
      description: 'Kids have school performance',
      date: '2024-01-14',
      time: '18:00',
      icon: 'school',
      color: '#4CAF50',
    },
    {
      id: '4',
      name: 'Bill Payment',
      type: 'Finance',
      priority: 'high',
      status: 'active',
      description: 'Electricity bill due today',
      date: '2024-01-15',
      time: '23:59',
      icon: 'cash',
      color: '#FF5A5A',
      notificationCount: 2,
    },
    {
      id: '5',
      name: 'Birthday Party',
      type: 'Social',
      priority: 'medium',
      status: 'pending',
      description: 'Sister birthday celebration',
      date: '2024-01-18',
      time: '19:00',
      icon: 'cake-variant',
      color: '#FF8C8C',
    },
    {
      id: '6',
      name: 'Car Maintenance',
      type: 'Transport',
      priority: 'low',
      status: 'pending',
      description: 'Car service appointment',
      date: '2024-01-20',
      time: '09:00',
      icon: 'car',
      color: '#4CAF50',
    },
  ];

  // Mock data for notifications
  const notifications: NotificationItem[] = [
    {
      id: '1',
      title: 'New Message',
      message: 'Sarah sent you a message in Circle Chat',
      type: 'info',
      timestamp: '2 minutes ago',
      isRead: false,
      icon: 'message',
      color: '#2196F3',
    },
    {
      id: '2',
      title: 'Task Completed',
      message: 'Your assigned task "Review budget" has been completed',
      type: 'success',
      timestamp: '1 hour ago',
      isRead: true,
      icon: 'check-circle',
      color: '#4CAF50',
    },
    {
      id: '3',
      title: 'System Update',
      message: 'New app update available for download',
      type: 'warning',
      timestamp: '3 hours ago',
      isRead: false,
      icon: 'update',
      color: '#FF9800',
    },
    {
      id: '4',
      title: 'Connection Lost',
      message: 'Lost connection to Circle tracking service',
      type: 'error',
      timestamp: '5 hours ago',
      isRead: true,
      icon: 'wifi-off',
      color: '#F44336',
    },
    {
      id: '5',
      title: 'Location Shared',
      message: 'Dad shared his location with you',
      type: 'info',
      timestamp: '1 day ago',
      isRead: true,
      icon: 'map-marker',
      color: '#2196F3',
    },
    {
      id: '6',
      title: 'Reminder',
      message: 'Don\'t forget to take your medication',
      type: 'warning',
      timestamp: '2 days ago',
      isRead: false,
      icon: 'bell',
      color: '#FF9800',
    },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return '#FF5A5A';
      case 'medium':
        return '#FF8C8C';
      case 'low':
        return '#4CAF50';
      default:
        return '#666666';
    }
  };

  const getNotificationTypeColor = (type: string) => {
    switch (type) {
      case 'info':
        return '#2196F3';
      case 'success':
        return '#4CAF50';
      case 'warning':
        return '#FF9800';
      case 'error':
        return '#F44336';
      default:
        return '#666666';
    }
  };

  const getNotificationTypeIcon = (type: string) => {
    switch (type) {
      case 'info':
        return 'information';
      case 'success':
        return 'check-circle';
      case 'warning':
        return 'alert-circle';
      case 'error':
        return 'close-circle';
      default:
        return 'bell';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const filteredAttentionItems = filter === 'all' 
    ? attentionItems 
    : attentionItems.filter(item => item.priority === filter);

  const unreadNotifications = notifications.filter(n => !n.isRead);
  const readNotifications = notifications.filter(n => n.isRead);

  const renderAttentionItem = (item: AttentionItem) => (
    <TouchableOpacity
      key={item.id}
      style={styles.attentionListItem}
      onPress={() => navigation.navigate('AttentionDetail', { attentionApp: item })}
    >
      <View style={styles.listItemLeft}>
        <View style={styles.listItemIcon}>
          <IconMC name={item.icon} size={20} color={item.color} />
        </View>
        
        <View style={styles.listItemContent}>
          <Text style={styles.listItemName}>{item.name}</Text>
          <Text style={styles.listItemDescription}>{item.description}</Text>
          <View style={styles.listItemMeta}>
            <Text style={styles.listItemDate}>{formatDate(item.date)} at {item.time}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.listItemRight}>
        <IconIon name="chevron-forward" size={16} color="#666666" />
      </View>
    </TouchableOpacity>
  );

  const renderNotificationItem = (item: NotificationItem) => (
    <TouchableOpacity
      key={item.id}
      style={[
        styles.notificationListItem,
        !item.isRead && styles.unreadNotificationItem
      ]}
      onPress={() => {
        // Handle notification press
        console.log('Notification pressed:', item);
      }}
    >
      <View style={styles.listItemLeft}>
        <View style={styles.listItemIcon}>
          <IconMC 
            name={getNotificationTypeIcon(item.type)} 
            size={20} 
            color={getNotificationTypeColor(item.type)} 
          />
        </View>
        
        <View style={styles.listItemContent}>
          <Text style={[
            styles.listItemName,
            !item.isRead && styles.unreadText
          ]}>
            {item.title}
          </Text>
          <Text style={styles.listItemDescription}>{item.message}</Text>
          <View style={styles.listItemMeta}>
            <Text style={styles.listItemDate}>{item.timestamp}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.listItemRight}>
        {!item.isRead && <View style={styles.unreadDot} />}
        <IconIon name="chevron-forward" size={16} color="#666666" />
      </View>
    </TouchableOpacity>
  );

  const renderTabContent = () => {
    if (activeTab === 'attention') {
      return (
        <>
          {/* Filter Tabs for Attention Items */}
          <View style={styles.filterContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TouchableOpacity
                style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
                onPress={() => setFilter('all')}
              >
                <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
                  All ({attentionItems.length})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterTab, filter === 'high' && styles.filterTabActive]}
                onPress={() => setFilter('high')}
              >
                <Text style={[styles.filterText, filter === 'high' && styles.filterTextActive]}>
                  High Priority
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterTab, filter === 'medium' && styles.filterTabActive]}
                onPress={() => setFilter('medium')}
              >
                <Text style={[styles.filterText, filter === 'medium' && styles.filterTextActive]}>
                  Medium Priority
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterTab, filter === 'low' && styles.filterTabActive]}
                onPress={() => setFilter('low')}
              >
                <Text style={[styles.filterText, filter === 'low' && styles.filterTextActive]}>
                  Low Priority
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

          {/* Attention Items List */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.itemsContainer}>
              {filteredAttentionItems.length > 0 ? (
                filteredAttentionItems.map(renderAttentionItem)
              ) : (
                <View style={styles.emptyState}>
                  <IconMC name="alert-circle-outline" size={48} color="#CCCCCC" />
                  <Text style={styles.emptyTitle}>No Attention Items</Text>
                  <Text style={styles.emptySubtitle}>
                    {filter === 'all' 
                      ? 'No attention items found'
                      : `No ${filter} priority items found`
                    }
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>
        </>
      );
    } else {
      return (
        <>
          {/* Filter Tabs for Notifications */}
          <View style={styles.filterContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TouchableOpacity
                style={[styles.filterTab, true && styles.filterTabActive]}
                onPress={() => {}}
              >
                <Text style={[styles.filterText, true && styles.filterTextActive]}>
                  All ({notifications.length})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterTab, false && styles.filterTabActive]}
                onPress={() => {}}
              >
                <Text style={[styles.filterText, false && styles.filterTextActive]}>
                  Unread ({unreadNotifications.length})
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

          {/* Notifications List */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.itemsContainer}>
              {notifications.length > 0 ? (
                notifications.map(renderNotificationItem)
              ) : (
                <View style={styles.emptyState}>
                  <IconMC name="bell-off" size={48} color="#CCCCCC" />
                  <Text style={styles.emptyTitle}>No Notifications</Text>
                  <Text style={styles.emptySubtitle}>
                    You're all caught up!
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>
        </>
      );
    }
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
        <Text style={styles.headerTitle}>Attention & Notifications</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Main Tabs */}
      <View style={styles.mainTabsContainer}>
        <TouchableOpacity
          style={[styles.mainTab, activeTab === 'attention' && styles.mainTabActive]}
          onPress={() => setActiveTab('attention')}
        >
          <IconMC 
            name="alert-circle" 
            size={20} 
            color={activeTab === 'attention' ? '#FFFFFF' : '#666666'} 
          />
          <Text style={[styles.mainTabText, activeTab === 'attention' && styles.mainTabTextActive]}>
            Attention Items
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.mainTab, activeTab === 'notifications' && styles.mainTabActive]}
          onPress={() => setActiveTab('notifications')}
        >
          <IconMC 
            name="bell" 
            size={20} 
            color={activeTab === 'notifications' ? '#FFFFFF' : '#666666'} 
          />
          <Text style={[styles.mainTabText, activeTab === 'notifications' && styles.mainTabTextActive]}>
            Notifications
          </Text>
          {unreadNotifications.length > 0 && (
            <View style={styles.mainTabBadge}>
              <Text style={styles.mainTabBadgeText}>{unreadNotifications.length}</Text>
            </View>
          )}
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
    width: 40,
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
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    marginHorizontal: 4,
    position: 'relative',
  },
  mainTabActive: {
    backgroundColor: '#FF5A5A',
  },
  mainTabText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
    marginLeft: 6,
  },
  mainTabTextActive: {
    color: '#FFFFFF',
  },
  mainTabBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FF5A5A',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainTabBadgeText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  filterContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(240, 240, 240, 0.6)',
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    marginRight: 12,
  },
  filterTabActive: {
    backgroundColor: '#FF5A5A',
  },
  filterText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  itemsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  attentionListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(240, 240, 240, 0.6)',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  notificationListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(240, 240, 240, 0.6)',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  unreadNotificationItem: {
    backgroundColor: 'rgba(248, 249, 250, 0.7)',
  },
  listItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  listItemIcon: {
    position: 'relative',
    marginRight: 12,
  },
  listItemContent: {
    flex: 1,
  },
  listItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  unreadText: {
    fontWeight: '700',
  },
  listItemDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 6,
  },
  listItemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  listItemDate: {
    fontSize: 12,
    color: '#999999',
  },
  listItemRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF5A5A',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
  },
});

export default AttentionListScreen; 
