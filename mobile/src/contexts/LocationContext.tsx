import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { locationService, LocationData } from '../services/location/locationService';

interface Location {
  id: string;
  latitude: number;
  longitude: number;
  address: string;
  timestamp: string;
  accuracy?: number;
}

interface FamilyLocation {
  id: string;
  userId: string;
  userName: string;
  latitude: number;
  longitude: number;
  address: string;
  timestamp: string;
  isOnline: boolean;
}

interface LocationContextType {
  currentLocation: Location | null;
  familyLocations: FamilyLocation[];
  isLoading: boolean;
  error: string | null;
  updateLocation: (latitude: number, longitude: number) => Promise<void>;
  refreshFamilyLocations: () => Promise<void>;
  shareLocation: () => Promise<void>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

interface LocationProviderProps {
  children: ReactNode;
}

export const LocationProvider: React.FC<LocationProviderProps> = ({ children }) => {
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [familyLocations, setFamilyLocations] = useState<FamilyLocation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      try {
        setIsLoading(true);
        await locationService.startLocationTracking({ highAccuracy: true, interval: 30000 });
        const loc = locationService.getCurrentLocation();
        if (isMounted && loc) {
          setCurrentLocation({
            id: 'current',
            latitude: loc.latitude,
            longitude: loc.longitude,
            address: loc.address || '',
            timestamp: new Date(loc.timestamp).toISOString(),
            accuracy: loc.accuracy,
          });
        }
      } catch (e) {
        if (isMounted) setError(e instanceof Error ? e.message : 'Failed to initialize location');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    init();
    return () => {
      isMounted = false;
      locationService.stopLocationTracking();
    };
  }, []);

  const updateLocation = async (latitude: number, longitude: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const updated: LocationData = {
        latitude,
        longitude,
        accuracy: currentLocation?.accuracy || 10,
        timestamp: new Date(),
      };
      // Send update via service (will emit through sockets and enrich)
      (locationService as any).sendLocationUpdate?.(updated);
      setCurrentLocation({
        id: 'current',
        latitude: updated.latitude,
        longitude: updated.longitude,
        address: updated.address || currentLocation?.address || '',
        timestamp: updated.timestamp.toISOString(),
        accuracy: updated.accuracy,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update location');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshFamilyLocations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      // TODO: replace with API call to fetch hourse member locations
      // Placeholder: keep current state without mock
      setFamilyLocations(prev => prev);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh hourse locations');
    } finally {
      setIsLoading(false);
    }
  };

  const shareLocation = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const loc = locationService.getCurrentLocation();
      if (loc) {
        (locationService as any).sendLocationUpdate?.(loc);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to share location');
    } finally {
      setIsLoading(false);
    }
  };

  const value: LocationContextType = {
    currentLocation,
    familyLocations,
    isLoading,
    error,
    updateLocation,
    refreshFamilyLocations,
    shareLocation,
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = (): LocationContextType => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}; 