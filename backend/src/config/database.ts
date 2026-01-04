import { Pool } from 'pg';
import { config } from './env';

const poolConfig: any = {
    host: config.DB_HOST,
    port: config.DB_PORT,
    database: config.DB_NAME,
    user: config.DB_USER,
    password: config.DB_PASSWORD,
    max: 20, // Max number of clients in the pool
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
};

if (config.DATABASE_URL) {
    poolConfig.connectionString = config.DATABASE_URL;
}

export const pool = new Pool(poolConfig);

// Test the connection
pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

export const query = (text: string, params?: any[]) => pool.query(text, params);

export default {
    pool,
    query
};
