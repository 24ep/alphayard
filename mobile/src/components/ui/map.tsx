import React from 'react';
import { StyleSheet, View, useColorScheme } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, MapViewProps } from 'react-native-maps';

interface MapProps extends MapViewProps {
  children?: React.ReactNode;
  theme?: 'light' | 'dark';
  // Props from web version used for compatibility (ignored or adapted)
  styles?: any;
  projection?: any;
  className?: string;
}

// Minimal Dark Mode JSON Style for Google Maps (matches Carto Dark roughly)
const DARK_MAP_STYLE = [
  {
    "elementType": "geometry",
    "stylers": [{ "color": "#212121" }]
  },
  {
    "elementType": "labels.icon",
    "stylers": [{ "visibility": "off" }]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#757575" }]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [{ "color": "#212121" }]
  },
  {
    "featureType": "administrative",
    "elementType": "geometry",
    "stylers": [{ "color": "#757575" }]
  },
  {
    "featureType": "administrative.country",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#9e9e9e" }]
  },
  {
    "featureType": "administrative.land_parcel",
    "stylers": [{ "visibility": "off" }]
  },
  {
    "featureType": "administrative.locality",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#bdbdbd" }]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#757575" }]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry",
    "stylers": [{ "color": "#181818" }]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#616161" }]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.stroke",
    "stylers": [{ "color": "#1b1b1b" }]
  },
  {
    "featureType": "road",
    "elementType": "geometry.fill",
    "stylers": [{ "color": "#2c2c2c" }]
  },
  {
    "featureType": "road",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#8a8a8a" }]
  },
  {
    "featureType": "road.arterial",
    "elementType": "geometry",
    "stylers": [{ "color": "#373737" }]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [{ "color": "#3c3c3c" }]
  },
  {
    "featureType": "road.highway.controlled_access",
    "elementType": "geometry",
    "stylers": [{ "color": "#4e4e4e" }]
  },
  {
    "featureType": "road.local",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#616161" }]
  },
  {
    "featureType": "transit",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#757575" }]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [{ "color": "#000000" }]
  }
];

export const Map = React.forwardRef<MapView, MapProps>(({ 
  children, 
  theme: themeProp, 
  style, 
  ...props 
}, ref) => {
  const systemScheme = useColorScheme();
  const theme = themeProp || systemScheme || 'light';
  
  return (
    <View style={styles.container}>
      <MapView
        ref={ref}
        provider={PROVIDER_GOOGLE}
        style={[styles.map, style]}
        customMapStyle={theme === 'dark' ? DARK_MAP_STYLE : []}
        showsUserLocation={true}
        showsMyLocationButton={true}
        {...props}
      >
        {children}
      </MapView>
    </View>
  );
});

interface MapMarkerProps {
  longitude: number;
  latitude: number;
  children?: React.ReactNode;
  onClick?: () => void;
  // Compatibility props
  onMouseEnter?: any;
  onMouseLeave?: any;
  draggable?: boolean;
}

export const MapMarker = ({ 
  longitude, 
  latitude, 
  children, 
  onClick,
  draggable 
}: MapMarkerProps) => {
  return (
    <Marker
      coordinate={{ latitude, longitude }}
      onPress={onClick}
      draggable={draggable}
    >
      {/* React Native Maps Marker supports custom view children */}
      {children}
    </Marker>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});
