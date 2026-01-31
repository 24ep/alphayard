import cron, { ScheduledTask } from 'node-cron';
import { pool } from '../config/database';

export class ScheduledPublishingService {
  private cronJob: ScheduledTask | null = null;

  /**
   * Start the scheduled publishing cron job
   * Runs every minute to check for pages that need to be published or unpublished
   */
  start() {
    if (this.cronJob) {
      console.log('⚠️  Scheduled publishing service is already running');
      return;
    }

    // Run every minute
    this.cronJob = cron.schedule('* * * * *', async () => {
      try {
        await this.processScheduledPages();
      } catch (error) {
        console.error('Error in scheduled publishing cron job:', error);
      }
    });

    console.log('✅ Scheduled publishing service started (runs every minute)');
  }

  /**
   * Stop the cron job
   */
  stop() {
    if (this.cronJob) {
      this.cronJob.stop();
      this.cronJob = null;
      console.log('🛑 Scheduled publishing service stopped');
    }
  }

  /**
   * Process scheduled pages (publish and unpublish)
   */
  async processScheduledPages() {
    const now = new Date().toISOString();
    let publishedCount = 0;
    let unpublishedCount = 0;

    try {
      // Auto-publish scheduled pages
      // Replicating logic of 'auto_publish_scheduled_pages' RPC
      const publishResult = await pool.query(`
        UPDATE pages 
        SET status = 'published', 
            published_at = NOW(),
            updated_at = NOW()
        WHERE status = 'scheduled' 
          AND scheduled_for <= NOW()
          AND (scheduled_for IS NOT NULL)
        RETURNING id
      `);
      
      publishedCount = publishResult.rowCount || 0;
      if (publishedCount > 0) {
        console.log(`📅 Auto-published ${publishedCount} scheduled page(s)`);
      }

      // Auto-unpublish expired pages
      // Replicating logic of 'auto_unpublish_expired_pages' RPC
      const unpublishResult = await pool.query(`
        UPDATE pages 
        SET status = 'draft',
            updated_at = NOW()
        WHERE status = 'published' 
          AND unpublish_at <= NOW()
          AND (unpublish_at IS NOT NULL)
        RETURNING id
      `);

      unpublishedCount = unpublishResult.rowCount || 0;
      if (unpublishedCount > 0) {
        console.log(`⏰ Auto-unpublished ${unpublishedCount} expired page(s)`);
      }
    } catch (error) {
      console.error('Error processing scheduled pages:', error);
    }

    return {
      publishedCount,
      unpublishedCount,
      processedAt: now
    };
  }

  /**
   * Manually trigger processing (for testing)
   */
  async triggerManually() {
    console.log('🔄 Manually triggering scheduled publishing...');
    return await this.processScheduledPages();
  }
}

// Export singleton instance
export const scheduledPublishingService = new ScheduledPublishingService();
export default scheduledPublishingService;
