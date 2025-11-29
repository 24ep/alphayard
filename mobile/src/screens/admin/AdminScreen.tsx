import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Box, HStack, VStack, Icon, Badge, Progress, Divider } from 'native-base';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../hooks/useAuth';
import { adminService } from '../../services/admin/AdminService';
import { analyticsService } from '../../services/analytics/AnalyticsService';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';

interface AdminScreenProps {
  route?: {
    params?: {
      showStats?: boolean;
    };
  };
}

const AdminScreen: React.FC<AdminScreenProps> = ({ route }) => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [systemStats, setSystemStats] = useState<any>(null);
  const [systemHealth, setSystemHealth] = useState<any>(null);
  const [systemAlerts, setSystemAlerts] = useState<any[]>([]);
  const [recentActions, setRecentActions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [stats, health, alerts, actions] = await Promise.all([
        adminService.getSystemStats(),
        adminService.getSystemHealth(),
        adminService.getSystemAlerts(),
        adminService.getAdminActions({}, 1, 10)
      ]);
      
      setSystemStats(stats);
      setSystemHealth(health);
      setSystemAlerts(alerts);
      setRecentActions(actions.actions);
    } catch (error) {
      console.error('Failed to load admin data:', error);
      Alert.alert('Error', 'Failed to load admin information');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAdminData();
    setRefreshing(false);
  };

  const handleCreateAlert = () => {
    navigation.navigate('CreateAlert');
  };

  const handleViewUsers = () => {
    navigation.navigate('UserManagement');
  };

  const handleViewFamilies = () => {
    navigation.navigate('FamilyManagement');
  };

  const handleViewReports = () => {
    navigation.navigate('Reports');
  };

  const handleViewLogs = () => {
    navigation.navigate('SystemLogs');
  };

  const handleResolveAlert = async (alertId: string) => {
    try {
      await adminService.resolveAlert(alertId);
      await loadAdminData();
      Alert.alert('Success', 'Alert resolved successfully!');
      
      analyticsService.trackEvent('admin_alert_resolved', {
        alertId
      });
    } catch (error) {
      console.error('Failed to resolve alert:', error);
      Alert.alert('Error', 'Failed to resolve alert');
    }
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return '#4CAF50';
      case 'warning':
        return '#FF9800';
      case 'critical':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return '#F44336';
      case 'high':
        return '#FF5722';
      case 'medium':
        return '#FF9800';
      case 'low':
        return '#4CAF50';
      default:
        return '#9E9E9E';
    }
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
            name="arrow-left"
            size="lg"
            color="primary.500"
            onPress={() => navigation.goBack()}
          />
          <Text style={styles.title}>Admin Dashboard</Text>
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

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* System Stats */}
        {systemStats && (
          <Box style={styles.section}>
            <Text style={styles.sectionTitle}>System Overview</Text>
            <VStack space={3}>
              <HStack space={3}>
                <Box style={styles.statCard}>
                  <Icon
                    as={MaterialCommunityIcons}
                    name="account-group"
                    size="lg"
                    color="primary.500"
                  />
                  <Text style={styles.statNumber}>{systemStats.users.total.toLocaleString()}</Text>
                  <Text style={styles.statLabel}>Total Users</Text>
                  <Text style={styles.statSubtext}>
                    {systemStats.users.newThisMonth} new this month
                  </Text>
                </Box>

                <Box style={styles.statCard}>
                  <Icon
                    as={MaterialCommunityIcons}
                    name="home-group"
                    size="lg"
                    color="primary.500"
                  />
                  <Text style={styles.statNumber}>{systemStats.families.total.toLocaleString()}</Text>
                  <Text style={styles.statLabel}>Families</Text>
                  <Text style={styles.statSubtext}>
                    Avg {systemStats.families.averageSize} members
                  </Text>
                </Box>
              </HStack>

              <HStack space={3}>
                <Box style={styles.statCard}>
                  <Icon
                    as={MaterialCommunityIcons}
                    name="currency-usd"
                    size="lg"
                    color="primary.500"
                  />
                  <Text style={styles.statNumber}>${systemStats.revenue.monthly.toLocaleString()}</Text>
                  <Text style={styles.statLabel}>Monthly Revenue</Text>
                  <Text style={styles.statSubtext}>
                    {systemStats.revenue.growth > 0 ? '+' : ''}{systemStats.revenue.growth}% growth
                  </Text>
                </Box>

                <Box style={styles.statCard}>
                  <Icon
                    as={MaterialCommunityIcons}
                    name="cloud"
                    size="lg"
                    color="primary.500"
                  />
                  <Text style={styles.statNumber}>
                    {Math.round(systemStats.storage.used / 1024)}GB
                  </Text>
                  <Text style={styles.statLabel}>Storage Used</Text>
                  <Text style={styles.statSubtext}>
                    {Math.round((systemStats.storage.used / systemStats.storage.total) * 100)}% of total
                  </Text>
                </Box>
              </HStack>
            </VStack>
          </Box>
        )}

        {/* System Health */}
        {systemHealth && (
          <Box style={styles.section}>
            <Text style={styles.sectionTitle}>System Health</Text>
            <Box style={styles.healthCard}>
              <HStack space={3} alignItems="center" marginBottom={4}>
                <Box
                  style={[
                    styles.healthIcon,
                    { backgroundColor: getHealthColor(systemHealth.status) }
                  ]}
                >
                  <Icon
                    as={MaterialCommunityIcons}
                    name="heart-pulse"
                    size="md"
                    color="white"
                  />
                </Box>
                <VStack flex={1}>
                  <Text style={styles.healthStatus}>
                    {systemHealth.status.charAt(0).toUpperCase() + systemHealth.status.slice(1)}
                  </Text>
                  <Text style={styles.healthDetails}>
                    {systemHealth.services.filter((s: any) => s.status === 'up').length} of {systemHealth.services.length} services operational
                  </Text>
                </VStack>
              </HStack>

              <VStack space={2}>
                {systemHealth.services.slice(0, 5).map((service: any, index: number) => (
                  <HStack key={index} space={3} alignItems="center">
                    <Icon
                      as={MaterialCommunityIcons}
                      name={service.status === 'up' ? 'check-circle' : 'alert-circle'}
                      size="sm"
                      color={service.status === 'up' ? 'green.500' : 'red.500'}
                    />
                    <Text style={styles.serviceName}>{service.name}</Text>
                    <Text style={styles.serviceResponse}>
                      {service.responseTime}ms
                    </Text>
                    <Badge
                      colorScheme={service.status === 'up' ? 'green' : 'red'}
                      rounded="full"
                      variant="solid"
                    >
                      {service.status}
                    </Badge>
                  </HStack>
                ))}
              </VStack>
            </Box>
          </Box>
        )}

        {/* Quick Actions */}
        <Box style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <VStack space={2}>
            <TouchableOpacity style={styles.actionCard} onPress={handleViewUsers}>
              <HStack space={3} alignItems="center">
                <Icon
                  as={MaterialCommunityIcons}
                  name="account-multiple"
                  size="md"
                  color="primary.500"
                />
                <VStack flex={1}>
                  <Text style={styles.actionTitle}>User Management</Text>
                  <Text style={styles.actionSubtitle}>Manage users, permissions, and accounts</Text>
                </VStack>
                <Icon
                  as={MaterialCommunityIcons}
                  name="chevron-right"
                  size="md"
                  color="gray.400"
                />
              </HStack>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard} onPress={handleViewFamilies}>
              <HStack space={3} alignItems="center">
                <Icon
                  as={MaterialCommunityIcons}
                  name="home-group"
                  size="md"
                  color="primary.500"
                />
                <VStack flex={1}>
                  <Text style={styles.actionTitle}>hourse Management</Text>
                  <Text style={styles.actionSubtitle}>View and manage hourse accounts</Text>
                </VStack>
                <Icon
                  as={MaterialCommunityIcons}
                  name="chevron-right"
                  size="md"
                  color="gray.400"
                />
              </HStack>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard} onPress={handleViewReports}>
              <HStack space={3} alignItems="center">
                <Icon
                  as={MaterialCommunityIcons}
                  name="chart-line"
                  size="md"
                  color="primary.500"
                />
                <VStack flex={1}>
                  <Text style={styles.actionTitle}>Reports & Analytics</Text>
                  <Text style={styles.actionSubtitle}>Generate reports and view analytics</Text>
                </VStack>
                <Icon
                  as={MaterialCommunityIcons}
                  name="chevron-right"
                  size="md"
                  color="gray.400"
                />
              </HStack>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard} onPress={handleViewLogs}>
              <HStack space={3} alignItems="center">
                <Icon
                  as={MaterialCommunityIcons}
                  name="file-document"
                  size="md"
                  color="primary.500"
                />
                <VStack flex={1}>
                  <Text style={styles.actionTitle}>System Logs</Text>
                  <Text style={styles.actionSubtitle}>View system logs and errors</Text>
                </VStack>
                <Icon
                  as={MaterialCommunityIcons}
                  name="chevron-right"
                  size="md"
                  color="gray.400"
                />
              </HStack>
            </TouchableOpacity>
          </VStack>
        </Box>

        {/* System Alerts */}
        <Box style={styles.section}>
          <HStack space={3} alignItems="center" marginBottom={12}>
            <Text style={styles.sectionTitle}>System Alerts</Text>
            <TouchableOpacity onPress={handleCreateAlert}>
              <Icon
                as={MaterialCommunityIcons}
                name="plus-circle"
                size="md"
                color="primary.500"
              />
            </TouchableOpacity>
          </HStack>

          {systemAlerts.length > 0 ? (
            <VStack space={2}>
              {systemAlerts.slice(0, 5).map((alert) => (
                <Box key={alert.id} style={styles.alertCard}>
                  <HStack space={3} alignItems="flex-start">
                    <Box
                      style={[
                        styles.alertIcon,
                        { backgroundColor: getAlertColor(alert.severity) }
                      ]}
                    >
                      <Icon
                        as={MaterialCommunityIcons}
                        name={alert.type === 'error' ? 'alert' : 'information'}
                        size="sm"
                        color="white"
                      />
                    </Box>
                    <VStack flex={1}>
                      <HStack space={2} alignItems="center" marginBottom={2}>
                        <Text style={styles.alertTitle}>{alert.title}</Text>
                        <Badge
                          colorScheme={alert.severity === 'critical' ? 'red' : 'orange'}
                          rounded="full"
                          variant="solid"
                        >
                          {alert.severity}
                        </Badge>
                      </HStack>
                      <Text style={styles.alertMessage}>{alert.message}</Text>
                      <Text style={styles.alertTime}>
                        {new Date(alert.createdAt).toLocaleString()}
                      </Text>
                    </VStack>
                    {alert.isActive && (
                      <TouchableOpacity
                        style={styles.resolveButton}
                        onPress={() => handleResolveAlert(alert.id)}
                      >
                        <Icon
                          as={MaterialCommunityIcons}
                          name="check"
                          size="sm"
                          color="white"
                        />
                      </TouchableOpacity>
                    )}
                  </HStack>
                </Box>
              ))}
            </VStack>
          ) : (
            <EmptyState
              icon="check-circle-outline"
              title="No active alerts"
              subtitle="All systems are running smoothly"
            />
          )}
        </Box>

        {/* Recent Admin Actions */}
        <Box style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Actions</Text>
          {recentActions.length > 0 ? (
            <VStack space={2}>
              {recentActions.map((action) => (
                <Box key={action.id} style={styles.actionItem}>
                  <HStack space={3} alignItems="center">
                    <Icon
                      as={MaterialCommunityIcons}
                      name="account-cog"
                      size="sm"
                      color="primary.500"
                    />
                    <VStack flex={1}>
                      <Text style={styles.actionDescription}>{action.action}</Text>
                      <Text style={styles.actionTarget}>
                        {action.target}: {action.targetId}
                      </Text>
                      <Text style={styles.actionTime}>
                        {new Date(action.timestamp).toLocaleString()}
                      </Text>
                    </VStack>
                  </HStack>
                </Box>
              ))}
            </VStack>
          ) : (
            <EmptyState
              icon="account-cog-outline"
              title="No recent actions"
              subtitle="Admin actions will appear here"
            />
          )}
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
  refreshButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
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
    color: '#333333',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  statSubtext: {
    fontSize: 12,
    color: '#999999',
    marginTop: 2,
  },
  healthCard: {
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
  },
  healthIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  healthStatus: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  healthDetails: {
    fontSize: 14,
    color: '#666666',
  },
  serviceName: {
    fontSize: 14,
    color: '#333333',
    flex: 1,
  },
  serviceResponse: {
    fontSize: 12,
    color: '#666666',
  },
  actionCard: {
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  actionSubtitle: {
    fontSize: 14,
    color: '#666666',
  },
  alertCard: {
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  alertIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  alertMessage: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  alertTime: {
    fontSize: 12,
    color: '#999999',
  },
  resolveButton: {
    padding: 8,
    backgroundColor: '#4CAF50',
    borderRadius: 16,
  },
  actionItem: {
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  actionDescription: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  actionTarget: {
    fontSize: 12,
    color: '#666666',
  },
  actionTime: {
    fontSize: 12,
    color: '#999999',
  },
});

export default AdminScreen; 