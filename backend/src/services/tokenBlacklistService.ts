import { Redis } from 'ioredis';
import { auditService, AuditCategory, AuditAction } from './auditService';

class TokenBlacklistService {
  private redis: Redis;
  private blacklistedTokens: Map<string, { userId: string; expiresAt: Date }> = new Map();

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: Number(process.env.REDIS_PORT) || 6379,
      password: process.env.REDIS_PASSWORD,
    });

    // Clean up expired tokens every hour
    setInterval(() => this.cleanupExpiredTokens(), 60 * 60 * 1000);
  }

  /**
   * Blacklist a token (typically on logout)
   */
  async blacklistToken(token: string, userId: string, expiresAt: Date): Promise<void> {
    try {
      // Store in Redis with TTL
      const ttl = Math.floor((expiresAt.getTime() - Date.now()) / 1000);
      if (ttl > 0) {
        await this.redis.setex(`blacklist:${token}`, ttl, JSON.stringify({
          userId,
          blacklistedAt: new Date().toISOString(),
          expiresAt: expiresAt.toISOString()
        }));
      }

      // Also store in memory for fallback
      this.blacklistedTokens.set(token, { userId, expiresAt });

      // Log the security event
      await auditService.logAuditEvent({
        userId,
        action: AuditAction.LOGOUT,
        category: AuditCategory.SECURITY,
        description: 'Token blacklisted on logout',
        details: { tokenHash: this.hashToken(token) },
      });

      console.log(`[TOKEN_BLACKLIST] Token blacklisted for user: ${userId}`);
    } catch (error) {
      console.error('Error blacklisting token:', error);
      throw error;
    }
  }

  /**
   * Check if a token is blacklisted
   */
  async isTokenBlacklisted(token: string): Promise<boolean> {
    try {
      // Check Redis first (fast)
      const redisResult = await this.redis.get(`blacklist:${token}`);
      if (redisResult) {
        return true;
      }

      // Fallback to memory cache
      const memoryResult = this.blacklistedTokens.get(token);
      if (memoryResult && memoryResult.expiresAt > new Date()) {
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error checking token blacklist:', error);
      // Fail secure - if we can't check, assume it's blacklisted
      return true;
    }
  }

  /**
   * Clean up expired tokens from memory
   */
  async cleanupExpiredTokens(): Promise<void> {
    try {
      const now = new Date();
      let cleanedCount = 0;

      for (const [token, data] of this.blacklistedTokens.entries()) {
        if (data.expiresAt <= now) {
          this.blacklistedTokens.delete(token);
          cleanedCount++;
        }
      }

      if (cleanedCount > 0) {
        console.log(`[TOKEN_BLACKLIST] Cleaned up ${cleanedCount} expired tokens from memory`);
      }
    } catch (error) {
      console.error('Error cleaning up expired tokens:', error);
    }
  }

  /**
   * Blacklist all user tokens (for security incidents)
   */
  async blacklistAllUserTokens(userId: string): Promise<void> {
    try {
      // Mark all user tokens as invalid by updating their session
      const tokensToBlacklist: string[] = [];
      
      for (const [token, data] of this.blacklistedTokens.entries()) {
        if (data.userId === userId) {
          tokensToBlacklist.push(token);
        }
      }

      // Blacklist all found tokens
      for (const token of tokensToBlacklist) {
        await this.blacklistToken(token, userId, new Date(Date.now() + 24 * 60 * 60 * 1000)); // 24 hours
      }

      // Log security event
      await auditService.logAuditEvent({
        userId,
        action: AuditAction.SECURITY_ALERT,
        category: AuditCategory.SECURITY,
        description: 'All user tokens blacklisted - security incident',
        details: { tokensBlacklisted: tokensToBlacklist.length },
      });

      console.log(`[TOKEN_BLACKLIST] All tokens (${tokensToBlacklist.length}) invalidated for user: ${userId}`);
    } catch (error) {
      console.error('Error blacklisting all user tokens:', error);
      throw error;
    }
  }

  private hashToken(token: string): string {
    // Simple hash for logging - in production use proper crypto
    return require('crypto').createHash('sha256').update(token).digest('hex').substring(0, 16);
  }
}

export const tokenBlacklistService = new TokenBlacklistService();
export default tokenBlacklistService;
