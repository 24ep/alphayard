import { Response } from 'express';
import { prisma } from '../../lib/prisma';
import { Prisma } from '../../../prisma/generated/prisma/client';

export class PublishingController {
  /**
   * Get publishing workflow for a page
   */
  async getWorkflow(req: any, res: Response) {
    try {
      const { pageId } = req.params;

      const rows = await prisma.$queryRaw<Array<any>>(
        Prisma.sql`SELECT * FROM publishing_workflows WHERE page_id = ${pageId}`
      );

      res.json({ workflow: rows[0] || null });
    } catch (error: any) {
      console.error('Error fetching workflow:', error);
      res.status(500).json({ error: 'Internal server error', message: error.message });
    }
  }

  /**
   * Create or update publishing workflow
   */
  async createWorkflow(req: any, res: Response) {
    try {
      const { pageId } = req.params;
      const { requiresApproval, approvers } = req.body;
      const userId = req.user?.id || req.admin?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const approvalStatus = requiresApproval ? 'pending' : null;
      const requiresApprovalValue = requiresApproval || false;

      const rows = await prisma.$queryRaw<Array<any>>(
        Prisma.sql`
          INSERT INTO publishing_workflows (page_id, requires_approval, approval_status, updated_at)
          VALUES (${pageId}, ${requiresApprovalValue}, ${approvalStatus}, NOW())
          ON CONFLICT (page_id) DO UPDATE SET 
            requires_approval = EXCLUDED.requires_approval,
            approval_status = EXCLUDED.approval_status,
            updated_at = NOW()
          RETURNING *
        `
      );

      res.json({ workflow: rows[0] });
    } catch (error: any) {
      console.error('Error creating/updating workflow:', error);
      res.status(500).json({ error: 'Internal server error', message: error.message });
    }
  }

  /**
   * Request approval for publishing
   */
  async requestApproval(req: any, res: Response) {
    try {
      const { pageId } = req.params;
      const userId = req.user?.id || req.admin?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const rows = await prisma.$queryRaw<Array<any>>(
        Prisma.sql`
          INSERT INTO publishing_workflows (page_id, requires_approval, approval_status, updated_at)
          VALUES (${pageId}, true, 'pending', NOW())
          ON CONFLICT (page_id) DO UPDATE SET 
            requires_approval = true,
            approval_status = 'pending',
            approved_by = null,
            approved_at = null,
            rejection_reason = null,
            updated_at = NOW()
          RETURNING *
        `
      );

      res.json({ 
        workflow: rows[0],
        message: 'Approval requested successfully'
      });
    } catch (error: any) {
      console.error('Error requesting approval:', error);
      res.status(500).json({ error: 'Internal server error', message: error.message });
    }
  }

  /**
   * Approve page for publishing
   */
  async approvePage(req: any, res: Response) {
    try {
      const { pageId } = req.params;
      const userId = req.user?.id || req.admin?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const result = await prisma.$transaction(async (tx) => {
        const workflowRows = await tx.$queryRaw<Array<any>>(
          Prisma.sql`
            UPDATE publishing_workflows SET 
              approval_status = 'approved',
              approved_by = ${userId},
              approved_at = NOW(),
              rejection_reason = null,
              updated_at = NOW()
            WHERE page_id = ${pageId}
            RETURNING *
          `
        );

        if (workflowRows.length === 0) {
          throw new Error('Workflow not found');
        }

        const pageRows = await tx.$queryRaw<Array<any>>(
          Prisma.sql`
            UPDATE pages SET 
              status = 'published',
              published_at = NOW(),
              updated_by = ${userId}
            WHERE id = ${pageId}
            RETURNING *
          `
        );

        return { workflow: workflowRows[0], page: pageRows[0] };
      });

      res.json({ 
        workflow: result.workflow,
        page: result.page,
        message: 'Page approved and published successfully'
      });
    } catch (error: any) {
      if (error.message === 'Workflow not found') {
        return res.status(404).json({ error: 'Workflow not found' });
      }
      console.error('Error approving page:', error);
      res.status(500).json({ error: 'Internal server error', message: error.message });
    }
  }

