import { Router, Request, Response } from 'express';
import { prisma } from '../../lib/prisma';
import { authenticateAdmin } from '../../middleware/adminAuth';
import { requirePermission } from '../../middleware/permissionCheck';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Apply admin authentication to all routes
router.use(authenticateAdmin as any);

// Get ticket statistics
router.get('/stats', requirePermission('tickets', 'view'), async (req: Request, res: Response) => {
  try {
    // Get all statistics in parallel using Prisma
    const [
      total,
      open,
      inProgress,
      resolved,
      closed,
      overdue
    ] = await Promise.all([
      prisma.supportTicket.count(),
      prisma.supportTicket.count({ where: { status: 'open' } }),
      prisma.supportTicket.count({ where: { status: 'in_progress' } }),
      prisma.supportTicket.count({ where: { status: 'resolved' } }),
      prisma.supportTicket.count({ where: { status: 'closed' } }),
      prisma.supportTicket.count({ 
        where: { 
          status: 'open',
          createdAt: { lt: new Date(Date.now() - 48 * 60 * 60 * 1000) }
        }
      })
    ]);

    // Calculate average resolution time manually
    const resolvedTickets = await prisma.supportTicket.findMany({
      where: { resolvedAt: { not: null } },
      select: { createdAt: true, resolvedAt: true }
    });

    const avgHours = resolvedTickets.length > 0
      ? resolvedTickets.reduce((sum: number, ticket: any) => {
          const hours = ticket.resolvedAt 
            ? (ticket.resolvedAt.getTime() - ticket.createdAt.getTime()) / (1000 * 60 * 60)
            : 0;
          return sum + hours;
        }, 0) / resolvedTickets.length
      : 0;

    const stats = {
      total,
      open,
      in_progress: inProgress,
      resolved,
      closed,
      overdue,
      avg_hours: avgHours
    };
    
    res.json({
      success: true,
      stats: {
        total: Number(stats.total || 0),
        open: Number(stats.open || 0),
        inProgress: Number(stats.in_progress || 0),
        resolved: Number(stats.resolved || 0),
        closed: Number(stats.closed || 0),
        overdue: Number(stats.overdue || 0),
        avgResolutionTime: Math.round(Number(stats.avg_hours || 0))
      }
    });
  } catch (error) {
    console.error('Error fetching ticket stats:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch ticket stats' });
  }
});

// Get all tickets with filters
router.get('/', requirePermission('tickets', 'view'), async (req: Request, res: Response) => {
  try {
    const { status, type, priority, search, limit = 50, offset = 0, assignedTo } = req.query;
    
    // Build where conditions for Prisma
    const whereConditions: any = {};

    if (status && status !== 'all') {
      whereConditions.status = status;
    }
    if (type && type !== 'all') {
      whereConditions.type = type;
    }
    if (priority && priority !== 'all') {
      whereConditions.priority = priority;
    }
    if (assignedTo) {
      whereConditions.assignedTo = assignedTo;
    }
    if (search) {
      whereConditions.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Get tickets with proper relationships
    const result = await prisma.supportTicket.findMany({
      where: whereConditions,
      include: {
        reporter: {
          select: { 
            firstName: true, 
            lastName: true, 
            email: true 
          }
        },
        assigned: {
          select: { 
            name: true, 
            email: true 
          }
        },
        circle: {
          select: { 
            name: true 
          }
        }
      },
      orderBy: [
        { priority: 'asc' }, // Note: This might need custom ordering for priority levels
        { createdAt: 'desc' }
      ],
      skip: Number(offset),
      take: Number(limit)
    });

    // Get total count
    const total = await prisma.supportTicket.count({
      where: whereConditions
    });

    const tickets = result.map((row: any) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      type: row.type,
      priority: row.priority,
      status: row.status,
      reporter: {
        id: row.reporterId,
        name: `${row.reporter?.firstName || ''} ${row.reporter?.lastName || ''}`.trim(),
        email: row.reporter?.email,
        circleId: row.circleId,
        circleName: row.circle?.name || null
      },
      assignedTo: row.assigned ? {
        id: row.assignedTo,
        name: row.assigned?.name || null,
        email: row.assigned?.email
      } : null,
      tags: row.tags || [],
      attachments: row.attachments || [],
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      resolvedAt: row.resolved_at
    }));

    res.json({
      success: true,
      tickets,
      total: Number(total),
      limit: Number(limit as string),
      offset: Number(offset as string)
    });
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch tickets' });
  }
});

