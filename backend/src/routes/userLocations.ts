import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { userLocationService } from '../services/userLocationService';

const router = Router();

// Apply authentication to all routes
// Apply authentication to all routes
router.use(authenticateToken as any);

/**
 * GET /user/locations
 * Get all saved locations for the current user
 */
router.get('/', async (req: any, res: any) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, error: 'User not authenticated' });
        }

        const locations = await userLocationService.getUserLocations(userId);
        res.json({ success: true, data: locations });
    } catch (error) {
        console.error('Error fetching user locations:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch locations' });
    }
});

/**
 * GET /user/locations/:type
 * Get a specific location by type
 */
router.get('/:type', async (req: any, res: any) => {
    try {
        const userId = req.user?.id;
        const { type } = req.params;

        if (!userId) {
            return res.status(401).json({ success: false, error: 'User not authenticated' });
        }

        const location = await userLocationService.getUserLocationByType(userId, type);
        if (!location) {
            return res.status(404).json({ success: false, error: 'Location not found' });
        }

        res.json({ success: true, data: location });
    } catch (error) {
        console.error('Error fetching user location:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch location' });
    }
});

/**
 * POST /user/locations
 * Save or update a user location
 */
router.post('/', async (req: any, res: any) => {
    try {
        const userId = req.user?.id;
        const { location_type, name, latitude, longitude, address } = req.body;

        if (!userId) {
            return res.status(401).json({ success: false, error: 'User not authenticated' });
        }

        if (!location_type || latitude === undefined || longitude === undefined) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: location_type, latitude, longitude'
            });
        }

        const validTypes = ['hometown', 'workplace', 'school', 'custom'];
        if (!validTypes.includes(location_type)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid location_type. Must be: hometown, workplace, school, or custom'
            });
        }

        const location = await userLocationService.saveUserLocation({
            user_id: userId,
            location_type,
            name,
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
            address
        });

        res.status(201).json({ success: true, data: location });
    } catch (error) {
        console.error('Error saving user location:', error);
        res.status(500).json({ success: false, error: 'Failed to save location' });
    }
});

/**
 * DELETE /user/locations/:type
 * Delete a user location
 */
router.delete('/:type', async (req: any, res: any) => {
    try {
        const userId = req.user?.id;
        const { type } = req.params;

        if (!userId) {
            return res.status(401).json({ success: false, error: 'User not authenticated' });
        }

        await userLocationService.deleteUserLocation(userId, type);
        res.json({ success: true, message: 'Location deleted successfully' });
    } catch (error) {
        console.error('Error deleting user location:', error);
        res.status(500).json({ success: false, error: 'Failed to delete location' });
    }
});

export default router;
