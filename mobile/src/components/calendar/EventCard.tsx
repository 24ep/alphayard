import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import IconIon from 'react-native-vector-icons/Ionicons';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { brandColors } from '../../theme/colors';

export interface Event {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  allDay: boolean;
  location?: string;
  type: 'Circle' | 'personal' | 'work' | 'school' | 'medical' | 'other';
  color: string;
  attendees: string[];
  createdBy: string;
  priority: 'low' | 'medium' | 'high';
  recurring?: {
    type: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    endDate?: string;
  };
  reminders: {
    type: 'push' | 'email' | 'sms';
    time: number;
  }[];
}

interface EventCardProps {
  event: Event;
  onPress?: (event: Event) => void;
  onEdit?: (event: Event) => void;
  onDelete?: (event: Event) => void;
  variant?: 'default' | 'compact' | 'detailed';
  showActions?: boolean;
  animationDelay?: number;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  onPress,
  onEdit,
  onDelete,
  variant = 'default',
  showActions = true,
  animationDelay = 0,
}) => {
  const [fadeAnim] = React.useState(new Animated.Value(0));
  const [scaleAnim] = React.useState(new Animated.Value(0.9));

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        delay: animationDelay,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        delay: animationDelay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [animationDelay]);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getTypeIcon = (type: Event['type']) => {
    switch (type) {
      case 'Circle': return 'people-outline';
      case 'work': return 'briefcase-outline';
      case 'school': return 'school-outline';
      case 'medical': return 'medical-outline';
      case 'personal': return 'person-outline';
      default: return 'calendar-outline';
    }
  };

  const getPriorityColor = (priority: Event['priority']) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return brandColors.primary;
    }
  };

  const getTypeColor = (type: Event['type']) => {
    switch (type) {
      case 'Circle': return '#e91e63';
      case 'work': return '#2196f3';
      case 'school': return '#9c27b0';
      case 'medical': return '#f44336';
      case 'personal': return '#4caf50';
      default: return brandColors.primary;
    }
  };

  const renderCompactCard = () => (
    <Animated.View
      style={[
        styles.compactCard,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.compactCardContent}
        onPress={() => onPress?.(event)}
        activeOpacity={0.7}
      >
        <View style={[styles.typeIndicator, { backgroundColor: getTypeColor(event.type) }]} />
        <View style={styles.compactCardInfo}>
          <Text style={styles.compactTitle} numberOfLines={1}>
            {event.title}
          </Text>
          <Text style={styles.compactTime}>
            {event.allDay ? 'All Day' : formatTime(event.startDate)}
          </Text>
        </View>
        {event.priority === 'high' && (
          <View style={[styles.priorityIndicator, { backgroundColor: getPriorityColor(event.priority) }]} />
        )}
      </TouchableOpacity>
    </Animated.View>
  );

  const renderDetailedCard = () => (
    <Animated.View
      style={[
        styles.detailedCard,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <LinearGradient
        colors={[event.color, `${event.color}dd`]}
        style={styles.detailedCardGradient}
      >
        <TouchableOpacity
          style={styles.detailedCardContent}
          onPress={() => onPress?.(event)}
          activeOpacity={0.8}
        >
          <View style={styles.detailedCardHeader}>
            <View style={styles.detailedCardTitleRow}>
              <IconIon 
                name={getTypeIcon(event.type)} 
                size={20} 
                color="#ffffff" 
                style={styles.typeIcon}
              />
              <Text style={styles.detailedTitle} numberOfLines={2}>
                {event.title}
              </Text>
            </View>
            {showActions && (
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => onEdit?.(event)}
                  activeOpacity={0.7}
                >
                  <IconIon name="create-outline" size={16} color="#ffffff" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => onDelete?.(event)}
                  activeOpacity={0.7}
                >
                  <IconIon name="trash-outline" size={16} color="#ffffff" />
                </TouchableOpacity>
              </View>
            )}
          </View>
          
          {event.description && (
            <Text style={styles.detailedDescription} numberOfLines={2}>
              {event.description}
            </Text>
          )}
          
          <View style={styles.detailedCardFooter}>
            <View style={styles.timeInfo}>
              <IconIon name="time-outline" size={14} color="#ffffff" />
              <Text style={styles.timeText}>
                {event.allDay ? 'All Day' : `${formatTime(event.startDate)} - ${formatTime(event.endDate)}`}
              </Text>
            </View>
            
            {event.location && (
              <View style={styles.locationInfo}>
                <IconIon name="location-outline" size={14} color="#ffffff" />
                <Text style={styles.locationText} numberOfLines={1}>
                  {event.location}
                </Text>
              </View>
            )}
          </View>
          
          <View style={styles.detailedCardMeta}>
            <View style={styles.priorityBadge}>
              <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(event.priority) }]} />
              <Text style={styles.priorityText}>{event.priority}</Text>
            </View>
            
            {event.attendees.length > 0 && (
              <View style={styles.attendeesInfo}>
                <IconMC name="account-group" size={14} color="#ffffff" />
                <Text style={styles.attendeesText}>{event.attendees.length}</Text>
              </View>
            )}
            
            {event.recurring && (
              <View style={styles.recurringInfo}>
                <IconIon name="repeat-outline" size={14} color="#ffffff" />
                <Text style={styles.recurringText}>{event.recurring.type}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </LinearGradient>
    </Animated.View>
  );

  const renderDefaultCard = () => (
    <Animated.View
      style={[
        styles.defaultCard,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.defaultCardContent}
        onPress={() => onPress?.(event)}
        activeOpacity={0.7}
      >
        <View style={styles.defaultCardHeader}>
          <View style={[styles.typeIndicator, { backgroundColor: getTypeColor(event.type) }]} />
          <View style={styles.defaultCardInfo}>
            <Text style={styles.defaultTitle} numberOfLines={1}>
              {event.title}
            </Text>
            <Text style={styles.defaultTime}>
              {event.allDay ? 'All Day' : formatTime(event.startDate)}
            </Text>
          </View>
          <View style={styles.defaultCardActions}>
            {event.priority === 'high' && (
              <View style={[styles.priorityIndicator, { backgroundColor: getPriorityColor(event.priority) }]} />
            )}
            {showActions && (
              <TouchableOpacity
                style={styles.moreButton}
                onPress={() => onEdit?.(event)}
                activeOpacity={0.7}
              >
                <IconIon name="ellipsis-horizontal" size={16} color="#666" />
              </TouchableOpacity>
            )}
          </View>
        </View>
        
        {event.location && (
          <View style={styles.locationRow}>
            <IconIon name="location-outline" size={12} color="#666" />
            <Text style={styles.locationText} numberOfLines={1}>
              {event.location}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );

  switch (variant) {
    case 'compact':
      return renderCompactCard();
    case 'detailed':
      return renderDetailedCard();
    default:
      return renderDefaultCard();
  }
};

const styles = StyleSheet.create({
  // Compact Card Styles
  compactCard: {
    marginVertical: 2,
    marginHorizontal: 4,
  },
  compactCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  compactCardInfo: {
    flex: 1,
    marginLeft: 12,
  },
  compactTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  compactTime: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },

  // Default Card Styles
  defaultCard: {
    marginVertical: 4,
    marginHorizontal: 8,
  },
  defaultCardContent: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  defaultCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  defaultCardInfo: {
    flex: 1,
    marginLeft: 12,
  },
  defaultTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  defaultTime: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  defaultCardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },

  // Detailed Card Styles
  detailedCard: {
    marginVertical: 6,
    marginHorizontal: 12,
  },
  detailedCardGradient: {
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  detailedCardContent: {
    padding: 20,
  },
  detailedCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  detailedCardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  typeIcon: {
    marginRight: 12,
  },
  detailedTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailedDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 20,
    marginBottom: 16,
  },
  detailedCardFooter: {
    marginBottom: 16,
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  timeText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '500',
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    flex: 1,
  },
  detailedCardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  attendeesInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  attendeesText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '500',
  },
  recurringInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  recurringText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '500',
    textTransform: 'capitalize',
  },

  // Common Styles
  typeIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
  },
  priorityIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  moreButton: {
    padding: 4,
  },
});
