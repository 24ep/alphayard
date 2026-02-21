import Redis from 'ioredis';

/**
 * Redis Service
 * 
 * Basic Redis service implementation for caching and session management.
 * In production, this would connect to a real Redis instance.
 */

class RedisService {
    private client: Redis | null = null;

    async connect(): Promise<void> {
        if (this.client) return;
        
        try {
            const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
            this.client = new Redis(redisUrl, {
                retryStrategy: (times) => {
                    const delay = Math.min(times * 50, 2000);
                    return delay;
                },
                maxRetriesPerRequest: 3
            });
            
            this.client.on('error', (err) => {
                console.error('Redis connection error:', err);
            });

            console.log('RedisService: Connected to Redis');
        } catch (error) {
            console.error('RedisService: Failed to connect to Redis', error);
            // Fallback to null/disconnected state is handled by methods checking this.client
        }
    }

    async disconnect(): Promise<void> {
        if (this.client) {
            await this.client.quit();
            this.client = null;
        }
    }

    async getClient(): Promise<Redis | null> {
        if (!this.client) await this.connect();
        return this.client;
    }

    async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
        const client = await this.getClient();
        if (!client) return;
        
        const valueStr = typeof value === 'string' ? value : JSON.stringify(value);
        if (ttlSeconds) {
            await client.setex(key, ttlSeconds, valueStr);
        } else {
            await client.set(key, valueStr);
        }
    }

    async get(key: string): Promise<any> {
        const client = await this.getClient();
        if (!client) return null;
        
        const value = await client.get(key);
        if (!value) return null;
        
        try {
            return JSON.parse(value);
        } catch {
            return value;
        }
    }

    async del(key: string): Promise<void> {
        const client = await this.getClient();
        if (client) await client.del(key);
    }

    async exists(key: string): Promise<boolean> {
        const client = await this.getClient();
        if (!client) return false;
        const result = await client.exists(key);
        return result === 1;
    }

    async incr(key: string): Promise<number> {
        const client = await this.getClient();
        if (!client) return 0;
        return await client.incr(key);
    }

    async expire(key: string, ttlSeconds: number): Promise<void> {
        const client = await this.getClient();
        if (client) await client.expire(key, ttlSeconds);
    }

    // Rate limiting helper
    async checkRateLimit(key: string, limit: number, windowMs: number): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
        const now = Date.now();
        const client = await this.getClient();
        
        if (!client) {
            return { allowed: true, remaining: limit, resetTime: now + windowMs };
        }

        const current = await this.incr(key);
        if (current === 1) {
            await this.expire(key, Math.ceil(windowMs / 1000));
        }

        const remaining = Math.max(0, limit - current);
        const resetTime = now + (await client.ttl(key)) * 1000;

        return {
            allowed: current <= limit,
            remaining,
            resetTime
        };
    }
}

export default new RedisService();
export { RedisService };
