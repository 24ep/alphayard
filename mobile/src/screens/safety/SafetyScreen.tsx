import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Box, HStack, VStack, Icon, Badge, Progress, Divider } from 'native-base';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { safetyService } from '../../services/safety/SafetyService';
import { analyticsService } from '../../services/analytics/AnalyticsService';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmergencyAlertButton } from '../../components/emergency/EmergencyAlertButton';
import { GeofenceManager } from '../../components/safety/GeofenceManager';
import { safetyApi, type SafetyAlert, type EmergencyContact } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';

interface SafetyStatus {
  isSafe: boolean;
  lastCheckIn: number;
  nextCheckIn: number;
  emergencyContacts: number;
  geofences: number;
  activeAlerts: number;
  safetyScore: number;
}

interface SafetyAlert {
  id: string;
  type: 'check-in' | 'geofence' | 'emergency' | 'weather' | 'health';
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: number;
  isActive: boolean;
  actionRequired: boolean;
}

interface SafetyScreenProps {
  route?: {
    params?: {
      showEmergency?: boolean;
    };
  };
}

const SafetyScreen: React.FC<SafetyScreenProps> = ({ route }) => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { sendEmergencyAlert, on, off } = useSocket();
  const [safetyStatus, setSafetyStatus] = useState<SafetyStatus | null>(null);
  const [alerts, setAlerts] = useState<SafetyAlert[]>([]);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [safetyStats, setSafetyStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadSafetyData();
    
    // Setup Socket.io event listeners
    on('emergency_alert', handleEmergencyAlertReceived);
    on('alert_acknowledged', handleAlertAcknowledged);
    
    return () => {
      off('emergency_alert', handleEmergencyAlertReceived);
      off('alert_acknowledged', handleAlertAcknowledged);
    };
  }, []);

  const loadSafetyData = async () => {
    try {
      setLoading(true);
      
      // Load data from backend API
      const [alertsResponse, contactsResponse, statsResponse] = await Promise.all([
        safetyApi.getAlerts({ limit: 20 }),
        safetyApi.getEmergencyContacts(),
        safetyApi.getSafetyStats(),
      ]);
      
      if (alertsResponse.success) {
        setAlerts(alertsResponse.alerts);
      }
      
      if (contactsResponse.success) {
        setEmergencyContacts(contactsResponse.emergencyContacts);
      }
      
      if (statsResponse.success) {
        setSafetyStats(statsResponse.stats);
        
        // Create safety status from stats
        const status: SafetyStatus = {
          isSafe: statsResponse.stats.activeAlerts === 0,
          lastCheckIn: Date.now() - 3600000, // 1 hour ago
          nextCheckIn: Date.now() + 3600000, // 1 hour from now
          emergencyContacts: contactsResponse.emergencyContacts.length,
          geofences: 0, // Will be loaded separately
          activeAlerts: statsResponse.stats.activeAlerts,
          safetyScore: Math.max(0, 100 - (statsResponse.stats.activeAlerts * 10)),
        };
        setSafetyStatus(status);
      }
      
      // Using API data only - no mock data fallback
      
    } catch (error) {
      console.error('Failed to load safety data:', error);
      Alert.alert('Error', 'Failed to load safety data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadSafetyData();
    setRefreshing(false);
  };

  const handleEmergencyAlert = async () => {
    try {
      // Send emergency alert via Socket.io for real-time delivery
      sendEmergencyAlert('Emergency panic alert activated', 'Current location', 'panic');
      
      // Also send via API as backup
      const response = await safetyApi.createPanicAlert({
        message: 'Emergency panic alert activated',
      });
      
      if (response.success) {
        Alert.alert('Emergency Alert Sent', 'Help is on the way');
        
        // Also send via local service as backup
        await safetyService.sendEmergencyAlert();
        
        analyticsService.trackEvent('emergency_alert_sent', {
          timestamp: Date.now(),
        });
        
        // Refresh data to show new alert
        await loadSafetyData();
      } else {
        throw new Error('Failed to create panic alert');
      }
    } catch (error) {
      console.error('Failed to send emergency alert:', error);
      Alert.alert('Error', 'Failed to send emergency alert');
    }
  };

  const handleEmergencyAlertReceived = (data: { alert: any }) => {
    // Handle incoming emergency alert from other hourse members
    console.log('Emergency alert received:', data.alert);
    
    // Add to local alerts
    setAlerts(prev => [data.alert, ...prev]);
    
    // Show notification
    Alert.alert(
      '🚨 Emergency Alert',
      `${data.alert.user.first_name} ${data.alert.user.last_name} has sent an emergency alert: ${data.alert.message}`,
      [
        {
          text: 'Acknowledge',
          onPress: () => {
            // Acknowledge the alert
            console.log('Acknowledging alert:', data.alert.id);
          }
        }
      ]
    );
  };

  const handleAlertAcknowledged = (data: { alertId: string; acknowledgedBy: string; acknowledgedByName: string; timestamp: string }) => {
    console.log('Alert acknowledged:', data);
    
    // Update alert status in local state
    setAlerts(prev => prev.map(alert => 
      alert.id === data.alertId 
        ? { ...alert, isActive: false, acknowledgedBy: data.acknowledgedBy }
        : alert
    ));
  };

  const handleCheckIn = async () => {
    try {
      await safetyService.checkIn();
      await loadSafetyData();
      Alert.alert('Check-in Successful', 'Your hourse has been notified');
      
      analyticsService.trackEvent('safety_check_in', {
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('Failed to check in:', error);
      Alert.alert('Error', 'Failed to check in');
    }
  };

  const handleAlertPress = (alert: SafetyAlert) => {
    analyticsService.trackEvent('safety_alert_pressed', {
      alertId: alert.id,
      alertType: alert.type,
      severity: alert.severity,
    });
    
    navigation.navigate('AlertDetails', { alertId: alert.id });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return '#F44336';
      case 'high':
        return '#FF9800';
      case 'medium':
        return '#FFC107';
      case 'low':
        return '#4CAF50';
      default:
        return '#9E9E9E';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'alert-circle';
      case 'high':
        return 'exclamation';
      case 'medium':
        return 'information';
      case 'low':
        return 'check-circle';
      default:
        return 'circle';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'check-in':
        return 'clock-check';
      case 'geofence':
        return 'map-marker-radius';
      case 'emergency':
        return 'alert';
      case 'weather':
        return 'weather-lightning';
      case 'health':
        return 'heart-pulse';
      default:
        return 'bell';
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner fullScreen />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Box style={styles.header}>
        <HStack space={3} alignItems="center" flex={1}>
          <Icon
            as={MaterialCommunityIcons}
            name="shield-check"
            size="lg"
            color="primary.500"
          />
          <VStack flex={1}>
            <Text style={styles.title}>Safety Center</Text>
            <Text style={styles.subtitle}>
              {safetyStatus?.isSafe ? 'All hourse members are safe' : 'Safety check needed'}
            </Text>
          </VStack>
        </HStack>
        <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
          <Icon
            as={MaterialCommunityIcons}
            name="refresh"
            size="md"
            color="primary.500"
          />
        </TouchableOpacity>
      </Box>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Safety Status */}
        <Box style={styles.statusCard}>
          <HStack space={3} alignItems="center" marginBottom={4}>
            <Icon
              as={MaterialCommunityIcons}
              name={safetyStatus?.isSafe ? 'shield-check' : 'shield-alert'}
              size="lg"
              color={safetyStatus?.isSafe ? 'green.500' : 'orange.500'}
            />
            <VStack flex={1}>
              <Text style={styles.statusTitle}>
                {safetyStatus?.isSafe ? 'Safe' : 'Safety Check Needed'}
              </Text>
              <Text style={styles.statusSubtitle}>
                Last check-in: {safetyStatus?.lastCheckIn ? formatTime(safetyStatus.lastCheckIn) : 'Never'}
              </Text>
            </VStack>
          </HStack>

          <Progress
            value={safetyStatus?.safetyScore || 0}
            colorScheme={safetyStatus?.safetyScore >= 80 ? 'green' : 'orange'}
            size="lg"
            marginBottom={2}
          />
          <Text style={styles.safetyScore}>
            Safety Score: {safetyStatus?.safetyScore || 0}%
          </Text>
        </Box>

        {/* Quick Actions */}
        <Box style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <HStack space={3} marginBottom={3}>
            <TouchableOpacity style={styles.actionButton} onPress={handleCheckIn}>
              <VStack space={2} alignItems="center">
                <Icon
                  as={MaterialCommunityIcons}
                  name="clock-check"
                  size="lg"
                  color="primary.500"
                />
                <Text style={styles.actionText}>Check In</Text>
              </VStack>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('EmergencyContacts')}
            >
              <VStack space={2} alignItems="center">
                <Icon
                  as={MaterialCommunityIcons}
                  name="account-group"
                  size="lg"
                  color="primary.500"
                />
                <Text style={styles.actionText}>Contacts</Text>
              </VStack>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('GeofenceSetup')}
            >
              <VStack space={2} alignItems="center">
                <Icon
                  as={MaterialCommunityIcons}
                  name="map-marker-radius"
                  size="lg"
                  color="primary.500"
                />
                <Text style={styles.actionText}>Geofences</Text>
              </VStack>
            </TouchableOpacity>
          </HStack>
        </Box>

        {/* Emergency Alert Button */}
        <Box style={styles.emergencySection}>
          <EmergencyAlertButton onPress={handleEmergencyAlert} />
        </Box>

        {/* Safety Statistics */}
        <Box style={styles.section}>
          <Text style={styles.sectionTitle}>Safety Overview</Text>
          <HStack space={3} justifyContent="space-between">
            <VStack style={styles.statCard} space={1}>
              <Text style={styles.statNumber}>{safetyStatus?.emergencyContacts || 0}</Text>
              <Text style={styles.statLabel}>Emergency Contacts</Text>
            </VStack>
            <VStack style={styles.statCard} space={1}>
              <Text style={styles.statNumber}>{safetyStatus?.geofences || 0}</Text>
              <Text style={styles.statLabel}>Active Geofences</Text>
            </VStack>
            <VStack style={styles.statCard} space={1}>
              <Text style={styles.statNumber}>{safetyStatus?.activeAlerts || 0}</Text>
              <Text style={styles.statLabel}>Active Alerts</Text>
            </VStack>
          </HStack>
        </Box>

        {/* Safety Alerts */}
        {alerts.length > 0 && (
          <Box style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Alerts</Text>
            <VStack space={2}>
              {alerts.slice(0, 5).map((alert) => (
                <TouchableOpacity
                  key={alert.id}
                  style={styles.alertItem}
                  onPress={() => handleAlertPress(alert)}
                >
                  <HStack space={3} alignItems="center">
                    <Icon
                      as={MaterialCommunityIcons}
                      name={getAlertIcon(alert.type)}
                      size="md"
                      color={getSeverityColor(alert.severity)}
                    />
                    <VStack flex={1}>
                      <HStack space={2} alignItems="center" marginBottom={2}>
                        <Text style={styles.alertTitle}>{alert.title}</Text>
                        <Badge
                          colorScheme={
                            alert.severity === 'critical' ? 'red' :
                            alert.severity === 'high' ? 'orange' :
                            alert.severity === 'medium' ? 'yellow' : 'green'
                          }
                          rounded="full"
                          variant="solid"
                        >
                          {alert.severity}
                        </Badge>
                      </HStack>
                      <Text style={styles.alertMessage} numberOfLines={2}>
                        {alert.message}
                      </Text>
                      <Text style={styles.alertTime}>
                        {formatTime(alert.timestamp)}
                      </Text>
                    </VStack>
                    {alert.actionRequired && (
                      <Icon
                        as={MaterialCommunityIcons}
                        name="chevron-right"
                        size="md"
                        color="gray.400"
                      />
                    )}
                  </HStack>
                </TouchableOpacity>
              ))}
            </VStack>
          </Box>
        )}

        {/* Safety Features */}
        <Box style={styles.section}>
          <Text style={styles.sectionTitle}>Safety Features</Text>
          <VStack space={2}>
            <TouchableOpacity
              style={styles.featureItem}
              onPress={() => navigation.navigate('LocationSharing')}
            >
              <HStack space={3} alignItems="center">
                <Icon as={MaterialCommunityIcons} name="map-marker" size="md" color="primary.500" />
                <Text style={styles.featureText}>Location Sharing</Text>
              </HStack>
              <Icon as={MaterialCommunityIcons} name="chevron-right" size="md" color="gray.400" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.featureItem}
              onPress={() => navigation.navigate('SafetyCheck')}
            >
              <HStack space={3} alignItems="center">
                <Icon as={MaterialCommunityIcons} name="clipboard-check" size="md" color="primary.500" />
                <Text style={styles.featureText}>Safety Check</Text>
              </HStack>
              <Icon as={MaterialCommunityIcons} name="chevron-right" size="md" color="gray.400" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.featureItem}
              onPress={() => navigation.navigate('CrisisSupport')}
            >
              <HStack space={3} alignItems="center">
                <Icon as={MaterialCommunityIcons} name="heart" size="md" color="primary.500" />
                <Text style={styles.featureText}>Crisis Support</Text>
              </HStack>
              <Icon as={MaterialCommunityIcons} name="chevron-right" size="md" color="gray.400" />
            </TouchableOpacity>
          </VStack>
        </Box>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
  },
  refreshButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  statusCard: {
    margin: 16,
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  statusSubtitle: {
    fontSize: 14,
    color: '#666666',
  },
  safetyScore: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  actionButton: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    alignItems: 'center',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
  },
  emergencySection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
  },
  alertItem: {
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  alertMessage: {
    fontSize: 14,
    color: '#666666',
  },
  alertTime: {
    fontSize: 12,
    color: '#999999',
    marginTop: 4,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  featureText: {
    fontSize: 16,
    color: '#333333',
  },
});

export default SafetyScreen; 
