import { query } from '../config/database';

export interface UserSavedLocation {
    id: string;
    user_id: string;
    location_type: 'hometown' | 'workplace' | 'school' | 'custom';
    name: string | null;
    latitude: number;
    longitude: number;
    address: string | null;
    created_at: string;
    updated_at: string;
    location?: any; // PostGIS geography type
}

export class UserLocationService {

    /**
     * Get all saved locations for a user
     */
    async getUserLocations(userId: string): Promise<UserSavedLocation[]> {
        try {
            const { rows } = await query(`
        SELECT id, user_id, location_type, name, latitude, longitude, address, created_at, updated_at
        FROM user_saved_locations
        WHERE user_id = $1
        ORDER BY location_type
      `, [userId]);

            return rows;
        } catch (error) {
            console.error('Error fetching user locations:', error);
            throw error;
        }
    }

    /**
     * Get a specific location by type
     */
    async getUserLocationByType(userId: string, locationType: string): Promise<UserSavedLocation | null> {
        try {
            const { rows } = await query(`
        SELECT id, user_id, location_type, name, latitude, longitude, address, created_at, updated_at
        FROM user_saved_locations
        WHERE user_id = $1 AND location_type = $2
      `, [userId, locationType]);

            return rows[0] || null;
        } catch (error) {
            console.error('Error fetching user location:', error);
            throw error;
        }
    }

    /**
     * Save or update a user location
     */
    async saveUserLocation(data: {
        user_id: string;
        location_type: 'hometown' | 'workplace' | 'school' | 'custom';
        name?: string;
        latitude: number;
        longitude: number;
        address?: string;
    }): Promise<UserSavedLocation> {
        try {
      const { rows } = await query(`
        INSERT INTO user_saved_locations (
          user_id, location_type, name, latitude, longitude, address, location
        )
        VALUES ($1, $2, $3, $4, $5, $6, ST_SetSRID(ST_MakePoint($5, $4), 4326))
        ON CONFLICT (user_id, location_type)
        DO UPDATE SET
          name = EXCLUDED.name,
          latitude = EXCLUDED.latitude,
          longitude = EXCLUDED.longitude,
          address = EXCLUDED.address,
          location = EXCLUDED.location,
          updated_at = NOW()
        RETURNING *
      `, [data.user_id, data.location_type, data.name || null, data.latitude, data.longitude, data.address || null]);

            return rows[0];
        } catch (error) {
            console.error('Error saving user location:', error);
            throw error;
        }
    }

    /**
     * Delete a user location
     */
    async deleteUserLocation(userId: string, locationType: string): Promise<void> {
        try {
            await query(`
        DELETE FROM user_saved_locations
        WHERE user_id = $1 AND location_type = $2
      `, [userId, locationType]);
        } catch (error) {
            console.error('Error deleting user location:', error);
            throw error;
        }
    }

    /**
     * Find locations nearby a point using PostGIS
     * @param latitude Center latitude
     * @param longitude Center longitude
     * @param radiusInMeters Search radius
     */
    async getNearbyLocations(latitude: number, longitude: number, radiusInMeters: number = 1000): Promise<UserSavedLocation[]> {
        try {
            const { rows } = await query(`
                SELECT id, user_id, location_type, name, latitude, longitude, address, created_at, updated_at,
                       ST_Distance(location, ST_SetSRID(ST_MakePoint($2, $1), 4326)::geography) as distance
                FROM user_saved_locations
                WHERE ST_DWithin(location, ST_SetSRID(ST_MakePoint($2, $1), 4326)::geography, $3)
                ORDER BY distance ASC
            `, [latitude, longitude, radiusInMeters]);

            return rows;
        } catch (error) {
            console.error('Error finding nearby locations:', error);
            // Fallback for when PostGIS is not available could be implemented here if needed
            throw error;
        }
    }
}

export const userLocationService = new UserLocationService();
