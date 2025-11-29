import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Dimensions,
  Animated,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import IconIon from 'react-native-vector-icons/Ionicons';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { brandColors } from '../../theme/colors';

const { width, height } = Dimensions.get('window');

interface App {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  route: string;
  badge?: number;
  isNew?: boolean;
  isPremium?: boolean;
  category: 'communication' | 'productivity' | 'entertainment' | 'utilities' | 'safety' | 'finance' | 'settings';
  gradient: string[];
}

interface ApplicationsPopupProps {
  visible: boolean;
  onClose: () => void;
}

const ApplicationsPopup: React.FC<ApplicationsPopupProps> = React.memo(({
  visible,
  onClose,
}) => {
  const navigation = useNavigation<any>();
  const [searchQuery, setSearchQuery] = React.useState('');
  const slideAnim = React.useMemo(() => new Animated.Value(0), []);

  React.useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim]);

  const apps: App[] = React.useMemo(() => [
    // Communication Group
    {
      id: 'gallery',
      name: 'Gallery',
      description: 'hourse photo sharing',
      icon: 'image',
      color: '#FF6B6B',
      route: 'Gallery',
      category: 'communication',
      gradient: ['#FF6B6B', '#FF8E8E'],
    },
    {
      id: 'call',
      name: 'Calls',
      description: 'Voice & video calls',
      icon: 'call',
      color: '#4ECDC4',
      route: 'CallApplication',
      category: 'communication',
      gradient: ['#4ECDC4', '#6EDDD6'],
    },
    {
      id: 'communication',
      name: 'Communication',
      description: 'Chat, calls & voice',
      icon: 'chatbubbles',
      color: '#4ECDC4',
      route: 'Communication',
      category: 'communication',
      gradient: ['#4ECDC4', '#6EDDD6'],
    },
    {
      id: 'social',
      name: 'Social',
      description: 'hourse social network',
      icon: 'people',
      color: '#FFA07A',
      route: 'Social',
      category: 'communication',
      gradient: ['#FFA07A', '#FFB08C'],
    },

    // Productivity Group
    {
      id: 'storage',
      name: 'Storage',
      description: 'File management',
      icon: 'folder',
      color: '#DDA0DD',
      route: 'Storage',
      category: 'productivity',
      gradient: ['#DDA0DD', '#E5B3E5'],
    },
    {
      id: 'notes',
      name: 'Notes',
      description: 'Quick notes',
      icon: 'document-text',
      color: '#98D8C8',
      route: 'Notes',
      category: 'productivity',
      gradient: ['#98D8C8', '#A8E0D0'],
    },
    {
      id: 'calendar',
      name: 'Calendar',
      description: 'Event planning',
      icon: 'calendar',
      color: '#F7DC6F',
      route: 'Calendar',
      category: 'productivity',
      gradient: ['#F7DC6F', '#F8E07F'],
    },
    {
      id: 'tasks',
      name: 'Tasks',
      description: 'To-do lists',
      icon: 'checkmark-circle',
      color: '#BB8FCE',
      route: 'TaskManagement',
      category: 'productivity',
      gradient: ['#BB8FCE', '#C59DD6'],
    },
    {
      id: 'goals',
      name: 'Goals',
      description: 'hourse goals',
      icon: 'trophy',
      color: '#F8C471',
      route: 'Goals',
      category: 'productivity',
      gradient: ['#F8C471', '#F9CC81'],
    },

    // Safety Group
    {
      id: 'location',
      name: 'Location',
      description: 'hourse tracking',
      icon: 'location',
      color: '#3498DB',
      route: 'Location',
      category: 'safety',
      gradient: ['#3498DB', '#44A8EB'],
    },
    {
      id: 'health',
      name: 'Health',
      description: 'Health records',
      icon: 'medical',
      color: '#2ECC71',
      route: 'Health',
      category: 'safety',
      gradient: ['#2ECC71', '#3EDC81'],
    },

    // Finance Group
    {
      id: 'budget',
      name: 'Budget',
      description: 'hourse budget',
      icon: 'wallet',
      color: '#27AE60',
      route: 'Budget',
      category: 'finance',
      gradient: ['#27AE60', '#37BE70'],
    },
    {
      id: 'expenses',
      name: 'Expenses',
      description: 'Track spending',
      icon: 'card',
      color: '#8E44AD',
      route: 'Expenses',
      category: 'finance',
      gradient: ['#8E44AD', '#9E54BD'],
    },
    {
      id: 'savings',
      name: 'Savings',
      description: 'Save money',
      icon: 'trending-up',
      color: '#16A085',
      route: 'Savings',
      category: 'finance',
      gradient: ['#16A085', '#26B095'],
    },
    {
      id: 'investments',
      name: 'Investments',
      description: 'Investment tracking',
      icon: 'analytics',
      color: '#D68910',
      route: 'Investments',
      category: 'finance',
      gradient: ['#D68910', '#E69920'],
    },
    {
      id: 'bills',
      name: 'Bills',
      description: 'Bill reminders',
      icon: 'receipt',
      color: '#C0392B',
      route: 'Bills',
      category: 'finance',
      gradient: ['#C0392B', '#D0493B'],
    },

    // Settings Group
    {
      id: 'hourse',
      name: 'hourse',
      description: 'hourse settings',
      icon: 'people-circle',
      color: '#9B59B6',
      route: 'hourse',
      category: 'settings',
      gradient: ['#9B59B6', '#AB69C6'],
    },
  ], []);

  const handleAppPress = React.useCallback((app: App) => {
    onClose();
    // Navigate to the app screen
    navigation.navigate(app.route as never);
  }, [onClose, navigation]);

  const renderAppIcon = React.useCallback((app: App) => (
    <TouchableOpacity
      key={app.id}
      style={styles.appItem}
      onPress={() => handleAppPress(app)}
      activeOpacity={0.6}
    >
      <LinearGradient
        colors={app.gradient}
        style={styles.appIconContainer}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <IconIon name={app.icon as any} size={24} color="#FFFFFF" />
        {app.badge && app.badge > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{app.badge}</Text>
          </View>
        )}
        {app.isNew && (
          <View style={styles.newBadge}>
            <Text style={styles.newBadgeText}>NEW</Text>
          </View>
        )}
        {app.isPremium && (
          <View style={styles.premiumBadge}>
            <IconIon name="star" size={12} color="#FFD700" />
          </View>
        )}
      </LinearGradient>
      <Text style={styles.appName} numberOfLines={1}>
        {app.name}
      </Text>
      <Text style={styles.appDescription} numberOfLines={1}>
        {app.description}
      </Text>
    </TouchableOpacity>
  ), [handleAppPress]);

  const renderAppGroup = React.useCallback((category: string, categoryApps: App[]) => (
    <View key={category} style={styles.appGroup}>
      <View style={styles.groupHeaderContainer}>
        <Text style={styles.groupHeader}>{category.toUpperCase()}</Text>
        <View style={styles.groupDivider} />
      </View>
      <View style={styles.appsGrid}>
        {categoryApps.map((app, index) => (
          <View key={app.id} style={styles.appGridItem}>
            {renderAppIcon(app)}
          </View>
        ))}
      </View>
    </View>
  ), [renderAppIcon]);

  const filteredApps = React.useMemo(() => {
    if (!searchQuery.trim()) {
      return apps;
    }
    const query = searchQuery.toLowerCase().trim();
    return apps.filter(app => 
      app.name.toLowerCase().includes(query) ||
      app.description.toLowerCase().includes(query) ||
      app.category.toLowerCase().includes(query)
    );
  }, [apps, searchQuery]);

  const groupedApps = React.useMemo(() => {
    const groups: { [key: string]: App[] } = {};
    filteredApps.forEach(app => {
      if (!groups[app.category]) {
        groups[app.category] = [];
      }
      groups[app.category].push(app);
    });
    return groups;
  }, [filteredApps]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
                 <Animated.View 
                   style={[
                     styles.popupContainer,
                     {
                       transform: [
                         {
                           translateY: slideAnim.interpolate({
                             inputRange: [0, 1],
                             outputRange: [300, 0],
                           }),
                         },
                       ],
                     },
                   ]}
                 >
           <View style={styles.header}>
             <View style={styles.headerHandle} />
             <Text style={styles.headerTitle}>Applications</Text>
             <TouchableOpacity 
               style={styles.closeButton} 
               onPress={() => {
                 Animated.timing(slideAnim, {
                   toValue: 0,
                   duration: 200,
                   useNativeDriver: true,
                 }).start(() => {
                   onClose();
                 });
               }}
               activeOpacity={0.6}
             >
               <IconIon name="close" size={24} color="#666" />
             </TouchableOpacity>
           </View>
           
           {/* Search Bar */}
           <View style={styles.searchContainer}>
             <View style={styles.searchInputContainer}>
               <IconIon name="search" size={20} color="#999" style={styles.searchIcon} />
               <TextInput
                 style={styles.searchInput}
                 placeholder="Search applications..."
                 placeholderTextColor="#999"
                 value={searchQuery}
                 onChangeText={setSearchQuery}
                 autoCapitalize="none"
                 autoCorrect={false}
               />
               {searchQuery.length > 0 && (
                 <TouchableOpacity
                   style={styles.clearButton}
                   onPress={() => setSearchQuery('')}
                   activeOpacity={0.6}
                 >
                   <IconIon name="close-circle" size={20} color="#999" />
                 </TouchableOpacity>
               )}
             </View>
           </View>
          
          <ScrollView 
            style={styles.content}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.contentContainer}
          >
            {Object.entries(groupedApps).map(([category, categoryApps]) => 
              renderAppGroup(category, categoryApps)
            )}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  popupContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: height * 0.8,
    minHeight: height * 0.5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  appsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginHorizontal: -8,
  },
  appItem: {
    width: (width - 60) / 3,
    alignItems: 'center',
    marginBottom: 20,
  },
  appIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF5A5A',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  newBadge: {
    position: 'absolute',
    top: -5,
    left: -5,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  newBadgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: 'bold',
  },
  premiumBadge: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  appName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 2,
  },
  appDescription: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
  appGroup: {
    marginBottom: 32,
  },
  groupHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  groupHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginRight: 12,
  },
  groupDivider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  appGridItem: {
    width: (width - 60) / 3,
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 8,
  },
  clearButton: {
    marginLeft: 8,
    padding: 2,
  },
});

export default ApplicationsPopup;