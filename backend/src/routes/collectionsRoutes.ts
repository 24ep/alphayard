import { Router, Request, Response } from 'express';
import entityService from '../services/EntityService';

const router = Router();

/**
 * Mobile API endpoints for dynamic collections
 * These endpoints allow mobile apps to fetch collection schemas and data
 */

/**
 * List all available collections for mobile app
 * GET /api/mobile/collections
 */
router.get('/', async (req: Request, res: Response) => {
    try {
        const applicationId = req.query.applicationId as string;
        const types = await entityService.listEntityTypes(applicationId);
        
        // Map to mobile-friendly format (exclude sensitive fields)
        const collections = types.map(t => ({
            id: t.id,
            name: t.name,
            displayName: t.displayName,
            description: t.description,
            icon: t.icon,
            schema: t.schema,
            isSystem: t.isSystem
        }));

        res.json({ 
            success: true, 
            collections 
        });
    } catch (error: any) {
        console.error('List collections error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * Get collection schema by name
 * GET /api/mobile/collections/:typeName/schema
 */
router.get('/:typeName/schema', async (req: Request, res: Response) => {
    try {
        const { typeName } = req.params;
        const entityType = await entityService.getEntityType(typeName);
        
        if (!entityType) {
            return res.status(404).json({ success: false, error: 'Collection not found' });
        }

        // Get full type info
        const types = await entityService.listEntityTypes();
        const fullType = types.find(t => t.name === typeName);

        res.json({
            success: true,
            collection: {
                id: fullType?.id || entityType.id,
                name: entityType.name,
                displayName: fullType?.displayName || entityType.name,
                description: fullType?.description,
                icon: fullType?.icon,
                schema: entityType.schema
            }
        });
    } catch (error: any) {
        console.error('Get collection schema error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * Get collection items
 * GET /api/mobile/collections/:typeName
 */
router.get('/:typeName', async (req: Request, res: Response) => {
    try {
        const { typeName } = req.params;
        const {
            applicationId,
            page,
            limit,
            orderBy,
            orderDir,
            search
        } = req.query;

        // If search term provided
        if (search) {
            const entities = await entityService.searchEntities(typeName, search as string, {
                applicationId: applicationId as string,
                limit: parseInt(limit as string) || 20
            });

            // Map to mobile-friendly format
            const items = entities.map(e => ({
                id: e.id,
                ...e.attributes,
                status: e.status,
                createdAt: e.createdAt,
                updatedAt: e.updatedAt
            }));

            return res.json({
                success: true,
                items,
                total: items.length
            });
        }

        // Standard query
        const result = await entityService.queryEntities(typeName, {
            applicationId: applicationId as string,
            page: parseInt(page as string) || 1,
            limit: parseInt(limit as string) || 20,
            orderBy: orderBy as string,
            orderDir: orderDir as 'asc' | 'desc'
        });

        // Map to mobile-friendly format
        const items = result.entities.map(e => ({
            id: e.id,
            ...e.attributes,
            status: e.status,
            createdAt: e.createdAt,
            updatedAt: e.updatedAt
        }));

        res.json({
            success: true,
            items,
            total: result.total,
            page: result.page,
            limit: result.limit
        });
    } catch (error: any) {
        console.error('Get collection items error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * Get single collection item by ID
 * GET /api/mobile/collections/:typeName/:id
 */
router.get('/:typeName/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const entity = await entityService.getEntity(id);
        
        if (!entity) {
            return res.status(404).json({ success: false, error: 'Item not found' });
        }

        // Map to mobile-friendly format
        const item = {
            id: entity.id,
            ...entity.attributes,
            status: entity.status,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt
        };

        res.json({
            success: true,
            item
        });
    } catch (error: any) {
        console.error('Get collection item error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * Create new collection item (requires authentication)
 * POST /api/mobile/collections/:typeName
 */
router.post('/:typeName', async (req: Request, res: Response) => {
    try {
        const { typeName } = req.params;
        const { applicationId, attributes } = req.body;

        // Get user ID from auth middleware if available
        const ownerId = (req as any).user?.id;

        const entity = await entityService.createEntity({
            typeName,
            applicationId,
            ownerId,
            attributes: attributes || {}
        });

        res.status(201).json({
            success: true,
            item: {
                id: entity.id,
                ...entity.attributes,
                status: entity.status,
                createdAt: entity.createdAt,
                updatedAt: entity.updatedAt
            }
        });
    } catch (error: any) {
        console.error('Create collection item error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
