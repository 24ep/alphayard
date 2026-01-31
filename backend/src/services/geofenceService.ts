import { UserModel } from '../models/UserModel';
import { notificationService } from './notificationService';
import { pool } from '../config/database';

export enum GeofenceType {
  HOME = 'home',
  WORK = 'work',
  SCHOOL = 'school',
  CUSTOM = 'custom',
}

export enum BreachType {
  ENTER = 'enter',
  EXIT = 'exit',
  BOTH = 'both',
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Geofence {
  id?: string;
  name: string;
  type: GeofenceType;
  coordinates: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  radius: number;
  notifications: boolean;
  breachType: BreachType;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

class GeofenceService {
  // Create a new geofence
  async createGeofence(userId: string, geofenceData: any) {
    try {
      const user = await UserModel.findById(userId);
      if (!user) throw new Error('User not found');

      const geofence: Geofence = {
        name: geofenceData.name,
        type: geofenceData.type,
        coordinates: {
          type: 'Point',
          coordinates: [parseFloat(geofenceData.coordinates.lng), parseFloat(geofenceData.coordinates.lat)],
        },
        radius: geofenceData.radius,
        notifications: geofenceData.notifications !== false,
        breachType: geofenceData.breachType || BreachType.BOTH,
        description: geofenceData.description,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const geofences = user.metadata?.geofences || [];
      geofences.push(geofence);

      await UserModel.findByIdAndUpdate(userId, { geofences });

      return { success: true, geofence };
    } catch (error) {
      console.error('Create geofence error:', error);
      throw error;
    }
  }

  // Check if location is inside geofence
  isInsideGeofence(location: Coordinates, geofence: Geofence): boolean {
    const distance = this.calculateDistance(
      location.lat,
      location.lng,
      geofence.coordinates.coordinates[1],
      geofence.coordinates.coordinates[0]
    );

    return distance <= geofence.radius;
  }

  // Calculate distance between two points using Haversine formula
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371000; // Earth's radius in meters
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Get user's geofences
  async getUserGeofences(userId: string): Promise<Geofence[]> {
    const user = await UserModel.findById(userId);
    return user?.metadata?.geofences || [];
  }
}

export const geofenceService = new GeofenceService();
export default geofenceService;