  /**
   * Reject page publishing
   */
  async rejectPage(req: any, res: Response) {
    try {
      const { pageId } = req.params;
      const { reason } = req.body;
      const userId = req.user?.id || req.admin?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (!reason) {
        return res.status(400).json({ error: 'Rejection reason is required' });
      }

      const rows = await prisma.$queryRaw<Array<any>>(
        Prisma.sql`
          UPDATE publishing_workflows SET 
            approval_status = 'rejected',
            approved_by = ${userId},
            approved_at = NOW(),
            rejection_reason = ${reason},
            updated_at = NOW()
          WHERE page_id = ${pageId}
          RETURNING *
        `
      );

      if (rows.length === 0) {
        return res.status(404).json({ error: 'Workflow not found' });
      }

      res.json({ 
        workflow: rows[0],
        message: 'Page rejected'
      });
    } catch (error: any) {
      console.error('Error rejecting page:', error);
      res.status(500).json({ error: 'Internal server error', message: error.message });
    }
  }

  /**
   * Get pages pending approval
   */
  async getPendingApprovals(req: any, res: Response) {
    try {
      const { limit = 50, offset = 0 } = req.query;
      const limitValue = parseInt(String(limit));
      const offsetValue = parseInt(String(offset));

      // Using a JOIN to get page data along with workflow
      const rows = await prisma.$queryRaw<Array<any>>(
        Prisma.sql`
          SELECT pw.*, 
                  json_build_object(
                    'id', p.id,
                    'title', p.title,
                    'slug', p.slug,
                    'description', p.description,
                    'status', p.status,
                    'created_by', p.created_by,
                    'updated_by', p.updated_by,
                    'created_at', p.created_at,
                    'updated_at', p.updated_at
                  ) as pages
          FROM publishing_workflows pw
          JOIN pages p ON pw.page_id = p.id
          WHERE pw.approval_status = 'pending'
          ORDER BY pw.created_at DESC
          LIMIT ${limitValue} OFFSET ${offsetValue}
        `
      );

      res.json({ pendingApprovals: rows });
    } catch (error: any) {
      console.error('Error fetching pending approvals:', error);
      res.status(500).json({ error: 'Internal server error', message: error.message });
    }
  }

  /**
   * Get scheduled pages
   */
  async getScheduledPages(req: any, res: Response) {
    try {
      const { limit = 50, offset = 0 } = req.query;
      const limitValue = parseInt(String(limit));
      const offsetValue = parseInt(String(offset));

      const rows = await prisma.$queryRaw<Array<any>>(
        Prisma.sql`
          SELECT * FROM pages 
          WHERE status = 'scheduled' 
          ORDER BY scheduled_for ASC 
          LIMIT ${limitValue} OFFSET ${offsetValue}
        `
      );

      res.json({ scheduledPages: rows });
    } catch (error: any) {
      console.error('Error fetching scheduled pages:', error);
      res.status(500).json({ error: 'Internal server error', message: error.message });
    }
  }

  /**
   * Get publishing statistics
   */
  async getPublishingStats(req: any, res: Response) {
    try {
      // Get counts for different statuses in one query
      const statusRows = await prisma.$queryRaw<Array<{ status: string; count: bigint }>>(
        Prisma.sql`SELECT status, count(*) FROM pages GROUP BY status`
      );

      const pendingRows = await prisma.$queryRaw<Array<{ count: bigint }>>(
        Prisma.sql`SELECT count(*) FROM publishing_workflows WHERE approval_status = 'pending'`
      );

      const statusMap: Record<string, number> = {};
      let total = 0;
      statusRows.forEach(row => {
        const count = Number(row.count);
        statusMap[row.status] = count;
        total += count;
      });

      const stats = {
        total,
        draft: statusMap['draft'] || 0,
        scheduled: statusMap['scheduled'] || 0,
        published: statusMap['published'] || 0,
        archived: statusMap['archived'] || 0,
        pendingApprovals: Number(pendingRows[0]?.count || 0)
      };

      res.json({ stats });
    } catch (error: any) {
      console.error('Error fetching publishing stats:', error);
      res.status(500).json({ error: 'Internal server error', message: error.message });
    }
  }
}
