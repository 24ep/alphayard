import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';
import { homeStyles } from '../../styles/homeStyles';

interface LocationData {
  id: string;
  name: string;
  type: 'home' | 'work' | 'school' | 'other';
  address: string;
  distance: string;
  lastSeen: string;
  isOnline: boolean;
  batteryLevel?: number;
}

interface LocationMapWidgetProps {
  locations: LocationData[];
  onLocationPress: (location: LocationData) => void;
  onShareLocation: () => void;
  onViewMap: () => void;
}

const LocationMapWidget: React.FC<LocationMapWidgetProps> = ({
  locations,
  onLocationPress,
  onShareLocation,
  onViewMap,
}) => {
  const getLocationIcon = (type: string) => {
    switch (type) {
      case 'home':
        return 'home';
      case 'work':
        return 'briefcase';
      case 'school':
        return 'school';
      default:
        return 'map-marker';
    }
  };

  const getLocationColor = (type: string) => {
    switch (type) {
      case 'home':
        return '#10B981';
      case 'work':
        return '#3B82F6';
      case 'school':
        return '#8B5CF6';
      default:
        return '#6B7280';
    }
  };

  return (
    <View style={homeStyles.widgetContainer}>
      <View style={homeStyles.widgetHeader}>
        <View style={homeStyles.widgetTitleContainer}>
          <Text style={homeStyles.widgetTitle}>hourse Locations</Text>
          <Text style={homeStyles.widgetSubtitle}>
            {locations.filter(l => l.isOnline).length} online
          </Text>
        </View>
        <View style={homeStyles.widgetActions}>
          <TouchableOpacity onPress={onShareLocation} style={homeStyles.addButton}>
            <IconMC name="share" size={20} color="#4F46E5" />
          </TouchableOpacity>
          <TouchableOpacity onPress={onViewMap} style={homeStyles.addButton}>
            <IconMC name="map" size={20} color="#4F46E5" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={homeStyles.widgetScrollContent}
      >
        {locations.map((location) => (
          <TouchableOpacity
            key={location.id}
            style={[
              homeStyles.locationCard,
              { borderLeftColor: getLocationColor(location.type) }
            ]}
            onPress={() => onLocationPress(location)}
          >
            <View style={homeStyles.locationHeader}>
              <View style={[
                homeStyles.locationIconContainer,
                { backgroundColor: getLocationColor(location.type) + '20' }
              ]}>
                <IconMC 
                  name={getLocationIcon(location.type)} 
                  size={20} 
                  color={getLocationColor(location.type)} 
                />
              </View>
              <View style={homeStyles.locationStatus}>
                <View style={[
                  homeStyles.onlineIndicator,
                  { backgroundColor: location.isOnline ? '#10B981' : '#EF4444' }
                ]} />
              </View>
            </View>
            
            <Text style={homeStyles.locationName}>{location.name}</Text>
            <Text style={homeStyles.locationAddress}>{location.address}</Text>
            
            <View style={homeStyles.locationFooter}>
              <Text style={homeStyles.locationDistance}>{location.distance}</Text>
              <Text style={homeStyles.locationLastSeen}>{location.lastSeen}</Text>
            </View>

            {location.batteryLevel && (
              <View style={homeStyles.batteryIndicator}>
                <IconMC name="battery" size={12} color="#6B7280" />
                <Text style={homeStyles.batteryText}>{location.batteryLevel}%</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default LocationMapWidget;
