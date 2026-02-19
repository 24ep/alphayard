declare module 'pg' {
    export interface PoolConfig {
        host?: string;
        port?: number;
        database?: string;
        user?: string;
        password?: string;
        max?: number;
        min?: number;
        idleTimeoutMillis?: number;
        connectionTimeoutMillis?: number;
        statement_timeout?: number;
        keepAlive?: boolean;
        keepAliveInitialDelayMillis?: number;
        connectionString?: string;
        [key: string]: any;
    }

    export class Pool {
        constructor(config?: PoolConfig);
        on(event: string, listener: (...args: any[]) => void): this;
        connect(): Promise<any>;
        query(text: string, params?: any[]): Promise<any>;
        // Properties used in database.ts
        totalCount: number;
        idleCount: number;
        waitingCount: number;
    }
}
