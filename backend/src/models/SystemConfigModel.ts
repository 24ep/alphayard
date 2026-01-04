import { query } from '../config/database';

export interface ISystemConfig {
    key: string;
    value: any;
    description?: string;
    updatedAt?: Date;
    updatedBy?: string;
}

export class SystemConfigModel {
    static async get(key: string): Promise<any> {
        try {
            const res = await query('SELECT value FROM public.system_configs WHERE key = $1', [key]);
            if (res.rows.length === 0) return null;
            return res.rows[0].value;
        } catch (error: any) {
            // Gracefully handle missing table in dev environment
            if (error.code === '42P01') {
                console.warn(`[SystemConfig] Table public.system_configs missing. returning null for ${key}`);
                return null;
            }
            throw error;
        }
    }

    static async set(key: string, value: any, description?: string, userId?: string): Promise<void> {
        await query(`
      INSERT INTO public.system_configs (key, value, description, updated_by, updated_at)
      VALUES ($1, $2, $3, $4, NOW())
      ON CONFLICT (key) DO UPDATE
      SET value = $2, description = COALESCE($3, public.system_configs.description),
          updated_by = $4, updated_at = NOW()
    `, [key, value /* pg driver auto-stringifies json? check pool config */, description, userId]);
        // NOTE: pg node driver handles objects to JSONB automatically if input is object.
    }

    static async getAll(): Promise<Record<string, any>> {
        const res = await query('SELECT key, value FROM public.system_configs');
        const config: Record<string, any> = {};
        res.rows.forEach(row => {
            config[row.key] = row.value;
        });
        return config;
    }
}
