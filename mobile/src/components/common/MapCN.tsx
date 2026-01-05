import React from 'react';
import MapView, { MapViewProps, UrlTile, PROVIDER_DEFAULT, PROVIDER_GOOGLE, Marker as RNMarker, MapMarkerProps as RNMarkerProps } from 'react-native-maps';
import { useColorModeValue } from 'native-base';
import { Platform } from 'react-native';

export interface MarkerProps extends RNMarkerProps {
    avatarLabel?: string;
    isOnline?: boolean;
    children?: React.ReactNode;
}

export const Marker: React.FC<MarkerProps> = ({ avatarLabel, isOnline, children, ...props }) => {
    return <RNMarker {...props}>{children}</RNMarker>;
};

interface MapCNProps extends MapViewProps {
    children?: React.ReactNode;
    theme?: 'light' | 'dark' | 'system';
    focusCoordinate?: {
        latitude: number;
        longitude: number;
    };
}

/**
 * MapCN Component
 * Replicates the visual style of https://mapcn.vercel.app/ using CartoDB tiles.
 */
export const MapCN: React.FC<MapCNProps> = ({ children, theme = 'system', style, focusCoordinate, ...props }) => {
    const systemColorMode = useColorModeValue('light', 'dark');
    const activeTheme = theme === 'system' ? systemColorMode : theme;
    const mapRef = React.useRef<MapView>(null);

    React.useEffect(() => {
        if (focusCoordinate && mapRef.current) {
            mapRef.current.animateToRegion({
                latitude: focusCoordinate.latitude,
                longitude: focusCoordinate.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            }, 1000);
        }
    }, [focusCoordinate]);

    // CartoDB Basemap URLs (Standard for "mapcn" clean look)
    const tileUrl = activeTheme === 'dark'
        ? "https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png"
        : "https://basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png";

    return (
        <MapView
            ref={mapRef}
            provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
            mapType={Platform.OS === 'android' ? "none" : "standard"} // On iOS standard + overlay often works better, but "none" is safer for pure tiles. Let's try "none".
            style={[{ flex: 1 }, style]}
            rotateEnabled={true}
            showsUserLocation={true}
            showsMyLocationButton={true}
            showsCompass={true}
            {...props}
        >
            {/* 
        Render the Carto Tiles. 
        Note: On Google Maps (Android), mapType="none" hides the base map, and UrlTile renders our custom tiles.
      */}
            <UrlTile
                urlTemplate={tileUrl}
                zIndex={-3}
                maximumZ={19}
                flipY={false}
                tileSize={256}
            />
            {children}
        </MapView>
    );
};