// Get single ticket with comments
router.get('/:id', requirePermission('tickets', 'view'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
      include: {
        reporter: {
          select: { 
            firstName: true, 
            lastName: true, 
            email: true 
          }
        },
        assigned: {
          select: { 
            name: true, 
            email: true 
          }
        },
        circle: {
          select: { 
            name: true 
          }
        },
        comments: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!ticket) {
      return res.status(404).json({ success: false, error: 'Ticket not found' });
    }

    // Format the ticket response
    const formattedTicket = {
      id: ticket.id,
      title: ticket.title,
      description: ticket.description,
      type: ticket.type,
      priority: ticket.priority,
      status: ticket.status,
      reporter: {
        id: ticket.reporterId,
        name: `${ticket.reporter?.firstName || ''} ${ticket.reporter?.lastName || ''}`.trim(),
        email: ticket.reporter?.email,
        circleId: ticket.circleId,
        circleName: ticket.circle?.name || null
      },
      assignedTo: ticket.assigned ? {
        id: ticket.assignedTo,
        name: ticket.assigned?.name || null,
        email: ticket.assigned?.email
      } : null,
      tags: ticket.tags || [],
      attachments: ticket.attachments || [],
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt,
      resolvedAt: ticket.resolvedAt,
      comments: ticket.comments.map((c: any) => ({
        id: c.id,
        content: c.content,
        isInternal: c.isInternal,
        createdAt: c.createdAt,
        author: {
          id: c.authorId,
          name: c.authorType === 'admin' 
            ? `${c.adminUser?.firstName || ''} ${c.adminUser?.lastName || ''}`.trim()
            : `${c.user?.firstName || ''} ${c.user?.lastName || ''}`.trim(),
          role: c.authorType
        }
      }))
    };

    res.json({ success: true, ticket });
  } catch (error) {
    console.error('Error fetching ticket:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch ticket' });
  }
});

// Create ticket
router.post('/', requirePermission('tickets', 'create'), async (req: Request, res: Response) => {
  try {
    const { title, description, type, priority, reporterId, circleId, tags, attachments } = req.body;
    const id = uuidv4();

    const ticket = await prisma.supportTicket.create({
      data: {
        id,
        title,
        description,
        type: type || 'other',
        priority: priority || 'medium',
        status: 'open',
        reporterId,
        circleId,
        tags: tags || [],
        attachments: attachments || []
      }
    });

    res.json({ success: true, ticket });
  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(500).json({ success: false, error: 'Failed to create ticket' });
  }
});

// Update ticket
router.put('/:id', requirePermission('tickets', 'edit'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, type, priority, status, assignedTo, tags } = req.body;

    const updateData: any = {
      updatedAt: new Date()
    };

    if (title !== undefined) { updateData.title = title; }
    if (description !== undefined) { updateData.description = description; }
    if (type !== undefined) { updateData.type = type; }
    if (priority !== undefined) { updateData.priority = priority; }
    if (status !== undefined) { 
      updateData.status = status;
      if (status === 'resolved' || status === 'closed') {
        updateData.resolvedAt = new Date();
      }
    }
    if (assignedTo !== undefined) { updateData.assignedTo = assignedTo || null; }
    if (tags !== undefined) { updateData.tags = tags; }

    const result = await prisma.supportTicket.update({
      where: { id },
      data: updateData
    });

    if (!result) {
      return res.status(404).json({ success: false, error: 'Ticket not found' });
    }

    res.json({ success: true, ticket: result });
  } catch (error) {
    console.error('Error updating ticket:', error);
    res.status(500).json({ success: false, error: 'Failed to update ticket' });
  }
});

// Assign ticket
router.patch('/:id/assign', requirePermission('tickets', 'edit'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { assignedTo } = req.body;

    // First get current ticket to check status
    const currentTicket = await prisma.supportTicket.findUnique({
      where: { id },
      select: { status: true }
    });

    if (!currentTicket) {
      return res.status(404).json({ success: false, error: 'Ticket not found' });
    }

    // Update with conditional status change
    const updateData: any = {
      assignedTo,
      updatedAt: new Date()
    };

    if (currentTicket.status === 'open') {
      updateData.status = 'in_progress';
    }

    const result = await prisma.supportTicket.update({
      where: { id },
      data: updateData
    });

    res.json({ success: true, ticket: result });
  } catch (error) {
    console.error('Error assigning ticket:', error);
    res.status(500).json({ success: false, error: 'Failed to assign ticket' });
  }
});

// Add comment to ticket
router.post('/:id/comments', requirePermission('tickets', 'edit'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { content, isInternal = false } = req.body;
    const adminUser = (req as any).adminUser;
    const commentId = uuidv4();

    const comment = await prisma.ticketComment.create({
      data: {
        id: commentId,
        ticketId: id,
        authorId: adminUser?.id,
        authorType: 'admin',
        content,
        isInternal
      }
    });

    // Update ticket updated_at
    await prisma.supportTicket.update({
      where: { id },
      data: { updatedAt: new Date() }
    });

    res.json({ 
      success: true, 
      comment: {
        id: comment.id,
        content: comment.content,
        author: {
          id: comment.authorId,
          firstName: adminUser?.firstName,
          lastName: adminUser?.lastName,
          role: 'admin'
        },
        isInternal: comment.isInternal,
        createdAt: comment.createdAt
      }
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ success: false, error: 'Failed to add comment' });
  }
});

// Delete ticket
router.delete('/:id', requirePermission('tickets', 'delete'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Delete comments first
    await prisma.ticketComment.deleteMany({
      where: { ticketId: id }
    });
    
    // Delete ticket
    const result = await prisma.supportTicket.delete({
      where: { id }
    });

    if (!result) {
      return res.status(404).json({ success: false, error: 'Ticket not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting ticket:', error);
    res.status(500).json({ success: false, error: 'Failed to delete ticket' });
  }
});

// Get tickets count (for badge)
router.get('/count/open', async (req: Request, res: Response) => {
  try {
    const result = await prisma.supportTicket.count({
      where: { status: { in: ['open', 'in_progress'] } }
    });
    res.json({ success: true, count: result });
  } catch (error) {
    console.error('Error getting ticket count:', error);
    res.json({ success: true, count: 0 });
  }
});

export default router;
