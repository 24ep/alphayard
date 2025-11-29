import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import IconIon from 'react-native-vector-icons/Ionicons';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';
import { homeStyles } from '../../styles/homeStyles';
import { FreeMapView } from '../maps/FreeMapView';

interface FamilyLocation {
  id: string;
  userName: string;
  latitude: number;
  longitude: number;
  lastUpdated: Date;
  isOnline: boolean;
  address?: string;
  batteryLevel?: number;
  accuracy?: number;
  speed?: number;
}

interface FamilyLocationMapProps {
  locations: FamilyLocation[];
}

export const FamilyLocationMap: React.FC<FamilyLocationMapProps> = ({ locations }) => {
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    // Simple distance calculation (not accurate for large distances)
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const handleNavigate = (location: FamilyLocation) => {
    Alert.alert(
      'Navigate to Location',
      `Open navigation to ${location.userName}'s location?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Navigate', onPress: () => {
          // Implement navigation logic
          console.log('Navigate to:', location);
        }}
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
          <FreeMapView 
            locations={locations}
            height={300}
          />
        </View>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <ScrollView 
          style={homeStyles.familyLocationList}
          showsVerticalScrollIndicator={false}
        >
          {locations.map((location) => (
            <TouchableOpacity
              key={location.id}
              style={[
                homeStyles.familyLocationItem,
                selectedLocation === location.id && homeStyles.familyLocationItemSelected
              ]}
              onPress={() => setSelectedLocation(selectedLocation === location.id ? null : location.id)}
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
                      {location.address || `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`}
                    </Text>
                    <Text style={homeStyles.familyLocationItemTime}>
                      {formatTimeAgo(location.lastUpdated)}
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
              {selectedLocation === location.id && (
                <View style={homeStyles.familyLocationItemExpanded}>
                  <View style={homeStyles.familyLocationItemDetails}>
                    <View style={homeStyles.familyLocationItemDetail}>
                      <IconIon name="time" size={14} color="#6B7280" />
                      <Text style={homeStyles.familyLocationItemDetailText}>
                        Last updated: {location.lastUpdated.toLocaleString()}
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
          ))}
        </ScrollView>
      )}

    </View>
  );
};
