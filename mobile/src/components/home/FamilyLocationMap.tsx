import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import IconIon from 'react-native-vector-icons/Ionicons';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';
import { homeStyles } from '../../styles/homeStyles';

import { MapCN, Marker } from '../common/MapCN';
import { CircularBatteryBorder } from '../common/CircularBatteryBorder';

// ... (interfaces remain same)

interface FamilyLocation {
  userId: string;
  userName: string;
  latitude: number;
  longitude: number;
  timestamp: Date;
  isOnline: boolean;
  address?: string;
  batteryLevel?: number;
  accuracy?: number;
  speed?: number;
  // Legacy support if needed
  id?: string;
  lastUpdated?: Date;
}

interface FamilyLocationMapProps {
  locations: FamilyLocation[];
  onMemberSelect?: (member: FamilyLocation) => void;
}

export const FamilyLocationMap: React.FC<FamilyLocationMapProps> = ({ locations, onMemberSelect }) => {
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);



  const formatTimeAgo = (date: Date) => {
    if (!date) return 'Unknown';
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime(); // Ensure it's a Date object
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  // Removed unused getDistance function

  const handleNavigate = (location: FamilyLocation) => {
    Alert.alert(
      'Navigate to Location',
      `Open navigation to ${location.userName}'s location?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Navigate', onPress: () => {
            // Implement navigation logic
            console.log('Navigate to:', location);
          }
        }
      ]
    );
  };

  return (
    <View style={homeStyles.familyLocationCard}>
      {/* Header with View Toggle */}
      <View style={homeStyles.familyLocationHeader}>
        <View style={homeStyles.familyLocationHeaderLeft}>
          <Text style={homeStyles.familyLocationTitle}>hourse Locations</Text>
          <View style={homeStyles.familyLocationStats}>
            <Text style={homeStyles.familyLocationStatsText}>
              {locations.filter(l => l.isOnline).length} online
            </Text>
          </View>
        </View>
        <View style={homeStyles.familyLocationHeaderRight}>
          <View style={homeStyles.familyLocationViewToggle}>
            <TouchableOpacity
              style={[
                homeStyles.familyLocationToggleButton,
                viewMode === 'map' && homeStyles.familyLocationToggleButtonActive
              ]}
              onPress={() => setViewMode('map')}
            >
              <IconMC name="map" size={16} color={viewMode === 'map' ? '#FFFFFF' : '#6B7280'} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                homeStyles.familyLocationToggleButton,
                viewMode === 'list' && homeStyles.familyLocationToggleButtonActive
              ]}
              onPress={() => setViewMode('list')}
            >
              <IconIon name="list" size={16} color={viewMode === 'list' ? '#FFFFFF' : '#6B7280'} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={homeStyles.familyLocationRefreshButton}>
            <IconIon name="refresh" size={18} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Map View */}
      {viewMode === 'map' && (
        <View style={homeStyles.familyLocationMap}>
          {/* Horizontal Members List */}
          <View style={{ height: 80, marginBottom: 8 }}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 4, alignItems: 'center' }}
            >
              {locations.map((loc) => {
                const id = loc.userId || loc.id || '';
                if (!id) return null;
                const isSelected = selectedLocation === id;
                const batteryLevel = loc.batteryLevel || 0;

                return (
                  <TouchableOpacity
                    key={id}
                    onPress={() => setSelectedLocation(id)}
                    style={{
                      alignItems: 'center',
                      marginHorizontal: 8,
                      opacity: isSelected ? 1 : 0.7
                    }}
                  >
                    <CircularBatteryBorder
                      percentage={batteryLevel}
                      size={44}
                      strokeWidth={3}
                    >
                      <View style={{
                        width: 36,
                        height: 36,
                        borderRadius: 18,
                        backgroundColor: loc.isOnline ? '#10B981' : '#9CA3AF',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}>
                        <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 14 }}>
                          {loc.userName.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                    </CircularBatteryBorder>

                    <Text style={{ fontSize: 12, color: '#374151', fontWeight: isSelected ? 'bold' : 'normal', marginTop: 4 }}>
                      {loc.userName.split(' ')[0]}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          <MapCN
            style={{ flex: 1, minHeight: 300, borderRadius: 12, overflow: 'hidden' }}
            initialRegion={{
              latitude: locations[0]?.latitude || 37.78825,
              longitude: locations[0]?.longitude || -122.4324,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
            focusCoordinate={
              selectedLocation
                ? locations.find(l => (l.userId === selectedLocation || l.id === selectedLocation))
                : undefined
            }
          >
            {locations.map((loc) => {
              const id = loc.userId || loc.id || '';
              if (!id) return null;
              return (
                <Marker
                  key={id}
                  coordinate={{ latitude: loc.latitude, longitude: loc.longitude }}
                  title={loc.userName}
                  description={loc.address || 'Unknown Location'}
                  avatarLabel={loc.userName.charAt(0).toUpperCase()}
                  isOnline={loc.isOnline}
                  onPress={() => {
                    setSelectedLocation(id);
                    if (onMemberSelect) {
                      onMemberSelect(loc);
                    }
                  }}
                >
                  <View style={{ alignItems: 'center' }}>
                    <View style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: loc.isOnline ? '#10B981' : '#6B7280',
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderWidth: 2,
                      borderColor: '#FFFFFF',
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.25,
                      shadowRadius: 3.84,
                      elevation: 5,
                    }}>
                      <Text style={{ color: 'white', fontWeight: 'bold' }}>
                        {loc.userName.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={{
                      backgroundColor: 'white',
                      paddingHorizontal: 8,
                      paddingVertical: 2,
                      borderRadius: 10,
                      marginTop: 4,
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.2,
                      shadowRadius: 1.41,
                      elevation: 2,
                    }}>
                      <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#374151' }}>
                        {loc.userName.split(' ')[0]}
                      </Text>
                    </View>
                  </View>
                </Marker>
              )
            })}
          </MapCN>
        </View>
      )
      }

      {/* List View */}
      {
        viewMode === 'list' && (
          <ScrollView
            style={homeStyles.familyLocationList}
            showsVerticalScrollIndicator={false}
          >
            {locations.map((location) => {
              const id = location.userId || location.id || '';
              if (!id) return null;
              const lastUpdated = location.timestamp || location.lastUpdated;
              return (
                <TouchableOpacity
                  key={id}
                  style={[
                    homeStyles.familyLocationItem,
                    selectedLocation === id && homeStyles.familyLocationItemSelected
                  ]}
                  onPress={() => {
                    const newId = selectedLocation === id ? null : id;
                    setSelectedLocation(newId);
                    if (newId && onMemberSelect) {
                      onMemberSelect(location);
                    }
                  }}
                >
                  <View style={homeStyles.familyLocationItemContent}>
                    <View style={homeStyles.familyLocationItemLeft}>
                      <View style={homeStyles.familyLocationItemAvatarContainer}>
                        <View style={[
                          homeStyles.familyLocationItemAvatar,
                          { backgroundColor: location.isOnline ? '#10B981' : '#6B7280' }
                        ]}>
                          <Text style={homeStyles.familyLocationItemAvatarText}>
                            {location.userName.charAt(0)}
                          </Text>
                        </View>
                        {location.isOnline && (
                          <View style={homeStyles.familyLocationItemOnlineIndicator} />
                        )}
                      </View>

                      <View style={homeStyles.familyLocationItemInfo}>
                        <Text style={homeStyles.familyLocationItemName}>{location.userName}</Text>
                        <Text style={homeStyles.familyLocationItemAddress} numberOfLines={1}>
                          {location.address ||
                            (location.latitude === 0 && location.longitude === 0
                              ? 'Locating...'
                              : `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`)
                          }
                        </Text>
                        <Text style={homeStyles.familyLocationItemTime}>
                          {formatTimeAgo(lastUpdated)}
                        </Text>
                      </View>
                    </View>

                    <View style={homeStyles.familyLocationItemRight}>
                      {location.batteryLevel && (
                        <View style={homeStyles.familyLocationItemBattery}>
                          <IconIon name="battery-half" size={14} color="#6B7280" />
                          <Text style={homeStyles.familyLocationItemBatteryText}>
                            {location.batteryLevel}%
                          </Text>
                        </View>
                      )}

                      <View style={homeStyles.familyLocationItemActions}>
                        <TouchableOpacity
                          style={homeStyles.familyLocationItemActionButton}
                          onPress={() => handleNavigate(location)}
                        >
                          <IconIon name="navigate" size={16} color="#3B82F6" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>

                  {/* Expanded Details */}
                  {selectedLocation === id && (
                    <View style={homeStyles.familyLocationItemExpanded}>
                      <View style={homeStyles.familyLocationItemDetails}>
                        <View style={homeStyles.familyLocationItemDetail}>
                          <IconIon name="time" size={14} color="#6B7280" />
                          <Text style={homeStyles.familyLocationItemDetailText}>
                            Last updated: {lastUpdated ? new Date(lastUpdated).toLocaleString() : 'Unknown'}
                          </Text>
                        </View>

                        {location.accuracy && (
                          <View style={homeStyles.familyLocationItemDetail}>
                            <IconIon name="locate" size={14} color="#6B7280" />
                            <Text style={homeStyles.familyLocationItemDetailText}>
                              Accuracy: ±{location.accuracy}m
                            </Text>
                          </View>
                        )}

                        {location.speed && (
                          <View style={homeStyles.familyLocationItemDetail}>
                            <IconIon name="speedometer" size={14} color="#6B7280" />
                            <Text style={homeStyles.familyLocationItemDetailText}>
                              Speed: {location.speed} km/h
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  )}
                </TouchableOpacity>
              )
            })}
          </ScrollView>
        )
      }

    </View >
  );
};
