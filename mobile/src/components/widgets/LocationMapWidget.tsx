import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';

interface Location {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

interface LocationMapWidgetProps {
  familyLocations: Location[];
  currentLocation?: Location;
  onLocationPress?: (location: Location) => void;
}

export const LocationMapWidget: React.FC<LocationMapWidgetProps> = ({
  familyLocations,
  currentLocation,
  onLocationPress,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>hourse Locations</Text>
      </View>
      
      {familyLocations.length === 0 ? (
        <View style={styles.emptyState}>
          <IconMC name="map-marker" size={48} color="#CCC" />
          <Text style={styles.emptyText}>No hourse locations available</Text>
        </View>
      ) : (
        <View style={styles.locationsList}>
          {familyLocations.map((location) => (
            <View key={location.id} style={styles.locationItem}>
              <IconMC name="map-marker" size={20} color="#4A90E2" />
              <Text style={styles.locationName}>{location.name}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
  },
  locationsList: {
    gap: 12,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  locationName: {
    fontSize: 16,
    color: '#333',
    marginLeft: 8,
  },
});