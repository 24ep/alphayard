import { Platform } from 'react-native';
import * as Location from 'expo-location';
import { socketService } from '../socket/SocketService';
import { logger } from '../../utils/logger';
import { isDev } from '../../utils/isDev';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude?: number;
  heading?: number;
  speed?: number;
  timestamp: Date;
  address?: string;
  placeLabel?: string;
}

export interface Geofence {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number; // in meters
  type: 'home' | 'school' | 'work' | 'custom';
  isActive: boolean;
  circleId: string;
  members: string[];
  notifications: {
    onEnter: boolean;
    onExit: boolean;
    onStay: boolean;
    stayThreshold: number; // minutes
  };
}

export interface SafetyZone {
  id: string;
  name: string;
  center: {
    latitude: number;
    longitude: number;
  };
  radius: number;
  type: 'safe' | 'warning' | 'danger';
  description?: string;
  circleId: string;
}

export interface LocationHistory {
  userId: string;
  locations: LocationData[];
  startTime: Date;
  endTime: Date;
}

export interface CircleLocation {
  userId: string;
  userName: string;
  circleId: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: Date;
  address?: string;
  placeLabel?: string;
  isOnline?: boolean;
}

class LocationService {
  private currentLocation: LocationData | null = null;
  private locationWatcher: number | null = null;
  private geofences: Geofence[] = [];
  private safetyZones: SafetyZone[] = [];
  private _isTracking = false;
  private updateInterval = 30000; // 30 seconds
  private highAccuracyMode = false;
  private backgroundMode = false;
  private circleData: any[] = [];
  private currentUser: any = null;
  private circleLocationListeners: Array<(locations: CircleLocation[]) => void> = [];
  private currentLocationListeners: Array<(location: LocationData) => void> = [];
  private circleLocations: CircleLocation[] = [];

  // Location tracking methods
  async startLocationTracking(options: {
    highAccuracy?: boolean;
    background?: boolean;
    interval?: number;
  } = {}) {
    try {
      // Request permissions
      const hasPermission = await this.requestLocationPermission();
      if (!hasPermission) {
        const error = new Error('Location permission denied');
        logger.warn('Location permission denied - location tracking will not start');
        // Don't throw error, just log it and return gracefully
        // This allows the app to continue functioning without location tracking
        return;
      }

      this.highAccuracyMode = options.highAccuracy || false;
      this.backgroundMode = options.background || false;
      this.updateInterval = options.interval || 30000;

      // Check current permission status
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted') {
        logger.warn('Location permission not granted - cannot start tracking');
        return;
      }

      // Start watching location with expo-location
      const subscription = await Location.watchPositionAsync(
        {
          accuracy: this.highAccuracyMode ? Location.Accuracy.High : Location.Accuracy.Balanced,
          timeInterval: this.updateInterval,
          distanceInterval: 10, // meters
        },
        (location) => {
          this.handleLocationUpdate({
            coords: {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              accuracy: location.coords.accuracy || 0,
              altitude: location.coords.altitude || undefined,
              heading: location.coords.heading || undefined,
              speed: location.coords.speed || undefined,
            },
            timestamp: location.timestamp,
          });
        }
      );

      // Try to get an immediate fix as well
      const locationPromise = Location.getCurrentPositionAsync({
        accuracy: this.highAccuracyMode ? Location.Accuracy.High : Location.Accuracy.Balanced,
      });

      // Timeout for immediate fix - fallback to mock if taking too long (common on Android emulator/Web)
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Location timeout')), 5000)
      );

      try {
        const location: any = await Promise.race([locationPromise, timeoutPromise]);
        this.handleLocationUpdate({
          coords: {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            accuracy: location.coords.accuracy || 0,
            altitude: location.coords.altitude || undefined,
            heading: location.coords.heading || undefined,
            speed: location.coords.speed || undefined,
          },
          timestamp: location.timestamp,
        });
      } catch (err) {
        logger.warn('Failed to get immediate location fix or timed out', err);
        // If in DEV or Web, fallback to a default location to avoid "Locating..." stuck state
        if (isDev || Platform.OS === 'web') {
          logger.info('Using fallback mock location');
          this.handleLocationUpdate({
            coords: {
              latitude: 37.7749,
              longitude: -122.4194, // San Francisco
              accuracy: 100,
            },
            timestamp: Date.now(),
          });
        }
      }


