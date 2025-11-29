import React, { useState } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';
import IconIon from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface Task {
  id: string;
  title: string;
  description: string;
  category: 'work' | 'personal' | 'hourse' | 'urgent';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  isCompleted: boolean;
  assignedBy: string;
  assignedTo: string;
}

interface TaskDetailScreenProps {
  TaskDetail: {
    task: Task;
  };
}

const TaskDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<TaskDetailScreenProps, 'TaskDetail'>>();
  const { task } = route.params;
  const [isCompleted, setIsCompleted] = useState(task.isCompleted);

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleToggleComplete = () => {
    setIsCompleted(!isCompleted);
    // Here you would typically update the task in your backend
    Alert.alert(
      'Task Updated',
      `Task marked as ${!isCompleted ? 'completed' : 'pending'}`,
      [{ text: 'OK' }]
    );
  };

  const handleDeleteTask = () => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            // Here you would typically delete the task from your backend
            navigation.goBack();
          }
        }
      ]
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return '#F44336';
      case 'medium':
        return '#FF9800';
      case 'low':
        return '#4CAF50';
      default:
        return '#666666';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'work':
        return '#2196F3';
      case 'personal':
        return '#9C27B0';
      case 'hourse':
        return '#FF5722';
      case 'urgent':
        return '#F44336';
      default:
        return '#666666';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'work':
        return 'briefcase';
      case 'personal':
        return 'account';
      case 'hourse':
        return 'home';
      case 'urgent':
        return 'alert';
      default:
        return 'help';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const dueDate = new Date(dateString);
    const diffInMs = dueDate.getTime() - now.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);
    
    if (diffInMs < 0) {
      // Past due
      const absDiffInHours = Math.abs(diffInHours);
      const absDiffInDays = Math.abs(diffInDays);
      
      if (absDiffInDays > 0) {
        return `${absDiffInDays} day${absDiffInDays > 1 ? 's' : ''} ago`;
      } else if (absDiffInHours > 0) {
        return `${absDiffInHours} hour${absDiffInHours > 1 ? 's' : ''} ago`;
      } else {
        return 'Just now';
      }
    } else {
      // Due in the future
      if (diffInDays > 0) {
        return `in ${diffInDays} day${diffInDays > 1 ? 's' : ''}`;
      } else if (diffInHours > 0) {
        return `in ${diffInHours} hour${diffInHours > 1 ? 's' : ''}`;
      } else {
        return 'Due now';
      }
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <LinearGradient
      colors={['#FF8C8C', '#FF6B6B']}
      style={styles.gradientContainer}
    >
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <IconIon name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Task Details</Text>
          <TouchableOpacity onPress={handleDeleteTask} style={styles.deleteButton}>
            <IconIon name="trash-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Task Card */}
          <View style={styles.taskCard}>
            <View style={styles.taskHeader}>
              <TouchableOpacity 
                style={styles.completeButton}
                onPress={handleToggleComplete}
              >
                <IconIon 
                  name={isCompleted ? "checkmark-circle" : "ellipse-outline"} 
                  size={32} 
                  color={isCompleted ? "#4CAF50" : "#666666"} 
                />
              </TouchableOpacity>
              
              <View style={styles.taskTitleContainer}>
                <Text style={[
                  styles.taskTitle,
                  { textDecorationLine: isCompleted ? 'line-through' : 'none' }
                ]}>
                  {task.title}
                </Text>
                <Text style={styles.taskStatus}>
                  {isCompleted ? 'Completed' : 'Pending'}
                </Text>
              </View>
            </View>

            <Text style={[
              styles.taskDescription,
              { textDecorationLine: isCompleted ? 'line-through' : 'none' }
            ]}>
              {task.description}
            </Text>

            {/* Task Meta */}
            <View style={styles.taskMeta}>
              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <IconMC name="calendar-clock" size={16} color="#666666" />
                  <Text style={styles.metaLabel}>Due</Text>
                  <Text style={styles.metaValue}>{formatTimeAgo(task.dueDate)}</Text>
                </View>
                
                <View style={styles.metaItem}>
                  <IconMC name="account" size={16} color="#666666" />
                  <Text style={styles.metaLabel}>Assigned by</Text>
                  <Text style={styles.metaValue}>{task.assignedBy}</Text>
                </View>
              </View>

              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <IconMC name="account-check" size={16} color="#666666" />
                  <Text style={styles.metaLabel}>Assigned to</Text>
                  <Text style={styles.metaValue}>{task.assignedTo}</Text>
                </View>
                
                <View style={styles.metaItem}>
                  <IconMC name="clock-outline" size={16} color="#666666" />
                  <Text style={styles.metaLabel}>Created</Text>
                  <Text style={styles.metaValue}>{formatDateTime(task.dueDate)}</Text>
                </View>
              </View>
            </View>

            {/* Badges */}
            <View style={styles.badgesContainer}>
              <View style={[styles.badge, { backgroundColor: getCategoryColor(task.category) }]}>
                <IconMC name={getCategoryIcon(task.category)} size={14} color="#FFFFFF" />
                <Text style={styles.badgeText}>{task.category}</Text>
              </View>
              
              <View style={[styles.badge, { backgroundColor: getPriorityColor(task.priority) }]}>
                <Text style={styles.badgeText}>{task.priority}</Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.editButton]}
              onPress={() => {
                // Handle edit task
                Alert.alert('Edit Task', 'Edit functionality would be implemented here');
              }}
            >
              <IconIon name="create-outline" size={20} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Edit Task</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.shareButton]}
              onPress={() => {
                // Handle share task
                Alert.alert('Share Task', 'Share functionality would be implemented here');
              }}
            >
              <IconIon name="share-outline" size={20} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Share</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  deleteButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  taskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  completeButton: {
    marginRight: 16,
  },
  taskTitleContainer: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  taskStatus: {
    fontSize: 14,
    color: '#666666',
  },
  taskDescription: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 24,
    marginBottom: 20,
  },
  taskMeta: {
    marginBottom: 20,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metaItem: {
    flex: 1,
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: 12,
    color: '#999999',
    marginTop: 4,
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
  },
  badgesContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'capitalize',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  editButton: {
    backgroundColor: '#4CAF50',
  },
  shareButton: {
    backgroundColor: '#2196F3',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default TaskDetailScreen; 