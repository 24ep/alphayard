import { useState, useEffect, useCallback } from 'react';
import { locationService } from '../services/location/locationService';
import { useAuth } from './useAuth';
import * as Location from 'expo-location';

interface Location {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  address?: string;
  updatedAt: string;
}

interface LocationHistory {
  id: string;
  userId: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  address?: string;
  createdAt: string;
}

export const useLocation = () => {
  const { user } = useAuth();
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [familyLocations, setFamilyLocations] = useState<Location[]>([]);
  const [locationHistory, setLocationHistory] = useState<LocationHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationPermission, setLocationPermission] = useState<boolean>(false);

  // Request location permissions
  useEffect(() => {
    requestLocationPermission();
  }, []);

  // Start location tracking when user is authenticated
  useEffect(() => {
    if (user && locationPermission) {
      startLocationTracking();
      loadFamilyLocations();
    }
  }, [user, locationPermission]);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status === 'granted');

      if (status !== 'granted') {
        setError('Location permission denied');
        return;
      }

      // Get initial location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      if (user) {
        await updateLocation(location.coords.latitude, location.coords.longitude, location.coords.accuracy);
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
      setError('Failed to get location permission');
    }
  };

  const startLocationTracking = async () => {
    try {
      await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 30000, // Update every 30 seconds
          distanceInterval: 10, // Update if moved 10 meters
        },
        async (location) => {
          if (user) {
            await updateLocation(
              location.coords.latitude,
              location.coords.longitude,
              location.coords.accuracy
            );
          }
        }
      );
    } catch (error) {
      console.error('Error starting location tracking:', error);
      setError('Failed to start location tracking');
    }
  };

  const updateLocation = async (latitude: number, longitude: number, accuracy?: number) => {
    if (!user) return;

    try {
      // Get address from coordinates
      const address = await getAddressFromCoordinates(latitude, longitude);

      // Update location in database
      await locationService.updateLocation(user.id, latitude, longitude, accuracy, address);

      // Update current location state
      setCurrentLocation({
        id: 'current',
        name: 'Current Location',
        latitude,
        longitude,
        accuracy,
        address,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error updating location:', error);
      setError('Failed to update location');
    }
  };

  const getAddressFromCoordinates = async (latitude: number, longitude: number): Promise<string | undefined> => {
    try {
      const [address] = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (address) {
        return `${address.street}, ${address.city}, ${address.region}`;
      }
    } catch (error) {
      console.error('Error getting address:', error);
    }
    return undefined;
  };

  const loadFamilyLocations = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Get user's families
      const families = await locationService.getFamilyLocations(user.id);
      setFamilyLocations(families);
    } catch (error) {
      console.error('Error loading hourse locations:', error);
      setError('Failed to load hourse locations');
    } finally {
      setLoading(false);
    }
  };

  const loadLocationHistory = async (days: number = 7) => {
    if (!user) return;

    try {
      setLoading(true);
      const history = await locationService.getLocationHistory(user.id, days);
      setLocationHistory(history);
    } catch (error) {
      console.error('Error loading location history:', error);
      setError('Failed to load location history');
    } finally {
      setLoading(false);
    }
  };

  const shareLocation = async (duration: number = 3600) => {
    if (!user || !currentLocation) return;

    try {
      setLoading(true);
      await locationService.shareLocation(user.id, user.familyId || '', duration);
    } catch (error) {
      console.error('Error sharing location:', error);
      setError('Failed to share location');
    } finally {
      setLoading(false);
    }
  };

  const requestLocation = async (targetUserId: string) => {
    if (!user) return;

    try {
      setLoading(true);
      await locationService.requestLocation(user.id, targetUserId, user.familyId || '');
    } catch (error) {
      console.error('Error requesting location:', error);
      setError('Failed to request location');
    } finally {
      setLoading(false);
    }
  };

  const createGeofence = async (name: string, latitude: number, longitude: number, radius: number, type: 'home' | 'work' | 'school' | 'custom' = 'custom') => {
    if (!user) return;

    try {
      setLoading(true);
      await locationService.createGeofence(user.familyId || '', name, latitude, longitude, radius, type);
    } catch (error) {
      console.error('Error creating geofence:', error);
      setError('Failed to create geofence');
    } finally {
      setLoading(false);
    }
  };

  const checkGeofenceStatus = async () => {
    if (!user) return null;

    try {
      return await locationService.checkGeofenceStatus(user.id, user.familyId || '');
    } catch (error) {
      console.error('Error checking geofence status:', error);
      return null;
    }
  };

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    currentLocation,
    familyLocations,
    locationHistory,
    loading,
    error,
    locationPermission,
    updateLocation,
    loadFamilyLocations,
    loadLocationHistory,
    shareLocation,
    requestLocation,
    createGeofence,
    checkGeofenceStatus,
    clearError,
  };
}; 