import { Router, Request, Response } from 'express';
import { prisma } from '../../lib/prisma';
import { authenticateAdmin } from '../../middleware/adminAuth';
import { requirePermission } from '../../middleware/permissionCheck';

const router = Router();

// Apply admin auth to all routes
router.use(authenticateAdmin as any);

// Helper to get content type ID
async function getContentTypeId(name: string): Promise<string | null> {
  const rows = await prisma.$queryRawUnsafe<any[]>('SELECT id FROM admin.content_types WHERE name = $1', name);
  return rows[0]?.id || null;
}

/**
 * GET /slides
 * Get all marketing slides
 */
router.get('/slides', requirePermission('marketing', 'view'), async (_req: Request, res: Response) => {
  try {
    const typeId = await getContentTypeId('marketing_slide');
    if (!typeId) return res.json({ slides: getFallbackSlides() });

    const data = await prisma.marketingContent.findMany({
      where: { contentTypeId: typeId },
      orderBy: { priority: 'asc' }
    });

    const slides = (data || []).map(item => {
      let slideData = {};
      try {
        slideData = typeof item.content === 'string' ? JSON.parse(item.content) : item.content;
      } catch (e) {
        console.error('Error parsing slide content:', e);
      }
      return {
        ...item,
        slideData
      };
    });

    res.json({ slides: slides.length > 0 ? slides : getFallbackSlides() });
  } catch (error) {
    console.error('Error in marketing slides endpoint:', error);
    res.json({ slides: getFallbackSlides() });
  }
});

/**
 * POST /slides
 * Create a new marketing slide
 */
router.post('/slides', requirePermission('marketing', 'create'), async (req: Request, res: Response) => {
  try {
    const { title, slug, slideData, status = 'published', priority = 0 } = req.body;
    const typeId = await getContentTypeId('marketing_slide');

    if (!typeId) return res.status(500).json({ error: 'Marketing slide content type not found' });

    const slide = await prisma.marketingContent.create({
      data: {
        title,
        slug,
        content: JSON.stringify(slideData),
        contentTypeId: typeId,
        status,
        priority
      }
    });

    res.status(201).json({ slide });
  } catch (error) {
    console.error('Error creating marketing slide:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PUT /slides/:id
 * Update an existing marketing slide
 */
router.put('/slides/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, slug, slideData, status, priority } = req.body;

    const updateData: any = {
      updatedAt: new Date()
    };

    if (title !== undefined) updateData.title = title;
    if (slug !== undefined) updateData.slug = slug;
    if (slideData !== undefined) updateData.content = JSON.stringify(slideData);
    if (status !== undefined) updateData.status = status;
    if (priority !== undefined) updateData.priority = priority;

    const slide = await prisma.marketingContent.update({
      where: { id },
      data: updateData
    });

    res.json({ slide });
  } catch (error) {
    console.error('Error updating marketing slide:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * DELETE /slides/:id
 * Delete a marketing slide
 */
router.delete('/slides/:id', requirePermission('marketing', 'delete'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const slide = await prisma.marketingContent.delete({
      where: { id }
    });
    
    if (!slide) return res.status(404).json({ error: 'Slide not found' });
    
    res.json({ message: 'Slide deleted successfully' });
  } catch (error) {
    console.error('Error deleting marketing slide:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /content
 * Get all marketing content
 */
router.get('/content', requirePermission('marketing', 'view'), async (req: Request, res: Response) => {
  try {
    const { type, featured } = req.query;

    const whereConditions: any = {
      status: 'published'
    };

    if (type) {
      whereConditions.contentTypeId = type;
    }

    if (featured === 'true') {
      whereConditions.isFeatured = true;
    }

    const data = await prisma.marketingContent.findMany({
      where: whereConditions,
      orderBy: { priority: 'desc' }
    });
    res.json({ content: data || [] });
  } catch (error) {
    console.error('Error in marketing content endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Fallback slides when database is not available
 */
function getFallbackSlides() {
  return [
    {
      id: '1',
      title: 'Welcome to AppKit',
      slideData: {
        title: 'Welcome to AppKit',
        subtitle: 'Circle Management Made Simple',
        description: 'Connect, organize, and share with your circle in one beautiful app',
        icon: 'home',
        gradient: ['#667eea', '#764ba2'],
        features: ['Circle Calendar', 'Shared Tasks', 'Photo Albums'],
        slide_order: 1
      }
    },
    {
      id: '2',
      title: 'Stay Connected',
      slideData: {
        title: 'Stay Connected',
        subtitle: 'Real-time Communication',
        description: 'Chat, share locations, and stay in touch with circle members',
        icon: 'message-circle',
        gradient: ['#f093fb', '#f5576c'],
        features: ['Group Chat', 'Location Sharing', 'Safety Alerts'],
        slide_order: 2
      }
    }
  ];
}

export default router;

