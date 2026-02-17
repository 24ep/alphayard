import React from 'react';
import { View, Platform } from 'react-native';
import { Map, MapMarker, MapCircle } from '../ui/map';
import { useColorModeValue } from 'native-base';

// Re-export Marker with compatible props
export const Marker = MapMarker;
export const Circle = MapCircle;

interface MapCNProps {
    children?: React.ReactNode;
    theme?: 'light' | 'dark' | 'system';
    focusCoordinate?: {
        latitude: number;
        longitude: number;
    };
    style?: any;
    region?: {
        latitude: number;
        longitude: number;
        latitudeDelta: number;
        longitudeDelta: number;
    };
    // Compatibility props
    showsUserLocation?: boolean;
    showsMyLocationButton?: boolean;
    showsCompass?: boolean;
    provider?: any;
    mapType?: any;
    rotateEnabled?: boolean;
    onPress?: (e: any) => void;
}

/**
 * MapCN Component
 * Now wraps the MapLibre-based Map component to provide the MapCN style.
 */
export const MapCN: React.FC<MapCNProps> = ({ 
    children, 
    theme = 'system', 
    style, 
    focusCoordinate, 
    region,
    showsUserLocation,
    ...props 
}) => {
    const systemColorMode = useColorModeValue('light', 'dark');
    const activeTheme = theme === 'system' ? systemColorMode : theme;
    
    // Map existing props to new component
    return (
        <Map
            theme={activeTheme === 'dark' ? 'dark' : 'light'}
            style={style}
            initialRegion={region} // Note: region changes won't be animated automatically by this simple wrapper, would need Ref
            showsUserLocation={showsUserLocation}
            {...props}
        >
            {children}
        </Map>
    );
};