      this.locationWatcher = subscription as any; // Store subscription
      this._isTracking = true;
      logger.info('Location tracking started successfully');
    } catch (error) {
      logger.error('Failed to start location tracking:', error);
      // Don't throw - allow app to continue without location tracking
      this._isTracking = false;
    }
  }

  stopLocationTracking() {
    if (this.locationWatcher !== null) {
      // expo-location subscription has remove() method
      if (typeof (this.locationWatcher as any).remove === 'function') {
        (this.locationWatcher as any).remove();
      }
      this.locationWatcher = null;
    }
    this._isTracking = false;
    logger.info('Location tracking stopped');
  }

  private async requestLocationPermission(): Promise<boolean> {
    try {
      // Check current permission status
      const { status: existingStatus } = await Location.getForegroundPermissionsAsync();

      if (existingStatus === 'granted') {
        return true;
      }

      // Request permission
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status === 'granted') {
        logger.info('Location permission granted');
        return true;
      }

      // Permission denied
      logger.warn('Location permission denied by user');
      return false;
    } catch (error) {
      logger.error('Error requesting location permission:', error);
      return false;
    }
  }

  private handleLocationUpdate = (position: any) => {
    const locationData: LocationData = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      altitude: position.coords.altitude,
      heading: position.coords.heading,
      speed: position.coords.speed,
      timestamp: new Date(position.timestamp),
    };

    this.currentLocation = locationData;

    // Get address and place label
    this.getAddressFromCoordinates(locationData.latitude, locationData.longitude)
      .then(({ address, placeLabel }) => {
        locationData.address = address;
        locationData.placeLabel = placeLabel;

        // Send location update via socket
        this.sendLocationUpdate(locationData);

        // Notify local listeners
        this.notifyLocationListeners(locationData);

        // Check geofences
        this.checkGeofences(locationData);

        // Check safety zones
        this.checkSafetyZones(locationData);
      })
      .catch(error => {
        logger.error('Failed to get address:', error);
        // Still send location update without address
        this.sendLocationUpdate(locationData);
        // Notify local listeners even if address fails
        this.notifyLocationListeners(locationData);
      });
  };

  private handleLocationError = (error: any) => {
    logger.error('Location error:', error);
    // Implement retry logic or fallback
  };

  private async getAddressFromCoordinates(latitude: number, longitude: number): Promise<{
    address?: string;
    placeLabel?: string;
  }> {
    try {
      // Use reverse geocoding to get address
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${process.env.GOOGLE_MAPS_API_KEY}`
      );

      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const result = data.results[0];
        const address = result.formatted_address;

        // Determine place label based on address components
        const placeLabel = this.determinePlaceLabel(result.address_components);

        return { address, placeLabel };
      }
    } catch (error) {
      logger.error('Reverse geocoding failed:', error);
    }

    return {};
  }

  private determinePlaceLabel(addressComponents: any[]): string {
    // Logic to determine if location is home, work, school, etc.
    // This would typically use saved locations or AI classification
    const types = addressComponents.flatMap(component => component.types);

    if (types.includes('establishment')) {
      // Could be work, school, etc.
      return 'establishment';
    }

    if (types.includes('sublocality')) {
      return 'neighborhood';
    }

    return 'unknown';
  }

  private sendLocationUpdate(locationData: LocationData) {
    try {
      socketService.updateLocation(
        locationData.latitude,
        locationData.longitude,
        locationData.address,
        locationData.accuracy
      );
    } catch (error) {
      logger.error('Failed to send location update:', error);
    }
  }

  // Geofencing methods
  async addGeofence(geofence: Omit<Geofence, 'id'>): Promise<string> {
    const id = `geofence_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newGeofence: Geofence = { ...geofence, id };

    this.geofences.push(newGeofence);

    // Save to local storage and sync with backend
    await this.saveGeofences();

    logger.info('Geofence added:', id);
    return id;
  }

  async removeGeofence(geofenceId: string): Promise<boolean> {
    const index = this.geofences.findIndex(g => g.id === geofenceId);
    if (index !== -1) {
      this.geofences.splice(index, 1);
      await this.saveGeofences();
      logger.info('Geofence removed:', geofenceId);
      return true;
    }
    return false;
  }

  async updateGeofence(geofenceId: string, updates: Partial<Geofence>): Promise<boolean> {
    const index = this.geofences.findIndex(g => g.id === geofenceId);
    if (index !== -1) {
      this.geofences[index] = { ...this.geofences[index], ...updates };
      await this.saveGeofences();
      logger.info('Geofence updated:', geofenceId);
      return true;
    }
    return false;
  }

  getGeofences(): Geofence[] {
    return this.geofences.filter(g => g.isActive);
  }

  private checkGeofences(locationData: LocationData) {
    this.geofences.forEach(geofence => {
      if (!geofence.isActive) return;

      const distance = this.calculateDistance(
        locationData.latitude,
        locationData.longitude,
        geofence.latitude,
        geofence.longitude
      );

      const isInside = distance <= geofence.radius;

      // Check if this is a new state change
      const wasInside = this.wasInsideGeofence(geofence.id);

      if (isInside && !wasInside && geofence.notifications.onEnter) {
        this.triggerGeofenceNotification(geofence, 'enter');
      } else if (!isInside && wasInside && geofence.notifications.onExit) {
        this.triggerGeofenceNotification(geofence, 'exit');
      }

      // Update geofence state
      this.updateGeofenceState(geofence.id, isInside);
    });
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) *
      Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  private wasInsideGeofence(geofenceId: string): boolean {
    // This would typically check against stored state
    // For now, return false to trigger notifications
    return false;
  }

  private updateGeofenceState(geofenceId: string, isInside: boolean) {
    // Store geofence state for comparison
    // This would typically use AsyncStorage or similar
  }

  private triggerGeofenceNotification(geofence: Geofence, event: 'enter' | 'exit') {
    // Send notification to Circle members
    const message = `${geofence.name}: Circle member ${event}ed the area`;

    // This would trigger push notifications and in-app alerts
    logger.info('Geofence notification:', message);
  }

  // Safety zones methods
  async addSafetyZone(safetyZone: Omit<SafetyZone, 'id'>): Promise<string> {
    const id = `safety_zone_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newSafetyZone: SafetyZone = { ...safetyZone, id };

    this.safetyZones.push(newSafetyZone);
    await this.saveSafetyZones();

    logger.info('Safety zone added:', id);
    return id;
  }

  async removeSafetyZone(zoneId: string): Promise<boolean> {
    const index = this.safetyZones.findIndex(z => z.id === zoneId);
    if (index !== -1) {
      this.safetyZones.splice(index, 1);
      await this.saveSafetyZones();
      logger.info('Safety zone removed:', zoneId);
      return true;
    }
    return false;
  }

  getSafetyZones(): SafetyZone[] {
    return this.safetyZones;
  }

  private checkSafetyZones(locationData: LocationData) {
    this.safetyZones.forEach(zone => {
      const distance = this.calculateDistance(
        locationData.latitude,
        locationData.longitude,
        zone.center.latitude,
        zone.center.longitude
      );

      if (distance <= zone.radius) {
        this.triggerSafetyZoneAlert(zone, locationData);
      }
    });
  }

  private triggerSafetyZoneAlert(zone: SafetyZone, locationData: LocationData) {
    const alertMessage = `Safety Alert: You are in a ${zone.type} zone - ${zone.name}`;

    // Send emergency alert to Circle
    const locationString = `${locationData.latitude},${locationData.longitude}${locationData.address ? ` (${locationData.address})` : ''}`;
    socketService.sendEmergencyAlert(
      alertMessage,
      locationString,
      zone.type === 'danger' ? 'panic' : 'location'
    );

    logger.warn('Safety zone alert triggered:', zone.name);
  }

  // Utility methods
  getCurrentLocation(): LocationData | null {
    return this.currentLocation;
  }

  isTracking(): boolean {
    return this._isTracking;
  }

  async getLocationHistory(userId: string, startTime: Date, endTime: Date): Promise<LocationHistory> {
    // This would typically fetch from backend
    return {
      userId,
      locations: [],
      startTime,
      endTime,
    };
  }

  // Storage methods
  private async saveGeofences() {
    try {
      // Save to AsyncStorage and sync with backend
      // Implementation would depend on storage solution
    } catch (error) {
      logger.error('Failed to save geofences:', error);
    }
  }

  private async saveSafetyZones() {
    try {
      // Save to AsyncStorage and sync with backend
      // Implementation would depend on storage solution
    } catch (error) {
      logger.error('Failed to save safety zones:', error);
    }
  }

  // Emergency methods
  async getEmergencyLocation(): Promise<LocationData | null> {
    try {
      // Check permission first
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted') {
        logger.warn('Location permission not granted for emergency location');
        return null;
      }

      // Get current location with high accuracy for emergency
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
        timeInterval: 0,
        distanceInterval: 0,
      });

      const locationData: LocationData = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy || 0,
        altitude: location.coords.altitude || undefined,
        heading: location.coords.heading || undefined,
        speed: location.coords.speed || undefined,
        timestamp: new Date(location.timestamp),
      };

      return locationData;
    } catch (error) {
      logger.error('Emergency location failed:', error);
      return null;
    }
  }

  // Battery optimization
  setHighAccuracyMode(enabled: boolean) {
    this.highAccuracyMode = enabled;
    if (this._isTracking) {
      // Restart tracking with new settings
      this.stopLocationTracking();
      this.startLocationTracking({ highAccuracy: enabled });
    }
  }

  setBackgroundMode(enabled: boolean) {
    this.backgroundMode = enabled;
    // Configure background location updates
  }

  // Circle location methods
  setCircleData(families: any[]) {
    this.circleData = families;
    this.updateCircleLocations();
  }

  setCurrentUser(user: any) {
    this.currentUser = user;
    this.updateCircleLocations();
  }

  subscribe(callback: (locations: CircleLocation[]) => void): () => void {
    this.circleLocationListeners.push(callback);
    // Immediately call with current locations
    callback(this.circleLocations);

    // Return unsubscribe function
    return () => {
      const index = this.circleLocationListeners.indexOf(callback);
      if (index > -1) {
        this.circleLocationListeners.splice(index, 1);
      }
    };
  }

  private notifyCircleLocationListeners() {
    this.circleLocationListeners.forEach(callback => {
      callback(this.circleLocations);
    });
  }

  private updateCircleLocations() {
    // This would typically fetch circle member locations from the backend
    // For now, we'll create a mock implementation
    if (!this.circleData || this.circleData.length === 0) {
      this.circleLocations = [];
      this.notifyCircleLocationListeners();
      return;
    }

    // Transform circle data into CircleLocation format
    // This is a simplified version - in production, you'd fetch actual locations
    const memberLocations = this.circleData
      .flatMap((circle: any) =>
        (circle.members || []).map((member: any) => ({
          userId: member.id || member.userId,
          userName: member.name || member.userName || 'Unknown',
          circleId: circle.id || circle.circleId,
          latitude: member.latitude || this.currentLocation?.latitude || 0,
          longitude: member.longitude || this.currentLocation?.longitude || 0,
          accuracy: member.accuracy || this.currentLocation?.accuracy,
          timestamp: member.lastLocationUpdate
            ? new Date(member.lastLocationUpdate)
            : new Date(),
          address: member.address,
          placeLabel: member.placeLabel,
          isOnline: !!member.isOnline,
        }))
      );

    // Add current user if available
    if (this.currentUser) {
      const currentUserLocation: CircleLocation = {
        userId: this.currentUser.id || 'current-user',
        userName: `${this.currentUser.firstName || ''} ${this.currentUser.lastName || ''}`.trim() || 'You',
        circleId: this.circleData[0]?.id || 'unknown',
        latitude: this.currentLocation?.latitude || 0,
        longitude: this.currentLocation?.longitude || 0,
        accuracy: this.currentLocation?.accuracy || 0,
        timestamp: this.currentLocation?.timestamp || new Date(),
        address: this.currentLocation?.address,
        placeLabel: this.currentLocation?.placeLabel,
        isOnline: true,
      };
      // Avoid duplicate if user is somehow in the list
      const filteredMembers = memberLocations.filter((m: CircleLocation) => m.userId !== this.currentUser.id);
      this.circleLocations = [currentUserLocation, ...filteredMembers];
    } else {
      this.circleLocations = memberLocations;
    }

    this.notifyCircleLocationListeners();
  }

  subscribeToLocationUpdates(callback: (location: LocationData) => void): () => void {
    this.currentLocationListeners.push(callback);
    // Immediately call with current location if available
    if (this.currentLocation) {
      callback(this.currentLocation);
    }

    return () => {
      const index = this.currentLocationListeners.indexOf(callback);
      if (index > -1) {
        this.currentLocationListeners.splice(index, 1);
      }
    };
  }

  private notifyLocationListeners(location: LocationData) {
    this.currentLocationListeners.forEach(callback => {
      try {
        callback(location);
      } catch (error) {
        logger.error('Error in location listener:', error);
      }
    });
  }
}

// Singleton instance
export const locationService = new LocationService();

// Hook for using location service
export const useLocation = () => {
  return {
    locationService,
    currentLocation: locationService.getCurrentLocation(),
    isTracking: locationService.isTracking(),
  };
}; 
