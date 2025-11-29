// Map Configuration for Free Forever Maps
export const mapConfig = {
  // OpenStreetMap Configuration (Free Forever)
  openStreetMap: {
    // No API key required
    // No usage limits
    // No billing
    tileServer: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '© OpenStreetMap contributors',
  },
  
  // Alternative free tile servers
  alternatives: {
    cartoDB: {
      tileServer: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
      attribution: '© CARTO, © OpenStreetMap contributors',
    },
    cartoDBDark: {
      tileServer: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      attribution: '© CARTO, © OpenStreetMap contributors',
    },
  },
  
  // Map styling options
  styles: {
    light: {
      backgroundColor: '#F3F4F6',
      textColor: '#374151',
    },
    dark: {
      backgroundColor: '#1F2937',
      textColor: '#F9FAFB',
    },
  },
  
  // Default map settings
  defaults: {
    latitude: 37.7749,
    longitude: -122.4194,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
    zoom: 13,
  },
};
