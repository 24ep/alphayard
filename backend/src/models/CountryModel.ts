import { Pool } from 'pg';

export interface Country {
    code: string;
    name: string;
    dial_code: string;
    flag: string;
    is_active: boolean;
}

export class CountryModel {
    private pool: Pool;

    constructor(pool: Pool) {
        this.pool = pool;
    }

    async getAllActive(): Promise<Country[]> {
        const result = await this.pool.query(
            'SELECT * FROM public.countries WHERE is_active = true ORDER BY name ASC'
        );
        return result.rows;
    }

    async getByCode(code: string): Promise<Country | null> {
        const result = await this.pool.query(
            'SELECT * FROM public.countries WHERE code = $1',
            [code]
        );
        return result.rows[0] || null;
    }
}
