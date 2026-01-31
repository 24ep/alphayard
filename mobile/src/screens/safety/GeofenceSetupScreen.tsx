import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Switch,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Box, HStack, VStack, Icon, Badge, Input, IconButton, Modal } from 'native-base';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { safetyService } from '../../services/safety/SafetyService';
import { analyticsService } from '../../services/analytics/AnalyticsService';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { GeofenceManager } from '../../components/safety/GeofenceManager';

interface Geofence {
  id: string;
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
  radius: number; // in meters
  isActive: boolean;
  isEnterAlert: boolean;
  isExitAlert: boolean;
  members: string[];
  color: string;
  icon: string;
  createdAt: number;
  lastTriggered?: number;
  triggerCount: number;
}

interface GeofenceSetupScreenProps {
  route?: {
    params?: {
      showMap?: boolean;
    };
  };
}

const GeofenceSetupScreen: React.FC<GeofenceSetupScreenProps> = ({ route }) => {
  const navigation = useNavigation();
  const [geofences, setGeofences] = useState<Geofence[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showMap, setShowMap] = useState(route?.params?.showMap || false);
  const [selectedGeofence, setSelectedGeofence] = useState<Geofence | null>(null);

  useEffect(() => {
    loadGeofences();
  }, []);

  const loadGeofences = async () => {
    try {
      setLoading(true);
      const geofenceList = await safetyService.getGeofences();
      setGeofences(geofenceList);
    } catch (error) {
      console.error('Failed to load geofences:', error);
      Alert.alert('Error', 'Failed to load geofences');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadGeofences();
    setRefreshing(false);
  };

  const handleAddGeofence = () => {
    navigation.navigate('AddGeofence');
  };

  const handleEditGeofence = (geofence: Geofence) => {
    navigation.navigate('EditGeofence', { geofenceId: geofence.id });
  };

  const handleDeleteGeofence = (geofence: Geofence) => {
    Alert.alert(
      'Delete Geofence',
      `Are you sure you want to delete "${geofence.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await safetyService.deleteGeofence(geofence.id);
              await loadGeofences();
              
              analyticsService.trackEvent('geofence_deleted', {
                geofenceId: geofence.id,
                geofenceName: geofence.name,
              });
            } catch (error) {
              console.error('Failed to delete geofence:', error);
              Alert.alert('Error', 'Failed to delete geofence');
            }
          },
        },
      ]
    );
  };

  const handleToggleGeofence = async (geofence: Geofence) => {
    try {
      await safetyService.updateGeofence(geofence.id, {
        isActive: !geofence.isActive,
      });
      await loadGeofences();
      
      analyticsService.trackEvent('geofence_toggled', {
        geofenceId: geofence.id,
        geofenceName: geofence.name,
        isActive: !geofence.isActive,
      });
    } catch (error) {
      console.error('Failed to toggle geofence:', error);
      Alert.alert('Error', 'Failed to update geofence');
    }
  };

  const handleGeofencePress = (geofence: Geofence) => {
    setSelectedGeofence(geofence);
    setShowMap(true);
  };

  const formatDistance = (meters: number) => {
    if (meters < 1000) {
      return `${meters}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  };

  const getGeofenceIcon = (icon: string) => {
    const iconMap: { [key: string]: string } = {
      home: 'home',
      work: 'briefcase',
      school: 'school',
      gym: 'dumbbell',
      store: 'shopping',
      park: 'tree',
      hospital: 'hospital',
      restaurant: 'food',
      default: 'map-marker-radius',
    };
    return iconMap[icon] || iconMap.default;
  };

  const renderGeofence = ({ item }: { item: Geofence }) => (
    <TouchableOpacity
      style={styles.geofenceItem}
      onPress={() => handleGeofencePress(item)}
    >
      <HStack space={3} alignItems="center" flex={1}>
        <Box
          style={[
            styles.geofenceIcon,
            { backgroundColor: item.color },
          ]}
        >
          <Icon
            as={MaterialCommunityIcons}
            name={getGeofenceIcon(item.icon)}
            size="md"
            color="white"
          />
        </Box>

        <VStack flex={1}>
          <HStack space={2} alignItems="center" marginBottom={2}>
            <Text style={styles.geofenceName}>{item.name}</Text>
            <Badge
              colorScheme={item.isActive ? 'green' : 'gray'}
              rounded="full"
              variant="solid"
            >
              {item.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </HStack>

          {item.description && (
            <Text style={styles.geofenceDescription} numberOfLines={1}>
              {item.description}
            </Text>
          )}

          <HStack space={4} alignItems="center" marginTop={4}>
            <HStack space={1} alignItems="center">
              <Icon as={MaterialCommunityIcons} name="map-marker-radius" size="sm" color="gray.500" />
              <Text style={styles.geofenceDetail}>
                {formatDistance(item.radius)}
              </Text>
            </HStack>

            <HStack space={1} alignItems="center">
              <Icon as={MaterialCommunityIcons} name="account-group" size="sm" color="gray.500" />
              <Text style={styles.geofenceDetail}>
                {item.members.length} member{item.members.length !== 1 ? 's' : ''}
              </Text>
            </HStack>

            {item.triggerCount > 0 && (
              <HStack space={1} alignItems="center">
                <Icon as={MaterialCommunityIcons} name="bell" size="sm" color="gray.500" />
                <Text style={styles.geofenceDetail}>
                  {item.triggerCount} trigger{item.triggerCount !== 1 ? 's' : ''}
                </Text>
              </HStack>
            )}
          </HStack>

          <HStack space={2} marginTop={4}>
            {item.isEnterAlert && (
              <Badge colorScheme="blue" rounded="full" variant="subtle">
                Enter Alert
              </Badge>
            )}
            {item.isExitAlert && (
              <Badge colorScheme="orange" rounded="full" variant="subtle">
                Exit Alert
              </Badge>
            )}
          </HStack>
        </VStack>

        <VStack space={2}>
          <Switch
            value={item.isActive}
            onValueChange={() => handleToggleGeofence(item)}
            colorScheme="green"
          />
          <IconButton
            icon={<Icon as={MaterialCommunityIcons} name="pencil" />}
            onPress={() => handleEditGeofence(item)}
            variant="ghost"
            colorScheme="primary"
            size="sm"
          />
          <IconButton
            icon={<Icon as={MaterialCommunityIcons} name="delete" />}
            onPress={() => handleDeleteGeofence(item)}
            variant="ghost"
            colorScheme="red"
            size="sm"
          />
        </VStack>
      </HStack>
    </TouchableOpacity>
  );

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
          <Text style={styles.title}>Geofences</Text>
        </HStack>
        <IconButton
          icon={<Icon as={MaterialCommunityIcons} name="plus" />}
          onPress={handleAddGeofence}
          variant="ghost"
          colorScheme="primary"
        />
      </Box>

      {geofences.length === 0 ? (
        <EmptyState
          icon="map-marker-radius-outline"
          title="No geofences set up"
          subtitle="Create geofences to get alerts when Circle members enter or leave specific areas"
          actionText="Add Geofence"
          onAction={handleAddGeofence}
        />
      ) : (
        <>
          <FlatList
            data={geofences}
            renderItem={renderGeofence}
            keyExtractor={(item) => item.id}
            style={styles.geofenceList}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={['#4A90E2']}
              />
            }
            showsVerticalScrollIndicator={false}
          />

          <Box style={styles.footer}>
            <Text style={styles.footerText}>
              {geofences.length} geofence{geofences.length !== 1 ? 's' : ''}
            </Text>
            <Text style={styles.footerSubtext}>
              {geofences.filter(g => g.isActive).length} active
            </Text>
          </Box>
        </>
      )}

      {/* Map Modal */}
      <Modal
        isOpen={showMap}
        onClose={() => setShowMap(false)}
        size="full"
      >
        <Modal.Content maxWidth="100%" maxHeight="100%">
          <Modal.Header>
            <HStack space={3} alignItems="center">
              <Icon
                as={MaterialCommunityIcons}
                name="arrow-left"
                size="lg"
                color="primary.500"
                onPress={() => setShowMap(false)}
              />
              <Text style={styles.modalTitle}>
                {selectedGeofence?.name || 'Geofence Map'}
              </Text>
            </HStack>
          </Modal.Header>
          <Modal.Body>
            {selectedGeofence && (
              <GeofenceManager
                geofence={selectedGeofence}
                onGeofenceUpdate={loadGeofences}
              />
            )}
          </Modal.Body>
        </Modal.Content>
      </Modal>
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
  geofenceList: {
    flex: 1,
  },
  geofenceItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  geofenceIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  geofenceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  geofenceDescription: {
    fontSize: 14,
    color: '#666666',
  },
  geofenceDetail: {
    fontSize: 12,
    color: '#666666',
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#666666',
  },
  footerSubtext: {
    fontSize: 12,
    color: '#999999',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
});

export default GeofenceSetupScreen; 
