import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';

// We will use raw leaflet
let L: any;

const isBrowser = typeof window !== 'undefined';

if (isBrowser) {
    try {
        L = require('leaflet');
        require('leaflet/dist/leaflet.css');

        // Fix Leaflet's default icon path issues in Webpack/Metro
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
            iconUrl: require('leaflet/dist/images/marker-icon.png'),
            shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
        });
    } catch (e) {
        console.warn('Failed to load leaflet', e);
    }
}

interface MapCNProps {
    children?: React.ReactNode;
    style?: any;
    theme?: 'light' | 'dark' | 'system';
    initialRegion?: {
        latitude: number;
        longitude: number;
        latitudeDelta: number;
        longitudeDelta: number;
        longitude: number;
    };
    focusCoordinate?: {
        latitude: number;
        longitude: number;
    };
}

export const MapCN: React.FC<MapCNProps> = ({ children, style, theme, initialRegion, focusCoordinate }) => {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const markersLayerRef = useRef<any>(null); // LayerGroup for markers
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Handle Focus Coordinate Change
    useEffect(() => {
        if (mapInstanceRef.current && focusCoordinate) {
            mapInstanceRef.current.setView(
                [focusCoordinate.latitude, focusCoordinate.longitude],
                16, // Zoom level for focus
                { animate: true }
            );
        }
    }, [focusCoordinate]);

    // Initialize Map
    useEffect(() => {
        if (!isBrowser || !mounted || !L || !mapContainerRef.current) return;

        if (!mapInstanceRef.current) {
            const center = initialRegion
                ? [initialRegion.latitude, initialRegion.longitude]
                : [51.505, -0.09];

            // Calculate zoom from delta (approximate)
            const zoom = initialRegion
                ? Math.round(Math.log(360 / initialRegion.longitudeDelta) / Math.LN2)
                : 13;

            const map = L.map(mapContainerRef.current).setView(center, zoom);

            // Add tile layer
            L.tileLayer(
                theme === 'dark'
                    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
                    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
                {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
                    subdomains: 'abcd',
                    maxZoom: 19
                }
            ).addTo(map);

            markersLayerRef.current = L.layerGroup().addTo(map);
            mapInstanceRef.current = map;

            // Force a resize check
            setTimeout(() => {
                map.invalidateSize();
            }, 100);
        }

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, [mounted, theme]); // Re-init on theme change for simplicity, or just update tile layer

    // Handle Children (Markers)
    // Since we can't easily iterate children to get props in the same way native MapView does for declaratively rendering markers, 
    // we need a way to pass marker data.
    // However, the interface expects children. 
    // We will parse the children if they are standard elements, or ideally, we should have received data props.
    // Given the props pattern `children.map(...)`, we can inspect children.

    useEffect(() => {
        if (!mapInstanceRef.current || !markersLayerRef.current) return;

        markersLayerRef.current.clearLayers();
        const bounds = L.latLngBounds([]);
        let hasMarkers = false;

        React.Children.forEach(children, (child: any) => {
            if (React.isValidElement(child) && child.props) {
                const props = child.props as any;
                const { coordinate, title, description, onPress, avatarLabel, isOnline } = props;
                if (coordinate) {
                    hasMarkers = true;
                    const latLng = [coordinate.latitude, coordinate.longitude];
                    bounds.extend(latLng);

                    let markerIcon;

                    if (avatarLabel) {
                        const bgColor = isOnline ? '#10B981' : '#6B7280';
                        const html = `
                            <div style="
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                width: 40px;
                                height: 40px;
                                background-color: ${bgColor};
                                border-radius: 50%;
                                border: 2px solid white;
                                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                                color: white;
                                font-weight: bold;
                                font-family: system-ui, -apple-system, sans-serif;
                            ">
                                ${avatarLabel}
                            </div>
                        `;
                        markerIcon = L.divIcon({
                            className: 'custom-avatar-marker',
                            html: html,
                            iconSize: [40, 40],
                            iconAnchor: [20, 20],
                            popupAnchor: [0, -20]
                        });
                    }

                    const marker = L.marker(
                        latLng,
                        markerIcon ? { icon: markerIcon } : undefined
                    );

                    if (title || description) {
                        const popupContent = `
                            <div style="text-align: center">
                                <b>${title || ''}</b><br/>
                                ${description || ''}
                            </div>
                        `;
                        marker.bindPopup(popupContent);
                    }

                    if (onPress) {
                        marker.on('click', onPress);
                    }

                    marker.addTo(markersLayerRef.current);
                }
            }
        });

        // Auto-fit bounds
        if (hasMarkers && mapInstanceRef.current) {
            if (bounds.isValid()) {
                // Check if it's a single point or very small area to avoid max zoom
                const southWest = bounds.getSouthWest();
                const northEast = bounds.getNorthEast();
                const latDiff = Math.abs(northEast.lat - southWest.lat);
                const lngDiff = Math.abs(northEast.lng - southWest.lng);

                if (latDiff < 0.001 && lngDiff < 0.001) {
                    // Practically a single point, set view directly with reasonable zoom
                    mapInstanceRef.current.setView(bounds.getCenter(), 14);
                } else {
                    mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
                }
            }
        }

    }, [children, mounted]);


    if (!isBrowser || !mounted) {
        return (
            <View style={[styles.container, style]}>
                <Text>Loading Map...</Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, style]}>
            <div
                ref={mapContainerRef}
                style={{ height: '100%', width: '100%' }}
            />
        </View>
    );
};

// Marker component acts as a data carrier for the parent MapCN to read
export const Marker: React.FC<any> = (props) => {
    return null;
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        overflow: 'hidden',
        borderRadius: 12,
        minHeight: 300,
    },
});
