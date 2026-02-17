import React, { useMemo } from 'react';
import { StyleSheet, View, useColorScheme } from 'react-native';
import MapLibreGL from '@maplibre/maplibre-react-native';

// Set access token to null since we are using open source tiles
MapLibreGL.setAccessToken(null);

interface MapProps extends React.ComponentProps<typeof MapLibreGL.MapView> {
  children?: React.ReactNode;
  theme?: 'light' | 'dark';
  initialRegion?: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  showsUserLocation?: boolean;
}

// Construct style JSON for CartoDB raster tiles
const getMapStyle = (theme: 'light' | 'dark') => {
  const tileUrl = theme === 'dark'
    ? "https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png"
    : "https://basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png";

  return JSON.stringify({
    version: 8,
    sources: {
      "carto-raster": {
        type: "raster",
        tiles: [tileUrl],
        tileSize: 256,
        attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
      },
    },
    layers: [
      {
        id: "carto-raster-layer",
        type: "raster",
        source: "carto-raster",
        minzoom: 0,
        maxzoom: 20,
      },
    ],
  });
};

export const Map = React.forwardRef<MapLibreGL.MapView, MapProps>(({ 
  children, 
  theme: themeProp, 
  style, 
  initialRegion,
  showsUserLocation,
  ...props 
}, ref) => {
  const systemScheme = useColorScheme();
  const theme = themeProp || (systemScheme === 'dark' ? 'dark' : 'light');
  const mapStyle = getMapStyle(theme);

  const defaultCenter = initialRegion 
    ? [initialRegion.longitude, initialRegion.latitude] 
    : [0, 0];
  
  const defaultZoom = initialRegion 
    ? Math.log2(360 / initialRegion.longitudeDelta) 
    : 1;

  return (
    <View style={styles.container}>
      <MapLibreGL.MapView
        ref={ref}
        style={[styles.map, style]}
        styleJSON={mapStyle}
        logoEnabled={false}
        attributionEnabled={true}
        attributionPosition={{ bottom: 8, right: 8 }}
        {...props}
      >
        <MapLibreGL.Camera 
          defaultSettings={{
            centerCoordinate: defaultCenter,
            zoomLevel: defaultZoom,
          }}
        />
        {showsUserLocation && (
             <MapLibreGL.UserLocation 
                visible={true} 
                animated={true}
                showsUserHeadingIndicator={true}
             />
        )}
        {children}
      </MapLibreGL.MapView>
    </View>
  );
});

interface MapMarkerProps {
    longitude: number;
    latitude: number;
    children?: React.ReactNode;
    onClick?: () => void;
    title?: string;
    description?: string;
}
  
export const MapMarker = ({ 
    longitude, 
    latitude, 
    children, 
    onClick,
    title,
}: MapMarkerProps) => {
    return (
      <MapLibreGL.MarkerView coordinate={[longitude, latitude]}>
         <View onTouchEnd={onClick}>
            {children}
         </View>
      </MapLibreGL.MarkerView>
    );
};

// Helper: Generate GeoJSON Polygon for a circle
const createGeoJSONCircle = (center: [number, number], radiusInMeters: number, points = 64) => {
    const coords = {
        latitude: center[1],
        longitude: center[0],
    };

    const km = radiusInMeters / 1000;
    const ret = [];
    const distanceX = km / (111.320 * Math.cos((coords.latitude * Math.PI) / 180));
    const distanceY = km / 110.574;

    let theta, x, y;
    for (let i = 0; i < points; i++) {
        theta = (i / points) * (2 * Math.PI);
        x = distanceX * Math.cos(theta);
        y = distanceY * Math.sin(theta);
        ret.push([coords.longitude + x, coords.latitude + y]);
    }
    ret.push(ret[0]); // Close the loop

    return {
        type: 'FeatureCollection',
        features: [{
            type: 'Feature',
            geometry: {
                type: 'Polygon',
                coordinates: [ret],
            },
            properties: {},
        }],
    };
};

interface MapCircleProps {
    center: { latitude: number; longitude: number };
    radius: number; // meters
    fillColor?: string;
    strokeColor?: string;
    strokeWidth?: number;
}

export const MapCircle = ({
    center,
    radius,
    fillColor = 'rgba(0, 0, 255, 0.2)',
    strokeColor = 'rgba(0, 0, 255, 1.0)',
    strokeWidth = 2,
}: MapCircleProps) => {
    const shape = useMemo(() => {
        return createGeoJSONCircle([center.longitude, center.latitude], radius);
    }, [center.longitude, center.latitude, radius]);

    return (
        <MapLibreGL.ShapeSource id={`circle-source-${center.latitude}-${center.longitude}-${radius}`} shape={shape as any}>
            <MapLibreGL.FillLayer 
                id={`circle-fill-${center.latitude}-${center.longitude}-${radius}`} 
                style={{ fillColor: fillColor }} 
            />
            {strokeWidth > 0 && (
                 <MapLibreGL.LineLayer 
                    id={`circle-stroke-${center.latitude}-${center.longitude}-${radius}`} 
                    style={{ lineColor: strokeColor, lineWidth: strokeWidth }} 
                 />
            )}
        </MapLibreGL.ShapeSource>
    );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
    width: '100%',
    height: '100%',
  },
  map: {
    flex: 1,
  },
});
