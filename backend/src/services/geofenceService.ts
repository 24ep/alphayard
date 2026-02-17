import { prisma } from '../lib/prisma';

interface Location {
  latitude: number;
  longitude: number;
}

interface Geofence {
  id: string;
  name: string;
  centerLat: number;
  centerLng: number;
  radiusMeters: number;
  type: 'home' | 'work' | 'school' | 'custom';
  isActive: boolean;
}

interface GeofenceCheckResult {
  inZone: boolean;
  zones: Array<{
    id: string;
    name: string;
    type: string;
    distance: number;
  }>;
  violations: Array<{
    geofenceId: string;
    name: string;
    type: string;
    message: string;
  }>;
}

class GeofenceService {
  // Haversine formula to calculate distance between two points
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }

  // Check if a user is within their geofences
  async checkGeofence(userId: string, location: Location): Promise<GeofenceCheckResult> {
    try {
      // Get user's circle memberships to find circle geofences
      const userCircles = await prisma.circleMember.findMany({
        where: { userId },
        select: { circleId: true },
      });
      const circleIds = userCircles.map(cm => cm.circleId);

      // Get user's geofences (both user-specific and circle-specific)
      const geofences = await prisma.geofence.findMany({
        where: {
          isActive: true,
          OR: [
            { userId },
            ...(circleIds.length > 0 ? [{ circleId: { in: circleIds } }] : []),
          ],
        },
      });

      const zones: GeofenceCheckResult['zones'] = [];
      const violations: GeofenceCheckResult['violations'] = [];
      let inAnyZone = false;

      for (const geofence of geofences) {
        const distance = this.calculateDistance(
          location.latitude,
          location.longitude,
          Number(geofence.latitude),
          Number(geofence.longitude)
        );

        const isInside = distance <= geofence.radius;

        if (isInside) {
          inAnyZone = true;
          zones.push({
            id: geofence.id,
            name: geofence.name,
            type: geofence.type,
            distance: Math.round(distance),
          });
        }

        // Check for violations based on geofence type
        if (geofence.notifyOnExit && !isInside) {
          violations.push({
            geofenceId: geofence.id,
            name: geofence.name,
            type: geofence.type,
            message: `User has left the ${geofence.name} zone`,
          });
        }

        if (geofence.notifyOnEnter && isInside) {
          // Check if this is a new entry
          const lastLocation = await this.getLastKnownLocation(userId);
          if (lastLocation) {
            const wasInside = this.calculateDistance(
              lastLocation.latitude,
              lastLocation.longitude,
              Number(geofence.latitude),
              Number(geofence.longitude)
            ) <= geofence.radius;

            if (!wasInside && isInside) {
              violations.push({
                geofenceId: geofence.id,
                name: geofence.name,
                type: geofence.type,
                message: `User has entered the ${geofence.name} zone`,
              });
            }
          }
        }
      }

      // If no geofences defined, consider user in zone
      if (geofences.length === 0) {
        return { inZone: true, zones: [], violations: [] };
      }

      return { inZone: inAnyZone, zones, violations };
    } catch (error) {
      console.error('Error checking geofence:', error);
      return { inZone: true, zones: [], violations: [] };
    }
  }

  // Get last known location for a user
  async getLastKnownLocation(userId: string): Promise<Location | null> {
    try {
      const location = await prisma.userLocation.findFirst({
        where: { userId },
        orderBy: { recordedAt: 'desc' },
        select: {
          latitude: true,
          longitude: true,
        },
      });

      if (location) {
        return {
          latitude: Number(location.latitude),
          longitude: Number(location.longitude),
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting last location:', error);
      return null;
    }
  }

  // Create a geofence
  async createGeofence(data: {
    userId?: string;
    circleId?: string;
    name: string;
    centerLat: number;
    centerLng: number;
    radiusMeters: number;
    type?: string;
    alertOnEnter?: boolean;
    alertOnExit?: boolean;
  }): Promise<Geofence | null> {
    try {
      // Prisma schema requires userId, so if not provided and circleId is provided,
      // we need to get the circle owner. Otherwise, userId must be provided.
      let resolvedUserId = data.userId;
      
      if (!resolvedUserId && data.circleId) {
        const circle = await prisma.circle.findUnique({
          where: { id: data.circleId },
          select: { ownerId: true },
        });
        if (circle) {
          resolvedUserId = circle.ownerId;
        }
      }

      if (!resolvedUserId) {
        throw new Error('userId is required when creating a geofence');
      }

      const geofence = await prisma.geofence.create({
        data: {
          userId: resolvedUserId,
          circleId: data.circleId || null,
          name: data.name,
          latitude: data.centerLat,
          longitude: data.centerLng,
          radius: data.radiusMeters,
          type: (data.type || 'custom') as any,
          notifyOnEnter: data.alertOnEnter ?? false,
          notifyOnExit: data.alertOnExit ?? true,
          isActive: true,
        },
      });

      return this.mapGeofence(geofence);
    } catch (error) {
      console.error('Error creating geofence:', error);
      return null;
    }
  }

  // Get geofences for a user
  async getUserGeofences(userId: string): Promise<Geofence[]> {
    try {
      // Get user's circle memberships
      const userCircles = await prisma.circleMember.findMany({
        where: { userId },
        select: { circleId: true },
      });
      const circleIds = userCircles.map(cm => cm.circleId);

      // Get geofences (both user-specific and circle-specific)
      const geofences = await prisma.geofence.findMany({
        where: {
          OR: [
            { userId },
            ...(circleIds.length > 0 ? [{ circleId: { in: circleIds } }] : []),
          ],
        },
        orderBy: { createdAt: 'desc' },
      });

      return geofences.map(geofence => this.mapGeofence(geofence));
    } catch (error) {
      console.error('Error getting user geofences:', error);
      return [];
    }
  }

  // Update a geofence
  async updateGeofence(id: string, data: Partial<{
    name: string;
    centerLat: number;
    centerLng: number;
    radiusMeters: number;
    type: string;
    alertOnEnter: boolean;
    alertOnExit: boolean;
    isActive: boolean;
  }>): Promise<Geofence | null> {
    try {
      const updateData: any = {};

      if (data.name !== undefined) updateData.name = data.name;
      if (data.centerLat !== undefined) updateData.latitude = data.centerLat;
      if (data.centerLng !== undefined) updateData.longitude = data.centerLng;
      if (data.radiusMeters !== undefined) updateData.radius = data.radiusMeters;
      if (data.type !== undefined) updateData.type = data.type as any;
      if (data.alertOnEnter !== undefined) updateData.notifyOnEnter = data.alertOnEnter;
      if (data.alertOnExit !== undefined) updateData.notifyOnExit = data.alertOnExit;
      if (data.isActive !== undefined) updateData.isActive = data.isActive;

      if (Object.keys(updateData).length === 0) return null;

      const geofence = await prisma.geofence.update({
        where: { id },
        data: updateData,
      });

      return this.mapGeofence(geofence);
    } catch (error) {
      console.error('Error updating geofence:', error);
      return null;
    }
  }

  // Delete a geofence
  async deleteGeofence(id: string): Promise<boolean> {
    try {
      await prisma.geofence.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      console.error('Error deleting geofence:', error);
      return false;
    }
  }

  // Check and notify for geofence violations
  async processLocationUpdate(userId: string, location: Location): Promise<void> {
    try {
      const result = await this.checkGeofence(userId, location);
      
      if (result.violations.length > 0) {
        // Import socket notification function
        const { sendSocketNotification } = await import('../socket/socketService');
        
        // Get user's circle memberships
        const userCircles = await prisma.circleMember.findMany({
          where: { userId },
          select: { circleId: true },
        });
        const circleIds = userCircles.map(cm => cm.circleId);

        // Get all circle members from user's circles (excluding the user themselves)
        const circleMembers = await prisma.circleMember.findMany({
          where: {
            circleId: { in: circleIds },
            userId: { not: userId },
          },
          select: {
            userId: true,
          },
          distinct: ['userId'],
        });

        for (const violation of result.violations) {
          // Notify circle members
          for (const member of circleMembers) {
            await sendSocketNotification(member.userId, {
              type: 'geofence',
              title: 'Location Alert',
              message: violation.message,
              data: { userId, geofenceId: violation.geofenceId },
            });
          }
        }
      }
    } catch (error) {
      console.error('Error processing location update:', error);
    }
  }

  private mapGeofence(geofence: any): Geofence {
    return {
      id: geofence.id,
      name: geofence.name,
      centerLat: Number(geofence.latitude),
      centerLng: Number(geofence.longitude),
      radiusMeters: geofence.radius,
      type: geofence.type,
      isActive: geofence.isActive,
    };
  }
}

export const geofenceService = new GeofenceService();
export default geofenceService;
