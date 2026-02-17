import React from 'react';
import { View, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { Map, MapMarker } from '../ui/map';
// import { Avatar } from 'native-base';

interface CircleLocationMapProps {
  locations: any[];
  onMemberSelect?: (location: any) => void;
}

export const CircleLocationMap: React.FC<CircleLocationMapProps> = ({
  locations,
  onMemberSelect
}) => {
  // Default region (e.g., somewhere central or calculated from locations)
  // For demo, defaulting to San Francisco or user's location if available
  const defaultRegion = {
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  // If we have locations, center on the first one
  const initialRegion = locations.length > 0 
    ? {
        latitude: locations[0].latitude || defaultRegion.latitude,
        longitude: locations[0].longitude || defaultRegion.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      } 
    : defaultRegion;

  // Filter out invalid locations
  const validLocations = locations.filter(loc => 
    loc && typeof loc.latitude === 'number' && typeof loc.longitude === 'number' &&
    !isNaN(loc.latitude) && !isNaN(loc.longitude)
  );

  return (
    <View style={styles.container}>
      {validLocations.length === 0 && locations.length > 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No valid locations available</Text>
        </View>
      ) : (
        <Map 
          style={styles.map} 
          initialRegion={initialRegion}
          theme="light" // Can be dynamic based on app theme
          loadingEnabled={true}
          loadingIndicatorColor="#666666"
          loadingBackgroundColor="#FFFFFF"
        >
          {validLocations.map((loc, index) => (
            <MapMarker
              key={loc.id || index}
              latitude={loc.latitude}
              longitude={loc.longitude}
              onClick={() => onMemberSelect?.(loc)}
            >
              {/* Custom Marker Content */}
              <View style={styles.markerContainer}>
                 <View style={styles.markerDot} />
                 {/* Could show Avatar here if available */}
              </View>
            </MapMarker>
          ))}
        </Map>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    borderRadius: 16,
    overflow: 'hidden',
    width: '100%',
    height: '100%',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#3b82f6',
    borderWidth: 2,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});


